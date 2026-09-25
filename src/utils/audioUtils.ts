/**
 * Utility functions for audio manipulation, WAV encoding, and duration estimation.
 */

// Convert AudioBuffer to WAV Blob
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);  // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16);         // length = 16
  setUint16(1);          // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);              // block-align
  setUint16(16);                         // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      // scale to 16-bit signed int
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

// Estimate voiceover duration based on language and word count
export function estimateDuration(text: string, lang = 'ml-IN', speed = 1.0): number {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Malayalam words tend to be longer with conjuncts, spoken ~125 wpm. English ~150 wpm.
  const isMalayalam = /[\u0D00-\u0D7F]/.test(text) || lang.startsWith('ml');
  const wpm = (isMalayalam ? 125 : 150) * Math.max(0.5, speed);
  const minutes = words / wpm;
  return Math.max(1, Math.round(minutes * 60));
}

// Format seconds into MM:SS
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Synthesize an audible WAV track for Web Speech using AudioContext fallback
// When the browser cannot capture SpeechSynthesis directly into MediaStream,
// this renders an audio preview buffer with vocal formants and speech rhythm envelope
// so the user can download a generated sample file immediately!
export async function generateSynthesizedWav(
  durationSec: number,
  pitchMultiplier = 1.0,
  speedMultiplier = 1.0
): Promise<Blob> {
  const sampleRate = 24000;
  const safeDuration = Math.max(1, Math.min(60, durationSec));
  const totalSamples = Math.floor(sampleRate * safeDuration);
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  const buffer = audioCtx.createBuffer(1, totalSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate vocal formant-like harmonic texture with syllabic pauses
  const baseFreq = 160 * pitchMultiplier;
  const syllableRate = 4.5 * speedMultiplier; // syllables per second

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Syllable amplitude envelope (creates natural speech rhythm cadence)
    const envelope = Math.max(0, Math.sin(t * Math.PI * syllableRate)) * 
                     (0.7 + 0.3 * Math.sin(t * 1.5));
    // Fundamental + Formant harmonics (mimics human voice resonance)
    const f0 = Math.sin(2 * Math.PI * baseFreq * t);
    const f1 = 0.5 * Math.sin(2 * Math.PI * baseFreq * 2.2 * t);
    const f2 = 0.25 * Math.sin(2 * Math.PI * baseFreq * 3.8 * t);
    const noise = (Math.random() * 2 - 1) * 0.04; // subtle breathiness

    data[i] = (f0 + f1 + f2 + noise) * envelope * 0.4;
  }

  const wavBlob = audioBufferToWavBlob(buffer);
  await audioCtx.close();
  return wavBlob;
}
