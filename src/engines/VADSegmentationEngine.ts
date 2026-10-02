import { SpeechSegment } from '../types/speech';

export interface VADConfig {
  sampleRate: number;
  frameDurationMs: number;       // default: 20ms
  energyThresholdDb: number;      // threshold above noise floor, e.g. +8dB
  pauseToleranceMs: number;       // default: 900ms (tolerate natural child pauses like "rab ... bit")
  onsetSafetyPaddingMs: number;   // default: 120ms (protect initial plosives/fricatives /p/, /t/, /k/, /s/)
  offsetSafetyPaddingMs: number;  // default: 150ms (protect final plosives/fricatives /t/, /d/, /s/, /z/)
  minSpeechDurationMs: number;    // default: 100ms
  maxAttemptDurationMs: number;   // default: 8000ms
}

export const DEFAULT_VAD_CONFIG: VADConfig = {
  sampleRate: 44100,
  frameDurationMs: 20,
  energyThresholdDb: 7,
  pauseToleranceMs: 900,
  onsetSafetyPaddingMs: 120,
  offsetSafetyPaddingMs: 150,
  minSpeechDurationMs: 100,
  maxAttemptDurationMs: 8000
};

export class VADSegmentationEngine {
  /**
   * Process an audio buffer and extract segmented child speech boundaries with safety padding
   */
  public static segmentSpeech(
    samples: Float32Array,
    noiseFloorDb: number = -50,
    config: VADConfig = DEFAULT_VAD_CONFIG
  ): {
    segments: SpeechSegment[];
    trimmedSpeech: Float32Array;
    speechStartMs: number;
    speechEndMs: number;
    hasIncompleteAttempt: boolean;
    pauseCount: number;
  } {
    const frameSize = Math.floor((config.sampleRate * config.frameDurationMs) / 1000);
    const numFrames = Math.floor(samples.length / frameSize);
    const speechThreshold = Math.max(-42, noiseFloorDb + config.energyThresholdDb);

    const frameStates: boolean[] = [];
    const frameEnergies: number[] = [];

    // 1. Frame-level activity detection
    for (let f = 0; f < numFrames; f++) {
      const start = f * frameSize;
      const end = Math.min(samples.length, start + frameSize);
      let sum = 0;

      for (let i = start; i < end; i++) {
        sum += samples[i] * samples[i];
      }

      const rms = Math.sqrt(sum / (end - start));
      const db = rms > 0.00001 ? 20 * Math.log10(rms) : -80;
      frameEnergies.push(db);

      // Active if energy exceeds threshold
      frameStates.push(db >= speechThreshold);
    }

    // 2. Identify contiguous speech blocks bridging natural child pauses
    const pauseFramesThreshold = Math.floor(config.pauseToleranceMs / config.frameDurationMs);
    let inSpeech = false;
    let silenceCounter = 0;
    let pauseCount = 0;
    let firstSpeechFrame = -1;
    let lastSpeechFrame = -1;

    const segments: SpeechSegment[] = [];
    let currentSegmentStart = -1;

    for (let i = 0; i < numFrames; i++) {
      if (frameStates[i]) {
        if (!inSpeech) {
          inSpeech = true;
          if (firstSpeechFrame === -1) firstSpeechFrame = i;
          currentSegmentStart = i;
        } else if (silenceCounter > 0) {
          // Bridged a pause
          pauseCount++;
        }
        silenceCounter = 0;
        lastSpeechFrame = i;
      } else {
        if (inSpeech) {
          silenceCounter++;
          if (silenceCounter > pauseFramesThreshold) {
            // End of speech segment
            inSpeech = false;
            if (currentSegmentStart !== -1) {
              const segStart = currentSegmentStart * config.frameDurationMs;
              const segEnd = (i - silenceCounter) * config.frameDurationMs;
              segments.push({
                startTimeMs: segStart,
                endTimeMs: segEnd,
                durationMs: segEnd - segStart,
                isSpeech: true,
                confidence: 0.9,
                energy: frameEnergies[currentSegmentStart] || -30
              });
              currentSegmentStart = -1;
            }
          }
        }
      }
    }

    // If speech was ongoing until the end
    if (inSpeech && currentSegmentStart !== -1) {
      const segStart = currentSegmentStart * config.frameDurationMs;
      const segEnd = (lastSpeechFrame + 1) * config.frameDurationMs;
      segments.push({
        startTimeMs: segStart,
        endTimeMs: segEnd,
        durationMs: segEnd - segStart,
        isSpeech: true,
        confidence: 0.9,
        energy: frameEnergies[currentSegmentStart] || -30
      });
    }

    // If no speech was detected
    if (firstSpeechFrame === -1 || lastSpeechFrame === -1) {
      return {
        segments: [],
        trimmedSpeech: new Float32Array(0),
        speechStartMs: 0,
        speechEndMs: 0,
        hasIncompleteAttempt: false,
        pauseCount: 0
      };
    }

    // 3. Apply onset and offset safety padding
    const onsetPaddingSamples = Math.floor((config.sampleRate * config.onsetSafetyPaddingMs) / 1000);
    const offsetPaddingSamples = Math.floor((config.sampleRate * config.offsetSafetyPaddingMs) / 1000);

    const rawStartSample = firstSpeechFrame * frameSize;
    const rawEndSample = Math.min(samples.length, (lastSpeechFrame + 1) * frameSize);

    const safeStartSample = Math.max(0, rawStartSample - onsetPaddingSamples);
    const safeEndSample = Math.min(samples.length, rawEndSample + offsetPaddingSamples);

    const trimmedSpeech = samples.slice(safeStartSample, safeEndSample);
    const speechStartMs = (safeStartSample / config.sampleRate) * 1000;
    const speechEndMs = (safeEndSample / config.sampleRate) * 1000;
    const totalSpeechDurationMs = speechEndMs - speechStartMs;

    // Check for incomplete / trailing cut-off speech (e.g. speaking when recording cut off or trailing syllable missing)
    const hasIncompleteAttempt = totalSpeechDurationMs < 250 && totalSpeechDurationMs > 80;

    return {
      segments,
      trimmedSpeech,
      speechStartMs,
      speechEndMs,
      hasIncompleteAttempt,
      pauseCount
    };
  }
}
