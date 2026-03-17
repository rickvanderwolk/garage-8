let particles = [];
let flowScale = 0.005;
let palette = ['#0D1B2A', '#1B263B', '#415A77', '#778DA9', '#E0E1DD'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(13, 27, 42);

  for (let i = 0; i < 2000; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      col: random(['#778DA9', '#E0E1DD', '#415A77', '#D4A373', '#E9C46A']),
      speed: random(0.5, 2),
      life: 0
    });
  }
}

function draw() {
  noStroke();

  let t = frameCount * 0.003;

  for (let p of particles) {
    let angle = noise(p.x * flowScale, p.y * flowScale, t) * TWO_PI * 2;

    p.x += cos(angle) * p.speed;
    p.y += sin(angle) * p.speed;
    p.life++;

    let alpha = min(p.life * 0.5, 15);
    let col = color(p.col);
    col.setAlpha(alpha);
    fill(col);
    circle(p.x, p.y, 1.5);

    if (p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
      p.x = random(width);
      p.y = random(height);
      p.life = 0;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(13, 27, 42);
}
