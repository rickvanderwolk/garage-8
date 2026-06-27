// Variant: een fase-accumulator met een snelheid die over een cyclus oploopt en
// bij de wrap terugvalt. Bij elke fase-omslag wordt een korte lage puls
// (frequentie-envelope) getriggerd en een naar buiten lopende ring toegevoegd;
// een ondertoon stijgt mee met de cyclus. Een centrale schijf pulseert met de fase.

const period = 1400;
let phase = 0;
let rings = [];

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  background(6, 5, 7);

  const base = min(width, height);
  const t = (frameCount % period) / period;
  // pulssnelheid loopt van laag naar hoog, met harde terugval bij de wrap
  const rate = lerp(0.012, 0.16, pow(t, 1.6));

  phase += rate;
  if (phase >= 1) {
    phase -= 1;
    rings.push({ r: base * 0.02, a: 150 });
    if (audio) audio.thud(lerp(44, 70, t));
  }

  // donkere, naar buiten lopende ringen
  noFill();
  for (const r of rings) {
    r.r += base * 0.02;
    r.a *= 0.94;
    stroke(60, 30, 36, r.a);
    strokeWeight(2);
    circle(width * 0.5, height * 0.5, r.r * 2);
  }
  rings = rings.filter(r => r.a > 4);
  noStroke();

  // centrale schijf pulseert met de fase
  const beat = pow(1 - phase, 4);
  fill(40, 16, 20, 180);
  circle(width * 0.5, height * 0.5, base * (0.1 + 0.14 * beat));

  if (audio) {
    // ondertoon stijgt mee met de cyclus
    audio.drone.frequency.setTargetAtTime(36 + 26 * t, audio.ctx.currentTime, 0.2);
    audio.g.gain.setTargetAtTime(0.05, audio.ctx.currentTime, 0.4);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 120; lp.connect(g);
  const drone = ctx.createOscillator(); drone.type = 'sawtooth'; drone.frequency.value = 36; drone.connect(lp);
  drone.start();
  audio = { ctx, master, g, drone };
  audio.thud = function (freq) {
    const o = ctx.createOscillator(); o.type = 'sine';
    const eg = ctx.createGain(); eg.gain.value = 0;
    o.connect(eg); eg.connect(master);
    const now = ctx.currentTime;
    o.frequency.setValueAtTime(freq * 2.2, now);
    o.frequency.exponentialRampToValueAtTime(freq, now + 0.08);
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(0.5, now + 0.005);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    o.start(now); o.stop(now + 0.34);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
