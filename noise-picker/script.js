// Noise picker
// Pick any color → mapped to the nearest noise via HSL classification.
// Spectral colors (brown, orange, pink, yellow, white, cyan, blue, indigo,
// violet) play as crossfaded positions on a -6..+6 dB/oct tilt continuum
// using true derivatives for blue/violet. Off-axis colors (grey, green,
// black, magenta) play their own dedicated chains:
//   grey    = white noise with inverse equal-loudness shaping
//   green   = pink noise through a ~500 Hz bandpass
//   magenta = white noise through a ~500 Hz notch (the inverse of green)
//   black   = pink noise gated to sparse bursts
// Live spectrum analyzer (log frequency). Last picked color persists in
// localStorage.

const picker = document.getElementById("picker");
const nameEl = document.getElementById("name");
const metaEl = document.getElementById("meta");
const toggleBtn = document.getElementById("toggle");
const canvas = document.getElementById("spectrum");
const paletteEl = document.getElementById("palette");

const PALETTE = [
  { name: "brown",   hex: "#7a3b1a" },
  { name: "orange",  hex: "#ff8c3c" },
  { name: "pink",    hex: "#ff8fb2" },
  { name: "yellow",  hex: "#ffe066" },
  { name: "white",   hex: "#f5f5f5" },
  { name: "cyan",    hex: "#78dce6" },
  { name: "blue",    hex: "#3aa0ff" },
  { name: "indigo",  hex: "#5a5ac8" },
  { name: "violet",  hex: "#9b5cff" },
  { name: "grey",    hex: "#888888" },
  { name: "green",   hex: "#3fae5a" },
  { name: "magenta", hex: "#ff3cc8" },
  { name: "black",   hex: "#111111" },
];

// Five spectrally-distinct reference noises that we actually synthesize.
const AUDIO_ANCHORS = [
  { tilt: -6, name: "brown"  },
  { tilt: -3, name: "pink"   },
  { tilt:  0, name: "white"  },
  { tilt: +3, name: "blue"   },
  { tilt: +6, name: "violet" },
];

const TILT_POSITION = {
  brown:  -6,
  orange: -4.5,
  pink:   -3,
  yellow: -1.5,
  white:   0,
  cyan:   +1.5,
  blue:   +3,
  indigo: +4.5,
  violet: +6,
};

const STORAGE_KEY = "noise-picker-state-v2";

let ctx = null;
let masterGain = null;
let analyser = null;
let analyserData = null;
let buffers = null;
let activeChain = null;
let playing = false;

// Current selection driven by the color picker.
let currentMode = "tilt";  // "tilt" or one of: grey/green/black/magenta
let currentTilt = -3;      // only meaningful when currentMode === "tilt"
let currentName = "pink";

// ---- Color helpers ----------------------------------------------------

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
}

function classifyColor(rgb) {
  const [h, s, l] = rgbToHsl(rgb);

  if (l < 0.10) return { mode: "black",   name: "black"   };
  if (l > 0.92 && s < 0.20) return { mode: "tilt", name: "white", tilt: 0 };
  if (s < 0.15) return { mode: "grey",    name: "grey"    };

  // Brown lives in the red-orange band at low lightness.
  if ((h < 50 || h > 340) && l < 0.45 && s > 0.25) {
    return { mode: "tilt", name: "brown", tilt: -6 };
  }

  // Hue-based mapping for the rest.
  if (h >= 15 && h < 45)  return { mode: "tilt",   name: "orange", tilt: -4.5 };
  if (h >= 45 && h < 70)  return { mode: "tilt",   name: "yellow", tilt: -1.5 };
  if (h >= 70 && h < 165) return { mode: "green",  name: "green"  };
  if (h >= 165 && h < 200)return { mode: "tilt",   name: "cyan",   tilt: +1.5 };
  if (h >= 200 && h < 245)return { mode: "tilt",   name: "blue",   tilt: +3   };
  if (h >= 245 && h < 275)return { mode: "tilt",   name: "indigo", tilt: +4.5 };
  if (h >= 275 && h < 315)return { mode: "tilt",   name: "violet", tilt: +6   };
  if (h >= 315 && h < 345)return { mode: "magenta",name: "magenta"};

  // Reds: light → pink, otherwise pink (brown already handled by lightness).
  return { mode: "tilt", name: "pink", tilt: -3 };
}

