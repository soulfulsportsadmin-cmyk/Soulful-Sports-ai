import React from 'react';
import { 
  X, 
  Trash2, 
  Play, 
  Pause, 
  Download, 
  ArrowUpRight, 
  Clock, 
  Radio, 
  Volume2, 
  FileText 
} from 'lucide-react';
import { GeneratedVoiceover } from '../types/tts';
import { formatTime } from '../utils/audioUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedVoiceover[];
  onSelectVoiceover: (item: GeneratedVoiceover) => void;
  onRestoreScript: (text: string) => void;
  onClearHistory: () => void;
  currentPlayingId: string | null;
  isPlaying: boolean;
  onTogglePlayHistory: (item: GeneratedVoiceover) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectVoiceover,
  onRestoreScript,
  onClearHistory,
  currentPlayingId,
  isPlaying,
  onTogglePlayHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#0b0e14] border-l border-white/10 h-full p-6 shadow-2xl flex flex-col gap-5 z-10 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Voiceover Library</h3>
              <p className="text-xs text-slate-400">{history.length} generated recordings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500 text-center px-4">
              <Volume2 className="w-10 h-10 opacity-30 text-indigo-400" />
              <p className="text-sm font-medium">No voiceovers generated yet.</p>
              <p className="text-xs text-slate-600">
                Click 'Generate & Download Voiceover' to build your voiceover catalog.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const isItemPlaying = currentPlayingId === item.id && isPlaying;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/70 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-200">
                          {item.voiceName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                          {item.engine === 'gemini' ? 'Gemini AI' : 'Web Speech'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ~{item.duration}s
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.text}
                      </p>
                    </div>

                    {/* Inline Quick Play Button */}
                    <button
                      onClick={() => onTogglePlayHistory(item)}
                      className={`p-2.5 rounded-xl flex-shrink-0 transition-transform active:scale-95 ${
                        isItemPlaying
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title={isItemPlaying ? 'Pause' : 'Play'}
                    >
                      {isItemPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onRestoreScript(item.text);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors text-[11px]"
                        title="Load this script back into the editor"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <a
                        href={item.audioUrl}
                        download={`svara_${item.voiceName.toLowerCase()}_voiceover.wav`}
                        className="px-2 py-1 rounded bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 flex items-center gap-1 transition-colors text-[11px]"
                        title="Download audio file"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 text-center text-[11px] text-slate-500">
          Audio recordings are stored in this browser session
        </div>

      </div>
    </div>
  );
};
