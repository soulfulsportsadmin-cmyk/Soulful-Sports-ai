import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Trash2, 
  Check, 
  Wand2, 
  Clock, 
  Languages, 
  Bookmark,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { SCRIPT_PRESETS } from '../utils/presets';
import { ScriptPreset } from '../types/tts';
import { estimateDuration } from '../utils/audioUtils';

interface ScriptEditorProps {
  text: string;
  onTextChange: (newText: string) => void;
  speed: number;
  onApplyPreset: (preset: ScriptPreset) => void;
  onOptimizeScript: (goal: string) => Promise<void>;
  isOptimizing: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  text,
  onTextChange,
  speed,
  onApplyPreset,
  onOptimizeScript,
  isOptimizing,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estSeconds = estimateDuration(text, 'ml-IN', speed);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertPunctuation = (char: string) => {
    onTextChange(text + (text.endsWith(' ') ? '' : ' ') + char + ' ');
  };

  return (
    <div className="rounded-2xl p-5 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col gap-4">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">Voiceover Script & Narration</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono">
                മലയാളം / English
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Type or paste your voiceover script
            </p>
          </div>
        </div>

        {/* Script Presets Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              onChange={(e) => {
                const found = SCRIPT_PRESETS.find((p) => p.id === e.target.value);
                if (found) onApplyPreset(found);
              }}
              defaultValue=""
              className="bg-slate-950 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 pr-8 appearance-none cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="" disabled>⚡ Load Authentic Script Presets...</option>
              <optgroup label="🌴 Malayalam Voiceover Scripts">
                {SCRIPT_PRESETS.filter((p) => p.category === 'malayalam').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌐 Multilingual Scripts">
                {SCRIPT_PRESETS.filter((p) => p.category === 'multilingual').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* AI Script Polish Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAiMenuOpen(!aiMenuOpen)}
              disabled={isOptimizing || !text.trim()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              title="AI Script Director & Malayalam Polish"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{isOptimizing ? 'Polishing...' : 'AI Director'}</span>
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            </button>

            {aiMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/15 rounded-xl shadow-2xl p-1.5 z-30 flex flex-col gap-1 backdrop-blur-2xl">
                <button
                  onClick={() => {
                    setAiMenuOpen(false);
                    onOptimizeScript('malayalam_narration');
                  }}
                  className="px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors flex flex-col"
                >
                  <span className="font-semibold">Optimize for Malayalam Narration</span>
                  <span className="text-[10px] text-slate-400">Adds natural pauses and cadence</span>
                </button>

                <button
                  onClick={() => {
                    setAiMenuOpen(false);
                    onOptimizeScript('translate_to_malayalam');
                  }}
                  className="px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors flex flex-col"
                >
                  <span className="font-semibold">Translate into Spoken Malayalam</span>
                  <span className="text-[10px] text-slate-400">Natural voiceover translation</span>
                </button>

                <button
                  onClick={() => {
                    setAiMenuOpen(false);
                    onOptimizeScript('add_ssml_pauses');
                  }}
                  className="px-3 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors flex flex-col"
                >
                  <span className="font-semibold">Add Dramatic Breath Pauses</span>
                  <span className="text-[10px] text-slate-400">Inserts punctuation for storytelling</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={6}
          placeholder="ഇവിടെ നിങ്ങളുടെ മലയാളം അല്ലെങ്കിൽ മറ്റ് ഭാഷകളിലെ വാചകങ്ങൾ ടൈപ്പ് ചെയ്യുക... (Type or paste Malayalam or multilingual voiceover script here)"
          className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-4 text-slate-100 text-sm sm:text-base leading-relaxed focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/40 resize-y transition-all font-sans placeholder:text-slate-500"
          style={{ minHeight: '140px' }}
        />

        {/* Clear & Copy Floating Buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 transition-colors"
            title="Copy script"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onTextChange('')}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-white/5 transition-colors"
            title="Clear text"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Punctuation Bar for Malayalam Oral Cadence */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[11px] text-slate-500">Insert Pauses:</span>
          {[
            { label: '...', desc: 'Pause (വിരാമം)' },
            { label: ',', desc: 'Comma' },
            { label: '!', desc: 'Emphasis' },
            { label: '?', desc: 'Question' },
            { label: '—', desc: 'Break' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => insertPunctuation(item.label)}
              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-white/5 text-cyan-300 font-mono hover:border-cyan-500/30 transition-colors"
              title={item.desc}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Real-time stats */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>
            Chars: <strong className="text-slate-200">{charCount}</strong>
          </span>
          <span>
            Words: <strong className="text-slate-200">{wordCount}</strong>
          </span>
          <span className="flex items-center gap-1 text-cyan-400 font-medium">
            <Clock className="w-3 h-3" />
            Est. ~{estSeconds}s
          </span>
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-slate-500 hover:text-cyan-400 transition-colors"
            title="Toggle Malayalam Script Tips"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helpful Collapsible Tips */}
      {showTips && (
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300 flex flex-col gap-1.5 animate-fadeIn">
          <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Malayalam Voiceover Tips:
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            • Use ellipsis (<code className="text-cyan-300">...</code>) where the narrator should take a natural breath.
            <br />
            • For dates and large numbers, write words out in Malayalam (eg. <span className="text-slate-200">രണ്ടായിരത്തി ഇരുപത്തിയാറ്</span>) to avoid unnatural robotic pronunciation.
            <br />
            • Short sentences sound noticeably more engaging and authentic for YouTube and podcast hooks.
          </p>
        </div>
      )}

    </div>
  );
};
