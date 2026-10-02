import { AudioQualityMetrics, AudioQualityClassification, RetryReason, OverlapState } from '../types/speech';

export class AudioQualityEngine {
  /**
   * Analyze raw PCM float audio samples and determine acoustic signal health metrics
   */
  public static analyzeAudioBuffer(
    samples: Float32Array,
    sampleRate: number = 44100,
    ambientNoiseFloorDb: number = -48
  ): AudioQualityMetrics {
    const totalSamples = samples.length;
    const durationMs = (totalSamples / sampleRate) * 1000;

    if (totalSamples === 0 || durationMs < 100) {
      return {
        rms: 0,
        peakAmplitude: 0,
        hasClipping: false,
        clippingCount: 0,
        silenceRatio: 1,
        speechRatio: 0,
        noiseFloorDb: -60,
        snrDb: 0,
        dynamicRangeDb: 0,
        durationMs,
        sampleRate,
        channelCount: 1,
        signalConsistencyScore: 0,
        overlapState: 'NO_OVERLAP',
        classification: 'INVALID',
        retryReason: 'NO_SPEECH',
        feedbackMessage: "No speech was detected. Let's try again!"
      };
    }

    let sumSquares = 0;
    let peak = 0;
    let clippingCount = 0;
    const clippingThreshold = 0.96; // 96% of max headroom

    // Frame-based energy analysis (20ms frames)
    const frameSize = Math.floor(sampleRate * 0.02); // 20ms
    const numFrames = Math.floor(totalSamples / frameSize);
    const frameEnergies: number[] = [];
    const zeroCrossingRates: number[] = [];

    let silenceFrames = 0;
    let speechFrames = 0;
    let harmonicPeaksCount = 0;

    for (let i = 0; i < totalSamples; i++) {
      const absVal = Math.abs(samples[i]);
      sumSquares += samples[i] * samples[i];
      if (absVal > peak) peak = absVal;
      if (absVal >= clippingThreshold) clippingCount++;
    }

    const rms = Math.sqrt(sumSquares / totalSamples);
    const rmsDb = rms > 0.00001 ? 20 * Math.log10(rms) : -80;

    // Analyze frames
    for (let f = 0; f < numFrames; f++) {
      const start = f * frameSize;
      const end = start + frameSize;
      let frameSum = 0;
      let zcr = 0;

      for (let j = start; j < end; j++) {
        frameSum += samples[j] * samples[j];
        if (j > start && ((samples[j] >= 0 && samples[j - 1] < 0) || (samples[j] < 0 && samples[j - 1] >= 0))) {
          zcr++;
        }
      }

      const frameRms = Math.sqrt(frameSum / frameSize);
      const frameDb = frameRms > 0.00001 ? 20 * Math.log10(frameRms) : -80;
      frameEnergies.push(frameDb);
      zeroCrossingRates.push(zcr / frameSize);

      // Simple voice activity per frame
      if (frameDb < ambientNoiseFloorDb + 6) {
        silenceFrames++;
      } else {
        speechFrames++;
        // Check for multi-pitch spectral density
        if (zcr / frameSize > 0.12 && frameDb > -28) {
          harmonicPeaksCount++;
        }
      }
    }

    const silenceRatio = numFrames > 0 ? silenceFrames / numFrames : 1;
    const speechRatio = numFrames > 0 ? speechFrames / numFrames : 0;

    // Estimate dynamic range
    const sortedEnergies = [...frameEnergies].sort((a, b) => a - b);
    const lowPercentile = sortedEnergies[Math.floor(sortedEnergies.length * 0.1)] || -60;
    const highPercentile = sortedEnergies[Math.floor(sortedEnergies.length * 0.9)] || -20;
    const dynamicRangeDb = Math.max(0, highPercentile - lowPercentile);

    // SNR estimation
    const estimatedNoise = Math.min(lowPercentile, ambientNoiseFloorDb);
    const estimatedSignal = Math.max(highPercentile, rmsDb);
    const snrDb = Math.max(0, estimatedSignal - estimatedNoise);

    // Check signal consistency
    let signalConsistencyScore = 1.0;
    if (dynamicRangeDb < 6 && speechRatio > 0.5) signalConsistencyScore -= 0.3; // Flat hum
    if (clippingCount > 10) signalConsistencyScore -= 0.4;
    signalConsistencyScore = Math.max(0.1, Math.min(1.0, signalConsistencyScore));

    // Overlap classification
    let overlapState: OverlapState = 'NO_OVERLAP';
    if (speechFrames > 5 && harmonicPeaksCount / speechFrames > 0.65 && snrDb > 18) {
      overlapState = 'MAJOR_OVERLAP';
    } else if (speechFrames > 5 && harmonicPeaksCount / speechFrames > 0.4) {
      overlapState = 'MINOR_OVERLAP';
    }

    // Determine classification & retry reasons according to prompt rules
    let classification: AudioQualityClassification = 'GOOD';
    let retryReason: RetryReason | undefined = undefined;
    let feedbackMessage: string | undefined = undefined;

    // Rule 1: No speech / pure silence
    if (speechRatio < 0.08 || rms < 0.008) {
      classification = 'INVALID';
      retryReason = 'NO_SPEECH';
      feedbackMessage = "I didn't hear any speech yet. Tap the button when you're ready to speak!";
    }
    // Rule 2: Too quiet (speech detected but weak)
    else if (rms < 0.025 || peak < 0.08 || (rmsDb < -38 && snrDb < 8)) {
      classification = 'RETRY_REQUIRED';
      retryReason = 'TOO_QUIET';
      feedbackMessage = "I couldn't hear you clearly. Try speaking a little louder!";
    }
    // Rule 3: Clipped / Too loud
    else if (clippingCount > 25 || peak >= 0.99) {
      classification = 'RETRY_REQUIRED';
      retryReason = 'CLIPPED_AUDIO';
      feedbackMessage = "That was a little too loud or close to the microphone. Try stepping back a little and speak gently!";
    }
    // Rule 4: High Background Noise
    else if (snrDb < 7 || ambientNoiseFloorDb > -25) {
      classification = 'POOR';
      retryReason = 'HIGH_NOISE';
      feedbackMessage = "It's a little noisy around here. Let's find a quieter spot or try again!";
    }
    // Rule 5: Overlapping Speech
    else if (overlapState === 'MAJOR_OVERLAP') {
      classification = 'ACCEPTABLE'; // Still allow, but flag lowered confidence
      retryReason = 'OVERLAPPING_SPEECH';
      feedbackMessage = "I heard more than one voice. Let's make sure only you are speaking!";
    }
    // Rule 6: Acceptable vs Good
    else if (snrDb >= 15 && clippingCount === 0 && rms >= 0.04) {
      classification = 'GOOD';
      feedbackMessage = "Crystal clear audio!";
    } else {
      classification = 'ACCEPTABLE';
      feedbackMessage = "Good audio quality.";
    }

    return {
      rms,
      peakAmplitude: peak,
      hasClipping: clippingCount > 0,
      clippingCount,
      silenceRatio,
      speechRatio,
      noiseFloorDb: estimatedNoise,
      snrDb,
      dynamicRangeDb,
      durationMs,
      sampleRate,
      channelCount: 1,
      signalConsistencyScore,
      overlapState,
      classification,
      retryReason,
      feedbackMessage
    };
  }

  /**
   * Calculates independent Audio Quality Confidence (0 to 1)
   */
  public static calculateAudioConfidence(metrics: AudioQualityMetrics): number {
    if (metrics.classification === 'INVALID') return 0;
    if (metrics.classification === 'RETRY_REQUIRED') return 0.2;

    let score = 0.5;
    // SNR contribution (up to +0.3)
    if (metrics.snrDb >= 24) score += 0.3;
    else if (metrics.snrDb >= 15) score += 0.2;
    else if (metrics.snrDb >= 10) score += 0.1;

    // Clipping penalty
    if (metrics.clippingCount === 0) score += 0.1;
    else score -= Math.min(0.3, metrics.clippingCount * 0.02);

    // Consistency contribution
    score += metrics.signalConsistencyScore * 0.1;

    // Overlap penalty
    if (metrics.overlapState === 'MAJOR_OVERLAP') score -= 0.25;
    if (metrics.overlapState === 'MINOR_OVERLAP') score -= 0.1;

    return Math.max(0.1, Math.min(0.99, Number(score.toFixed(2))));
  }
}
