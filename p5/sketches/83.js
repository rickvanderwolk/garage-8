// Variant: een bewegend net van caustic-aderen uit Perlin-ruis. Het patroon
// zakt omlaag (toenemende y-offset) en de helderheid wordt via een continue
// cosinus van vol naar vrijwel zwart en terug geschaald.

const period = 2200;
let cell;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
  cell = max(7, floor(min(width, height) * 0.02));
}

function draw() {
  const ctx = drawingContext;

  const t = (frameCount % period) / period;
  const depth = 0.5 - 0.5 * cos(t * TWO_PI);
  const sl = 1 - depth;

  // diep blauwe grond, dimt mee
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, `rgb(${6 + 26 * sl}, ${16 + 46 * sl}, ${34 + 70 * sl})`);
  g.addColorStop(1, 'rgb(2, 5, 11)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // caustic-net: ribbels waar de ruis dicht bij een drempel ligt lichten op;
  // het patroon zakt omlaag (toenemende y-offset) en dempt met de diepte
  const z = frameCount * 0.012;
  const sink = frameCount * 0.002;
  blendMode(ADD);
  noStroke();
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const n = noise(x * 0.006, y * 0.006 + sink, z);
      const ridge = 1 - abs(n - 0.5) * 2.4;
      if (ridge > 0.55) {
        const v = pow((ridge - 0.55) / 0.45, 2) * 150 * sl;
        fill(120, 170, 200, v);
        rect(x, y, cell, cell);
      }
    }
  }
  blendMode(BLEND);

  if (audio) {
    audio.lp.frequency.setTargetAtTime(80 + 220 * sl, audio.ctx.currentTime, 0.4);
    audio.g.gain.setTargetAtTime(0.04 + 0.03 * depth, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 41; o1.connect(lp);
  const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 27; o2.connect(lp);
  o1.start(); o2.start();
  audio = { ctx, g, lp, o1, o2 };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
