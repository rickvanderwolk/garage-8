// Variant: een factor loopt over een cyclus op naar 1 en valt bij de wrap terug
// naar 0. De toonhoogte van een zaagtand, de middenfrequentie van een
// ruis-bandpass en het volume schalen met die factor; bij de wrap wordt de gain
// hard op nul gezet. Een vlak vult van onder naar boven mee, met een per-frame
// trillende bovenrand.

const period = 1500;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  const t = (frameCount % period) / period;
  // factor loopt op naar 1 en valt bij de wrap terug naar 0
  const ramp = pow(t, 1.3);

  background(lerp(6, 30, ramp), 6, lerp(8, 14, ramp));

  const base = min(width, height);

  // vlak vult van onder naar boven, hoogte schaalt met de factor
  noStroke();
  fill(90, 50, 60, 120);
  const h = height * ramp;
  rect(0, height - h, width, h);

  // per-frame trillende bovenrand; amplitude schaalt met de factor
  stroke(200, 170, 180, 180);
  strokeWeight(1.5);
  const jit = base * 0.02 * ramp;
  let prevy = height - h;
  for (let x = 0; x <= width; x += 14) {
    const y = height - h + random(-jit, jit);
    line(x - 14, prevy, x, y);
    prevy = y;
  }
  noStroke();

  if (audio) {
    const now = audio.ctx.currentTime;
    if (t < 0.02) {
      // bij de wrap: gain hard op nul
      audio.g.gain.cancelScheduledValues(now);
      audio.g.gain.setValueAtTime(0.0001, now);
    } else {
      audio.tone.frequency.setTargetAtTime(70 + 900 * ramp, now, 0.1);
      audio.bp.frequency.setTargetAtTime(200 + 4000 * ramp, now, 0.1);
      audio.g.gain.setTargetAtTime(0.02 + 0.08 * ramp, now, 0.1);
    }
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
  const g = ctx.createGain(); g.gain.value = 0; g.connect(master);

  // ruisband
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.5; bp.frequency.value = 200;
  src.connect(bp); bp.connect(g); src.start();

  // stijgende toon erbovenop
  const tone = ctx.createOscillator(); tone.type = 'sawtooth'; tone.frequency.value = 70;
  const tg = ctx.createGain(); tg.gain.value = 0.5; tone.connect(tg); tg.connect(g); tone.start();

  audio = { ctx, master, g, bp, tone };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
