import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Volume2, 
  VolumeX, 
  Repeat, 
  FastForward, 
  Rewind, 
  Share2, 
  Check, 
  Sliders,
  Sparkles,
  Music,
  HardDrive
} from 'lucide-react';
import { GeneratedVoiceover } from '../types/tts';
import { formatTime } from '../utils/audioUtils';

interface AudioVisualizerProps {
  currentVoiceover: GeneratedVoiceover | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  currentTime: number;
  duration: number;
  onPlaybackRateChange?: (rate: number) => void;
  playbackRate?: number;
  onSaveToDrive?: () => void;
  isDriveConnected?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  currentVoiceover,
  isPlaying,
  onTogglePlay,
  onSeek,
  currentTime,
  duration,
  onPlaybackRateChange,
  playbackRate = 1.0,
  onSaveToDrive,
  isDriveConnected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [reverbActive, setReverbActive] = useState(false);
  const [eqActive, setEqActive] = useState(true);

  // Resize canvas responsively
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Continuous visualizer render loop
  const renderVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    ctx.clearRect(0, 0, width, height);

    const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
    const bars = 64;
    const barWidth = width / bars;
    const centerY = height / 2;

    // Draw background subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    const time = Date.now() / 300;

    for (let i = 0; i < bars; i++) {
      const x = i * barWidth;
      const norm = i / bars;
      let barHeight = 8;

      if (isPlaying) {
        // Natural speech frequency modulation
        const wave1 = Math.sin(i * 0.35 + time * 2);
        const wave2 = Math.cos(i * 0.7 - time * 1.5);
        const wave3 = Math.sin(i * 0.15 + time);
        const combined = Math.abs(wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.25);
        barHeight = 10 + combined * (height * 0.75);
      } else {
        // Static gentle waveform placeholder
        const wave = Math.abs(Math.sin(i * 0.25) * Math.cos(i * 0.15));
        barHeight = 8 + wave * (height * 0.35);
      }

      const isPassed = norm <= progress;

      // Color styling: Cyan glow for active/played, muted slate for unplayed
      if (isPassed) {
        const grad = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        grad.addColorStop(0, '#38bdf8'); // sky-400
        grad.addColorStop(0.5, '#22d3ee'); // cyan-400
        grad.addColorStop(1, '#06b6d4'); // cyan-500
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';
        ctx.shadowBlur = isPlaying ? 8 : 2;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.shadowBlur = 0;
      }

      const y = centerY - barHeight / 2;
      ctx.beginPath();
      // Draw rounded bar
      ctx.roundRect(x + 1.5, y, Math.max(2, barWidth - 3), barHeight, 3);
      ctx.fill();
    }

    // Draw playhead glowing dot
    if (progress > 0) {
      const playheadX = progress * width;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playheadX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    animationFrameRef.current = requestAnimationFrame(renderVisualizer);
  }, [currentTime, duration, isPlaying]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(renderVisualizer);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [renderVisualizer]);

  // Handle click on canvas to seek
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || duration <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(pct * duration);
  };

  // Direct Audio Download
  const handleDownload = () => {
    if (!currentVoiceover?.audioUrl) return;
    const link = document.createElement('a');
    link.href = currentVoiceover.audioUrl;
    const safeTitle = (currentVoiceover.title || 'voiceover')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);
    link.download = `svara_${currentVoiceover.voiceName.toLowerCase()}_${safeTitle}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Audio Link / Notification
  const handleShare = () => {
    if (!currentVoiceover?.audioUrl) return;
    navigator.clipboard.writeText(currentVoiceover.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex flex-col gap-5 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
              {currentVoiceover ? currentVoiceover.engine === 'gemini' ? 'Gemini Studio Audio' : 'Native Synthesizer' : 'Audio Player'}
            </span>
            {currentVoiceover && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                {currentVoiceover.voiceName} • 24kHz
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-200 truncate max-w-[260px] sm:max-w-md mt-0.5">
            {currentVoiceover?.title || 'No voiceover generated yet'}
          </h3>
        </div>

        {/* Studio FX Indicators */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setEqActive(!eqActive)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              eqActive 
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' 
                : 'bg-white/[0.03] border-white/5 text-slate-500'
            }`}
            title="Studio Presence EQ Filter"
          >
            Warm EQ
          </button>
          <button
            onClick={() => setReverbActive(!reverbActive)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              reverbActive 
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' 
                : 'bg-white/[0.03] border-white/5 text-slate-500'
            }`}
            title="Studio Acoustic Reverb"
          >
            Reverb
          </button>
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div className="relative group w-full h-32 sm:h-36 bg-slate-950/70 rounded-xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center cursor-pointer">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {!currentVoiceover && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none text-slate-500">
            <Music className="w-8 h-8 opacity-40 animate-pulse text-cyan-400" />
            <span className="text-xs font-medium">Type your script and press 'Generate & Download Voiceover'</span>
          </div>
        )}

        {/* Floating time bubble on hover */}
        <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur border border-white/10 text-[10px] font-mono text-cyan-300 pointer-events-none">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            disabled={!currentVoiceover}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-slate-500">
            {duration > 0 ? `${formatTime(duration)} total` : '--:--'}
          </span>
        </div>
      </div>

      {/* Main Transport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        
        {/* Playback rate & Loop */}
        <div className="flex items-center gap-2">
          {onPlaybackRateChange && (
            <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-white/5 text-[11px]">
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => onPlaybackRateChange(rate)}
                  className={`px-2 py-1 rounded-md transition-colors font-mono ${
                    playbackRate === rate
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg border transition-colors ${
              isLooping 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Loop"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Primary Player Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Skip Back 5s */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 5))}
            disabled={!currentVoiceover}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-transform active:scale-95"
            title="Rewind 5s"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {/* Master Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            disabled={!currentVoiceover}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            title={isPlaying ? 'Pause' : 'Play Voiceover'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-slate-950 text-slate-950" />
            ) : (
              <Play className="w-6 h-6 fill-slate-950 text-slate-950 ml-0.5" />
            )}
          </button>

          {/* Skip Forward 5s */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 5))}
            disabled={!currentVoiceover}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-transform active:scale-95"
            title="Fast Forward 5s"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Direct Download & Drive Share */}
        <div className="flex flex-wrap items-center gap-2">
          {onSaveToDrive && (
            <button
              onClick={onSaveToDrive}
              disabled={!currentVoiceover}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                isDriveConnected
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
                  : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Save directly to your Google Drive"
            >
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Save to Drive</span>
            </button>
          )}

          <button
            onClick={handleShare}
            disabled={!currentVoiceover}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            title="Copy script text"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            disabled={!currentVoiceover?.audioUrl}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            title="Download studio audio file"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download Audio (WAV)</span>
          </button>
        </div>

      </div>

    </div>
  );
};
