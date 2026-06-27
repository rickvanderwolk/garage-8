// Variant: ademend lichtveld op zwart. Een radiale lichtvlek krimpt naar een
// punt en groeit weer, aangedreven door een continue cosinus (geen reset), dus
// als een doorlopende beweging. De helderheid van de kern volgt de diameter,
// zodat het beeld bij de kleinste stand bijna volledig zwart is.

const period = 1800;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  const base = min(width, height);
  const ctx = drawingContext;

  // continue 0..1..0 cyclus, sprongloos bij de wrap
  const t = (frameCount % period) / period;
  const k = 0.5 - 0.5 * cos(t * TWO_PI);

  background(0);

  // diameter ademt tussen een vrijwel gesloten punt en een ruime vlek
  const wob = 1 + 0.03 * sin(frameCount * 0.13);
  const R = lerp(base * 0.015, base * 0.62, k) * wob;

  // kernhelderheid volgt de diameter
  const lvl = 70 * k;

  const cx = width * 0.5;
  const cy = height * 0.5;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, max(1, R));
  grad.addColorStop(0, `rgb(${lvl}, ${lvl}, ${lvl})`);
  grad.addColorStop(0.7, `rgb(${lvl * 0.3}, ${lvl * 0.3}, ${lvl * 0.3})`);
  grad.addColorStop(1, 'rgb(0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (audio) {
    audio.lp.frequency.setTargetAtTime(110 + 130 * k, audio.ctx.currentTime, 0.4);
    audio.g.gain.setTargetAtTime(0.04 + 0.03 * (1 - k), audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 46; o1.connect(lp);
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 47.5; o2.connect(lp);
  o1.start(); o2.start();
  audio = { ctx, g, lp, o1, o2 };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
