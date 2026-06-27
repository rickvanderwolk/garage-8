// Variant: zes tonen rond een basisfrequentie. Een via continue cosinus op- en
// aflopende factor schuift ze symmetrisch microtonaal uit elkaar en weer samen.
// Horizontale lijnen volgen dezelfde verschuiving.

const tones = 6;
const period = 2600;
const baseFreq = 98;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  background(10, 9, 12);

  const t = (frameCount % period) / period;
  const spread = 0.5 - 0.5 * cos(t * TWO_PI); // 0 = unisono, 1 = ver uiteen

  stroke(150, 140, 160, 120);
  strokeWeight(1.5);
  const cy = height * 0.5;
  for (let i = 0; i < tones; i++) {
    const k = (i - (tones - 1) / 2);
    const off = k * spread * 0.06;
    const y = cy + off * height * 0.5;
    line(0, y, width, y);

    if (audio) {
      const f = baseFreq * (1 + off);
      audio.osc[i].frequency.setTargetAtTime(f, audio.ctx.currentTime, 0.05);
    }
  }
  noStroke();

  if (audio) {
    audio.g.gain.setTargetAtTime(0.05, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
  const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(g);
  const osc = [];
  for (let i = 0; i < tones; i++) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = baseFreq;
    const og = ctx.createGain(); og.gain.value = 0.18;
    o.connect(og); og.connect(lp); o.start();
    osc.push(o);
  }
  audio = { ctx, master, g, osc };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
