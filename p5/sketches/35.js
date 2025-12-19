let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noStroke();
}

function draw() {
  // zachte fade
  fill(0, 15);
  rect(0, 0, width, height);

  let t = millis() * 0.0005;

  // spawn nieuwe particles vanuit meerdere bronnen
  for (let i = 0; i < 3; i++) {
    let sourceX = width / 2 + sin(t * 2 + i * 2) * 200;
    let sourceY = height / 2 + cos(t * 1.5 + i * 3) * 150;

    particles.push({
      x: sourceX,
      y: sourceY,
      vx: random(-1, 1),
      vy: random(-2, -0.5),
      life: 255,
      size: random(30, 80)
    });
  }

  // update en teken
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    // flow field beweging
    let angle = noise(p.x * 0.003, p.y * 0.003, t) * TWO_PI * 2;
    p.vx += cos(angle) * 0.1;
    p.vy += sin(angle) * 0.1;

    // demping
    p.vx *= 0.98;
    p.vy *= 0.98;

    p.x += p.vx;
    p.y += p.vy;

    // fade out
    p.life -= 1.5;
    p.size *= 0.997;

    // teken zachte cirkel
    let alpha = p.life * 0.08;
    fill(255, alpha);
    circle(p.x, p.y, p.size);

    // verwijder dode particles
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // limit particles
  if (particles.length > 500) {
    particles.splice(0, 50);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
