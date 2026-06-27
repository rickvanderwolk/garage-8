// Variant: donker wordende vlekken. De grondhelderheid ademt via een continue
// cosinus van licht naar zwart en terug (geen reset). Traag drijvende zwarte
// schijven worden donkerder naarmate de dekking toeneemt, en vervagen weer als
// het beeld terugloopt naar de begintoestand.

let blobs = [];
const period = 2400;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);

  const base = min(width, height);
  for (let i = 0; i < 70; i++) {
    blobs.push({
      x: random(width),
      y: random(height),
      r: base * random(0.06, 0.22),
      vx: random(-0.2, 0.2),
      vy: random(-0.2, 0.2),
      ph: random(TWO_PI)
    });
  }
}

function draw() {
  const base = min(width, height);

  // continue dekkingsgraad 0..1..0, sprongloos bij de wrap
  const t = (frameCount % period) / period;
  const cover = pow(0.5 - 0.5 * cos(t * TWO_PI), 0.6);

  // grondhelderheid loopt van licht naar zwart en weer terug
  background(lerp(58, 0, cover));

  noStroke();
  for (const b of blobs) {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < -b.r) b.x = width + b.r;
    if (b.x > width + b.r) b.x = -b.r;
    if (b.y < -b.r) b.y = height + b.r;
    if (b.y > height + b.r) b.y = -b.r;

    const pulse = 0.7 + 0.3 * sin(frameCount * 0.01 + b.ph);
    fill(0, 26 * cover * pulse);
    ellipse(b.x, b.y, b.r * 2, b.r * 2);
  }

  if (audio) {
    audio.lp.frequency.setTargetAtTime(260 - 150 * cover, audio.ctx.currentTime, 0.4);
    audio.g.gain.setTargetAtTime(0.04 + 0.025 * cover, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 52; o1.connect(lp);
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 39; o2.connect(lp);
  o1.start(); o2.start();
  audio = { ctx, g, lp, o1, o2 };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
