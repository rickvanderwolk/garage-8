// Variant: uitdijende ringen vanuit het midden. Een factor `life` stijgt glad,
// valt vlak na het omslagpunt in enkele frames naar nul en komt pas laat traag
// terug. Bij hoge life worden periodiek warme ringen uitgestoten en pulseert een
// centrale schijf; de ringkleur loopt van warm naar koel grijs met dalende life,
// en bij lage life stopt de uitstoot en dooft de schijf.

let rings = [];
const period = 3600;
let prevLife = 0.15;

let audio = null;

function lifeAt(t) {
  const cp = 0.45;
  if (t < cp) {
    const u = t / cp;
    return lerp(0.15, 1, u * u * (3 - 2 * u));
  }
  const u = (t - cp) / (1 - cp);
  const fall = constrain(u / 0.012, 0, 1);
  const dropped = lerp(1, 0, fall * fall);
  const rise = u < 0.9 ? 0 : (u - 0.9) / 0.1 * 0.15;
  return max(dropped, rise);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  const base = min(width, height);
  const t = (frameCount % period) / period;
  const life = lifeAt(t);

  if (prevLife >= 0.5 && life < 0.5 && audio) audio.collapse();
  prevLife = life;

  background(lerpColor(color(6, 6, 10), color(26, 14, 20), life));

  const cx = width * 0.5;
  const cy = height * 0.5;

  // uitstoot van ringen zolang life hoog genoeg is
  if (life > 0.35 && frameCount % 16 === 0) {
    rings.push({ r: base * 0.02, born: life });
  }

  const warm = color(255, 175, 120);
  const cold = color(80, 84, 96);
  noFill();
  for (const r of rings) {
    r.r += base * 0.006;
    const fade = constrain(1 - r.r / (base * 0.75), 0, 1);
    const c = lerpColor(cold, warm, life);
    stroke(red(c), green(c), blue(c), 160 * fade * (0.3 + 0.7 * life));
    strokeWeight(1.5 + 3 * life * fade);
    circle(cx, cy, r.r * 2);
  }
  rings = rings.filter(r => r.r < base * 0.78);
  noStroke();

  // centrale schijf met pulserende straal, schaalt met life
  const pulse = 1 + 0.12 * sin(frameCount * 0.12);
  const cc = lerpColor(color(60, 60, 70), color(255, 200, 150), life);
  blendMode(ADD);
  fill(red(cc), green(cc), blue(cc), 60 * life);
  circle(cx, cy, base * 0.34 * life * pulse);
  blendMode(BLEND);
  fill(red(cc), green(cc), blue(cc), 120 + 120 * life);
  circle(cx, cy, base * 0.06 * (0.3 + life) * pulse);

  if (audio) {
    audio.warm.gain.setTargetAtTime(0.1 * life, audio.ctx.currentTime, 0.15);
    audio.bleak.gain.setTargetAtTime(0.06 * (1 - life), audio.ctx.currentTime, 0.4);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);

  const warm = ctx.createGain(); warm.gain.value = 0;
  const lpW = ctx.createBiquadFilter(); lpW.type = 'lowpass'; lpW.frequency.value = 1500;
  warm.connect(master); lpW.connect(warm);
  for (const f of [261.63, 329.63, 392.0, 523.25]) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const og = ctx.createGain(); og.gain.value = 0.2; o.connect(og); og.connect(lpW); o.start();
  }

  const bleak = ctx.createGain(); bleak.gain.value = 0;
  const lpB = ctx.createBiquadFilter(); lpB.type = 'lowpass'; lpB.frequency.value = 180;
  bleak.connect(master); lpB.connect(bleak);
  for (const f of [49, 51.8, 65.5]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const og = ctx.createGain(); og.gain.value = 0.3; o.connect(og); og.connect(lpB); o.start();
  }

  audio = { ctx, master, warm, bleak };
  audio.collapse = function () {
    const now = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const eg = ctx.createGain(); eg.gain.value = 0; o.connect(eg); eg.connect(master);
    o.frequency.setValueAtTime(700, now);
    o.frequency.exponentialRampToValueAtTime(52, now + 0.5);
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(0.13, now + 0.02);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    o.start(now); o.stop(now + 0.65);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