// ---- Audio init -------------------------------------------------------

function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    analyser.minDecibels = -100;
    analyser.maxDecibels = -10;
    analyserData = new Float32Array(analyser.frequencyBinCount);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);
    buffers = buildReferenceBuffers(ctx, 5);
  }
  if (ctx.state === "suspended") ctx.resume();
}

function rmsNormalize(arr, target = 0.2) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i] * arr[i];
  const rms = Math.sqrt(sum / arr.length);
  if (rms === 0) return;
  const gain = target / rms;
  for (let i = 0; i < arr.length; i++) arr[i] *= gain;
}

function buildReferenceBuffers(ctx, seconds) {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);

  const white = new Float32Array(len);
  for (let i = 0; i < len; i++) white[i] = Math.random() * 2 - 1;

  const pink = new Float32Array(len);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < len; i++) {
    const w = white[i];
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    pink[i] = (b0+b1+b2+b3+b4+b5+b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }

  const brown = new Float32Array(len);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * white[i]) / 1.02;
    brown[i] = last;
  }

  // Mathematically correct derivatives.
  const blue = new Float32Array(len);
  for (let i = 1; i < len; i++) blue[i] = pink[i] - pink[i - 1];
  const violet = new Float32Array(len);
  for (let i = 1; i < len; i++) violet[i] = white[i] - white[i - 1];

  [white, pink, brown, blue, violet].forEach(a => rmsNormalize(a, 0.2));

  const toBuffer = (data) => {
    const buf = ctx.createBuffer(1, data.length, sr);
    buf.copyToChannel(data, 0);
    return buf;
  };
  return {
    brown:  toBuffer(brown),
    pink:   toBuffer(pink),
    white:  toBuffer(white),
    blue:   toBuffer(blue),
    violet: toBuffer(violet),
  };
}

// ---- Chains -----------------------------------------------------------

function buildTiltChain() {
  const sources = {};
  const gains = {};
  for (const a of AUDIO_ANCHORS) {
    const src = ctx.createBufferSource();
    src.buffer = buffers[a.name];
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(g).connect(masterGain);
    src.start();
    sources[a.name] = src;
    gains[a.name] = g;
  }
  applyTilt(currentTilt, gains);
  return {
    gains,
    stop() {
      for (const a of AUDIO_ANCHORS) {
        try { sources[a.name].stop(); } catch {}
        gains[a.name].disconnect();
      }
    },
  };
}

function applyTilt(t, gains) {
  for (const a of AUDIO_ANCHORS) gains[a.name].gain.value = 0;
  if (t <= AUDIO_ANCHORS[0].tilt) { gains[AUDIO_ANCHORS[0].name].gain.value = 1; return; }
  const last = AUDIO_ANCHORS[AUDIO_ANCHORS.length - 1];
  if (t >= last.tilt) { gains[last.name].gain.value = 1; return; }
  for (let i = 0; i < AUDIO_ANCHORS.length - 1; i++) {
    const a = AUDIO_ANCHORS[i], b = AUDIO_ANCHORS[i+1];
    if (t >= a.tilt && t <= b.tilt) {
      const u = (t - a.tilt) / (b.tilt - a.tilt);
      gains[a.name].gain.value = Math.cos(u * Math.PI / 2);
      gains[b.name].gain.value = Math.sin(u * Math.PI / 2);
      return;
    }
  }
}

