import React from 'react';
import { CaptureState } from '../../types/speech';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface LiveMicVisualizerProps {
  state: CaptureState;
  micLevel: number;
  peakLevel: number;
  onStartCapture: () => void;
  onStopCapture: () => void;
  isCapturing: boolean;
  avatarSeed?: string;
  feedbackText?: string;
}

export const LiveMicVisualizer: React.FC<LiveMicVisualizerProps> = ({
  state,
  micLevel,
  onStartCapture,
  onStopCapture,
  isCapturing,
  feedbackText
}) => {
  // Normalize mic level (0 to 1) for visual bar heights
  const bars = [
    Math.min(1, Math.max(0.15, micLevel * 2.5)),
    Math.min(1, Math.max(0.2, micLevel * 4.0)),
    Math.min(1, Math.max(0.3, micLevel * 5.5)),
    Math.min(1, Math.max(0.2, micLevel * 3.8)),
    Math.min(1, Math.max(0.15, micLevel * 2.2))
  ];

  const getStatusContent = () => {
    switch (state) {
      case 'IDLE':
        return {
          title: "Ready to practice?",
          subtitle: "Tap the big microphone button when you want to speak!",
          color: "bg-slate-100 text-slate-700",
          icon: Mic
        };
      case 'READY':
        return {
          title: "I'm listening!",
          subtitle: "Tap 'Speak Now' and say the word clearly.",
          color: "bg-teal-50 text-teal-800",
          icon: Mic
        };
      case 'SPEAK_NOW':
        return {
          title: "Speak Now! 🗣️",
          subtitle: "Say your target sound clearly into the microphone.",
          color: "bg-emerald-50 text-emerald-800",
          icon: Sparkles
        };
      case 'SPEECH_DETECTED':
      case 'RECORDING':
        return {
          title: "I can hear you! 👂",
          subtitle: "Keep speaking naturally...",
          color: "bg-amber-50 text-amber-800",
          icon: Volume2
        };
      case 'PROCESSING':
      case 'ANALYZING':
        return {
          title: "Listening carefully... ✨",
          subtitle: "Checking your pronunciation...",
          color: "bg-indigo-50 text-indigo-800",
          icon: RefreshCw
        };
      case 'RETRY':
        return {
          title: "Let's try that one more time! 🔄",
          subtitle: feedbackText || "Tap below to try again.",
          color: "bg-amber-50 text-amber-900",
          icon: AlertCircle
        };
      case 'RESULT':
      default:
        return {
          title: "Great job practicing! 🌟",
          subtitle: feedbackText || "Keep up the awesome effort!",
          color: "bg-teal-50 text-teal-900",
          icon: Sparkles
        };
    }
  };

  const status = getStatusContent();
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-md mx-auto w-full text-center">
      
      {/* Friendly Guide Avatar */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-amber-50 flex items-center justify-center">
          <img
            src="/src/assets/images/hero_speech_buddy_1790963809721.jpg"
            alt="Speech Owl Guide"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        {isCapturing && (
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center animate-pulse shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white"></span>
          </span>
        )}
      </div>

      {/* Live State Banner */}
      <div className={`px-4 py-2 rounded-2xl ${status.color} transition-all duration-300 w-full mb-5`}>
        <div className="flex items-center justify-center gap-2 text-sm font-bold font-child">
          <StatusIcon className={`w-4 h-4 ${state === 'PROCESSING' || state === 'ANALYZING' ? 'animate-spin' : ''}`} />
          <span>{status.title}</span>
        </div>
        <p className="text-xs text-slate-600 mt-0.5">{status.subtitle}</p>
      </div>

      {/* Live Soundwave visualizer */}
      <div className="flex items-center justify-center gap-2 h-14 w-full px-8 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
        {bars.map((height, idx) => (
          <div
            key={idx}
            className={`w-3 rounded-full transition-all duration-75 ${
              isCapturing ? 'bg-teal-500 shadow-xs' : 'bg-slate-200'
            }`}
            style={{
              height: `${Math.max(8, height * 44)}px`
            }}
          />
        ))}
      </div>

      {/* Action Button */}
      {isCapturing ? (
        <button
          onClick={onStopCapture}
          className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base font-child shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-98"
        >
          <MicOff className="w-5 h-5" />
          <span>Done Speaking</span>
        </button>
      ) : (
        <button
          onClick={onStartCapture}
          disabled={state === 'ANALYZING' || state === 'PROCESSING'}
          className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base font-child shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
        >
          <Mic className="w-5 h-5" />
          <span>Tap to Speak</span>
        </button>
      )}

    </div>
  );
};
