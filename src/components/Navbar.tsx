import React from 'react';
import { 
  Sparkles, 
  Settings, 
  Code, 
  History, 
  Volume2, 
  Radio, 
  Cpu,
  HardDrive
} from 'lucide-react';
import { User } from 'firebase/auth';
import { EngineMode } from '../types/tts';

interface NavbarProps {
  engine: EngineMode;
  onEngineChange: (engine: EngineMode) => void;
  hasGeminiKey: boolean;
  onOpenSettings: () => void;
  onOpenExportModal: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  user: User | null;
  onOpenDriveModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  engine,
  onEngineChange,
  hasGeminiKey,
  onOpenSettings,
  onOpenExportModal,
  onOpenHistory,
  historyCount,
  user,
  onOpenDriveModal,
}) => {
  return (
    <header className="w-full border-b border-white/[0.07] bg-[#090b10]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300">
              <span className="font-malayalam text-xl leading-none">സ്വ</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#090b10]"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                SvaraAI Studio
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                മലയാളം & Multilingual TTS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Professional Voiceover Synthesis & Audio Generator
            </p>
          </div>
        </div>

        {/* Engine Switcher & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Engine Selector Segmented Control */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-white/10 flex items-center shadow-inner">
            <button
              onClick={() => onEngineChange('gemini')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                engine === 'gemini'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Studio Quality Gemini 3.8 Flash TTS"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Gemini AI Studio</span>
              <span className="md:hidden">AI Studio</span>
              {hasGeminiKey && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => onEngineChange('webspeech')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                engine === 'webspeech'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Browser Web Speech API (Instant & Offline)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Web Speech API</span>
              <span className="md:hidden">Web API</span>
            </button>
          </div>

          {/* Google Drive Integration Button */}
          <button
            onClick={onOpenDriveModal}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              user 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Google Drive Cloud Storage"
          >
            <HardDrive className={`w-4 h-4 ${user ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">{user ? 'Google Drive' : 'Connect Drive'}</span>
            {user && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          {/* Standalone Export Button */}
          <button
            onClick={onOpenExportModal}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Single-File HTML Code Export"
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">Single-File Code</span>
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Voiceover History"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="API & Studio Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-slate-300 hover:rotate-45 transition-transform duration-300" />
          </button>

        </div>

      </div>
    </header>
  );
};
