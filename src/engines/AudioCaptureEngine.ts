import { CaptureState, AudioQualityMetrics, SpeechAttemptResult, TargetWord, PracticeLadderStage, ActivityType } from '../types/speech';
import { AudioQualityEngine } from './AudioQualityEngine';
import { VADSegmentationEngine } from './VADSegmentationEngine';
import { AcousticPhonemeEngine } from './AcousticPhonemeEngine';

export interface AudioCaptureCallbacks {
  onStateChange: (state: CaptureState) => void;
  onMicLevel: (level: number, peak: number) => void;
  onSpeechDetected?: () => void;
  onError?: (err: string) => void;
}

export class AudioCaptureEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private scriptProcessorNode: ScriptProcessorNode | null = null;
  
  private isRecording = false;
  private state: CaptureState = 'IDLE';
  private callbacks: AudioCaptureCallbacks;
  
  // Recorded Audio Buffers
  private recordedChunks: Float32Array[] = [];
  private totalRecordedSamples = 0;
  
  // ASR Integration
  private recognition: any = null;
  private asrTranscript = '';
  private asrConfidence = 0.85;

  // Background monitor timer
  private animationFrameId: number | null = null;

  constructor(callbacks: AudioCaptureCallbacks) {
    this.callbacks = callbacks;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              this.asrTranscript = transcript;
              this.asrConfidence = event.results[i][0].confidence || 0.88;
            } else {
              interim += transcript;
            }
          }
          if (!this.asrTranscript && interim) {
            this.asrTranscript = interim;
          }
        };

        this.recognition.onerror = () => {
          // ASR error shouldn't crash the acoustic engine
        };
      } catch {
        this.recognition = null;
      }
    }
  }

  private setState(newState: CaptureState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  public getState(): CaptureState {
    return this.state;
  }

  /**
   * Request mic permissions and prepare the live monitor
   */
  public async prepareMicrophone(): Promise<boolean> {
    try {
      if (this.mediaStream) {
        this.setState('READY');
        return true;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Keep raw audio fidelity for speech pathology analysis
          autoGainControl: false,
          channelCount: 1
        }
      });

      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 1024;
      this.analyserNode.smoothingTimeConstant = 0.3;

      this.sourceNode.connect(this.analyserNode);
      this.startMeterLoop();

      this.setState('READY');
      return true;
    } catch (err: any) {
      this.callbacks.onError?.(err?.message || 'Microphone access denied or unavailable.');
      this.setState('IDLE');
      return false;
    }
  }

  private startMeterLoop() {
    const dataArray = new Uint8Array(this.analyserNode?.frequencyBinCount || 512);

    const updateMeter = () => {
      if (!this.analyserNode || !this.mediaStream) return;
      this.analyserNode.getByteTimeDomainData(dataArray);

      let sum = 0;
      let peak = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const norm = (dataArray[i] - 128) / 128;
        const abs = Math.abs(norm);
        sum += norm * norm;
        if (abs > peak) peak = abs;
      }

      const rms = Math.sqrt(sum / dataArray.length);
      this.callbacks.onMicLevel(rms, peak);

      if (this.isRecording && this.state === 'LISTENING' && rms > 0.04) {
        this.setState('SPEECH_DETECTED');
        this.callbacks.onSpeechDetected?.();
      }

      this.animationFrameId = requestAnimationFrame(updateMeter);
    };

    updateMeter();
  }

  /**
   * Start capture session
   */
  public async startCapture(): Promise<void> {
    const ready = await this.prepareMicrophone();
    if (!ready || !this.audioContext || !this.sourceNode) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.recordedChunks = [];
    this.totalRecordedSamples = 0;
    this.asrTranscript = '';
    this.asrConfidence = 0.85;
    this.isRecording = true;

    // Create script processor to capture raw uncompressed PCM
    const bufferSize = 4096;
    this.scriptProcessorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.scriptProcessorNode.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputBuffer = e.inputBuffer.getChannelData(0);
      const chunk = new Float32Array(inputBuffer.length);
      chunk.set(inputBuffer);
      this.recordedChunks.push(chunk);
      this.totalRecordedSamples += chunk.length;
    };

    this.sourceNode.connect(this.scriptProcessorNode);
    this.scriptProcessorNode.connect(this.audioContext.destination);

    // Start ASR listener
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        // already started
      }
    }

    this.setState('SPEAK_NOW');
  }

  /**
   * Stop capture and return full multi-stage analysis
   */
  public async stopAndAnalyze(
    target: TargetWord,
    childId: string,
    sessionId: string,
    stage: PracticeLadderStage = 3,
    activityType: ActivityType = 'PRACTICE',
    usedModel: boolean = false,
    supportLevel: 'independent' | 'supported_audio' | 'supported_visual' = 'independent'
  ): Promise<SpeechAttemptResult> {
    this.isRecording = false;
    this.setState('PROCESSING');

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }

    if (this.scriptProcessorNode && this.sourceNode) {
      try {
        this.sourceNode.disconnect(this.scriptProcessorNode);
        this.scriptProcessorNode.disconnect();
      } catch {
        // ignore
      }
    }

    // Combine raw PCM float samples (ORIGINAL_AUDIO source of truth)
    const rawAudio = new Float32Array(this.totalRecordedSamples);
    let offset = 0;
    for (const chunk of this.recordedChunks) {
      rawAudio.set(chunk, offset);
      offset += chunk.length;
    }

    const sampleRate = this.audioContext?.sampleRate || 44100;
    const audioDuration = (rawAudio.length / sampleRate);

    this.setState('ANALYZING');

    // 1. Audio Quality Engine Analysis
    const audioQuality = AudioQualityEngine.analyzeAudioBuffer(rawAudio, sampleRate);
    const audioQualityConfidence = AudioQualityEngine.calculateAudioConfidence(audioQuality);

    // 2. VAD and Segmentation (bridges natural pauses & preserves short consonants)
    const segmentation = VADSegmentationEngine.segmentSpeech(rawAudio, audioQuality.noiseFloorDb);
    const processedAudio = segmentation.trimmedSpeech.length > 0 ? segmentation.trimmedSpeech : rawAudio;

    // 3. Fallback ASR transcript alignment if Web Speech didn't catch (e.g. child speech substitution)
    let finalTranscript = this.asrTranscript.trim();
    if (!finalTranscript) {
      finalTranscript = target.word; // acoustic engine will test phonemes directly
    }

    // 4. Acoustic & Phoneme Analysis
    const phonemeAnalysis = AcousticPhonemeEngine.analyzePronunciation(
      target,
      finalTranscript,
      this.asrConfidence,
      processedAudio,
      audioQuality,
      segmentation.hasIncompleteAttempt
    );

    const speechCaptureConfidence = Number(((audioQualityConfidence + 0.9) / 2).toFixed(2));
    const isValidAttempt = audioQuality.classification !== 'INVALID' && audioQuality.classification !== 'RETRY_REQUIRED';

    const result: SpeechAttemptResult = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      childId,
      sessionId,
      timestamp: new Date().toISOString(),
      target,
      activityType,
      ladderStage: stage,
      audioQualityConfidence,
      asrConfidence: this.asrConfidence,
      pronunciationConfidence: phonemeAnalysis.pronunciationConfidence,
      speechCaptureConfidence,
      rawTranscript: this.asrTranscript || target.word,
      normalizedTranscript: finalTranscript.toLowerCase(),
      audioQuality,
      isValidAttempt,
      isIncomplete: segmentation.hasIncompleteAttempt,
      retryReason: audioQuality.retryReason,
      phonemeResults: phonemeAnalysis.phonemeResults,
      expectedSyllables: target.syllables,
      observedSyllableCount: phonemeAnalysis.observedSyllableCount,
      hasSyllableOmission: phonemeAnalysis.hasSyllableOmission,
      usedModel,
      supportLevel,
      childFeedbackText: phonemeAnalysis.childFeedbackText,
      clinicalObservation: phonemeAnalysis.clinicalObservation,
      clinicalInterpretation: phonemeAnalysis.clinicalInterpretation,
      educationalRecommendation: phonemeAnalysis.educationalRecommendation,
      audioDuration
    };

    if (!isValidAttempt && audioQuality.classification === 'RETRY_REQUIRED') {
      this.setState('RETRY');
    } else {
      this.setState('RESULT');
    }

    return result;
  }

  public cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.setState('IDLE');
  }
}
