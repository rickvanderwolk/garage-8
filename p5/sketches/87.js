// Variant: achtergrond met lichte nasleep (gedeeltelijke wis). Op willekeurige
// intervallen start één snel bewegend punt vanaf een willekeurige rand, met een
// korte staart-nasleep en een vaste levensduur, samen met een snelle
// frequentiesweep door een bandpass.

let streak = null;
let nextStreak = 120;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  // lichte nasleep i.p.v. volledige wis
  background(4, 70);

  const base = min(width, height);

  if (frameCount >= nextStreak && !streak) {
    const edge = floor(random(4));
    let x, y;
    if (edge === 0) { x = -base * 0.1; y = random(height); }
    else if (edge === 1) { x = width + base * 0.1; y = random(height); }
    else if (edge === 2) { x = random(width); y = -base * 0.1; }
    else { x = random(width); y = height + base * 0.1; }
    const tx = random(width), ty = random(height);
    const sp = base * random(0.08, 0.16);
    const d = dist(x, y, tx, ty);
    streak = {
      x, y,
      vx: (tx - x) / d * sp,
      vy: (ty - y) / d * sp,
      life: floor(random(8, 16)),
      w: random(1.5, 3.5)
    };
    nextStreak = frameCount + floor(random(150, 720));
    if (audio) audio.swipe();
  }

  if (streak) {
    strokeCap(ROUND);
    for (let i = 0; i < 5; i++) {
      const px = streak.x - streak.vx * i * 0.5;
      const py = streak.y - streak.vy * i * 0.5;
      stroke(235, 240 - i * 45);
      strokeWeight(streak.w * (1 - i * 0.15));
      point(px, py);
    }
    streak.x += streak.vx;
    streak.y += streak.vy;
    streak.life--;
    if (streak.life <= 0 ||
        streak.x < -base * 0.2 || streak.x > width + base * 0.2 ||
        streak.y < -base * 0.2 || streak.y > height + base * 0.2) {
      streak = null;
    }
    noStroke();
  }

  if (audio) {
    audio.g.gain.setTargetAtTime(0.04, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 90; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 33; o1.connect(lp);
  o1.start();
  audio = { ctx, master, g, o1 };
  audio.swipe = function () {
    // snelle frequentiesweep door een bandpass
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 4;
    const eg = ctx.createGain(); eg.gain.value = 0;
    o.connect(bp); bp.connect(eg); eg.connect(master);
    const now = ctx.currentTime;
    const f0 = random(400, 900), f1 = random(2600, 4200);
    o.frequency.setValueAtTime(f0, now);
    o.frequency.exponentialRampToValueAtTime(f1, now + 0.16);
    bp.frequency.setValueAtTime(f0, now);
    bp.frequency.exponentialRampToValueAtTime(f1, now + 0.16);
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(0.14, now + 0.01);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    o.start(now); o.stop(now + 0.24);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
