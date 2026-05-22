const picker = document.getElementById("picker");
const swatch = document.getElementById("swatch");
const nameEl = document.getElementById("name");
const descEl = document.getElementById("desc");
const toggleBtn = document.getElementById("toggle");

const NOISES = {
  white:  { color: [255, 255, 255], desc: "Flat spectrum — equal energy per frequency." },
  pink:   { color: [255, 143, 178], desc: "1/f — softer highs, like steady rainfall." },
  brown:  { color: [122,  59,  26], desc: "1/f² — deep, oceanic rumble." },
  blue:   { color: [ 58, 160, 255], desc: "+3 dB/oct — bright, hissy, dithering-like." },
  violet: { color: [155,  92, 255], desc: "+6 dB/oct — sharp, very treble-heavy." },
  grey:   { color: [136, 136, 136], desc: "Equal-loudness — sounds flat to the ear." },
  green:  { color: [ 63, 174,  90], desc: "Mid-band — ambient, natural background." },
  black:  { color: [ 17,  17,  17], desc: "Sparse impulses inside silence." },
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbDistance(a, b) {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
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

function pickNoise(rgb) {
  const [h, s, l] = rgbToHsl(rgb);
  if (l > 0.85 && s < 0.25) return "white";
  if (l < 0.15) return "black";
  if (s < 0.18) return "grey";
  if (h >= 20 && h < 50 && l < 0.5) return "brown";
  if (h >= 320 || h < 20) return l > 0.6 ? "pink" : (l < 0.35 ? "brown" : "pink");
  if (h >= 70 && h < 170) return "green";
  if (h >= 170 && h < 250) return "blue";
  if (h >= 250 && h < 320) return "violet";
  let best = "white", bestD = Infinity;
  for (const [name, n] of Object.entries(NOISES)) {
    const d = rgbDistance(rgb, n.color);
    if (d < bestD) { bestD = d; best = name; }
  }
  return best;
}

// ---- Audio ----

let ctx = null;
let masterGain = null;
let currentNode = null;
let currentName = null;
let playing = false;

function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
}

function makeNoiseBuffer(seconds = 4) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function makePinkBuffer(seconds = 4) {
  // Paul Kellet's refined pink noise filter
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    data[i] = (b0+b1+b2+b3+b4+b5+b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return buf;
}

function makeBrownBuffer(seconds = 4) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    data[i] = last * 3.5;
  }
  return buf;
}

function makeBufferSource(buffer) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
}

function buildGraph(name) {
  // Returns a node that connects to masterGain, plus a start() method.
  const out = ctx.createGain();
  out.gain.value = 1;

  const start = [];
  const stop = [];

  function play(src) {
    src.start();
    stop.push(() => { try { src.stop(); } catch {} });
  }

  switch (name) {
    case "white": {
      const src = makeBufferSource(makeNoiseBuffer());
      src.connect(out);
      out.gain.value = 0.4;
      play(src);
      break;
    }
    case "pink": {
      const src = makeBufferSource(makePinkBuffer());
      src.connect(out);
      out.gain.value = 0.9;
      play(src);
      break;
    }
    case "brown": {
      const src = makeBufferSource(makeBrownBuffer());
      src.connect(out);
      out.gain.value = 0.9;
      play(src);
      break;
    }
    case "blue": {
      // Differentiated white -> emphasize highs. Use highshelf + highpass.
      const src = makeBufferSource(makeNoiseBuffer());
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 500;
      const hs = ctx.createBiquadFilter();
      hs.type = "highshelf"; hs.frequency.value = 2000; hs.gain.value = 9;
      src.connect(hp).connect(hs).connect(out);
      out.gain.value = 0.25;
      play(src);
      break;
    }
    case "violet": {
      // Even more upper-tilted than blue.
      const src = makeBufferSource(makeNoiseBuffer());
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 1500;
      const hs = ctx.createBiquadFilter();
      hs.type = "highshelf"; hs.frequency.value = 4000; hs.gain.value = 12;
      src.connect(hp).connect(hs).connect(out);
      out.gain.value = 0.2;
      play(src);
      break;
    }
    case "grey": {
      // Rough equal-loudness shaping of white: boost low and high a bit.
      const src = makeBufferSource(makeNoiseBuffer());
      const ls = ctx.createBiquadFilter();
      ls.type = "lowshelf"; ls.frequency.value = 200; ls.gain.value = 6;
      const hs = ctx.createBiquadFilter();
      hs.type = "highshelf"; hs.frequency.value = 6000; hs.gain.value = 8;
      const dip = ctx.createBiquadFilter();
      dip.type = "peaking"; dip.frequency.value = 3500; dip.Q.value = 1; dip.gain.value = -4;
      src.connect(ls).connect(hs).connect(dip).connect(out);
      out.gain.value = 0.35;
      play(src);
      break;
    }
    case "green": {
      // Narrowish band around 500 Hz on pink — "natural background".
      const src = makeBufferSource(makePinkBuffer());
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 500; bp.Q.value = 0.7;
      src.connect(bp).connect(out);
      out.gain.value = 1.6;
      play(src);
      break;
    }
    case "black": {
      // Mostly silence, sparse pink bursts.
      const src = makeBufferSource(makePinkBuffer());
      const g = ctx.createGain();
      g.gain.value = 0;
      src.connect(g).connect(out);
      out.gain.value = 0.8;
      play(src);

      const tick = () => {
        if (!stop.length) return;
        const now = ctx.currentTime;
        const peak = 0.6;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(peak, now + 0.05);
        g.gain.linearRampToValueAtTime(0, now + 0.35);
      };
      const interval = setInterval(tick, 2200);
      stop.push(() => clearInterval(interval));
      break;
    }
  }

  out.connect(masterGain);
  return {
    stop() {
      stop.forEach(fn => fn());
      out.disconnect();
    }
  };
}

function startNoise(name) {
  ensureCtx();
  stopNoise(true);
  currentNode = buildGraph(name);
  currentName = name;
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0.6, now + 0.25);
}

function stopNoise(immediate = false) {
  if (!currentNode) return;
  if (immediate) {
    currentNode.stop();
    currentNode = null;
    return;
  }
  const node = currentNode;
  currentNode = null;
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0, now + 0.2);
  setTimeout(() => node.stop(), 260);
}

// ---- UI wiring ----

function applyColor(hex) {
  const rgb = hexToRgb(hex);
  const name = pickNoise(rgb);
  document.documentElement.style.setProperty("--bg", hex);
  const [h, s, l] = rgbToHsl(rgb);
  document.documentElement.style.setProperty("--fg", l > 0.55 ? "#111" : "#fff");
  nameEl.textContent = name + " noise";
  descEl.textContent = NOISES[name].desc;
  if (playing && name !== currentName) startNoise(name);
}

picker.addEventListener("input", e => applyColor(e.target.value));

toggleBtn.addEventListener("click", () => {
  playing = !playing;
  toggleBtn.textContent = playing ? "stop" : "play";
  if (playing) {
    const rgb = hexToRgb(picker.value);
    startNoise(pickNoise(rgb));
  } else {
    stopNoise();
  }
});

applyColor(picker.value);
