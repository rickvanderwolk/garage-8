// Variant: rooster van cellen, ingekleurd waar een 3D-Perlin-ruisveld boven een
// drempel ligt, in een lage grijs-blauwe waarde die traag morft. Op willekeurige
// intervallen wordt de helderheid enkele frames met een factor vermenigvuldigd.
// Onder een lage toon klinken op losse intervallen korte band-gefilterde pulsen.

let cell;
let jolt = 0;
let nextJolt = 200;
let nextTick = 100;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
  cell = max(10, floor(min(width, height) * 0.03));
}

function draw() {
  background(6);

  const z = frameCount * 0.005;

  // helderheidsfactor: enkele frames verhoogd op een eigen interval
  if (frameCount >= nextJolt) {
    jolt = floor(random(2, 5));
    nextJolt = frameCount + floor(random(180, 700));
    if (audio) audio.tick(random(200, 900));
  }
  const gain = jolt > 0 ? random(2.2, 3.4) : 1;
  if (jolt > 0) jolt--;

  // losse pulsen op een eigen interval
  if (frameCount >= nextTick) {
    nextTick = frameCount + floor(random(40, 220));
    if (audio) audio.tick(random(150, 1200));
  }

  noStroke();
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const n = noise(x * 0.004, y * 0.004, z);
      // alleen waarden ruim boven het midden komen flauw op
      const v = max(0, n - 0.52) * 70 * gain;
      if (v > 1) {
        fill(40, 46, 52, v);
        rect(x, y, cell, cell);
      }
    }
  }

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
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 120; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 36; o1.connect(lp);
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 37.4; o2.connect(lp); // trage zweving
  o1.start(); o2.start();
  audio = { ctx, master, g, o1, o2 };
  audio.tick = function (freq) {
    // korte band-gefilterde puls
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = freq;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 6;
    const eg = ctx.createGain(); eg.gain.value = 0;
    o.connect(bp); bp.connect(eg); eg.connect(master);
    const now = ctx.currentTime;
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(0.16, now + 0.002);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    o.start(now); o.stop(now + 0.06);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
