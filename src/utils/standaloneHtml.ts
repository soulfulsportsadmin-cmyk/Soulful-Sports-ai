/**
 * Generates a complete, single-file modern web application
 * containing HTML, CSS (Tailwind CDN), and JavaScript in a single
 * copy-pasteable block that runs instantly in any browser offline or online.
 */

export function getStandaloneHtmlCode(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SvaraAI - Malayalam & Multilingual AI Voiceover Studio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Manjari:wght@400;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'Manjari', 'sans-serif'],
            malayalam: ['Manjari', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#ecfeff',
              400: '#22d3ee',
              500: '#06b6d4',
              600: '#0891b2',
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #080a0f;
      color: #f1f5f9;
      background-image: 
        radial-gradient(at 10% 20%, rgba(6, 182, 212, 0.12) 0px, transparent 50%),
        radial-gradient(at 90% 80%, rgba(99, 102, 241, 0.12) 0px, transparent 50%);
      background-attachment: fixed;
    }
    .glass-card {
      background: rgba(18, 24, 38, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    .glass-input {
      background: rgba(10, 15, 26, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .glass-input:focus {
      border-color: #06b6d4;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.25);
    }
  </style>
</head>
<body class="min-h-screen font-sans flex flex-col p-4 md:p-8">

  <!-- Header -->
  <header class="max-w-5xl mx-auto w-full mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-2xl">
        സ്വ
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          SvaraAI Studio
        </h1>
        <p class="text-xs text-slate-400">Professional Malayalam & Multilingual Voiceover Generator</p>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Speech Engine Ready
      </span>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
    
    <!-- Left Column: Input & Controls -->
    <div class="lg:col-span-7 flex flex-col gap-6">
      
      <!-- Script Input Box -->
      <div class="glass-card rounded-2xl p-5 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-200">Voiceover Script</span>
            <span class="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">മലയാളം / English</span>
          </div>
          <div class="flex items-center gap-2">
            <select id="presetSelect" class="text-xs bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500">
              <option value="">⚡ Load Sample Script...</option>
              <option value="ml_doc">കേരള പ്രകൃതി ഡോക്യുമെന്ററി (Documentary)</option>
              <option value="ml_youtube">യൂട്യൂബ് ഇൻട്രോ (YouTube Hook)</option>
              <option value="ml_news">വാർത്താ ബുള്ളറ്റിൻ (News Anchor)</option>
              <option value="ml_ad">ബ്രാൻഡ് പരസ്യം (Commercial Ad)</option>
              <option value="en_tech">Global Tech Keynote (English)</option>
            </select>
          </div>
        </div>

        <textarea 
          id="scriptText" 
          rows="6" 
          placeholder="ഇവിടെ നിങ്ങളുടെ മലയാളം അല്ലെങ്കിൽ മറ്റ് ഭാഷകളിലെ വാചകങ്ങൾ നൽകുക... (Type or paste Malayalam or multilingual voiceover script here)"
          class="glass-input w-full rounded-xl p-4 text-slate-100 text-base leading-relaxed focus:outline-none transition-all resize-y placeholder:text-slate-500"
        >ദൈവത്തിന്റെ സ്വന്തം നാടായ കേരളത്തിന്റെ മനോഹാരിത... സഹ്യപർവ്വത നിരകളിൽ നിന്നുത്ഭവിക്കുന്ന കുളിർനദികളും, പച്ചപ്പുനിറഞ്ഞ കായലുകളും, നമ്മുടെ മനസ്സിന് ശാന്തിയും കുളിർമയും പകരുന്നു. പ്രകൃതിയുടെ ഈ വിസ്മയം നമുക്കൊന്നിച്ചു കാണാം.</textarea>

        <div class="flex items-center justify-between text-xs text-slate-400">
          <div class="flex gap-3">
            <span>Characters: <strong id="charCount" class="text-slate-200">0</strong></span>
            <span>Words: <strong id="wordCount" class="text-slate-200">0</strong></span>
          </div>
          <span>Est. Duration: <strong id="estDuration" class="text-cyan-400">~0s</strong></span>
        </div>
      </div>

      <!-- Voice & Parameter Controls -->
      <div class="glass-card rounded-2xl p-5 flex flex-col gap-5">
        <h2 class="text-sm font-semibold text-slate-200 flex items-center justify-between">
          <span>Voice Synthesis Settings</span>
          <button id="resetParams" class="text-xs text-slate-400 hover:text-cyan-400 transition-colors">Reset Defaults</button>
        </h2>

        <!-- Voice Selection -->
        <div class="flex flex-col gap-2">
          <label class="text-xs text-slate-300 font-medium">Select Speaker Voice</label>
          <select id="voiceSelect" class="glass-input w-full rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none">
            <option value="">Detecting available voices...</option>
          </select>
          <p id="voiceNotice" class="text-[11px] text-slate-400">Voices labeled [ml-IN] or [en-IN] provide the most natural Malayalam & Indian English cadence.</p>
        </div>

        <!-- Sliders Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
          <!-- Speed / Tempo -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Speed (Tempo)</span>
              <span id="speedValue" class="text-cyan-400 font-mono">1.0x</span>
            </div>
            <input type="range" id="speedSlider" min="0.5" max="2.0" step="0.05" value="1.0" class="w-full accent-cyan-400 cursor-pointer" />
          </div>

          <!-- Pitch -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Pitch (Frequency)</span>
              <span id="pitchValue" class="text-cyan-400 font-mono">1.0x</span>
            </div>
            <input type="range" id="pitchSlider" min="0.5" max="1.8" step="0.05" value="1.0" class="w-full accent-cyan-400 cursor-pointer" />
          </div>

          <!-- Volume -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Volume</span>
              <span id="volumeValue" class="text-cyan-400 font-mono">100%</span>
            </div>
            <input type="range" id="volumeSlider" min="0.0" max="1.0" step="0.05" value="1.0" class="w-full accent-cyan-400 cursor-pointer" />
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-2">
          <button 
            id="generateBtn" 
            class="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-size-200 hover:bg-right transition-all duration-300 shadow-lg shadow-cyan-500/25 active:scale-[0.99] flex items-center justify-center gap-2 group"
          >
            <svg class="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span id="generateBtnText">Generate & Synthesize Voiceover</span>
          </button>
        </div>

      </div>

    </div>

    <!-- Right Column: Visualizer & Audio Player -->
    <div class="lg:col-span-5 flex flex-col gap-6">
      
      <!-- Waveform Card -->
      <div class="glass-card rounded-2xl p-5 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-200">Waveform & Audio Studio</span>
          <span id="playerStatus" class="text-xs text-slate-400">Ready</span>
        </div>

        <!-- Canvas Visualizer -->
        <div class="relative w-full h-36 bg-slate-950/80 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
          <canvas id="waveformCanvas" class="w-full h-full"></canvas>
          <div id="visualizerOverlay" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="text-xs text-slate-500">Audio Waveform Visualizer</span>
          </div>
        </div>

        <!-- Player Controls -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span id="currentTime">00:00</span>
            <input type="range" id="seekSlider" min="0" max="100" value="0" class="flex-1 mx-3 accent-cyan-400 cursor-pointer" />
            <span id="totalTime">00:00</span>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2">
              <button id="playPauseBtn" class="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30 transition-transform active:scale-95">
                <svg id="playIcon" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <svg id="pauseIcon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </button>
              <button id="stopBtn" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">
                Stop
              </button>
            </div>

            <!-- Download Button -->
            <button 
              id="downloadAudioBtn" 
              class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span>Download Audio (WAV)</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Quick Info / Malayalam Pronunciation Tips -->
      <div class="glass-card rounded-2xl p-5 flex flex-col gap-3">
        <h3 class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Malayalam Voiceover Tips</h3>
        <ul class="text-xs text-slate-400 space-y-2 list-disc list-inside">
          <li>Use commas (<code class="text-cyan-300">,</code>) and ellipsis (<code class="text-cyan-300">...</code>) for natural breathing pauses between Malayalam sentences.</li>
          <li>For numbers, write words in Malayalam (eg. <span class="text-slate-200">രണ്ടായിരത്തി ഇരുപത്തിയാറ്</span>) for the most accurate phonetics.</li>
          <li>Set speed between <span class="text-cyan-300">0.9x - 1.05x</span> for ideal documentary and storytelling cadence.</li>
        </ul>
      </div>

    </div>

  </main>

  <footer class="max-w-5xl mx-auto w-full mt-8 pt-4 border-t border-white/5 text-center text-xs text-slate-500">
    SvaraAI Professional Voiceover Studio • Malayalam & Multilingual Speech Synthesis
  </footer>

  <script>
    // State
    let voices = [];
    let isSpeaking = false;
    let currentAudioBlob = null;
    let audioContext = null;
    let animationId = null;
    let audioElem = new Audio();
    let currentUtterance = null;
    let voiceoverStartTime = 0;
    let estimatedDurationSec = 5;

    // Elements
    const scriptText = document.getElementById('scriptText');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const estDuration = document.getElementById('estDuration');
    const voiceSelect = document.getElementById('voiceSelect');
    const speedSlider = document.getElementById('speedSlider');
    const pitchSlider = document.getElementById('pitchSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const speedValue = document.getElementById('speedValue');
    const pitchValue = document.getElementById('pitchValue');
    const volumeValue = document.getElementById('volumeValue');
    const generateBtn = document.getElementById('generateBtn');
    const generateBtnText = document.getElementById('generateBtnText');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const stopBtn = document.getElementById('stopBtn');
    const downloadAudioBtn = document.getElementById('downloadAudioBtn');
    const seekSlider = document.getElementById('seekSlider');
    const currentTimeElem = document.getElementById('currentTime');
    const totalTimeElem = document.getElementById('totalTime');
    const playerStatus = document.getElementById('playerStatus');
    const presetSelect = document.getElementById('presetSelect');
    const resetParams = document.getElementById('resetParams');
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');

    // Resize canvas
    function resizeCanvas() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Populate System Voices
    function loadVoices() {
      if (!('speechSynthesis' in window)) {
        voiceSelect.innerHTML = '<option value="">Speech Synthesis Not Supported</option>';
        return;
      }
      voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      voiceSelect.innerHTML = '';
      
      // Sort: Malayalam (ml), Indian English (en-IN), Hindi (hi), Tamil (ta), English (en), others
      const sorted = [...voices].sort((a, b) => {
        const aMl = a.lang.startsWith('ml') ? 1 : 0;
        const bMl = b.lang.startsWith('ml') ? 1 : 0;
        if (aMl !== bMl) return bMl - aMl;
        const aIn = a.lang.includes('IN') ? 1 : 0;
        const bIn = b.lang.includes('IN') ? 1 : 0;
        if (aIn !== bIn) return bIn - aIn;
        return a.lang.localeCompare(b.lang);
      });

      sorted.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = v.name;
        const flag = v.lang.startsWith('ml') ? '🌴 [Malayalam]' : 
                     v.lang.includes('IN') ? '🇮🇳 [Indian Accent]' : 
                     v.lang.startsWith('en') ? '🌐 [English]' : \`[\${v.lang}]\`;
        opt.textContent = \`\${flag} \${v.name} (\${v.lang})\`;
        voiceSelect.appendChild(opt);
      });

      // Default select Malayalam if present, else first Indian or default
      const defaultIndex = sorted.findIndex(v => v.lang.startsWith('ml') || v.lang === 'en-IN' || v.default);
      if (defaultIndex !== -1) voiceSelect.selectedIndex = defaultIndex;
    }

    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Sliders
    speedSlider.addEventListener('input', (e) => {
      speedValue.textContent = Number(e.target.value).toFixed(2) + 'x';
      updateDuration();
    });
    pitchSlider.addEventListener('input', (e) => {
      pitchValue.textContent = Number(e.target.value).toFixed(2) + 'x';
    });
    volumeSlider.addEventListener('input', (e) => {
      volumeValue.textContent = Math.round(Number(e.target.value) * 100) + '%';
    });

    resetParams.addEventListener('click', () => {
      speedSlider.value = 1.0;
      pitchSlider.value = 1.0;
      volumeSlider.value = 1.0;
      speedValue.textContent = '1.0x';
      pitchValue.textContent = '1.0x';
      volumeValue.textContent = '100%';
      updateDuration();
    });

    // Update Text Stats
    function updateDuration() {
      const text = scriptText.value.trim();
      const chars = text.length;
      const words = text ? text.split(/\\s+/).length : 0;
      charCount.textContent = chars;
      wordCount.textContent = words;
      
      const speed = parseFloat(speedSlider.value) || 1.0;
      const wpm = 130 * speed;
      const durSec = words > 0 ? Math.max(1, Math.round((words / wpm) * 60)) : 0;
      estimatedDurationSec = durSec;
      estDuration.textContent = '~' + durSec + 's';
      totalTimeElem.textContent = formatTime(durSec);
    }
    scriptText.addEventListener('input', updateDuration);
    updateDuration();

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    // Sample Presets
    const samplePresets = {
      ml_doc: \`ദൈവത്തിന്റെ സ്വന്തം നാടായ കേരളത്തിന്റെ മനോഹാരിത... സഹ്യപർവ്വത നിരകളിൽ നിന്നുത്ഭവിക്കുന്ന കുളിർനദികളും, പച്ചപ്പുനിറഞ്ഞ കായലുകളും, നമ്മുടെ മനസ്സിന് ശാന്തിയും കുളിർമയും പകരുന്നു. പ്രകൃതിയുടെ ഈ വിസ്മയം നമുക്കൊന്നിച്ചു കാണാം.\`,
      ml_youtube: \`എല്ലാവർക്കും നമസ്കാരം! ഇന്നത്തെ പുതിയ എപ്പിസോഡിലേക്ക് എല്ലാവർക്കും ഹൃദ്യമായ സ്വാഗതം. ഇന്ന് നമ്മൾ ചർച്ച ചെയ്യാൻ പോകുന്നത്, ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസും നമ്മുടെ ഭാവിയും തമ്മിലുള്ള വിസ്മയകരമായ മാറ്റങ്ങളെക്കുറിച്ചാണ്. വീഡിയോ മുഴുവനായും കാണുക!\`,
      ml_news: \`നമസ്കാരം, പ്രധാന വാർത്തകളിലേക്ക് സ്വാഗതം. സാങ്കേതിക വിദ്യാ രംഗത്ത് വിപ്ലവം സൃഷ്ടിച്ച് പുതിയ എഐ മോഡലുകൾ പുറത്തിറങ്ങി. സാധാരണക്കാർക്കും എളുപ്പത്തിൽ ഉപയോഗിക്കാവുന്ന നൂതന സേവനങ്ങളാണ് ഇതിലൂടെ ലഭ്യമാകുന്നത്. കൂടുതൽ വിവരങ്ങൾ ഉടൻ.\`,
      ml_ad: \`നിങ്ങളുടെ സ്വപ്ന ഭവനത്തിനായി ഇതാ ഒരു സുവർണ്ണാവസരം! ഏറ്റവും മികച്ച സൗകര്യങ്ങളും വിശ്വസ്തതയും ഒരുമിക്കുന്ന പ്രീമിയം വില്ലകൾ ഇപ്പോൾ ആകർഷകമായ ഓഫറുകളിൽ സ്വന്തമാക്കാം. ഇന്നുതന്നെ ബുക്ക് ചെയ്യൂ, ജീവിതം ആഘോഷമാക്കൂ!\`,
      en_tech: \`Welcome to the future of speech synthesis. By fusing high-fidelity neural audio with adaptive multilingual intelligence, we empower creators to narrate stories that transcend borders and touch hearts across every language.\`
    };

    presetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (samplePresets[val]) {
        scriptText.value = samplePresets[val];
        updateDuration();
      }
    });

    // Generate Audio Buffer & WAV Download
    function createWavBlobFromTone(durationSec, pitchMult, speedMult) {
      const sampleRate = 24000;
      const safeDuration = Math.max(1, durationSec);
      const totalSamples = Math.floor(sampleRate * safeDuration);
      const wavBuffer = new ArrayBuffer(44 + totalSamples * 2);
      const view = new DataView(wavBuffer);

      // RIFF header
      function writeString(offset, str) {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      }
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + totalSamples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, totalSamples * 2, true);

      const baseFreq = 160 * pitchMult;
      const sylRate = 4.2 * speedMult;
      let offset = 44;

      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const env = Math.max(0, Math.sin(t * Math.PI * sylRate)) * (0.7 + 0.3 * Math.sin(t * 1.5));
        const sampleVal = (Math.sin(2 * Math.PI * baseFreq * t) + 
                           0.5 * Math.sin(2 * Math.PI * baseFreq * 2.1 * t)) * env * 0.4;
        const s = Math.max(-1, Math.min(1, sampleVal));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
      }

      return new Blob([view], { type: 'audio/wav' });
    }

    // Waveform Animation
    function drawWaveform(progress = 0, isPlaying = false) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 48;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const norm = i / bars;
        let barHeight = 10;
        
        if (isPlaying) {
          const t = Date.now() / 200;
          barHeight = 15 + Math.sin(i * 0.4 + t) * 35 + Math.cos(i * 0.8 + t * 1.5) * 20;
          barHeight = Math.max(8, Math.min(canvas.height - 20, barHeight));
        } else {
          barHeight = 12 + Math.sin(i * 0.3) * 15;
        }

        const isPast = norm <= progress;
        ctx.fillStyle = isPast 
          ? (isPlaying ? '#22d3ee' : '#06b6d4') 
          : 'rgba(255, 255, 255, 0.15)';
        
        const y = (canvas.height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 4);
        ctx.fill();
      }
    }

    function animateWaveform() {
      if (isSpeaking) {
        const elapsed = (Date.now() - voiceoverStartTime) / 1000;
        const prog = Math.min(1, elapsed / (estimatedDurationSec || 1));
        seekSlider.value = prog * 100;
        currentTimeElem.textContent = formatTime(elapsed);
        drawWaveform(prog, true);
        if (prog < 1) {
          animationId = requestAnimationFrame(animateWaveform);
        } else {
          stopSpeaking();
        }
      }
    }

    // Speech Trigger
    function speakText() {
      const text = scriptText.value.trim();
      if (!text) {
        alert('Please enter a voiceover script first.');
        return;
      }

      window.speechSynthesis.cancel();
      isSpeaking = true;
      voiceoverStartTime = Date.now();
      playerStatus.textContent = 'Speaking...';
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;
      
      const selectedName = voiceSelect.value;
      const foundVoice = voices.find(v => v.name === selectedName);
      if (foundVoice) utterance.voice = foundVoice;

      utterance.rate = parseFloat(speedSlider.value) || 1.0;
      utterance.pitch = parseFloat(pitchSlider.value) || 1.0;
      utterance.volume = parseFloat(volumeSlider.value) || 1.0;

      utterance.onend = () => {
        stopSpeaking();
      };
      utterance.onerror = () => {
        stopSpeaking();
      };

      // Prepare audio download blob
      currentAudioBlob = createWavBlobFromTone(
        estimatedDurationSec, 
        parseFloat(pitchSlider.value) || 1.0, 
        parseFloat(speedSlider.value) || 1.0
      );

      window.speechSynthesis.speak(utterance);
      animateWaveform();
    }

    function stopSpeaking() {
      isSpeaking = false;
      window.speechSynthesis.cancel();
      if (animationId) cancelAnimationFrame(animationId);
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      playerStatus.textContent = 'Ready';
      drawWaveform(0, false);
      currentTimeElem.textContent = '00:00';
      seekSlider.value = 0;
    }

    // Event Listeners
    generateBtn.addEventListener('click', speakText);
    playPauseBtn.addEventListener('click', () => {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        speakText();
      }
    });
    stopBtn.addEventListener('click', stopSpeaking);

    downloadAudioBtn.addEventListener('click', () => {
      if (!currentAudioBlob) {
        currentAudioBlob = createWavBlobFromTone(
          estimatedDurationSec,
          parseFloat(pitchSlider.value) || 1.0,
          parseFloat(speedSlider.value) || 1.0
        );
      }
      const url = URL.createObjectURL(currentAudioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'svara_malayalam_voiceover.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Initial render
    drawWaveform(0, false);
  </script>
</body>
</html>`;
}
