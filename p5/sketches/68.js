let nodes = [];
let parent = [];

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
        y: 0
      });
    }
  }
}

function locate(n) {
  n.x = n.cx + cos(n.angle) * n.orbit;
  n.y = n.cy + sin(n.angle) * n.orbit;
}

function root(i) {
  while (parent[i] !== i) {
    parent[i] = parent[parent[i]];
    i = parent[i];
  }
  return i;
}

function unite(a, b) {
  parent[root(a)] = root(b);
}

function overlaps(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rr = a.r + b.r;
  return dx * dx + dy * dy < rr * rr;
}

function hueOf(root) {
  return (root * 53) % 360;
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

  for (let i = 0; i < nodes.length; i++) {
    locate(nodes[i]);
    parent[i] = i;
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (overlaps(nodes[i], nodes[j])) {
        unite(i, j);
      }
    }
  }

  const size = new Array(nodes.length).fill(0);
  for (let i = 0; i < nodes.length; i++) {
    size[root(i)]++;
  }

  noFill();
  strokeCap(ROUND);
  for (let i = 0; i < nodes.length; i++) {
    const r = root(i);
    if (size[r] > 1) {
      stroke(hueOf(r), 80, 90);
    } else {
      stroke(0, 0, 0);
    }
    strokeWeight(nodes[i].r * 2);
    trail(nodes[i]);
  }

  noStroke();
  for (let i = 0; i < nodes.length; i++) {
    const r = root(i);
    if (size[r] > 1) {
      fill(hueOf(r), 80, 90);
    } else {
      fill(0, 0, 0);
    }
    circle(nodes[i].x, nodes[i].y, nodes[i].r * 2);
    nodes[i].angle += nodes[i].speed;
  }
}
