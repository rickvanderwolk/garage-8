// Variant: stijgende donkere golfvlakken. Meerdere sinusvormige zwarte vlakken
// klimmen vanaf de onderrand. De dekkingsgraad volgt een continue cosinus
// (geen harde reset): het beeld loopt traag vol tot zwart, blijft daar door de
// afvlakking rond de top hangen, en loopt daarna weer leeg.

const period = 3600;

let audio = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
}

function draw() {
  const base = min(width, height);

  // continue dekkingsgraad 0..1..0, sprongloos bij de wrap; pow biedt een
  // langer verblijf nabij volledig zwart
  const t = (frameCount % period) / period;
  let cover = 0.5 - 0.5 * cos(t * TWO_PI);
  cover = pow(cover, 0.55);

  background(46);

  // rustlijn loopt van onder beeld (leeg) naar boven beeld (vol zwart)
  const rest = lerp(height + base * 0.18, -base * 0.22, cover);

  noStroke();
  const layers = 4;
  for (let L = 0; L < layers; L++) {
    const amp = base * (0.03 + 0.02 * L);
    const ph = frameCount * (0.01 + 0.004 * L) + L * 1.7;
    const yBase = rest + L * base * 0.04;
    fill(0, 70);
    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width; x += 12) {
      const y = yBase + sin(x * 0.008 + ph) * amp;
      vertex(x, y);
    }
    vertex(width, height);
    endShape(CLOSE);
  }

  if (audio) {
    audio.lp.frequency.setTargetAtTime(240 - 150 * cover, audio.ctx.currentTime, 0.4);
    audio.g.gain.setTargetAtTime(0.04 + 0.03 * cover, audio.ctx.currentTime, 0.5);
  }
}

function startAudio() {
  if (audio) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; lp.connect(g);
  const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = 44; o1.connect(lp);
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 33; o2.connect(lp);
  o1.start(); o2.start();
  audio = { ctx, g, lp, o1, o2 };
}

function mousePressed() { startAudio(); }
function keyPressed() { startAudio(); }
function touchStarted() { startAudio(); }
