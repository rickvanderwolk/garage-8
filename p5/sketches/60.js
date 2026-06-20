let crowd = [];
let one;
let fleeRadius;

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

  fleeRadius = min(width, height) / 5;

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

  // crowd wanders and wraps
  for (const p of crowd) {
    wander(p);

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

  // one steers away from crowd within fleeRadius
  wander(one);

  for (const p of crowd) {
    // toroidal distance across the wrap
    let dx = one.x - p.x;
    let dy = one.y - p.y;
    if (dx > width / 2) dx -= width;
    if (dx < -width / 2) dx += width;
    if (dy > height / 2) dy -= height;
    if (dy < -height / 2) dy += height;
    const d = sqrt(dx * dx + dy * dy);

    if (d < fleeRadius && d > 0) {
      const push = (fleeRadius - d) / fleeRadius;
      one.vx += (dx / d) * push * 0.4;
      one.vy += (dy / d) * push * 0.4;
    }

    // hard collision: on actual contact they bounce off each other
    const minDist = one.r + p.r;
    if (d < minDist && d > 0) {
      const nx = dx / d;
      const ny = dy / d;

      // separate so they no longer overlap
      const overlap = minDist - d;
      one.x += nx * overlap * 0.5;
      one.y += ny * overlap * 0.5;
      p.x -= nx * overlap * 0.5;
      p.y -= ny * overlap * 0.5;

      // exchange velocity along the contact normal (equal-mass bounce)
      const rvn = (one.vx - p.vx) * nx + (one.vy - p.vy) * ny;
      if (rvn < 0) {
        one.vx -= rvn * nx;
        one.vy -= rvn * ny;
        p.vx += rvn * nx;
        p.vy += rvn * ny;
      }
    }
  }

  one.vx = constrain(one.vx, -3, 3);
  one.vy = constrain(one.vy, -3, 3);
  one.vx *= 0.96;
  one.vy *= 0.96;

  one.x += one.vx;
  one.y += one.vy;
  wrap(one);

  noStroke();
  fill(0);
  circle(one.x, one.y, one.r * 2);
}
