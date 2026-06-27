let particles = [];
let dots = [];

const warm = [
  [236, 208, 168],
  [232, 196, 178],
  [226, 184, 162],
  [238, 216, 188],
  [222, 198, 200]
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);

  const base = min(width, height);

  particles = [];
  for (let i = 0; i < 90; i++) {
    particles.push(newParticle(base));
  }

  // verspreide cluster kleine cirkels in een band laag-midden
  dots = [];
  for (let i = 0; i < 16; i++) {
    const ang = random(TWO_PI);
    const rad = random(1);
    dots.push({
      x: width * 0.5 + cos(ang) * width * 0.24 * rad,
      y: height * 0.86 + sin(ang) * height * 0.07 * rad,
      r: base * random(0.006, 0.017),
      phase: random(TWO_PI),
      col: warm[floor(random(warm.length))]
    });
  }
}

function newParticle(base) {
  const depth = random();
  return {
    x: random(width),
    y: random(height),
    depth: depth,
    r: base * lerp(0.002, 0.018, depth),
    speed: lerp(0.15, 0.9, 1 - depth),
    drift: random(TWO_PI),
    driftAmp: random(0.2, 0.9),
    phase: random(TWO_PI),
    a: lerp(60, 14, depth)
  };
}

function draw() {
  const base = min(width, height);
  const ctx = drawingContext;

  // globale sinuscyclus 0..1 die alle helderheden moduleert
  const period = 2400;
  const t = (frameCount % period) / period;
  const cyc = 0.5 + 0.5 * cos(t * TWO_PI);

  // tweede, snellere band voor subtiele onrust bovenop de hoofdcyclus
  const shimmer = 0.85 + 0.15 * noise(frameCount * 0.02);
  const amb = (0.22 + 0.78 * cyc) * shimmer;

  // bronpositie en flikker eerst bepalen zodat de kleur kan terugbloeden
  const rx = width * 0.5;
  const ry = height * 0.4;
  const rw = base * 0.26;
  const rh = base * 0.16;
  const flick = noise(frameCount * 0.15) * noise(frameCount * 0.45);
  const lum = (0.3 + 0.7 * flick) * cyc;

  // achtergrond: radiale gradient, warme kern naar bijna zwarte rand,
  // met een koele bijdrage vanuit de bron die mee op- en afzwelt
  const cool = 60 * lum;
  const g = ctx.createRadialGradient(
    width * 0.5, height * 0.58, base * 0.04,
    width * 0.5, height * 0.55, base * 1.0
  );
  g.addColorStop(0, `rgb(${48 * amb + 14 + cool * 0.25}, ${30 * amb + 8 + cool * 0.35}, ${20 * amb + 6 + cool * 0.8})`);
  g.addColorStop(0.55, `rgb(${20 * amb + 5}, ${14 * amb + 4}, ${12 * amb + 4})`);
  g.addColorStop(1, `rgb(${5 * amb + 2}, ${4 * amb + 1}, ${4 * amb + 2})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  blendMode(ADD);
  noStroke();

  // concentrische ellipsen, additief, als radiale falloff laag in beeld;
  // kleur mengt warm grondtoon met een vleugje van de koele bron
  const px = width * 0.5;
  const py = height * 0.82;
  for (let i = 9; i >= 1; i--) {
    const rr = base * 0.14 * i;
    fill(138 + 10 * flick, 80 + 18 * lum, 38 + 50 * lum, 7 * amb);
    ellipse(px, py, rr, rr * 0.62);
  }

  // additieve radiale falloff rond de bron-rechthoek: ronde gloed/bloom
  for (let i = 13; i >= 1; i--) {
    const rr = base * 0.095 * i;
    fill(74 + 48 * flick, 104, 150, 5 * lum);
    ellipse(rx, ry, rr, rr);
  }
  // de bron-rechthoek zelf
  fill(135 + 75 * flick, 158, 205, 215 * lum);
  rect(rx - rw / 2, ry - rh / 2, rw, rh, base * 0.012);

  // verticale verplaatsing + zijwaartse sinusdrift; diepte stuurt grootte,
  // snelheid en alpha zodat verre deeltjes trager en vager bewegen
  for (const m of particles) {
    m.y -= m.speed * (0.35 + 0.65 * cyc);
    m.x += sin(frameCount * 0.01 + m.drift) * m.driftAmp;
    if (m.y < -m.r) {
      m.y = height + m.r;
      m.x = random(width);
    }
    const pulse = 0.5 + 0.5 * sin(frameCount * 0.05 + m.phase);
    fill(234, 184, 126, m.a * pulse * (0.25 + 0.75 * cyc));
    circle(m.x, m.y, m.r * 2);
  }

  blendMode(BLEND);

  // twee overlappende cirkels met een trage radiusoscillatie; behouden een
  // zachte additieve halo eromheen
  const osc = 0.5 + 0.5 * sin(frameCount * 0.03);
  const cx = width * 0.5;
  const cy = height * 0.83;
  const s = base * (0.055 + 0.013 * osc);

  // gedeelde warme additieve halo onder de groep
  blendMode(ADD);
  fill(178, 96, 56, 26);
  ellipse(cx, cy + s * 0.2, s * 7.5, s * 5);

  // verspreide zachte gloed-stipjes: gestapelde lage-alpha ringen, randloos
  blendMode(ADD);
  noStroke();
  for (const d of dots) {
    const tw = 0.5 + 0.5 * sin(frameCount * 0.035 + d.phase);
    const k = (0.3 + 0.7 * cyc) * tw;
    for (let i = 5; i >= 1; i--) {
      fill(d.col[0], d.col[1], d.col[2], 5.5 * k);
      circle(d.x, d.y, d.r * i * 1.5);
    }
  }
  blendMode(BLEND);

  // vier overlappende cirkels met trage radiusoscillatie
  blendMode(BLEND);
  fill(214, 134, 84, 188);
  circle(cx - s * 0.75, cy, s * 2.0);
  fill(204, 114, 122, 188);
  circle(cx + s * 0.75, cy, s * 1.85);
  fill(226, 158, 112, 198);
  circle(cx - s * 0.15, cy + s * 0.5, s * 1.35);
  fill(232, 170, 124, 202);
  circle(cx + s * 0.55, cy + s * 0.7, s * 1.1);

  // vignet: radiale gradient van transparant naar donker langs de randen
  const v = ctx.createRadialGradient(
    width * 0.5, height * 0.5, base * 0.25,
    width * 0.5, height * 0.5, base * 0.95
  );
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, width, height);
}
