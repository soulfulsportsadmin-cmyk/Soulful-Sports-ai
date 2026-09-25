import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Gauge, 
  Music2, 
  Volume2, 
  Sparkles, 
  Loader2, 
  Download,
  Zap
} from 'lucide-react';
import { GenerationSettings } from '../types/tts';

interface AudioControlsProps {
  settings: GenerationSettings;
  onChange: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  onReset: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  settings,
  onChange,
  onReset,
  onGenerate,
  isGenerating,
  disabled,
}) => {
  return (
    <div className="rounded-2xl p-5 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col gap-5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Audio Synthesis Controls</h3>
            <p className="text-[11px] text-slate-400">Tempo, pitch, volume, and encoding</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          title="Reset to default settings"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Speed / Tempo */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/40 border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              Speed (Tempo)
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {settings.speed.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={settings.speed}
            onChange={(e) => onChange('speed', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.5x Slow</span>
            <span>1.0x Normal</span>
            <span>2.0x Fast</span>
          </div>
        </div>

        {/* Pitch / Frequency */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/40 border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Music2 className="w-3.5 h-3.5 text-indigo-400" />
              Voice Pitch
            </span>
            <span className="font-mono text-indigo-400 font-bold">
              {settings.pitch.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={settings.pitch}
            onChange={(e) => onChange('pitch', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.5x Deep</span>
            <span>1.0x Balanced</span>
            <span>1.8x High</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/40 border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              Master Volume
            </span>
            <span className="font-mono text-teal-400 font-bold">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={settings.volume}
            onChange={(e) => onChange('volume', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% Mute</span>
            <span>50%</span>
            <span>100% Max</span>
          </div>
        </div>

      </div>

      {/* Format & Output Quality */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Audio Format:</span>
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => onChange('format', 'wav')}
              className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                settings.format === 'wav'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WAV (Lossless 24kHz)
            </button>
            <button
              onClick={() => onChange('format', 'mp3')}
              className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                settings.format === 'mp3'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MP3 (Compressed)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Direct High-Speed Audio Encoding</span>
        </div>
      </div>

      {/* Main Glowing Action Button */}
      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating || disabled}
          className="w-full py-4 px-6 rounded-2xl font-bold text-white text-sm sm:text-base bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:via-teal-400 hover:to-indigo-500 active:scale-[0.99] transition-all duration-300 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"></div>

          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Synthesizing Studio Audio...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform duration-300" />
              <span>Generate & Download Voiceover</span>
              <Download className="w-4 h-4 text-cyan-200 group-hover:translate-y-0.5 transition-transform duration-300" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
