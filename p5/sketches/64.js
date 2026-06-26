let nodes = [];

function buildGrid(cols, rows, margin) {
  const stepX = (width - margin * 2) / (cols - 1);
  const stepY = (height - margin * 2) / (rows - 1);
  const orbit = min(stepX, stepY) * 0.35;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      nodes.push({
        cx: margin + i * stepX,
        cy: margin + j * stepY,
        orbit: orbit,
        r: orbit * 0.4,
        speed: 0.03,
        angle: random(TWO_PI)
      });
    }
  }
}

function advance(n) {
  const x = n.cx + cos(n.angle) * n.orbit;
  const y = n.cy + sin(n.angle) * n.orbit;
  circle(x, y, n.r * 2);
  n.angle += n.speed;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  fill(0);

  const margin = min(width, height) / 12;
  buildGrid(16, 10, margin);
}

function draw() {
  background(255);
  for (const n of nodes) {
    advance(n);
  }
}
