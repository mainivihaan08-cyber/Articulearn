import React, { useMemo } from 'react';
import { ChildProfile, SpeechAttemptResult, SoundPosition } from '../../types/speech';
import { PrivacyStorageEngine } from '../../engines/PrivacyStorageEngine';
import { EvidencePatternEngine } from '../../engines/EvidencePatternEngine';
import { PHONEME_REGISTRY } from '../../engines/PhonemeDictionary';
import { HeartHandshake, TrendingUp, Sparkles, CheckCircle2, AlertCircle, Info, Calendar, Award } from 'lucide-react';

interface ParentDashboardProps {
  activeChild: ChildProfile | null;
  onOpenChildModal: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  activeChild,
  onOpenChildModal
}) => {
  const attempts = useMemo(() => {
    if (!activeChild) return [];
    return PrivacyStorageEngine.getAttempts(activeChild.id);
  }, [activeChild]);

  // Recompute profiles for all active sounds
  const phonemeKeys = Object.keys(PHONEME_REGISTRY);
  const profiles = useMemo(() => {
    return phonemeKeys.map(ph => EvidencePatternEngine.updatePhonemeProfile(ph, attempts));
  }, [attempts, phonemeKeys]);

  const recurringPatterns = useMemo(() => {
    return EvidencePatternEngine.detectRecurringPatterns(attempts);
  }, [attempts]);

  const totalValidAttempts = attempts.filter(a => a.isValidAttempt).length;
  const totalSuccess = attempts.filter(a => a.isValidAttempt && a.phonemeResults.every(p => p.assessment === 'CORRECT' || p.assessment === 'LIKELY_CORRECT')).length;
  const overallClarityRate = totalValidAttempts > 0 ? Math.round((totalSuccess / totalValidAttempts) * 100) : 0;

  if (!activeChild) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs max-w-md mx-auto">
          <HeartHandshake className="w-12 h-12 text-teal-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 font-child mb-2">No Active Child Profile</h2>
          <p className="text-xs text-slate-500 mb-6">Select or create a child profile to view progress and home practice tips.</p>
          <button
            onClick={onOpenChildModal}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Select Child Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Non-Diagnostic Educational Notice */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/70 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-teal-900">
            Educational Speech Practice Guide · Non-Diagnostic Notice
          </p>
          <p>
            ArticuLearn provides structured educational practice to encourage clear articulation. This platform does not diagnose speech or medical conditions. Persistent difficulties may benefit from evaluation by a certified Speech-Language Pathologist (SLP).
          </p>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md font-mono">
              Learning Profile
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{activeChild.age} years old</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-child">
            {activeChild.name}'s Speech Journey
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Summary of observed speech sounds, recent improvements, and home practice activities.
          </p>
        </div>

        {/* Big Metric Badge */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-center px-3 border-r border-slate-200">
            <span className="block text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalValidAttempts}</span>
            <span className="text-[11px] text-slate-500">Total Attempts</span>
          </div>
          <div className="text-center px-3">
            <span className="block text-2xl font-bold text-teal-600 font-mono tabular-nums">{overallClarityRate}%</span>
            <span className="text-[11px] text-slate-500">Clarity Rate</span>
          </div>
        </div>
      </div>

      {/* Observed Sounds Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-child flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Speech Sound Observations
            </h2>
            <p className="text-xs text-slate-500">Progress across practiced sounds and positions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((prof) => {
            const spec = PHONEME_REGISTRY[prof.phoneme];
            const hasData = prof.validAttempts > 0;

            return (
              <div
                key={prof.phoneme}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-mono font-bold text-sm flex items-center justify-center border border-teal-100">
                        {spec?.symbol || prof.phoneme}
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 font-child">{spec?.name || prof.phoneme}</h3>
                        <span className="text-[10px] text-slate-400 capitalize">{spec?.category}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      prof.masteryState === 'MASTERED' ? 'bg-emerald-100 text-emerald-800' :
                      prof.masteryState === 'IMPROVING' ? 'bg-teal-100 text-teal-800' :
                      prof.masteryState === 'NEEDS_REVIEW' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {prof.masteryState.replace('_', ' ')}
                    </span>
                  </div>

                  {hasData ? (
                    <div className="space-y-2 mb-4">
                      {/* Position Bars */}
                      <div className="text-[11px] space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>Beginning sound (e.g. rabbit)</span>
                          <span className="font-mono font-semibold">{prof.initialAccuracy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${prof.initialAccuracy}%` }} />
                        </div>

                        <div className="flex justify-between text-slate-600 pt-1">
                          <span>Middle sound (e.g. carrot)</span>
                          <span className="font-mono font-semibold">{prof.medialAccuracy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${prof.medialAccuracy}%` }} />
                        </div>

                        <div className="flex justify-between text-slate-600 pt-1">
                          <span>Ending sound (e.g. star)</span>
                          <span className="font-mono font-semibold">{prof.finalAccuracy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${prof.finalAccuracy}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No practice recorded for this sound yet.
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  {hasData ? (
                    <span>{prof.validAttempts} valid trials · Recent clarity: {prof.recentAccuracy}%</span>
                  ) : (
                    <span>Ready for first practice session</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Observations & Parent Tips */}
      {recurringPatterns.length > 0 && (
        <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-900 font-child">
              Observed Pronunciation Patterns
            </h3>
          </div>
          <div className="space-y-2">
            {recurringPatterns.map((pat) => (
              <div key={pat.id} className="p-3 bg-white rounded-2xl border border-amber-200 text-xs text-slate-700">
                <p className="font-semibold text-amber-950 mb-1">{pat.patternDescription}</p>
                <p className="text-slate-600">
                  Home Practice Tip: Model words slowly with a playful mouth movement. Praise their effort every time!
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
