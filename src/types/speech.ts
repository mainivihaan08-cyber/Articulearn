// Core Types for ArticuLearn Platform

export type SoundPosition = 'initial' | 'medial' | 'final';

export type PhonemeCategory = 
  | 'liquid'      // /r/, /l/
  | 'glide'       // /w/, /j/
  | 'fricative'   // /s/, /z/, /f/, /v/, /θ/, /ð/, /ʃ/, /ʒ/, /h/
  | 'affricate'   // /tʃ/, /dʒ/
  | 'stop'        // /p/, /b/, /t/, /d/, /k/, /g/
  | 'nasal'       // /m/, /n/, /ŋ/
  | 'vowel';      // monophthongs & diphthongs

export type CaptureState = 
  | 'IDLE'
  | 'READY'
  | 'LISTENING'
  | 'SPEAK_NOW'
  | 'SPEECH_DETECTED'
  | 'RECORDING'
  | 'PROCESSING'
  | 'ANALYZING'
  | 'RESULT'
  | 'RETRY';

export type AudioQualityClassification = 
  | 'GOOD'
  | 'ACCEPTABLE'
  | 'POOR'
  | 'RETRY_REQUIRED'
  | 'INVALID';

export type RetryReason = 
  | 'NO_SPEECH'
  | 'TOO_QUIET'
  | 'TOO_LOUD'
  | 'CLIPPED_AUDIO'
  | 'HIGH_NOISE'
  | 'OVERLAPPING_SPEECH'
  | 'INCOMPLETE_ATTEMPT'
  | 'INVALID_AUDIO'
  | 'ANALYSIS_FAILED'
  | 'INSUFFICIENT_EVIDENCE';

export type OverlapState = 
  | 'NO_OVERLAP'
  | 'MINOR_OVERLAP'
  | 'MAJOR_OVERLAP'
  | 'UNCERTAIN';

export type PronunciationAssessment = 
  | 'CORRECT'
  | 'LIKELY_CORRECT'
  | 'POSSIBLE_ERROR'
  | 'LIKELY_ERROR'
  | 'UNCERTAIN'
  | 'NOT_DETECTED';

export type ErrorType = 
  | 'NONE'
  | 'SUBSTITUTION'
  | 'OMISSION'
  | 'ADDITION'
  | 'DISTORTION'
  | 'TIMING_DIFFERENCE'
  | 'INCONSISTENT_PRODUCTION';

export type PracticeLadderStage = 
  | 1 // Sound (/r/)
  | 2 // Syllable (ra, ri, ru)
  | 3 // Word (rabbit)
  | 4 // Multiple Words (rabbit, rocket, rain)
  | 5 // Phrase (red rabbit)
  | 6 // Sentence (The red rabbit runs)
  | 7 // Reading (Short story)
  | 8; // Natural Speech (Spontaneous conversation)

export type ActivityType = 
  | 'PRACTICE'
  | 'ASSESSMENT'
  | 'READING'
  | 'PHONICS'
  | 'SPEECH'
  | 'CONVERSATION'
  | 'GENERALIZATION';

export type MasteryState = 
  | 'NOT_STARTED'
  | 'LEARNING'
  | 'PRACTICING'
  | 'IMPROVING'
  | 'ALMOST_MASTERED'
  | 'MASTERED'
  | 'NEEDS_REVIEW'
  | 'INSUFFICIENT_DATA';

export interface PhonemeSpec {
  symbol: string;         // IPA or Arpabet e.g. /r/, /s/, /w/
  arpabet: string;        // 'R', 'S', 'W'
  name: string;           // 'R sound', 'S sound'
  category: PhonemeCategory;
  articulatoryCue: string;// Kid-friendly cue e.g. "Curl your tongue back like a roaring tiger"
  exampleWords: {
    initial: string[];
    medial: string[];
    final: string[];
  };
}

export interface TargetWord {
  id: string;
  word: string;
  phoneticSpelling: string;
  targetPhoneme: string;
  targetPosition: SoundPosition;
  expectedPhonemes: string[];
  syllables: string[];
  isUnseenProbe?: boolean; // For Generalization Testing
  imageUrl?: string;
  phrase?: string;
  sentence?: string;
  storyContext?: string;
}

