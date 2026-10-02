import React, { useState, useRef, useEffect } from 'react';
import { ChildProfile, TargetWord, CaptureState, SpeechAttemptResult } from '../../types/speech';
import { TARGET_WORDS_CATALOG } from '../../engines/PhonemeDictionary';
import { AudioCaptureEngine } from '../../engines/AudioCaptureEngine';
import { PrivacyStorageEngine } from '../../engines/PrivacyStorageEngine';
import { SpeechSynthesisEngine } from '../../engines/SpeechSynthesisEngine';
import { BookOpen, Mic, MicOff, Volume2, Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react';

interface ReadingStudioProps {
  activeChild: ChildProfile | null;
  onOpenChildModal: () => void;
}

export const ReadingStudio: React.FC<ReadingStudioProps> = ({
  activeChild,
  onOpenChildModal
}) => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [captureState, setCaptureState] = useState<CaptureState>('IDLE');
  const [lastReadingResult, setLastReadingResult] = useState<SpeechAttemptResult | null>(null);

  const readingTargets: TargetWord[] = TARGET_WORDS_CATALOG.filter(w => w.sentence && w.storyContext);
  const currentTarget = readingTargets[selectedStoryIndex] || readingTargets[0];

  const captureEngineRef = useRef<AudioCaptureEngine | null>(null);
  const sessionId = useRef(`reading_sess_${Date.now()}`);

  useEffect(() => {
    captureEngineRef.current = new AudioCaptureEngine({
      onStateChange: (st) => setCaptureState(st),
      onMicLevel: () => {}
    });

    return () => {
      captureEngineRef.current?.cleanup();
    };
  }, []);

  const handleStartReading = async () => {
    if (!activeChild) {
      onOpenChildModal();
      return;
    }
    setLastReadingResult(null);
    setIsRecording(true);
    await captureEngineRef.current?.startCapture();
  };

  const handleStopReading = async () => {
    if (!activeChild) return;
    setIsRecording(false);

    const result = await captureEngineRef.current?.stopAndAnalyze(
      currentTarget,
      activeChild.id,
      sessionId.current,
      7, // Stage 7: Reading
      'READING',
      false,
      'independent'
    );

    if (result) {
      setLastReadingResult(result);
      PrivacyStorageEngine.saveAttempt(result);
    }
  };

  const handleListenStory = async () => {
    await SpeechSynthesisEngine.speak(currentTarget.sentence || currentTarget.word, 0.85);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 font-child">Story Reading Studio</h1>
          </div>
          <p className="text-xs text-slate-500">
            Read sentences and short passages aloud to practice sound clarity in connected text.
          </p>
        </div>

        {/* Story Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {readingTargets.slice(0, 5).map((tw, idx) => (
            <button
              key={tw.id}
              onClick={() => {
                setSelectedStoryIndex(idx);
                setLastReadingResult(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize font-child shrink-0 ${
                selectedStoryIndex === idx
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Story {idx + 1}: {tw.word}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative">
        
        <div className="max-w-2xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-200/60 font-child">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Target Sound: /{currentTarget.targetPhoneme}/ in "{currentTarget.word}"</span>
          </div>

          {/* Primary Sentence to Read */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-child leading-relaxed tracking-wide">
              "{currentTarget.sentence}"
            </p>
          </div>

          {/* Story Context Paragraph */}
          <div className="p-4 bg-teal-50/40 rounded-2xl border border-teal-100/60 text-sm text-slate-600 leading-relaxed font-sans">
            <span className="font-semibold text-teal-900 mr-2">Context Story:</span>
            {currentTarget.storyContext}
          </div>

          {/* Audio Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            
            <button
              onClick={handleListenStory}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-child transition-colors flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-slate-600" />
              <span>Hear Sentence Read Aloud</span>
            </button>

            {isRecording ? (
              <button
                onClick={handleStopReading}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-child shadow-md transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                <MicOff className="w-4 h-4" />
                <span>Done Reading</span>
              </button>
            ) : (
              <button
                onClick={handleStartReading}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold font-child shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Mic className="w-4 h-4" />
                <span>Read Aloud Now</span>
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Reading Result Feedback */}
      {lastReadingResult && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-child">Reading Observation</h3>
              <p className="text-xs text-slate-500">Connected speech accuracy and fluency indicators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-xs text-slate-400 block mb-1">Target Clarity</span>
              <span className="text-sm font-bold text-emerald-700">
                {lastReadingResult.phonemeResults.every(p => p.assessment === 'CORRECT' || p.assessment === 'LIKELY_CORRECT') ? 'Clear Production' : 'Observed Variation'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-xs text-slate-400 block mb-1">Reading Duration</span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {lastReadingResult.audioDuration.toFixed(1)}s
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-xs text-slate-400 block mb-1">Audio Confidence</span>
              <span className="text-sm font-bold text-teal-700 font-mono">
                {Math.round(lastReadingResult.audioQualityConfidence * 100)}%
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-700 bg-teal-50/50 p-4 rounded-2xl border border-teal-100/60">
            {lastReadingResult.childFeedbackText}
          </p>
        </div>
      )}

    </div>
  );
};
