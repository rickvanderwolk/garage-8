// Variant: zwevende cirkels met verbindingslijnen. Een factor `life` stijgt
// glad over het eerste deel van de cyclus, valt vlak na het omslagpunt in enkele
// frames naar nul en komt pas in de laatste fractie traag terug. `life` stuurt
// kleur (warm verzadigd -> koel grijs), helderheid, de bewegingsrichting (omhoog
// bij hoog, omlaag bij laag) en de zichtbaarheid van de lijnen.

let orbs = [];
const period = 3600;
let prevLife = 0.15;

const warmCols = [
  [255, 180, 120],
  [255, 140, 160],
  [255, 210, 140],
  [232, 160, 205]
];

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

  const base = min(width, height);
  for (let i = 0; i < 70; i++) {
    orbs.push({
      x: random(width),
      y: random(height),
      r: base * random(0.006, 0.02),
      ph: random(TWO_PI),
      ci: floor(random(warmCols.length))
    });
  }
}

function draw() {
  const base = min(width, height);
  const t = (frameCount % period) / period;
  const life = lifeAt(t);

  if (prevLife >= 0.5 && life < 0.5 && audio) audio.collapse();
  prevLife = life;

  const bg = lerpColor(color(8, 8, 12), color(32, 16, 22), life);
  background(bg);

  // verbindingslijnen tussen nabije cirkels, alleen zichtbaar bij hoge life
  if (life > 0.05) {
    stroke(255, 200, 170, 50 * life);
    strokeWeight(1);
    for (let i = 0; i < orbs.length; i++) {
      for (let j = i + 1; j < orbs.length; j++) {
        const d = dist(orbs[i].x, orbs[i].y, orbs[j].x, orbs[j].y);
        if (d < base * 0.15) line(orbs[i].x, orbs[i].y, orbs[j].x, orbs[j].y);
      }
    }
  }
  noStroke();

  const grey = color(70, 70, 78);
  for (const o of orbs) {
    o.y += lerp(0.6, -0.4, life);
    o.x += sin(frameCount * 0.01 + o.ph) * 0.4;
    if (o.y < -o.r) o.y = height + o.r;
    if (o.y > height + o.r) o.y = -o.r;
    if (o.x < -o.r) o.x = width + o.r;
    if (o.x > width + o.r) o.x = -o.r;

    const c = lerpColor(color(warmCols[o.ci]), grey, 1 - life);
    blendMode(ADD);
    fill(red(c), green(c), blue(c), 40 * life);
    circle(o.x, o.y, o.r * 5);
    blendMode(BLEND);
    fill(red(c), green(c), blue(c), 120 + 120 * life);
    circle(o.x, o.y, o.r * 2);
  }

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

  // warme samenklank (majeur-drieklank + octaaf) door een zachte lowpass
  const warm = ctx.createGain(); warm.gain.value = 0;
  const lpW = ctx.createBiquadFilter(); lpW.type = 'lowpass'; lpW.frequency.value = 1400;
  warm.connect(master); lpW.connect(warm);
  for (const f of [220, 277.18, 329.63, 440]) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const og = ctx.createGain(); og.gain.value = 0.22; o.connect(og); og.connect(lpW); o.start();
  }

  // lage, licht gestemde cluster
  const bleak = ctx.createGain(); bleak.gain.value = 0;
  const lpB = ctx.createBiquadFilter(); lpB.type = 'lowpass'; lpB.frequency.value = 200;
  bleak.connect(master); lpB.connect(bleak);
  for (const f of [55, 58.3, 73.4]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const og = ctx.createGain(); og.gain.value = 0.3; o.connect(og); og.connect(lpB); o.start();
  }

  audio = { ctx, master, warm, bleak };
  audio.collapse = function () {
    const now = ctx.currentTime;
    // neerwaartse sweep
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const eg = ctx.createGain(); eg.gain.value = 0; o.connect(eg); eg.connect(master);
    o.frequency.setValueAtTime(620, now);
    o.frequency.exponentialRampToValueAtTime(58, now + 0.5);
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(0.13, now + 0.02);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    o.start(now); o.stop(now + 0.65);
    // lage stoot
    const b = ctx.createOscillator(); b.type = 'sine';
    const bg = ctx.createGain(); bg.gain.value = 0; b.connect(bg); bg.connect(master);
    b.frequency.setValueAtTime(90, now); b.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    bg.gain.setValueAtTime(0, now);
    bg.gain.linearRampToValueAtTime(0.4, now + 0.01);
    bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    b.start(now); b.stop(now + 0.75);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
