export type EngineMode = 'gemini' | 'webspeech';

export interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  langLabel: string;
  gender: 'female' | 'male' | 'neutral';
  engine: EngineMode;
  description: string;
  recommendedFor?: string;
  nativeVoice?: SpeechSynthesisVoice;
}

export interface GenerationSettings {
  engine: EngineMode;
  model: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';
  voiceId: string;
  speed: number;   // 0.5 to 2.0 (default: 1.0)
  pitch: number;   // 0.5 to 1.8 (default: 1.0)
  volume: number;  // 0.0 to 1.0 (default: 1.0)
  style: string;   // e.g. "Natural Malayalam narrator"
  format: 'wav' | 'mp3';
}

export interface GeneratedVoiceover {
  id: string;
  title: string;
  text: string;
  audioUrl: string;
  audioBlob?: Blob;
  mimeType: string;
  duration: number;
  timestamp: number;
  voiceName: string;
  engine: EngineMode;
  speed: number;
  pitch: number;
  style: string;
}

export interface ScriptPreset {
  id: string;
  title: string;
  language: string;
  category: 'malayalam' | 'multilingual';
  badge: string;
  text: string;
  suggestedStyle: string;
  suggestedVoice: string;
}
