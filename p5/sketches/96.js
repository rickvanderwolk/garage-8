// Variant: verticale gradient met deeltjes. Een factor `life` stijgt glad, valt
// vlak na het omslagpunt in enkele frames naar nul en komt pas laat traag terug.
// `life` stuurt de gradientkleuren (warm/licht -> koel/donker), de kleur en
// helderheid van de deeltjes, en hun verticale richting: bij hoge life stijgen ze
// met flikkering, bij lage life vallen ze met versnelling en verkleuren naar grijs.

let sparks = [];
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

  const base = min(width, height);
  for (let i = 0; i < 220; i++) {
    sparks.push({
      x: random(width),
      y: random(height),
      r: base * random(0.002, 0.008),
      vy: 0,
      ph: random(TWO_PI),
      sp: random(0.4, 1.2)
    });
  }
}

function draw() {
  const base = min(width, height);
  const ctx = drawingContext;
  const t = (frameCount % period) / period;
  const life = lifeAt(t);

  if (prevLife >= 0.5 && life < 0.5 && audio) audio.collapse();
  prevLife = life;

  // gradient van warm/licht boven naar koel/donker, schaalt met life
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, `rgb(${20 + 120 * life}, ${14 + 70 * life}, ${22 + 60 * life})`);
  g.addColorStop(1, `rgb(${6 + 10 * life}, ${5 + 8 * life}, ${10 + 16 * life})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  const warm = color(255, 200, 140);
  const grey = color(90, 90, 98);
  const c = lerpColor(grey, warm, life);

  blendMode(ADD);
  noStroke();
  for (const s of sparks) {
    // omhoog bij hoge life, versnellend omlaag bij lage life
    s.vy = lerp(0.05, -0.8, life) + (1 - life) * 0.04;
    s.y += s.vy * s.sp;
    s.x += sin(frameCount * 0.02 + s.ph) * 0.3 * life;
    if (s.y < -s.r) { s.y = height + s.r; s.x = random(width); }
    if (s.y > height + s.r) { s.y = -s.r; s.x = random(width); }

    const tw = 0.5 + 0.5 * sin(frameCount * 0.08 + s.ph);
    const a = (40 + 120 * life) * (0.4 + 0.6 * tw);
    fill(red(c), green(c), blue(c), a);
    circle(s.x, s.y, s.r * 2 * (0.7 + 0.6 * life));
  }
  blendMode(BLEND);

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
  const lpW = ctx.createBiquadFilter(); lpW.type = 'lowpass'; lpW.frequency.value = 2200;
  warm.connect(master); lpW.connect(warm);
  for (const f of [392.0, 493.88, 587.33, 783.99]) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const og = ctx.createGain(); og.gain.value = 0.16; o.connect(og); og.connect(lpW); o.start();
  }

  const bleak = ctx.createGain(); bleak.gain.value = 0;
  const lpB = ctx.createBiquadFilter(); lpB.type = 'lowpass'; lpB.frequency.value = 160;
  bleak.connect(master); lpB.connect(bleak);
  for (const f of [44, 46.6, 62]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const og = ctx.createGain(); og.gain.value = 0.3; o.connect(og); og.connect(lpB); o.start();
  }

  audio = { ctx, master, warm, bleak };
  audio.collapse = function () {
    const now = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const eg = ctx.createGain(); eg.gain.value = 0; o.connect(eg); eg.connect(master);
    o.frequency.setValueAtTime(800, now);
    o.frequency.exponentialRampToValueAtTime(50, now + 0.55);
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(0.12, now + 0.02);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    o.start(now); o.stop(now + 0.7);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
