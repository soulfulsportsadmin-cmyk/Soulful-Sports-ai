/**
 * SvaraAI - Professional Malayalam & Multilingual AI Voiceover Studio
 * Built with Google Gemini 3.8 Flash TTS & Web Speech API
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Headphones,
  Mic,
  Layers,
  Info
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ScriptEditor } from './components/ScriptEditor';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioControls } from './components/AudioControls';
import { AudioVisualizer } from './components/AudioVisualizer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { initAuth, googleSignIn, logout as googleLogout } from './services/auth';
import { User } from 'firebase/auth';
import { 
  EngineMode, 
  GenerationSettings, 
  GeneratedVoiceover, 
  ScriptPreset 
} from './types/tts';
import { SCRIPT_PRESETS } from './utils/presets';
import { estimateDuration, generateSynthesizedWav } from './utils/audioUtils';

export default function App() {
  // State: Script and Voice
  const [text, setText] = useState<string>(SCRIPT_PRESETS[0].text);
  const [settings, setSettings] = useState<GenerationSettings>({
    engine: 'gemini',
    model: 'gemini-3.8-flash-lite-tts',
    voiceId: 'Kore',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    style: 'Calm, poetic, deep documentary narrator with natural pauses',
    format: 'wav',
  });

  // State: System and Engine
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasServerKey, setHasServerKey] = useState<boolean>(true);
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('svara_gemini_api_key') || '';
  });

  // State: Playback and Output
  const [currentVoiceover, setCurrentVoiceover] = useState<GeneratedVoiceover | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // State: History & Modals
  const [history, setHistory] = useState<GeneratedVoiceover[]>(() => {
    try {
      const saved = localStorage.getItem('svara_voiceover_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState<boolean>(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [driveModalOpen, setDriveModalOpen] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState<boolean>(false);

  // Initialize Firebase Google Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        showMessage(`Connected to Google Drive as ${result.user.displayName || result.user.email}!`, 'success');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      showMessage(err.message || 'Google Sign-In failed', 'error');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleLogout();
      setGoogleUser(null);
      showMessage('Signed out of Google Drive', 'info');
    } catch (err: any) {
      showMessage('Failed to sign out', 'error');
    }
  };

  // Audio and Web Speech References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Check server status on initial load
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setHasServerKey(!!data.hasGeminiKey);
        // If server has no key and no custom key is stored, default to webspeech
        if (!data.hasGeminiKey && !customApiKey) {
          setSettings((prev) => ({ ...prev, engine: 'webspeech' }));
        }
      })
      .catch((err) => {
        console.warn('Server status check skipped:', err);
      });
  }, [customApiKey]);

  // Load browser speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const available = window.speechSynthesis.getVoices();
        setSystemVoices(available);
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('svara_voiceover_history', JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to save history to storage:', e);
    }
  }, [history]);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      // Ignore errors when audio element src is empty, revoked, or uninitialized
      if (!audio.src || audio.src === window.location.href || audio.src.endsWith('/')) {
        return;
      }
      const mediaErr = audio.error;
      // Only log meaningful playback failures, avoiding {"isTrusted": true} generic event spam
      if (mediaErr) {
        console.warn(`Audio playback status: code ${mediaErr.code} - ${mediaErr.message || 'Media decode or network issue'}`);
      }
      setIsPlaying(false);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Sync audio playback rate & volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = settings.volume;
    }
  }, [playbackRate, settings.volume]);

  // Handle setting updates
  const handleSettingChange = <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetSettings = () => {
    setSettings({
      engine: hasServerKey || customApiKey ? 'gemini' : 'webspeech',
      model: 'gemini-3.8-flash-lite-tts',
      voiceId: 'Kore',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      style: 'Natural, clear Malayalam narrator with warm presence',
      format: 'wav',
    });
  };

  // Apply script preset
  const handleApplyPreset = (preset: ScriptPreset) => {
    setText(preset.text);
    setSettings((prev) => ({
      ...prev,
      style: preset.suggestedStyle,
      voiceId: prev.engine === 'gemini' ? preset.suggestedVoice : prev.voiceId,
    }));
    showMessage(`Applied preset: ${preset.title}`, 'info');
  };

  // Save API key
  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    if (key) {
      localStorage.setItem('svara_gemini_api_key', key);
      setSettings((prev) => ({ ...prev, engine: 'gemini' }));
      showMessage('Gemini API Key saved successfully!', 'success');
    } else {
      localStorage.removeItem('svara_gemini_api_key');
      showMessage('Custom API key removed.', 'info');
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage({ text: msg, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (!currentVoiceover) return;

    if (isPlaying) {
      if (currentVoiceover.engine === 'webspeech') {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      setIsPlaying(false);
    } else {
      if (currentVoiceover.engine === 'webspeech') {
        speakWebSpeech(currentVoiceover.text);
      } else if (audioRef.current && currentVoiceover.audioUrl) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Playback resume error:', err);
          setIsPlaying(false);
        });
      }
    }
  };

  // Seek timeline
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  // Web Speech playback routine
  const speakWebSpeech = (speechText: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    
    // Find matching voice
    const foundVoice = systemVoices.find((v) => v.name === settings.voiceId);
    if (foundVoice) utterance.voice = foundVoice;

    utterance.rate = settings.speed;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    const estSec = estimateDuration(speechText, 'ml-IN', settings.speed);
    setDuration(estSec);
    setCurrentTime(0);
    setIsPlaying(true);

    const startTime = Date.now();
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);
      if (elapsed >= estSec) {
        window.clearInterval(timerRef.current!);
      }
    }, 100);

    utterance.onend = () => {
      setIsPlaying(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Main Generation Pipeline
  const handleGenerate = async () => {
    const cleanText = text.trim();
    if (!cleanText) {
      showMessage('Please enter a voiceover script first.', 'error');
      return;
    }

    setIsGenerating(true);
    // Stop any existing playback
    if (audioRef.current) audioRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      if (settings.engine === 'gemini') {
        // Server-Side Gemini Studio TTS
        const response = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: cleanText,
            voiceName: settings.voiceId || 'Kore',
            model: settings.model,
            speechStyle: settings.style,
            apiKey: customApiKey || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to synthesize speech via Gemini.');
        }

        const newVoiceover: GeneratedVoiceover = {
          id: 'tts_' + Date.now(),
          title: cleanText.slice(0, 38) + (cleanText.length > 38 ? '...' : ''),
          text: cleanText,
          audioUrl: data.audioDataUrl,
          mimeType: 'audio/wav',
          duration: data.duration || estimateDuration(cleanText, 'ml-IN', settings.speed),
          timestamp: Date.now(),
          voiceName: data.voice || settings.voiceId,
          engine: 'gemini',
          speed: settings.speed,
          pitch: settings.pitch,
          style: settings.style,
        };

        setCurrentVoiceover(newVoiceover);
        setDuration(newVoiceover.duration);
        setCurrentTime(0);
        setHistory((prev) => [newVoiceover, ...prev]);

        if (audioRef.current) {
          audioRef.current.src = newVoiceover.audioUrl;
          audioRef.current.load();
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => console.log('Autoplay deferred:', err));
        }

        showMessage('Studio audio generated successfully!', 'success');
      } else {
        // Web Speech API + AudioContext WAV generator
        const estSec = estimateDuration(cleanText, 'ml-IN', settings.speed);
        
        // Generate downloadable WAV file
        const wavBlob = await generateSynthesizedWav(estSec, settings.pitch, settings.speed);
        const wavUrl = URL.createObjectURL(wavBlob);

        const newVoiceover: GeneratedVoiceover = {
          id: 'web_' + Date.now(),
          title: cleanText.slice(0, 38) + (cleanText.length > 38 ? '...' : ''),
          text: cleanText,
          audioUrl: wavUrl,
          audioBlob: wavBlob,
          mimeType: 'audio/wav',
          duration: estSec,
          timestamp: Date.now(),
          voiceName: settings.voiceId || 'System Voice',
          engine: 'webspeech',
          speed: settings.speed,
          pitch: settings.pitch,
          style: settings.style,
        };

        setCurrentVoiceover(newVoiceover);
        setDuration(estSec);
        setCurrentTime(0);
        setHistory((prev) => [newVoiceover, ...prev]);

        if (audioRef.current) {
          audioRef.current.src = wavUrl;
        }

        // Trigger real-time browser speech playback
        speakWebSpeech(cleanText);
        showMessage('Voiceover synthesized and ready to download!', 'success');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      showMessage(err?.message || 'Error synthesizing audio. Try Web Speech API as fallback.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Script Optimization
  const handleOptimizeScript = async (goal: string) => {
    if (!text.trim()) return;
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/tts/optimize-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          goal,
          tone: settings.style,
          apiKey: customApiKey || undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.optimizedText) {
        setText(data.optimizedText);
        showMessage('Script polished for Malayalam voiceover delivery!', 'success');
      } else {
        showMessage(data.error || 'Optimization unavailable.', 'error');
      }
    } catch (err: any) {
      showMessage('Failed to optimize script.', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Select item from history
  const handleSelectHistoryVoiceover = (item: GeneratedVoiceover) => {
    setCurrentVoiceover(item);
    setDuration(item.duration);
    setCurrentTime(0);

    if (item.engine === 'webspeech') {
      speakWebSpeech(item.text);
    } else if (audioRef.current && item.audioUrl) {
      audioRef.current.src = item.audioUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error on history item:', err);
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-teal-500/6 rounded-full blur-[160px]" />
      </div>

      {/* Navigation Header */}
      <Navbar
        engine={settings.engine}
        onEngineChange={(eng) => setSettings((s) => ({ ...s, engine: eng }))}
        hasGeminiKey={hasServerKey || !!customApiKey}
        onOpenSettings={() => setApiKeyModalOpen(true)}
        onOpenExportModal={() => setExportModalOpen(true)}
        onOpenHistory={() => setHistoryDrawerOpen(true)}
        historyCount={history.length}
        user={googleUser}
        onOpenDriveModal={() => setDriveModalOpen(true)}
      />

      {/* Main Studio Viewport */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col gap-6 relative z-10">
        
        {/* Status Toast Alert */}
        {statusMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounceIn max-w-md">
            <div
              className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 text-xs sm:text-sm font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                  : 'bg-cyan-950/90 border-cyan-500/30 text-cyan-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
            </div>
          </div>
        )}

        {/* Studio Top Banner / Engine Mode Indicator */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-indigo-950/30 border border-white/[0.08] backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-100">
                  {settings.engine === 'gemini' 
                    ? 'Google Gemini 3.8 Flash Neural Voiceover Engine' 
                    : 'Universal Browser Web Speech Engine'}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.engine === 'gemini'
                  ? 'Studio-grade 24kHz neural audio with Malayalam cultural inflection and natural pauses.'
                  : 'Instant in-browser speech synthesis across Malayalam (ml-IN), Indian English, and regional languages.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Export Single-File App</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Inputs, Voice Selection & Audio Sliders) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Script Editor Area */}
            <ScriptEditor
              text={text}
              onTextChange={setText}
              speed={settings.speed}
              onApplyPreset={handleApplyPreset}
              onOptimizeScript={handleOptimizeScript}
              isOptimizing={isOptimizing}
            />

            {/* Voice & Model Selection */}
            <VoiceSelector
              engine={settings.engine}
              selectedVoiceId={settings.voiceId}
              onVoiceChange={(voiceId) => handleSettingChange('voiceId', voiceId)}
              selectedModel={settings.model}
              onModelChange={(model) => handleSettingChange('model', model)}
              selectedStyle={settings.style}
              onStyleChange={(style) => handleSettingChange('style', style)}
              systemVoices={systemVoices}
            />

            {/* Audio Synthesis Controls & Glowing Action Button */}
            <AudioControls
              settings={settings}
              onChange={handleSettingChange}
              onReset={handleResetSettings}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              disabled={!text.trim()}
            />

          </div>

          {/* Right Column (Waveform Visualizer & Audio Player Section) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-20">
            
            {/* Audio Player Preview & Canvas Visualizer */}
            <AudioVisualizer
              currentVoiceover={currentVoiceover}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onSeek={handleSeek}
              currentTime={currentTime}
              duration={duration}
              playbackRate={playbackRate}
              onPlaybackRateChange={setPlaybackRate}
              onSaveToDrive={() => setDriveModalOpen(true)}
              isDriveConnected={!!googleUser}
            />

            {/* Pro Malayalam Voiceover Tips */}
            <div className="rounded-2xl p-5 bg-slate-900/40 backdrop-blur-md border border-white/[0.06] flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Malayalam Voiceover Direction</span>
              </div>
              
              <ul className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Pacing & Pauses:</strong> Malayalam phrases are naturally polysyllabic. Use commas (<code className="text-cyan-300">,</code>) or pauses (<code className="text-cyan-300">...</code>) every 5-7 words for breath cadence.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Voice Pairing:</strong> Use <em>Kore</em> or <em>Puck</em> for Malayalam YouTube hooks and documentaries, and <em>Fenrir</em> for commercial promo ads.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Direct Audio Export:</strong> The downloaded file is a compliant 24,000 Hz RIFF WAVE file ready for Premiere Pro, DaVinci Resolve, or Audacity.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#090b10] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>SvaraAI Malayalam & Multilingual Audio Studio</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Powered by Google Gemini TTS & Web Audio API
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <HistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        history={history}
        onSelectVoiceover={handleSelectHistoryVoiceover}
        onRestoreScript={(txt) => setText(txt)}
        onClearHistory={() => setHistory([])}
        currentPlayingId={currentVoiceover?.id || null}
        isPlaying={isPlaying}
        onTogglePlayHistory={(item) => {
          if (currentVoiceover?.id === item.id && isPlaying) {
            handleTogglePlay();
          } else {
            handleSelectHistoryVoiceover(item);
          }
        }}
      />

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKey={customApiKey}
        onSaveApiKey={handleSaveApiKey}
        hasServerKey={hasServerKey}
      />

      <StandaloneExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />

      <GoogleDriveModal
        isOpen={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        user={googleUser}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        isSigningIn={isSigningInGoogle}
        currentVoiceover={currentVoiceover}
        onNotification={(msg, type) => showMessage(msg, type)}
      />

    </div>
  );
}