export interface AudioQualityMetrics {
  rms: number;                   // 0 to 1
  peakAmplitude: number;         // 0 to 1
  hasClipping: boolean;
  clippingCount: number;
  silenceRatio: number;          // 0 to 1
  speechRatio: number;           // 0 to 1
  noiseFloorDb: number;          // in dB (e.g. -50dB)
  snrDb: number;                 // Signal-to-Noise Ratio (dB)
  dynamicRangeDb: number;
  durationMs: number;
  sampleRate: number;
  channelCount: number;
  signalConsistencyScore: number;// 0 to 1
  overlapState: OverlapState;
  classification: AudioQualityClassification;
  retryReason?: RetryReason;
  feedbackMessage?: string;
}

export interface SpeechSegment {
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  isSpeech: boolean;
  confidence: number;
  energy: number;
}

export interface PhonemeAttemptResult {
  phoneme: string;
  targetPhoneme: string;
  position: SoundPosition;
  observedSound: string;
  errorType: ErrorType;
  assessment: PronunciationAssessment;
  confidence: number;            // 0 to 1
  acousticEvidence: {
    formantF1?: number | null;
    formantF2?: number | null;
    formantF3?: number | null;
    spectralCentroid?: number | null;
    fricationEnergyRatio?: number | null;
    voicingRatio?: number | null;
    durationMs: number;
  };
}

export interface SpeechAttemptResult {
  id: string;
  childId: string;
  sessionId: string;
  timestamp: string;
  target: TargetWord;
  activityType: ActivityType;
  ladderStage: PracticeLadderStage;
  
  // 3 Separate Confidences
  audioQualityConfidence: number;      // 0 to 1
  asrConfidence: number;               // 0 to 1
  pronunciationConfidence: number;     // 0 to 1
  speechCaptureConfidence: number;     // 0 to 1
  
  // ASR Transcript Data
  rawTranscript: string;
  normalizedTranscript: string;
  
  // Audio Metrics & Quality
  audioQuality: AudioQualityMetrics;
  
  // Status flags
  isValidAttempt: boolean;
  isIncomplete: boolean;
  retryReason?: RetryReason;
  
  // Phoneme Level Analysis
  phonemeResults: PhonemeAttemptResult[];
  
  // Syllable Level Analysis
  expectedSyllables: string[];
  observedSyllableCount: number;
  hasSyllableOmission: boolean;
  
  // Modeling Support
  usedModel: boolean;
  supportLevel: 'independent' | 'supported_audio' | 'supported_visual';
  
  // Child Feedback
  childFeedbackText: string;
  clinicalObservation: string;
  clinicalInterpretation: string;
  educationalRecommendation: string;
  
  // Audio references (stored in memory/blob store)
  audioDuration: number;
}

export interface ChildPhonemeProfile {
  phoneme: string;
  totalAttempts: number;
  validAttempts: number;
  successfulAttempts: number;
  possibleErrors: number;
  likelyErrors: number;
  initialAccuracy: number;       // 0 to 100%
  medialAccuracy: number;        // 0 to 100%
  finalAccuracy: number;         // 0 to 100%
  practiceAccuracy: number;      // 0 to 100%
  readingAccuracy: number;       // 0 to 100%
  naturalSpeechAccuracy: number; // 0 to 100%
  recentAccuracy: number;        // weighted last 5 attempts
  trend: 'improving' | 'stable' | 'needs_practice' | 'insufficient_data';
  patternConfidence: number;     // 0 to 1
  masteryState: MasteryState;
  lastAttemptDate?: string;
  updatedAt: string;
}

export interface ChildWordProfile {
  word: string;
  targetPhoneme: string;
  attempts: number;
  successfulAttempts: number;
  difficultyAttempts: number;
  recentAccuracy: number;
  longTermAccuracy: number;
  confidence: number;
  errorPatterns: string[];
  phonemesInvolved: string[];
  practiceCount: number;
  masteryState: MasteryState;
  lastPracticed?: string;
  lastAssessed?: string;
}

export interface RecurringPattern {
  id: string;
  phoneme: string;
  position: SoundPosition;
  patternDescription: string;     // e.g. "Frequent substitution /r/ → /w/ in initial position"
  errorType: ErrorType;
  substitutedSound?: string;
  evidenceCount: number;
  patternConfidence: number;      // 0 to 1
  observedWords: string[];
  lastObserved: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  createdAt: string;
  avatarSeed: string;
  notes?: string;
}

export interface PracticeSession {
  id: string;
  childId: string;
  startTime: string;
  endTime?: string;
  activityType: ActivityType;
  targetPhoneme: string;
  ladderStage: PracticeLadderStage;
  attemptsCount: number;
  successfulCount: number;
}
