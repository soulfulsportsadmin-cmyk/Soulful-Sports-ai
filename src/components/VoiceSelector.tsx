import React from 'react';
import { Mic, Sparkles, User, Volume2, Globe, Radio, Check } from 'lucide-react';
import { EngineMode, TTSVoice } from '../types/tts';
import { VOICE_STYLE_PRESETS } from '../utils/presets';

interface VoiceSelectorProps {
  engine: EngineMode;
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
  selectedModel: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';
  onModelChange: (model: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts') => void;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  systemVoices: SpeechSynthesisVoice[];
  onPreviewVoice?: (voiceId: string) => void;
}

export const GEMINI_VOICES = [
  {
    id: 'Kore',
    name: 'Kore (കൊരെ)',
    gender: 'female',
    persona: 'Warm & Natural',
    description: 'Crisp articulation with warm resonant warmth. Best for Malayalam documentaries & audiobooks.',
    bestFor: 'Documentary & Storytelling',
    badge: 'Popular for Malayalam',
  },
  {
    id: 'Puck',
    name: 'Puck (പക്ക്)',
    gender: 'male',
    persona: 'Dynamic & Youthful',
    description: 'Engaging, upbeat pacing. Ideal for Malayalam YouTube intros, shorts, and vlog hooks.',
    bestFor: 'YouTube & Podcasts',
    badge: 'Trending Hook',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (ഫെൻറിർ)',
    gender: 'male',
    persona: 'Deep & Authoritative',
    description: 'Rich low-end voice with commanding gravitas. Perfect for brand commercials and movie trailers.',
    bestFor: 'Commercial Ads & Promos',
    badge: 'Deep Baritone',
  },
  {
    id: 'Aoede',
    name: 'Aoede (അയീഡി)',
    gender: 'female',
    persona: 'Gentle & Melodic',
    description: 'Soft, whisper-friendly soothing tones. Excellent for bedtime tales, poetry and meditation.',
    bestFor: 'Bedtime Stories & Poetry',
    badge: 'Soothing Melodic',
  },
  {
    id: 'Charon',
    name: 'Charon (കാരോൺ)',
    gender: 'male',
    persona: 'News & Broadcast',
    description: 'Fast, steady, authoritative cadence suited for news reports and technical recaps.',
    bestFor: 'News & Announcements',
    badge: 'News Anchor',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (സെഫിർ)',
    gender: 'neutral',
    persona: 'Modern & Articulate',
    description: 'Clear, modern, balanced tone. Ideal for tech explainer videos and educational tutorials.',
    bestFor: 'Tech & E-Learning',
    badge: 'Crystal Clear',
  },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  engine,
  selectedVoiceId,
  onVoiceChange,
  selectedModel,
  onModelChange,
  selectedStyle,
  onStyleChange,
  systemVoices,
  onPreviewVoice,
}) => {
  // Filter & categorize system voices
  const malayalamVoices = systemVoices.filter((v) => v.lang.startsWith('ml'));
  const indianVoices = systemVoices.filter((v) => v.lang.includes('IN') && !v.lang.startsWith('ml'));
  const englishVoices = systemVoices.filter((v) => v.lang.startsWith('en') && !v.lang.includes('IN'));
  const otherVoices = systemVoices.filter(
    (v) => !v.lang.startsWith('ml') && !v.lang.includes('IN') && !v.lang.startsWith('en')
  );

  return (
    <div className="rounded-2xl p-5 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col gap-5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Voice & Model Selection</h3>
            <p className="text-[11px] text-slate-400">Choose vocal persona and delivery style</p>
          </div>
        </div>

        {engine === 'gemini' && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => onModelChange('gemini-3.8-flash-lite-tts')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedModel === 'gemini-3.8-flash-lite-tts'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Fast, low-latency, optimized for long voiceovers"
            >
              Flash Lite TTS
            </button>
            <button
              onClick={() => onModelChange('gemini-3.8-flash-tts')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedModel === 'gemini-3.8-flash-tts'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="High-definition studio voice synthesis"
            >
              Flash TTS (Studio)
            </button>
          </div>
        )}
      </div>

      {/* Voice Selection Cards (When in Gemini Engine) */}
      {engine === 'gemini' ? (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Gemini Studio Neural Voices</span>
            <span className="text-[10px] text-cyan-400 font-mono">24,000 Hz Studio PCM</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {GEMINI_VOICES.map((v) => {
              const isSelected = selectedVoiceId === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => onVoiceChange(v.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/50 border-white/[0.06] hover:border-white/20 hover:bg-slate-950/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {v.name}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        )}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/5">
                        {v.persona}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {v.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-cyan-400/90 font-medium">{v.bestFor}</span>
                    <span className="text-slate-500 group-hover:text-slate-400">
                      {v.gender === 'female' ? '♀ Female' : v.gender === 'male' ? '♂ Male' : '⚥ Neutral'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Web Speech API Voice Dropdown */
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">
              System Voices ({systemVoices.length} Available)
            </label>
            {malayalamVoices.length > 0 ? (
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Native Malayalam Voice Detected
              </span>
            ) : (
              <span className="text-[11px] text-amber-400">
                Tip: Indian English (en-IN) voices pronounce Malayalam phonetically well
              </span>
            )}
          </div>

          <select
            value={selectedVoiceId}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {malayalamVoices.length > 0 && (
              <optgroup label="🌴 Malayalam Native Voices (ml-IN)">
                {malayalamVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </optgroup>
            )}

            {indianVoices.length > 0 && (
              <optgroup label="🇮🇳 Indian Regional & English Voices">
                {indianVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </optgroup>
            )}

            {englishVoices.length > 0 && (
              <optgroup label="🌐 Global English Voices">
                {englishVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </optgroup>
            )}

            {otherVoices.length > 0 && (
              <optgroup label="Other Installed Voices">
                {otherVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      )}

      {/* Voice Delivery Style / Intonation Preset */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Voiceover Delivery Style & Intonation
          </span>
          <span className="text-[10px] text-slate-400">Influences speech inflection & pacing</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {VOICE_STYLE_PRESETS.map((s) => {
            const isSelected = selectedStyle === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onStyleChange(s.id)}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                }`}
                title={s.desc}
              >
                <span className="text-xs font-semibold leading-tight">{s.label}</span>
                <span className="text-[9px] text-slate-500 mt-1 line-clamp-1">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
