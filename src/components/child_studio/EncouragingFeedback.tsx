import React, { useEffect } from 'react';
import { SpeechAttemptResult } from '../../types/speech';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

interface EncouragingFeedbackProps {
  result: SpeechAttemptResult;
  onTryAgain: () => void;
  onNextTarget: () => void;
  onListenModelAgain: () => void;
}

export const EncouragingFeedback: React.FC<EncouragingFeedbackProps> = ({
  result,
  onTryAgain,
  onNextTarget,
  onListenModelAgain
}) => {
  const isSuccessful = result.isValidAttempt && result.phonemeResults.every(p => p.assessment === 'CORRECT' || p.assessment === 'LIKELY_CORRECT');

  useEffect(() => {
    if (isSuccessful) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore
      }
    }
  }, [isSuccessful]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header Banner */}
      <div className={`p-4 rounded-2xl mb-5 flex items-start gap-3.5 ${
        isSuccessful ? 'bg-emerald-50 border border-emerald-200/60' : 'bg-amber-50 border border-amber-200/60'
      }`}>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
          isSuccessful ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
        }`}>
          {isSuccessful ? <Sparkles className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
        </div>
        <div>
          <h3 className={`text-base font-bold font-child ${
            isSuccessful ? 'text-emerald-900' : 'text-amber-900'
          }`}>
            {isSuccessful ? 'Super Clear Pronunciation! 🌟' : 'Great Effort Practicing! 💪'}
          </h3>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
            {result.childFeedbackText}
          </p>
        </div>
      </div>

      {/* Target Word & Phoneme Inspection */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">Target Word Breakdown</span>
          <span className="text-xs font-bold text-slate-700">/{result.target.targetPhoneme}/ ({result.target.targetPosition} sound)</span>
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap py-2">
          {result.phonemeResults.map((p, idx) => {
            const isTargetSound = p.phoneme === result.target.targetPhoneme;
            const isMatch = p.assessment === 'CORRECT' || p.assessment === 'LIKELY_CORRECT';

            return (
              <div
                key={idx}
                className={`flex flex-col items-center px-3 py-2 rounded-xl border text-center transition-all ${
                  isTargetSound
                    ? isMatch
                      ? 'bg-emerald-100/70 border-emerald-300 ring-2 ring-emerald-400/20'
                      : 'bg-amber-100/70 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-white border-slate-200'
                }`}
              >
                <span className="text-sm font-bold text-slate-900 font-mono">/{p.phoneme}/</span>
                <span className={`text-[10px] font-semibold mt-1 ${
                  isMatch ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {p.observedSound ? `[${p.observedSound}]` : '✓'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center text-[11px] text-slate-400 mt-2">
          Observed Syllables: {result.observedSyllableCount} of {result.expectedSyllables.length} ({result.expectedSyllables.join('·')})
        </div>
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={onListenModelAgain}
          className="py-2.5 px-4 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Hear Model</span>
        </button>

        <button
          onClick={onTryAgain}
          className="py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <button
          onClick={onNextTarget}
          className="py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
        >
          <span>Next Word</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