function buildPresetChain(name) {
  const out = ctx.createGain();
  out.connect(masterGain);
  const stops = [];

  const newSrc = (buffer) => {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    stops.push(() => { try { src.stop(); } catch {} });
    return src;
  };

  if (name === "grey") {
    const src = newSrc(buffers.white);
    const ls = ctx.createBiquadFilter();
    ls.type = "lowshelf"; ls.frequency.value = 200; ls.gain.value = 6;
    const hs = ctx.createBiquadFilter();
    hs.type = "highshelf"; hs.frequency.value = 6000; hs.gain.value = 8;
    const dip = ctx.createBiquadFilter();
    dip.type = "peaking"; dip.frequency.value = 3500; dip.Q.value = 1; dip.gain.value = -4;
    src.connect(ls).connect(hs).connect(dip).connect(out);
    out.gain.value = 1.0;
    src.start();
  } else if (name === "green") {
    const src = newSrc(buffers.pink);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 500; bp.Q.value = 0.7;
    src.connect(bp).connect(out);
    out.gain.value = 3.0;
    src.start();
  } else if (name === "magenta") {
    // Inverse of green: notch around 500 Hz on white.
    const src = newSrc(buffers.white);
    const notch = ctx.createBiquadFilter();
    notch.type = "notch"; notch.frequency.value = 500; notch.Q.value = 0.7;
    src.connect(notch).connect(out);
    out.gain.value = 0.9;
    src.start();
  } else if (name === "black") {
    const src = newSrc(buffers.pink);
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(g).connect(out);
    out.gain.value = 1.2;
    src.start();
    const tick = () => {
      const now = ctx.currentTime;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.7, now + 0.05);
      g.gain.linearRampToValueAtTime(0, now + 0.4);
    };
    const interval = setInterval(tick, 2400);
    stops.push(() => clearInterval(interval));
  }

  return {
    stop() {
      stops.forEach(fn => fn());
      try { out.disconnect(); } catch {}
    }
  };
}

function startChain() {
  ensureCtx();
  stopChain(true);
  activeChain = (currentMode === "tilt") ? buildTiltChain() : buildPresetChain(currentMode);
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0.6, now + 0.2);
}

function stopChain(immediate = false) {
  if (!activeChain) return;
  if (immediate) {
    activeChain.stop();
    activeChain = null;
    return;
  }
  const node = activeChain;
  activeChain = null;
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0, now + 0.18);
  setTimeout(() => node.stop(), 240);
}

// ---- Visuals ----------------------------------------------------------

function applyVisuals(hex) {
  document.documentElement.style.setProperty("--bg", hex);
  const rgb = hexToRgb(hex);
  const lum = (0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]) / 255;
  document.documentElement.style.setProperty("--fg", lum > 0.55 ? "#111" : "#fff");

  nameEl.textContent = `${currentName} noise`;
  if (currentMode === "tilt") {
    const t = currentTilt;
    metaEl.textContent = `${t >= 0 ? "+" : "−"}${Math.abs(t).toFixed(1)} dB/oct`;
  } else {
    metaEl.textContent = "off-axis";
  }

  for (const tile of paletteEl.children) {
    tile.classList.toggle("active", tile.dataset.name === currentName);
  }
}

function buildPalette() {
  paletteEl.innerHTML = "";
  for (const p of PALETTE) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile";
    btn.dataset.name = p.name;
    btn.dataset.hex = p.hex;
    btn.style.setProperty("--c", p.hex);
    btn.setAttribute("aria-label", `${p.name} noise`);
    btn.addEventListener("click", () => {
      picker.value = p.hex;
      selectColor(p.hex);
    });
    paletteEl.appendChild(btn);
  }
  const custom = document.createElement("button");
  custom.type = "button";
  custom.className = "tile custom";
  custom.setAttribute("aria-label", "custom color");
  custom.addEventListener("click", () => picker.click());
  paletteEl.appendChild(custom);
}

// ---- Selection update -------------------------------------------------

