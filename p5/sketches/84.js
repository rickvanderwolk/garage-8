// Variant: vrijwel zwart veld met per-frame verspringende laag-contrast korrel.
// Op willekeurige intervallen wordt enkele frames lang een overlay getekend: een
// felle vlakvulling, een cluster willekeurige blokken, of een verschil-blend
// (inversie), telkens samen met een dissonante audio-stoot.

let nextEvt = 90;
let flash = 0;
let flashType = 0;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  background(7);

  // laag-contrast korrel: losse vage punten die per frame verspringen
  noStroke();
  for (let i = 0; i < 220; i++) {
    fill(255, random(4, 11));
    rect(random(width), random(height), 2, 2);
  }

  // onregelmatige onderbreking inplannen
  if (frameCount >= nextEvt) {
    flash = floor(random(2, 6));
    flashType = floor(random(3));
    nextEvt = frameCount + floor(random(120, 540));
    if (audio) {
      const f = random([1480, 1970, 2630, 3120]); // dissonante hoge stoten
      audio.stab(f, random(0.06, 0.22), 0.12, 'square');
    }
  }

  if (flash > 0) {
    if (flashType === 0) {
      // korte algehele oplichting
      fill(245, 180);
      rect(0, 0, width, height);
    } else if (flashType === 1) {
      // glitch-cluster: verspreide felle blokken
      for (let i = 0; i < 60; i++) {
        fill(random(120, 255));
        const w = random(width * 0.02, width * 0.16);
        const h = random(2, height * 0.02);
        rect(random(width), random(height), w, h);
      }
    } else {
      // inversie via verschil-blend
      blendMode(DIFFERENCE);
      fill(255);
      rect(0, 0, width, height);
      blendMode(BLEND);
    }
    flash--;
  }

  // donkere randen
  noFill();
  for (let i = 0; i < 60; i++) {
    stroke(0, 6);
    const m = i * (min(width, height) * 0.004);
    rect(m, m, width - 2 * m, height - 2 * m);
  }
  noStroke();

  if (audio) {
    audio.g.gain.setTargetAtTime(0.05, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 47; o1.connect(lp);
  const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 49.3; o2.connect(lp); // zweving
  o1.start(); o2.start();
  audio = { ctx, master, g, lp, o1, o2 };
  audio.stab = function (freq, dur, peak, type) {
    const o = ctx.createOscillator(); o.type = type || 'square'; o.frequency.value = freq;
    const eg = ctx.createGain(); eg.gain.value = 0;
    o.connect(eg); eg.connect(master);
    const now = ctx.currentTime;
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(peak, now + 0.004);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.start(now); o.stop(now + dur + 0.02);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
