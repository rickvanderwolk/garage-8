let particles = [];
let maxParticles = 400; // limiet voor performance

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noStroke();
}

function draw() {
  // fade - iets sneller voor meer contrast
  fill(0, 20);
  rect(0, 0, width, height);

  let t = millis() * 0.0004;

  // 6 bronpunten die wild bewegen
  for (let i = 0; i < 6; i++) {
    let sourceX = width / 2 + sin(t * 3 + i * 1.5) * 300 + cos(t * 5 + i) * 100;
    let sourceY = height / 2 + cos(t * 2 + i * 2) * 250 + sin(t * 4 + i) * 80;

    // 2 particles per bron per frame
    if (particles.length < maxParticles) {
      particles.push({
        x: sourceX + random(-20, 20),
        y: sourceY + random(-20, 20),
        vx: random(-3, 3),
        vy: random(-3, 3),
        life: 200,
        size: random(20, 60),
        noiseOff: random(1000)
      });
    }
  }

  // update en teken
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    // chaotischer flow field
    let angle = noise(p.x * 0.005, p.y * 0.005, t * 2 + p.noiseOff) * TWO_PI * 3;
    p.vx += cos(angle) * 0.2;
    p.vy += sin(angle) * 0.2;

    // sterke demping voor snelheid
    p.vx *= 0.95;
    p.vy *= 0.95;

    p.x += p.vx;
    p.y += p.vy;

    p.life -= 2;
    p.size *= 0.995;

    // teken
    let alpha = (p.life / 200) * 20;
    fill(255, alpha);
    circle(p.x, p.y, p.size);

    if (p.life <= 0 || p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
      particles.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