function selectColor(hex, { fromLoad = false } = {}) {
  const rgb = hexToRgb(hex);
  const c = classifyColor(rgb);
  const modeChanged = (c.mode !== currentMode);
  currentMode = c.mode;
  currentName = c.name;
  if (c.mode === "tilt") currentTilt = c.tilt;

  applyVisuals(hex);

  if (!fromLoad && !playing) {
    playing = true;
    toggleBtn.classList.add("playing");
    startChain();
  } else if (playing) {
    if (modeChanged || c.mode !== "tilt") {
      startChain();
    } else if (activeChain && activeChain.gains) {
      applyTilt(currentTilt, activeChain.gains);
    }
  }

  if (!fromLoad) saveState(hex);
}

// ---- Persistence ------------------------------------------------------

function saveState(hex) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ color: hex }));
  } catch {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.color === "string" && /^#[0-9a-fA-F]{6}$/.test(s.color)) {
      picker.value = s.color;
    }
  } catch {}
}

// ---- Spectrum analyzer ------------------------------------------------

const dpr = Math.max(1, window.devicePixelRatio || 1);
const cctx = canvas.getContext("2d");

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
}
window.addEventListener("resize", resizeCanvas);

function drawSpectrum() {
  requestAnimationFrame(drawSpectrum);
  const w = canvas.width, h = canvas.height;
  cctx.clearRect(0, 0, w, h);

  const fg = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#111";
  const minF = 20, maxF = 20000;
  const logMin = Math.log(minF), logMax = Math.log(maxF);

  // Reserve a thin axis strip at the bottom for frequency labels.
  const axisH = 22 * dpr;
  const plotH = h - axisH;

  // Baseline + three tiny labels — acts as the frame so the area still feels
  // like a chart even when nothing is playing.
  cctx.lineWidth = 1 * dpr;
  cctx.strokeStyle = fg + "22";
  cctx.beginPath();
  cctx.moveTo(0, plotH - 0.5);
  cctx.lineTo(w, plotH - 0.5);
  cctx.stroke();

  cctx.fillStyle = fg + "66";
  cctx.font = `${10 * dpr}px -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
  cctx.textAlign = "center";
  cctx.textBaseline = "middle";
  const labelY = plotH + axisH / 2;
  for (const lab of [{f:100,t:"100 Hz"},{f:1000,t:"1 kHz"},{f:10000,t:"10 kHz"}]) {
    const u = (Math.log(lab.f) - logMin) / (logMax - logMin);
    cctx.fillText(lab.t, u * w, labelY);
  }

  if (!analyser || !playing) return;
  analyser.getFloatFrequencyData(analyserData);

  const sr = ctx.sampleRate;
  const bins = analyserData.length;
  const nyquist = sr / 2;

  cctx.lineWidth = 2 * dpr;
  cctx.strokeStyle = fg;
  cctx.fillStyle = fg + "33";

  const samples = 256;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const freq = Math.exp(logMin + (logMax - logMin) * u);
    const bin = Math.min(bins - 1, Math.floor(freq / nyquist * bins));
    const db = analyserData[bin];
    const v = Math.max(0, Math.min(1, (db + 100) / 90));
    pts.push([u * w, plotH - v * plotH * 0.95]);
  }

  cctx.beginPath();
  cctx.moveTo(0, plotH);
  for (const [x,y] of pts) cctx.lineTo(x, y);
  cctx.lineTo(w, plotH);
  cctx.closePath();
  cctx.fill();

  cctx.beginPath();
  pts.forEach(([x,y], i) => i === 0 ? cctx.moveTo(x, y) : cctx.lineTo(x, y));
  cctx.stroke();
}

resizeCanvas();
requestAnimationFrame(drawSpectrum);

// ---- Wiring -----------------------------------------------------------

picker.addEventListener("input", (e) => selectColor(e.target.value));

toggleBtn.addEventListener("click", () => {
  playing = !playing;
  toggleBtn.classList.toggle("playing", playing);
  if (playing) startChain(); else stopChain();
});

buildPalette();
loadState();
selectColor(picker.value, { fromLoad: true });
