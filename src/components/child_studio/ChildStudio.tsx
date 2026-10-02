import React, { useState, useEffect, useRef } from 'react';
import { 
  ChildProfile, 
  TargetWord, 
  PracticeLadderStage, 
  CaptureState, 
  SpeechAttemptResult 
} from '../../types/speech';
import { PHONEME_REGISTRY, TARGET_WORDS_CATALOG, getTargetsForPhoneme } from '../../engines/PhonemeDictionary';
import { AudioCaptureEngine } from '../../engines/AudioCaptureEngine';
import { PrivacyStorageEngine } from '../../engines/PrivacyStorageEngine';
import { EvidencePatternEngine } from '../../engines/EvidencePatternEngine';
import { LiveMicVisualizer } from './LiveMicVisualizer';
import { ModelingPlayer } from './ModelingPlayer';
import { PracticeLadderView } from './PracticeLadderView';
import { EncouragingFeedback } from './EncouragingFeedback';
import { SpeechSynthesisEngine } from '../../engines/SpeechSynthesisEngine';
import { Sparkles, ChevronRight, HelpCircle, CheckCircle2, Volume2 } from 'lucide-react';

interface ChildStudioProps {
  activeChild: ChildProfile | null;
  onOpenChildModal: () => void;
}

export const ChildStudio: React.FC<ChildStudioProps> = ({
  activeChild,
  onOpenChildModal
}) => {
  const [selectedPhoneme, setSelectedPhoneme] = useState('r');
  const [ladderStage, setLadderStage] = useState<PracticeLadderStage>(3);
  const [currentTarget, setCurrentTarget] = useState<TargetWord>(TARGET_WORDS_CATALOG[0]);
  const [captureState, setCaptureState] = useState<CaptureState>('IDLE');
  const [micLevel, setMicLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasListenedToModel, setHasListenedToModel] = useState(false);
  const [lastResult, setLastResult] = useState<SpeechAttemptResult | null>(null);

  const captureEngineRef = useRef<AudioCaptureEngine | null>(null);
  const activeSessionId = useRef<string>(`sess_${Date.now()}`);

  // Initialize Capture Engine
  useEffect(() => {
    captureEngineRef.current = new AudioCaptureEngine({
      onStateChange: (st) => setCaptureState(st),
      onMicLevel: (lvl, peak) => {
        setMicLevel(lvl);
        setPeakLevel(peak);
      },
      onError: (err) => console.warn('Audio capture error:', err)
    });

    return () => {
      captureEngineRef.current?.cleanup();
    };
  }, []);

  // Update target when phoneme changes
  useEffect(() => {
    const list = getTargetsForPhoneme(selectedPhoneme);
    if (list.length > 0) {
      setCurrentTarget(list[0]);
      setLastResult(null);
      setHasListenedToModel(false);
    }
  }, [selectedPhoneme]);

  const phonemeSpec = PHONEME_REGISTRY[selectedPhoneme] || PHONEME_REGISTRY['r'];
  const targetsForPhoneme = getTargetsForPhoneme(selectedPhoneme);

  const handleStartCapture = async () => {
    if (!activeChild) {
      onOpenChildModal();
      return;
    }
    setLastResult(null);
    setIsCapturing(true);
    await captureEngineRef.current?.startCapture();
  };

  const handleStopCapture = async () => {
    if (!activeChild) return;
    setIsCapturing(false);

    const result = await captureEngineRef.current?.stopAndAnalyze(
      currentTarget,
      activeChild.id,
      activeSessionId.current,
      ladderStage,
      'PRACTICE',
      hasListenedToModel,
      hasListenedToModel ? 'supported_audio' : 'independent'
    );

    if (result) {
      setLastResult(result);
      // Save strictly scoped by childId
      PrivacyStorageEngine.saveAttempt(result);
    }
  };

  const handleNextWord = () => {
    const currentIndex = targetsForPhoneme.findIndex(t => t.id === currentTarget.id);
    const nextIndex = (currentIndex + 1) % targetsForPhoneme.length;
    setCurrentTarget(targetsForPhoneme[nextIndex]);
    setLastResult(null);
    setHasListenedToModel(false);
  };

  const handleHearWordAgain = async () => {
    await SpeechSynthesisEngine.speak(currentTarget.word, 0.85);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Sound Selection Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-child flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Pick a Sound to Practice
            </h2>
            <p className="text-xs text-slate-500">Choose a speech sound below to start practicing step-by-step!</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {Object.keys(PHONEME_REGISTRY).map((phKey) => {
              const item = PHONEME_REGISTRY[phKey];
              const isSelected = selectedPhoneme === phKey;
              return (
                <button
                  key={phKey}
                  onClick={() => setSelectedPhoneme(phKey)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.symbol}
                </button>
              );
            })}
          </div>
        </div>

        {/* Word Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1">Words:</span>
          {targetsForPhoneme.map((tw) => {
            const isTarget = currentTarget.id === tw.id;
            return (
              <button
                key={tw.id}
                onClick={() => {
                  setCurrentTarget(tw);
                  setLastResult(null);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all capitalize font-child ${
                  isTarget
                    ? 'bg-teal-100 text-teal-900 border border-teal-300 ring-2 ring-teal-400/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tw.word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Target Visual Card & Modeling (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Target Word Hero Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center relative overflow-hidden">
            {currentTarget.imageUrl && (
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 shadow-inner">
                <img
                  src={currentTarget.imageUrl}
                  alt={currentTarget.word}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold text-slate-900 font-child capitalize">
                {currentTarget.word}
              </h1>
              <button
                onClick={handleHearWordAgain}
                className="p-1.5 rounded-full text-teal-600 hover:bg-teal-50 transition-colors"
                title="Listen to word"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs font-mono text-slate-500 font-medium mb-3">
              {currentTarget.phoneticSpelling} · {currentTarget.targetPosition} sound
            </div>

            {/* Syllable bubble */}
            <div className="inline-flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-xl text-xs font-bold text-slate-700 font-child">
              <span>Syllables:</span>
              <span className="text-teal-700">{currentTarget.syllables.join(' - ')}</span>
            </div>
          </div>

          {/* Modeling Cue Component */}
          <ModelingPlayer
            target={currentTarget}
            phonemeSpec={phonemeSpec}
            onModelListened={() => setHasListenedToModel(true)}
          />

        </div>

        {/* Right Column: Live Capture Engine & Encouraging Feedback (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {lastResult ? (
            <EncouragingFeedback
              result={lastResult}
              onTryAgain={() => {
                setLastResult(null);
                setCaptureState('READY');
              }}
              onNextTarget={handleNextWord}
              onListenModelAgain={handleHearWordAgain}
            />
          ) : (
            <LiveMicVisualizer
              state={captureState}
              micLevel={micLevel}
              peakLevel={peakLevel}
              onStartCapture={handleStartCapture}
              onStopCapture={handleStopCapture}
              isCapturing={isCapturing}
              feedbackText={undefined}
            />
          )}

          {/* Practice Ladder View */}
          <PracticeLadderView
            currentStage={ladderStage}
            onSelectStage={(st) => setLadderStage(st)}
            targetPhoneme={selectedPhoneme}
          />

        </div>

      </div>

    </div>
  );
};
