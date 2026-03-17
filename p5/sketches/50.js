let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  colorMode(HSB, 360, 100, 100, 100);
  background(210, 60, 8);

  for (let i = 0; i < 1500; i++) {
    particles.push(newParticle());
  }
}

function newParticle() {
  return {
    x: random(width),
    y: random(height),
    hue: random(180, 260),
    life: floor(random(300, 800)),
    age: 0,
    speed: random(0.3, 1.2)
  };
}

function draw() {
  // subtiele fade — beeld bouwt op maar verdwijnt ook langzaam
  background(210, 60, 8, 1.5);

  let time = frameCount * 0.0008;

  for (let p of particles) {
    let angle = noise(p.x * 0.004, p.y * 0.004, time) * TAU * 2;

    p.x += cos(angle) * p.speed;
    p.y += sin(angle) * p.speed;
    p.age++;

    // fade in en fade out over levensduur
    let fade = sin(map(p.age, 0, p.life, 0, PI));
    let alpha = fade * 12;

    // hue driftt langzaam mee met tijd
    let h = (p.hue + time * 30) % 360;

    noStroke();
    fill(h, 50, 85, alpha);
    circle(p.x, p.y, 1.5);

    // hergeboorte als buiten beeld of te oud
    if (p.age > p.life || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
      let np = newParticle();
      p.x = np.x;
      p.y = np.y;
      p.hue = np.hue;
      p.life = np.life;
      p.age = 0;
      p.speed = np.speed;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(210, 60, 8);
}
