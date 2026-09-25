import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to convert 16-bit 24kHz PCM to WAV
function pcmToWav(pcmData: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const dataSize = pcmData.length;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitDepth, 34);

  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Copy raw PCM bytes
  pcmData.copy(buffer, 44);

  return buffer;
}

// Health & configuration check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    supportedModels: ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'],
    timestamp: new Date().toISOString(),
  });
});

// Direct download endpoints for Hostinger deployment
app.get('/api/download/zip', (req, res) => {
  const zipPath = path.resolve('svara-voiceover-studio-hostinger.zip');
  res.download(zipPath, 'svara-voiceover-studio-hostinger.zip');
});

app.get('/api/download/standalone-html', (req, res) => {
  const htmlPath = path.resolve('standalone.html');
  res.download(htmlPath, 'index.html');
});

// Gemini TTS Generation Route
app.post('/api/tts/generate', async (req, res) => {
  try {
    const {
      text,
      voiceName = 'Kore',
      model = 'gemini-3.8-flash-lite-tts',
      speechStyle = 'Natural, clear and authentic voiceover',
      apiKey: userApiKey,
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ success: false, error: 'Text prompt is required.' });
      return;
    }

    const keyToUse = userApiKey || process.env.GEMINI_API_KEY;

    if (!keyToUse || keyToUse === 'MY_GEMINI_API_KEY') {
      res.status(400).json({
        success: false,
        error: 'Gemini API key is not configured. Please supply an API key in settings or through Secrets.',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: keyToUse,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const targetModel =
      model === 'gemini-3.8-flash-tts'
        ? 'gemini-3.8-flash-tts'
        : 'gemini-3.8-flash-lite-tts';

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const rawAudioBase64 = part?.inlineData?.data;

    if (!rawAudioBase64) {
      res.status(500).json({
        success: false,
        error: 'The AI model completed without returning audio data. Try adjusting the voice or text phrasing.',
      });
      return;
    }

    // Convert raw PCM buffer (24kHz 16-bit Mono) to valid WAV buffer
    const pcmBuffer = Buffer.from(rawAudioBase64, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
    const audioWavBase64 = wavBuffer.toString('base64');
    const durationSeconds = pcmBuffer.length / (24000 * 2);

    res.json({
      success: true,
      audioBase64: audioWavBase64,
      audioDataUrl: `data:audio/wav;base64,${audioWavBase64}`,
      mimeType: 'audio/wav',
      sampleRate: 24000,
      duration: Number(durationSeconds.toFixed(2)),
      voice: voiceName,
      model: targetModel,
    });
  } catch (error: any) {
    console.error('Gemini TTS error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to synthesize speech using Gemini TTS.',
    });
  }
});

// AI Script Polish & Malayalam Translation / Enhancement
app.post('/api/tts/optimize-script', async (req, res) => {
  try {
    const { text, goal = 'malayalam_narration', tone = 'natural' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ success: false, error: 'Text is required.' });
      return;
    }

    const keyToUse = req.body.apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse || keyToUse === 'MY_GEMINI_API_KEY') {
      res.status(400).json({
        success: false,
        error: 'Gemini API key is not configured for script optimization.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: keyToUse,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let instruction = 'You are an elite voiceover director and multilingual script specialist specializing in Malayalam (മലയാളം) and Indian languages.';
    if (goal === 'malayalam_narration') {
      instruction += ' Enhance the text for smooth oral delivery, natural Malayalam intonation, rhythmic pauses using commas and ellipsis (...), and verify phonetic clarity for TTS synthesis.';
    } else if (goal === 'translate_to_malayalam') {
      instruction += ' Translate the text into eloquent, spoken Malayalam suitable for a compelling professional documentary or YouTube voiceover.';
    } else if (goal === 'add_ssml_pauses') {
      instruction += ' Add well-placed breath pauses, punctuation, and pacing cues for high-impact narration.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Input Text: "${text}"\nTone: ${tone}\nGoal: ${goal}\nProvide ONLY the optimized text ready for voiceover delivery without any markdown preamble or quotes.`,
      config: {
        systemInstruction: instruction,
        temperature: 0.7,
      },
    });

    const optimized = response.text?.trim() || text;
    res.json({ success: true, optimizedText: optimized });
  } catch (error: any) {
    console.error('Optimize script error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to optimize script.',
    });
  }
});

// Start Express server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
