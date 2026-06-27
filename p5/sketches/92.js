// Variant: vrijwel zwart met een dunne hoge toon van twee dicht bijeen liggende
// frequenties. Op willekeurige intervallen klinkt een FM-stoot (modulator op de
// carrier-frequentie, lange exponentiële uitdoving) en verschijnt op een
// willekeurige plek een vervagende, uitdijende gloed.

let nextStab = 120;
let blooms = [];

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  background(4, 4, 6);

  const base = min(width, height);

  if (frameCount >= nextStab) {
    nextStab = frameCount + floor(random(90, 540));
    blooms.push({
      x: random(width * 0.15, width * 0.85),
      y: random(height * 0.15, height * 0.85),
      r: base * random(0.1, 0.3),
      a: 90
    });
    if (audio) audio.stab(random(60, 320), random(1.4, 3.3));
  }

  noStroke();
  for (const b of blooms) {
    b.a *= 0.93;
    fill(70, 60, 90, b.a);
    circle(b.x, b.y, b.r * 2 * (1 + (90 - b.a) * 0.004));
  }
  blooms = blooms.filter(b => b.a > 3);

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
  // dunne hoge zweeftoon
  const hg = ctx.createGain(); hg.gain.value = 0.04; hg.connect(g);
  const h1 = ctx.createOscillator(); h1.type = 'sine'; h1.frequency.value = 5300; h1.connect(hg);
  const h2 = ctx.createOscillator(); h2.type = 'sine'; h2.frequency.value = 5311; h2.connect(hg);
  h1.start(); h2.start();
  audio = { ctx, master, g };
  audio.stab = function (carrier, dur) {
    // FM: modulator moduleert de carrier-frequentie (inharmonisch spectrum)
    const c = ctx.createOscillator(); c.type = 'sine'; c.frequency.value = carrier;
    const m = ctx.createOscillator(); m.type = 'square'; m.frequency.value = carrier * 2.74;
    const md = ctx.createGain(); md.gain.value = carrier * 3.5;
    m.connect(md); md.connect(c.frequency);
    const eg = ctx.createGain(); eg.gain.value = 0;
    c.connect(eg); eg.connect(master);
    const now = ctx.currentTime;
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(0.28, now + 0.004);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    c.start(now); m.start(now);
    c.stop(now + dur + 0.05); m.stop(now + dur + 0.05);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
