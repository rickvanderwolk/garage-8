// Variant: Shepard-toon. Zeven stemmen glijden continu omlaag in toonhoogte;
// hun gain volgt een gaussische weging over de toonfase, zodat stemmen aan de
// randen uitdoven en de fase-wrap geen hoorbare sprong geeft. De balken volgen
// dezelfde fase.

const voices = 7;
const descent = 0.00045;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  background(8, 12, 16);

  const t = frameCount * descent;

  // balken op posities die overeenkomen met de toonfase; helderheid volgt de
  // gaussische weging (luid in het midden, uit aan de randen)
  noStroke();
  for (let i = 0; i < voices; i++) {
    const p = ((t + i / voices) % 1 + 1) % 1;
    const y = p * height;
    const w = exp(-pow((p - 0.5) / 0.24, 2));
    fill(150, 160, 185, 70 * w);
    rect(0, y - 2, width, 4 + 40 * w);

    if (audio) {
      const freq = 40 * pow(2, (1 - p) * 5.2);
      audio.osc[i].frequency.setTargetAtTime(freq, audio.ctx.currentTime, 0.02);
      audio.vg[i].gain.setTargetAtTime(0.09 * w, audio.ctx.currentTime, 0.02);
    }
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
  const osc = [], vg = [];
  for (let i = 0; i < voices; i++) {
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const gg = ctx.createGain(); gg.gain.value = 0;
    o.connect(gg); gg.connect(master); o.start();
    osc.push(o); vg.push(gg);
  }
  audio = { ctx, master, osc, vg };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
