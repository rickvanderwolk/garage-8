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
  colorMode(HSB, 360, 100, 100);

  fleeRadius = min(width, height) / 5;

  for (let i = 0; i < 500; i++) {
    crowd.push({
      x: random(width),
      y: random(height),
      vx: 0,
      vy: 0,
      dir: random(TWO_PI),
      r: width / 200,
      c: 0,
      touching: false
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
  background(0, 0, 100);

  // crowd wanders and wraps
  for (const p of crowd) {
    p.touching = false;
    wander(p);

    p.vx = constrain(p.vx, -2, 2);
    p.vy = constrain(p.vy, -2, 2);
    p.vx *= 0.96;
    p.vy *= 0.96;

    p.x += p.vx;
    p.y += p.vy;
    wrap(p);
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

      const overlap = minDist - d;
      one.x += nx * overlap * 0.5;
      one.y += ny * overlap * 0.5;
      p.x -= nx * overlap * 0.5;
      p.y -= ny * overlap * 0.5;

      const rvn = (one.vx - p.vx) * nx + (one.vy - p.vy) * ny;
      if (rvn < 0) {
        one.vx -= rvn * nx;
        one.vy -= rvn * ny;
        p.vx += rvn * nx;
        p.vy += rvn * ny;
      }

      // contact tints p, not one
      p.c += 3;
      p.touching = true;
    }
  }

  one.vx = constrain(one.vx, -3, 3);
  one.vy = constrain(one.vy, -3, 3);
  one.vx *= 0.96;
  one.vy *= 0.96;

  one.x += one.vx;
  one.y += one.vy;
  wrap(one);

  // crowd circles touching shift colour, more touches -> more shift
  for (let i = 0; i < crowd.length; i++) {
    for (let j = i + 1; j < crowd.length; j++) {
      const a = crowd[i];
      const b = crowd[j];
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      if (dx > width / 2) dx -= width;
      if (dx < -width / 2) dx += width;
      if (dy > height / 2) dy -= height;
      if (dy < -height / 2) dy += height;
      const rr = a.r + b.r;
      if (dx * dx + dy * dy < rr * rr) {
        a.c += 1;
        b.c += 1;
        a.touching = true;
        b.touching = true;
      }
    }
  }

  // draw the crowd
  noStroke();
  for (const p of crowd) {
    if (p.touching) {
      fill(p.c % 360, 80, 90);
    } else {
      fill(0);
    }
    circle(p.x, p.y, p.r * 2);
  }

  // one is always black
  fill(0);
  circle(one.x, one.y, one.r * 2);
}
