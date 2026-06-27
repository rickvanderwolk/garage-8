// Variant: één klein object op een vrijwel zwarte achtergrond. Het volgt traag
// twee ruisvelden voor x en y; op willekeurige intervallen verplaatst het in
// enkele frames lineair naar een nieuw doel en wisselt het tussen drie vormen
// (punt, kruis, balkje) en wisselende grootte. Een hoge toon van twee dicht
// bijeen liggende frequenties loopt eronder door.

let px, py;
let dart = 0;
let dx = 0, dy = 0;
let nextDart = 120;
let shapeT = 0;
let nextShape = 80;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
  px = width * 0.5;
  py = height * 0.5;
}

function draw() {
  background(5);

  const base = min(width, height);
  const t = frameCount * 0.004;

  if (dart > 0) {
    // korte, snelle verplaatsing naar een willekeurig nieuw doel
    px += dx;
    py += dy;
    dart--;
  } else {
    // trage drift via ruis
    px = noise(t) * width;
    py = noise(t + 100) * height;
    if (frameCount >= nextDart) {
      const tx = random(width), ty = random(height);
      dart = floor(random(3, 8));
      dx = (tx - px) / dart;
      dy = (ty - py) / dart;
      nextDart = frameCount + floor(random(150, 600));
      if (audio) audio.blip(random(2600, 5200));
    }
  }

  if (frameCount >= nextShape) {
    shapeT = floor(random(3));
    nextShape = frameCount + floor(random(60, 240));
  }

  // het object: lage alpha, wisselende vorm
  const s = base * random(0.004, 0.009);
  const a = random(70, 120);
  noStroke();
  fill(180, a);
  if (shapeT === 0) {
    circle(px, py, s);
  } else if (shapeT === 1) {
    stroke(180, a); strokeWeight(max(1, s * 0.18)); noFill();
    line(px - s, py, px + s, py);
    line(px, py - s, px, py + s);
    noStroke();
  } else {
    rect(px - s * 0.5, py - s * 0.5, s, s * 0.4);
  }

  if (audio) {
    // lichte drift in de zwevende hoge toon
    const f = 4100 + 60 * sin(frameCount * 0.013);
    audio.hi1.frequency.setTargetAtTime(f, audio.ctx.currentTime, 0.2);
    audio.hi2.frequency.setTargetAtTime(f + 7, audio.ctx.currentTime, 0.2);
    audio.g.gain.setTargetAtTime(0.045, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
  // lage rommeling
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140; lp.connect(g);
  const lo = ctx.createOscillator(); lo.type = 'sine'; lo.frequency.value = 38; lo.connect(lp); lo.start();
  // hoge zwevende toon (twee dicht bijeen)
  const hg = ctx.createGain(); hg.gain.value = 0.06; hg.connect(g);
  const hi1 = ctx.createOscillator(); hi1.type = 'sine'; hi1.frequency.value = 4100; hi1.connect(hg);
  const hi2 = ctx.createOscillator(); hi2.type = 'sine'; hi2.frequency.value = 4107; hi2.connect(hg);
  hi1.start(); hi2.start();
  audio = { ctx, master, g, hi1, hi2 };
  audio.blip = function (freq) {
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = freq;
    const eg = ctx.createGain(); eg.gain.value = 0;
    o.connect(eg); eg.connect(master);
    const now = ctx.currentTime;
    eg.gain.setValueAtTime(0, now);
    eg.gain.linearRampToValueAtTime(0.08, now + 0.003);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    o.start(now); o.stop(now + 0.07);
  };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
