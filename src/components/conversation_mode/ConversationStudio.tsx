import React, { useState, useRef, useEffect } from 'react';
import { ChildProfile, CaptureState, SpeechAttemptResult, TargetWord } from '../../types/speech';
import { AudioCaptureEngine } from '../../engines/AudioCaptureEngine';
import { PrivacyStorageEngine } from '../../engines/PrivacyStorageEngine';
import { TARGET_WORDS_CATALOG } from '../../engines/PhonemeDictionary';
import { MessagesSquare, Mic, MicOff, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';

interface ConversationStudioProps {
  activeChild: ChildProfile | null;
  onOpenChildModal: () => void;
}

const CONVERSATION_PROMPTS = [
  {
    id: 'p1',
    title: 'Favorite Animal',
    question: 'Tell me about your favorite animal! Where does it live and what sounds does it make?',
    icon: '🦁',
    keySoundTarget: 'r'
  },
  {
    id: 'p2',
    title: 'Space Adventure',
    question: 'Imagine you are flying a fast rocket into outer space! What do you see past the stars?',
    icon: '🚀',
    keySoundTarget: 'r'
  },
  {
    id: 'p3',
    title: 'Sunny Day Outside',
    question: 'What is your favorite thing to do when the sun is shining outside on the playground?',
    icon: '☀️',
    keySoundTarget: 's'
  },
  {
    id: 'p4',
    title: 'Weekend Fun',
    question: 'What did you do today or over the weekend with your family or friends?',
    icon: '🎨',
    keySoundTarget: 'l'
  }
];

export const ConversationStudio: React.FC<ConversationStudioProps> = ({
  activeChild,
  onOpenChildModal
}) => {
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [captureState, setCaptureState] = useState<CaptureState>('IDLE');
  const [conversationResult, setConversationResult] = useState<SpeechAttemptResult | null>(null);

  const activePrompt = CONVERSATION_PROMPTS[selectedPromptIdx];
  const captureEngineRef = useRef<AudioCaptureEngine | null>(null);
  const sessionId = useRef(`conv_sess_${Date.now()}`);

  useEffect(() => {
    captureEngineRef.current = new AudioCaptureEngine({
      onStateChange: (st) => setCaptureState(st),
      onMicLevel: () => {}
    });

    return () => {
      captureEngineRef.current?.cleanup();
    };
  }, []);

  const handleStartConversation = async () => {
    if (!activeChild) {
      onOpenChildModal();
      return;
    }
    setConversationResult(null);
    setIsRecording(true);
    await captureEngineRef.current?.startCapture();
  };

  const handleStopConversation = async () => {
    if (!activeChild) return;
    setIsRecording(false);

    // Pick a natural probe target word matching prompt's key sound
    const probeTarget = TARGET_WORDS_CATALOG.find(w => w.targetPhoneme === activePrompt.keySoundTarget) || TARGET_WORDS_CATALOG[0];

    const result = await captureEngineRef.current?.stopAndAnalyze(
      probeTarget,
      activeChild.id,
      sessionId.current,
      8, // Stage 8: Natural Speech
      'CONVERSATION',
      false,
      'independent'
    );

    if (result) {
      setConversationResult(result);
      PrivacyStorageEngine.saveAttempt(result);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <MessagesSquare className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 font-child">Spontaneous Conversation Lab</h1>
          </div>
          <p className="text-xs text-slate-500">
            Natural speech without forced word repetition. Encourages spontaneous phonetic expression.
          </p>
        </div>

        {/* Prompt selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {CONVERSATION_PROMPTS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPromptIdx(idx);
                setConversationResult(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-child shrink-0 flex items-center gap-1.5 ${
                selectedPromptIdx === idx
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stage */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        
        <div className="max-w-xl mx-auto space-y-6">
          
          <div className="text-4xl">{activePrompt.icon}</div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-child leading-relaxed">
              "{activePrompt.question}"
            </h2>
          </div>

          <div className="text-xs text-slate-500 font-sans">
            Tip: Encourage the child to speak in full sentences and share their thoughts freely!
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {isRecording ? (
              <button
                onClick={handleStopConversation}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold font-child shadow-md transition-all flex items-center justify-center gap-2 mx-auto animate-pulse"
              >
                <MicOff className="w-5 h-5" />
                <span>Done Talking</span>
              </button>
            ) : (
              <button
                onClick={handleStartConversation}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold font-child shadow-md transition-all flex items-center justify-center gap-2 mx-auto active:scale-98"
              >
                <Mic className="w-5 h-5" />
                <span>Start Talking</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Natural Speech Result */}
      {conversationResult && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-child">Natural Speech Observation</h3>
              <p className="text-xs text-slate-500">Spontaneous phonetic output & conversational duration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-xs text-slate-400 block mb-1">Duration</span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {conversationResult.audioDuration.toFixed(1)}s
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-xs text-slate-400 block mb-1">Signal SNR</span>
              <span className="text-sm font-bold text-teal-700 font-mono">
                {conversationResult.audioQuality.snrDb.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-xs text-slate-400 block mb-1">Phonetic Evidence</span>
              <span className="text-sm font-bold text-emerald-700">
                {conversationResult.phonemeResults.length} Segments
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-700 bg-teal-50/50 p-4 rounded-2xl border border-teal-100/60">
            {conversationResult.childFeedbackText}
          </p>
        </div>
      )}

    </div>
  );
};
