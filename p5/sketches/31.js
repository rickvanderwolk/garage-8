let particles = [];
let numParticles = 800;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(0);

  for (let i = 0; i < numParticles; i++) {
    particles.push(createParticle());
  }
}

function createParticle() {
  let angle = random(TWO_PI);
  let r = random(50, max(width, height) / 2);
  return {
    x: width / 2 + cos(angle) * r,
    y: height / 2 + sin(angle) * r,
    hue: random(180, 280),
    size: random(1, 3),
    speed: random(0.5, 2)
  };
}

function draw() {
  // fade trail
  blendMode(BLEND);
  fill(0, 0, 0, 8);
  rect(0, 0, width, height);

  blendMode(ADD);
  noStroke();

  let t = millis() * 0.0005;
  let cx = width / 2;
  let cy = height / 2;

  for (let p of particles) {
    // afstand en hoek tot centrum
    let dx = p.x - cx;
    let dy = p.y - cy;
    let dist = sqrt(dx * dx + dy * dy);
    let angle = atan2(dy, dx);

    // spiraal beweging - sneller naar binnen
    let spiralSpeed = map(dist, 0, width / 2, 0.08, 0.02);
    angle += spiralSpeed * p.speed;

    // naar centrum trekken
    let pullStrength = map(dist, 0, width / 2, 0, 0.8);
    dist -= pullStrength * p.speed;

    // update positie
    p.x = cx + cos(angle) * dist;
    p.y = cy + sin(angle) * dist;

    // kleur shift gebaseerd op afstand
    let hue = (p.hue + dist * 0.3 + t * 50) % 360;
    let brightness = map(dist, 0, width / 2, 100, 50);
    let alpha = map(dist, 0, width / 2, 80, 30);

    fill(hue, 80, brightness, alpha);
    circle(p.x, p.y, p.size);

    // reset als bij centrum
    if (dist < 5) {
      let newAngle = random(TWO_PI);
      let newR = max(width, height) / 2 + random(50);
      p.x = cx + cos(newAngle) * newR;
      p.y = cy + sin(newAngle) * newR;
      p.hue = random(180, 280);
    }
  }

  blendMode(BLEND);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
