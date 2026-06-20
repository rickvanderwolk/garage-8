let circles = [];

function createCluster(x, y, count, spacing) {
  for (let i = 0; i < count; i++) {
    circles.push({
      cx: x + random(-spacing, spacing),
      cy: y + random(-spacing, spacing),
      r: width / 50,
      orbit: random(10, 30),
      speed: random(0.005, 0.02),
      angle: random(TWO_PI)
    });
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  background(255);

  createCluster(width * 0.25, height * 0.25, 500, width / 15);
  createCluster(width * 0.75, height * 0.75, 1, 0);
}

function draw() {
  for (const c of circles) {
    const x = c.cx + cos(c.angle) * c.orbit;
    const y = c.cy + sin(c.angle) * c.orbit;

    circle(x, y, c.r * 2);

    c.angle += c.speed;
  }
}