import React, { useState } from 'react';
import { TargetWord, PhonemeSpec } from '../../types/speech';
import { SpeechSynthesisEngine } from '../../engines/SpeechSynthesisEngine';
import { Volume2, Sparkles, Smile, Play } from 'lucide-react';

interface ModelingPlayerProps {
  target: TargetWord;
  phonemeSpec: PhonemeSpec;
  onModelListened: () => void;
}

export const ModelingPlayer: React.FC<ModelingPlayerProps> = ({
  target,
  phonemeSpec,
  onModelListened
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow'>('normal');

  const handlePlayModel = async () => {
    setIsPlaying(true);
    const rate = playbackSpeed === 'slow' ? 0.65 : 0.85;
    
    // First announce the target clearly
    await SpeechSynthesisEngine.speak(target.word, rate, 1.05);
    setIsPlaying(false);
    onModelListened();
  };

  const handlePlaySound = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    await SpeechSynthesisEngine.speak(phonemeSpec.symbol.replace(/\//g, ''), 0.6, 1.1);
    setIsPlaying(false);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/60 to-teal-50/40 rounded-3xl p-5 border border-amber-200/60 shadow-xs">
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Smile className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-child">Listen & Learn Model</h3>
            <p className="text-[11px] text-slate-500">Listen first, then try saying it after me!</p>
          </div>
        </div>

        {/* Speed toggle */}
        <div className="flex items-center bg-white/80 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
          <button
            onClick={() => setPlaybackSpeed('normal')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              playbackSpeed === 'normal' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setPlaybackSpeed('slow')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              playbackSpeed === 'slow' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Slow
          </button>
        </div>
      </div>

      {/* Articulatory Cue Card */}
      <div className="bg-white rounded-2xl p-4 border border-amber-100 mb-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-0.5">🗣️</div>
          <div>
            <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <span>Mouth & Tongue Cue:</span>
              <button 
                onClick={handlePlaySound}
                className="text-[11px] font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 underline underline-offset-2"
              >
                Hear {phonemeSpec.symbol} sound
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              "{phonemeSpec.articulatoryCue}"
            </p>
          </div>
        </div>
      </div>

      {/* Play Reference Button */}
      <button
        onClick={handlePlayModel}
        disabled={isPlaying}
        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-child shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>Listening to model...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-white" />
            <span>Play Model: "{target.word}"</span>
          </>
        )}
      </button>

    </div>
  );
};
