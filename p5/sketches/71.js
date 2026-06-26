let balls = [];

const palette = [
  [250, 190, 120],  // licht oranje / huidskleur
  [220, 60, 60],    // rood
  [70, 170, 70],    // groen
  [160, 220, 50],   // lime groen
  [60, 90, 220],    // blauw
  [90, 190, 235],   // licht blauw
  [30, 50, 130],    // donker blauw
  [240, 150, 40],   // oranje
  [200, 70, 160],   // magenta
  [60, 200, 190],   // turquoise
  [250, 210, 60]    // geel
];

function newBall(i, base) {
  const dir = random(TWO_PI);
  const speed = random(3, 5);
  return {
    x: random(width),
    y: random(height),
    r: base * random(0.015, 0.03),
    vx: cos(dir) * speed,
    vy: sin(dir) * speed,
    color: palette[i % palette.length]
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);

  const base = min(width, height);

  balls = [];
  for (let i = 0; i < 15; i++) {
    balls.push(newBall(i, base));
  }
}

function draw() {
  background(255);

  // beweeg + botsen tegen de muren (pong)
  for (const b of balls) {
    b.x += b.vx;
    b.y += b.vy;

    if (b.x < b.r) { b.x = b.r; b.vx = abs(b.vx); }
    if (b.x > width - b.r) { b.x = width - b.r; b.vx = -abs(b.vx); }
    if (b.y < b.r) { b.y = b.r; b.vy = abs(b.vy); }
    if (b.y > height - b.r) { b.y = height - b.r; b.vy = -abs(b.vy); }
  }

  // botsen tegen elkaar (elastisch, gelijke massa)
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = sqrt(dx * dx + dy * dy);
      const minDist = a.r + b.r;

      if (dist > 0 && dist < minDist) {
        // normaal
        const nx = dx / dist;
        const ny = dy / dist;

        // uit elkaar duwen zodat ze niet overlappen
        const overlap = (minDist - dist) / 2;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        // snelheden langs de normaal omwisselen
        const va = a.vx * nx + a.vy * ny;
        const vb = b.vx * nx + b.vy * ny;
        const diff = vb - va;
        a.vx += diff * nx;
        a.vy += diff * ny;
        b.vx -= diff * nx;
        b.vy -= diff * ny;
      }
    }
  }

  // tekenen
  noStroke();
  for (const b of balls) {
    fill(b.color[0], b.color[1], b.color[2]);
    circle(b.x, b.y, b.r * 2);
  }
}
