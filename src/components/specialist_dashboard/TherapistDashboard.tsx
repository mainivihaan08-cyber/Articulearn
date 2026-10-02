import React, { useState, useMemo } from 'react';
import { ChildProfile, SpeechAttemptResult, SoundPosition } from '../../types/speech';
import { PrivacyStorageEngine } from '../../engines/PrivacyStorageEngine';
import { EvidencePatternEngine } from '../../engines/EvidencePatternEngine';
import { PHONEME_REGISTRY } from '../../engines/PhonemeDictionary';
import { Stethoscope, Download, Filter, Search, CheckCircle, AlertTriangle, FileText, ChevronDown } from 'lucide-react';

interface TherapistDashboardProps {
  activeChild: ChildProfile | null;
  onOpenChildModal: () => void;
}

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  activeChild,
  onOpenChildModal
}) => {
  const [selectedAttempt, setSelectedAttempt] = useState<SpeechAttemptResult | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const attempts = useMemo(() => {
    if (!activeChild) return [];
    return PrivacyStorageEngine.getAttempts(activeChild.id);
  }, [activeChild]);

  const filteredAttempts = useMemo(() => {
    if (filterType === 'ALL') return attempts;
    if (filterType === 'VALID') return attempts.filter(a => a.isValidAttempt);
    if (filterType === 'ERROR') return attempts.filter(a => a.isValidAttempt && a.phonemeResults.some(p => p.assessment === 'POSSIBLE_ERROR'));
    if (filterType === 'RETRY') return attempts.filter(a => !a.isValidAttempt);
    return attempts;
  }, [attempts, filterType]);

  const patterns = useMemo(() => {
    return EvidencePatternEngine.detectRecurringPatterns(attempts);
  }, [attempts]);

  const handleExportJSON = () => {
    if (!activeChild) return;
    const jsonStr = PrivacyStorageEngine.exportChildData(activeChild.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `articulearn_${activeChild.name}_clinical_record_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeChild) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs max-w-md mx-auto">
          <Stethoscope className="w-12 h-12 text-teal-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 font-child mb-2">No Active Child Profile</h2>
          <p className="text-xs text-slate-500 mb-6">Select or create a child profile to access acoustic diagnostics.</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 font-child">Speech Specialist & Acoustic Diagnostic Lab</h1>
          </div>
          <p className="text-xs text-slate-500">
            Phoneme-level acoustic inspection, 3-tier confidence tracking, and isolated clinical logs for {activeChild.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Clinical JSON</span>
          </button>
        </div>
      </div>

      {/* Acoustic Insights & Recurring Patterns Summary */}
      {patterns.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-teal-400 font-mono flex items-center gap-2">
              <FileText className="w-4 h-4" />
              IDENTIFIED RECURRING PHONOLOGICAL PATTERNS
            </h3>
            <span className="text-[11px] text-slate-400">{patterns.length} Pattern(s) Documented</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patterns.map((pat) => (
              <div key={pat.id} className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">/{pat.phoneme}/ ({pat.position} position)</span>
                  <span className="text-[11px] font-mono text-teal-300">Confidence: {Math.round(pat.patternConfidence * 100)}%</span>
                </div>
                <p className="text-xs text-slate-300">{pat.patternDescription}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Evidence across {pat.evidenceCount} trials · Target words: {pat.observedWords.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trials Table & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Attempt History List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 font-child">Session Trials History</h3>
            
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-medium rounded-lg border border-slate-200 px-2 py-1 bg-slate-50"
            >
              <option value="ALL">All ({attempts.length})</option>
              <option value="VALID">Valid Only</option>
              <option value="ERROR">Observed Diff Only</option>
              <option value="RETRY">Retries</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredAttempts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No trials recorded under this filter.
              </div>
            ) : (
              filteredAttempts.map((att) => {
                const isSelected = selectedAttempt?.id === att.id;
                const isSuccess = att.isValidAttempt && att.phonemeResults.every(p => p.assessment === 'CORRECT' || p.assessment === 'LIKELY_CORRECT');

                return (
                  <div
                    key={att.id}
                    onClick={() => setSelectedAttempt(att)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-child capitalize">
                          "{att.target.word}"
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          /{att.target.targetPhoneme}/
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        !att.isValidAttempt
                          ? 'bg-rose-100 text-rose-800'
                          : isSuccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {!att.isValidAttempt ? (att.retryReason || 'RETRY') : isSuccess ? 'CORRECT' : 'OBSERVED DIFF'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Stage {att.ladderStage} · {att.activityType}</span>
                      <span>{new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deep Diagnostic Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          {selectedAttempt ? (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Header Details */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 font-child capitalize">
                      Trial: "{selectedAttempt.target.word}"
                    </h2>
                    <span className="text-xs font-mono text-slate-500">
                      {selectedAttempt.target.phoneticSpelling}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target: /{selectedAttempt.target.targetPhoneme}/ ({selectedAttempt.target.targetPosition} position) · Activity: {selectedAttempt.activityType}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">ID: {selectedAttempt.id.slice(-8)}</div>
                  <div className="text-[11px] text-slate-500">{new Date(selectedAttempt.timestamp).toLocaleString()}</div>
                </div>
              </div>

              {/* 3 Separate Confidences Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 font-mono mb-3">
                  INDEPENDENT 3-TIER CONFIDENCE SYSTEM
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-400 block mb-1">Audio Quality</span>
                    <span className="text-base font-bold text-teal-700 font-mono tabular-nums">
                      {Math.round(selectedAttempt.audioQualityConfidence * 100)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-400 block mb-1">ASR Recognition</span>
                    <span className="text-base font-bold text-indigo-700 font-mono tabular-nums">
                      {Math.round(selectedAttempt.asrConfidence * 100)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-400 block mb-1">Pronunciation Analysis</span>
                    <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                      {Math.round(selectedAttempt.pronunciationConfidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Acoustic & Signal Metrics */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 font-mono">
                  ACOUSTIC SIGNAL CHARACTERISTICS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">RMS / Peak</span>
                    <span className="font-bold text-slate-800">
                      {selectedAttempt.audioQuality.rms.toFixed(3)} / {selectedAttempt.audioQuality.peakAmplitude.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Estimated SNR</span>
                    <span className="font-bold text-teal-700">
                      {selectedAttempt.audioQuality.snrDb.toFixed(1)} dB
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Digital Clipping</span>
                    <span className={`font-bold ${selectedAttempt.audioQuality.hasClipping ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {selectedAttempt.audioQuality.clippingCount} samples
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Speaker Overlap</span>
                    <span className="font-bold text-slate-800">
                      {selectedAttempt.audioQuality.overlapState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phoneme Level Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 font-mono">
                  PHONEME-LEVEL ALIGNMENT & EVIDENCE
                </h4>
                <div className="space-y-2">
                  {selectedAttempt.phonemeResults.map((p, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-200 font-mono font-bold flex items-center justify-center text-slate-800">
                          /{p.phoneme}/
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">
                            Observed: [{p.observedSound}] · Error: {p.errorType}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Spectral Centroid: {p.acousticEvidence.spectralCentroid || 'N/A'}Hz · Frication: {p.acousticEvidence.fricationEnergyRatio ?? 'N/A'}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                        p.assessment === 'CORRECT' || p.assessment === 'LIKELY_CORRECT' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.assessment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Triad: Observation / Interpretation / Recommendation */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-slate-800">
                  <span className="font-bold text-blue-900 block mb-1 font-mono">1. OBSERVATION:</span>
                  {selectedAttempt.clinicalObservation}
                </div>
                <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-slate-800">
                  <span className="font-bold text-indigo-900 block mb-1 font-mono">2. INTERPRETATION:</span>
                  {selectedAttempt.clinicalInterpretation}
                </div>
                <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-100 text-xs text-slate-800">
                  <span className="font-bold text-teal-900 block mb-1 font-mono">3. EDUCATIONAL RECOMMENDATION:</span>
                  {selectedAttempt.educationalRecommendation}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700 font-child">Select a trial to inspect</p>
              <p className="text-xs text-slate-400 mt-1">Click any trial on the left to view detailed acoustic & phonemic evidence.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
