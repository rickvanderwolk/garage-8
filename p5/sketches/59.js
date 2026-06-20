let crowd = [];
let one;
let avoidRadius;

function wander(p) {
  p.dir += random(-0.3, 0.3);
  p.vx += cos(p.dir) * 0.05;
  p.vy += sin(p.dir) * 0.05;
}

function wrap(p) {
  if (p.x < 0) p.x += width;
  if (p.x > width) p.x -= width;
  if (p.y < 0) p.y += height;
  if (p.y > height) p.y -= height;
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  avoidRadius = min(width, height) / 5;

  for (let i = 0; i < 1000; i++) {
    crowd.push({
      x: random(width),
      y: random(height),
      vx: 0,
      vy: 0,
      dir: random(TWO_PI),
      r: width / 200
    });
  }

  one = {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    dir: random(TWO_PI),
    r: width / 200
  };
}

function draw() {
  background(255);

  // one drifts and wraps
  wander(one);
  one.vx = constrain(one.vx, -1.5, 1.5);
  one.vy = constrain(one.vy, -1.5, 1.5);
  one.x += one.vx;
  one.y += one.vy;
  wrap(one);

  // crowd wanders, steering away from one within avoidRadius
  for (const p of crowd) {
    wander(p);

    // toroidal distance across the wrap seams
    let dx = p.x - one.x;
    let dy = p.y - one.y;
    if (dx > width / 2) dx -= width;
    if (dx < -width / 2) dx += width;
    if (dy > height / 2) dy -= height;
    if (dy < -height / 2) dy += height;
    const d = sqrt(dx * dx + dy * dy);

    if (d < avoidRadius && d > 0) {
      const push = (avoidRadius - d) / avoidRadius;
      p.vx += (dx / d) * push * 0.6;
      p.vy += (dy / d) * push * 0.6;
    }

    p.vx = constrain(p.vx, -2, 2);
    p.vy = constrain(p.vy, -2, 2);
    p.vx *= 0.96;
    p.vy *= 0.96;

    p.x += p.vx;
    p.y += p.vy;
    wrap(p);

    noStroke();
    fill(0);
    circle(p.x, p.y, p.r * 2);
  }

  noStroke();
  fill(0);
  circle(one.x, one.y, one.r * 2);
}
