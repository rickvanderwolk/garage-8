// Variant: dovend ruisveld. Een rooster van grijswaarden uit Perlin-ruis wordt
// vermenigvuldigd met een helderheidsfactor die via een continue cosinus van
// vol naar nul en terug loopt (geen reset); de lichtflarden sterven traag uit
// tot een vlak zwart raster en komen daarna weer op.

const period = 2400;
let cell;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
  cell = max(8, floor(min(width, height) * 0.022));
}

function draw() {
  background(0);

  // continue helderheidsfactor 1..0..1, sprongloos bij de wrap
  const t = (frameCount % period) / period;
  const lum = 0.5 + 0.5 * cos(t * TWO_PI);
  const z = frameCount * 0.01;

  noStroke();
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const n = noise(x * 0.01, y * 0.01, z);
      // drempel laat alleen de hoogste ruiswaarden oplichten
      const v = max(0, n - 0.45) * 2.2;
      const g = v * v * 210 * lum;
      if (g > 2) {
        fill(g);
        rect(x, y, cell, cell);
      }
    }
  }

  if (audio) {
    audio.lp.frequency.setTargetAtTime(120 + 200 * lum, audio.ctx.currentTime, 0.3);
    audio.g.gain.setTargetAtTime(0.03 + 0.04 * lum, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 58; o1.connect(lp);
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 29; o2.connect(lp);
  o1.start(); o2.start();
  audio = { ctx, g, lp, o1, o2 };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
