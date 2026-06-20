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
  colorMode(HSB, 360, 100, 100);

  avoidRadius = min(width, height) / 5;

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

  // one drifts and wraps
  wander(one);
  one.vx = constrain(one.vx, -1.5, 1.5);
  one.vy = constrain(one.vy, -1.5, 1.5);
  one.x += one.vx;
  one.y += one.vy;
  wrap(one);

  // crowd wanders, steering away from one within avoidRadius
  for (const p of crowd) {
    p.touching = false;
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
  }

  // crowd circles flash a colour the moment they touch each other
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

  // draw the crowd: coloured only while touching, otherwise black
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
