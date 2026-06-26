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
        angle: random(TWO_PI),
        x: 0,
        y: 0,
        touches: 0
      });
    }
  }
}

function locate(n) {
  n.x = n.cx + cos(n.angle) * n.orbit;
  n.y = n.cy + sin(n.angle) * n.orbit;
  n.touches = 0;
}

function collide(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rr = a.r + b.r;
  if (dx * dx + dy * dy < rr * rr) {
    a.touches++;
    b.touches++;
  }
}

function hueOf(n) {
  return (n.touches * 60) % 360;
}

function trail(n) {
  arc(n.cx, n.cy, n.orbit * 2, n.orbit * 2, n.angle - PI, n.angle);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);

  const margin = min(width, height) / 12;
  buildGrid(16, 10, margin);
}

function draw() {
  background(0, 0, 100);

  for (const n of nodes) {
    locate(n);
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      collide(nodes[i], nodes[j]);
    }
  }

  noFill();
  strokeCap(ROUND);
  for (const n of nodes) {
    if (n.touches > 0) {
      stroke(hueOf(n), 80, 90);
    } else {
      stroke(0, 0, 0);
    }
    strokeWeight(n.r * 2);
    trail(n);
  }

  noStroke();
  for (const n of nodes) {
    if (n.touches > 0) {
      fill(hueOf(n), 80, 90);
    } else {
      fill(0, 0, 0);
    }
    circle(n.x, n.y, n.r * 2);
    n.angle += n.speed;
  }
}
