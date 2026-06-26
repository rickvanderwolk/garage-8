let nodes = [];

function buildGrid(cols, rows, margin) {
  const stepX = (width - margin * 2) / (cols - 1);
  const stepY = (height - margin * 2) / (rows - 1);
  const orbit = min(stepX, stepY) * 0.5;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      nodes.push({
        cx: margin + i * stepX,
        cy: margin + j * stepY,
        orbit: orbit,
        r: orbit * 0.55,
        speed: 0.03,
        angle: random(TWO_PI)
      });
    }
  }
}

function trail(n) {
  arc(n.cx, n.cy, n.orbit * 2, n.orbit * 2, n.angle - PI, n.angle);
}

function advance(n) {
  const x = n.cx + cos(n.angle) * n.orbit;
  const y = n.cy + sin(n.angle) * n.orbit;
  circle(x, y, n.r * 2);
  n.angle += n.speed;
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  const margin = min(width, height) / 12;
  buildGrid(16, 10, margin);
}

function draw() {
  background(255);

  noFill();
  stroke(0);
  strokeCap(ROUND);
  for (const n of nodes) {
    strokeWeight(n.r * 2);
    trail(n);
  }

  noStroke();
  fill(0);
  for (const n of nodes) {
    advance(n);
  }
}
