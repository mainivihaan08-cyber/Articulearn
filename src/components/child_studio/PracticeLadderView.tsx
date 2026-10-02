import React from 'react';
import { PracticeLadderStage } from '../../types/speech';
import { LADDER_STAGES } from '../../engines/PracticeLadderEngine';
import { CheckCircle2, Lock, ArrowUpCircle } from 'lucide-react';

interface PracticeLadderViewProps {
  currentStage: PracticeLadderStage;
  onSelectStage: (stage: PracticeLadderStage) => void;
  targetPhoneme: string;
}

export const PracticeLadderView: React.FC<PracticeLadderViewProps> = ({
  currentStage,
  onSelectStage,
  targetPhoneme
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-child flex items-center gap-1.5">
            <ArrowUpCircle className="w-4 h-4 text-teal-600" />
            Therapy Practice Ladder
          </h3>
          <p className="text-[11px] text-slate-500">Gradual progression from isolated sounds to spontaneous speech</p>
        </div>
        <div className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
          Stage {currentStage} of 8
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {LADDER_STAGES.map((stageInfo) => {
          const isCurrent = stageInfo.stage === currentStage;
          const isCompleted = stageInfo.stage < currentStage;

          return (
            <button
              key={stageInfo.stage}
              onClick={() => onSelectStage(stageInfo.stage)}
              className={`text-left p-3 rounded-2xl border transition-all relative ${
                isCurrent
                  ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20'
                  : isCompleted
                  ? 'border-slate-200 bg-emerald-50/30 hover:bg-emerald-50/60'
                  : 'border-slate-200/80 bg-white hover:bg-slate-50 opacity-85'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isCurrent ? 'bg-teal-600 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Stage {stageInfo.stage}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
                ) : (
                  <span className="text-[10px] text-slate-400">Next</span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-900 font-child truncate mb-0.5">
                {stageInfo.title.split(':')[1]?.trim() || stageInfo.title}
              </div>

              <div className="text-[11px] text-slate-500 line-clamp-1">
                {stageInfo.example}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
