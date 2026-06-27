// Variant: raster van korte kruis-segmenten waarvan de posities elke frame met
// kleine willekeurige uitslagen verspringen. Op willekeurige intervallen wordt
// één frame een verschil-blend (inversie) getekend. Een cluster van vier dicht
// bijeen liggende zaagtand-frequenties zwelt onregelmatig aan via ruis.

let cell;
let invert = 0;
let nextInvert = 240;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
  cell = max(18, floor(min(width, height) * 0.05));
}

function draw() {
  background(8);

  const base = min(width, height);
  const j = base * 0.006; // trilamplitude

  stroke(44);
  strokeWeight(1);
  for (let y = cell; y < height; y += cell) {
    for (let x = cell; x < width; x += cell) {
      const ox = random(-j, j);
      const oy = random(-j, j);
      const len = cell * 0.35;
      line(x + ox - len, y + oy, x + ox + len, y + oy);
      line(x + ox, y + oy - len, x + ox, y + oy + len);
    }
  }
  noStroke();

  // periodieke inversie van een enkel frame
  if (frameCount >= nextInvert) {
    invert = 1;
    nextInvert = frameCount + floor(random(150, 520));
    if (audio) audio.swell();
  }
  if (invert > 0) {
    blendMode(DIFFERENCE);
    fill(255);
    rect(0, 0, width, height);
    blendMode(BLEND);
    invert--;
  }

  if (audio) {
    // onregelmatig aanzwellend volume via ruis
    const lvl = 0.03 + 0.05 * noise(frameCount * 0.01);
    audio.g.gain.setTargetAtTime(lvl, audio.ctx.currentTime, 0.3);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.connect(g);
  // cluster van vier dicht bijeen liggende frequenties
  const freqs = [196, 208, 214, 233];
  const oscs = [];
  for (const f of freqs) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const og = ctx.createGain(); og.gain.value = 0.25;
    o.connect(og); og.connect(lp); o.start();
    oscs.push(o);
  }
  audio = { ctx, master, g, lp, oscs };
  audio.swell = function () {
    const now = ctx.currentTime;
    audio.g.gain.cancelScheduledValues(now);
    audio.g.gain.setValueAtTime(audio.g.gain.value, now);
    audio.g.gain.linearRampToValueAtTime(0.12, now + 0.03);
    audio.g.gain.linearRampToValueAtTime(0.04, now + 0.5);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
