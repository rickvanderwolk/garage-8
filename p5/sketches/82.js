// Variant: centrale leegte. Lichte deeltjes spiraliseren naar het midden en
// verdwijnen in een zwarte schijf waarvan de straal via een continue cosinus
// op- en afzwelt (geen reset); de leegte slokt het veld traag op en geeft het
// daarna weer ruimte, als één doorlopende beweging.

let parts = [];
const period = 2400;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);

  const base = min(width, height);
  for (let i = 0; i < 700; i++) parts.push(newPart(base));
}

function newPart(base) {
  const ang = random(TWO_PI);
  const rad = random(base * 0.25, base * 0.7);
  return {
    ang: ang,
    rad: rad,
    vr: random(0.4, 1.4),
    va: random(0.004, 0.012) * (random() < 0.5 ? -1 : 1),
    a: random(40, 150)
  };
}

function draw() {
  const base = min(width, height);

  background(4);

  const cx = width * 0.5;
  const cy = height * 0.5;

  // continue dekkingsgraad 0..1..0; straal van de leegte zwelt op en weer af
  const t = (frameCount % period) / period;
  const cover = 0.5 - 0.5 * cos(t * TWO_PI);
  const voidR = lerp(base * 0.02, base * 0.62, cover);

  noStroke();
  for (const p of parts) {
    p.rad -= p.vr;
    p.ang += p.va;

    const x = cx + cos(p.ang) * p.rad;
    const y = cy + sin(p.ang) * p.rad;

    // binnen de leegte opgeslokt -> opnieuw aan de buitenrand
    if (p.rad <= voidR) {
      Object.assign(p, newPart(base));
      p.rad = base * random(0.55, 0.75);
    } else {
      const fade = constrain((p.rad - voidR) / (base * 0.3), 0, 1);
      fill(150, p.a * fade);
      circle(x, y, 2.2);
    }
  }

  // de leegte zelf
  fill(0);
  circle(cx, cy, voidR * 2);

  if (audio) {
    const prog = constrain(voidR / (base * 0.6), 0, 1);
    audio.lp.frequency.setTargetAtTime(220 - 140 * prog, audio.ctx.currentTime, 0.3);
    audio.g.gain.setTargetAtTime(0.04 + 0.03 * prog, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 49; o1.connect(lp);
  const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 24.5; o2.connect(lp);
  o1.start(); o2.start();
  audio = { ctx, g, lp, o1, o2 };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
