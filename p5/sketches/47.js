let palette = [
  '#FF6B35', '#F7C59F', '#EFEFD0', '#004E89',
  '#1A659E', '#73D2DE', '#FF9F1C', '#2EC4B6',
  '#E71D36', '#011627'
];

let spacing = 80;
let margin = 40;
let cells = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  buildGrid();
}

function buildGrid() {
  cells = [];
  let cols = floor((width - margin * 2) / spacing);
  let rows = floor((height - margin * 2) / spacing);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = margin + (width - margin * 2 - (cols - 1) * spacing) / 2 + c * spacing;
      let y = margin + (height - margin * 2 - (rows - 1) * spacing) / 2 + r * spacing;

      let type = floor(random(4));
      let parts = [];

      for (let i = 0; i < 4; i++) {
        parts.push({
          col: random(palette),
          size: random(8, 30),
          speed: random(0.4, 2.0) * random([-1, 1]),
          offset: random(TWO_PI),
          weight: random(1.5, 5)
        });
      }

      cells.push({ x, y, type, parts });
    }
  }
}

function draw() {
  background(1, 22, 39);

  let t = millis() * 0.001;

  for (let cell of cells) {
    push();
    translate(cell.x, cell.y);

    switch (cell.type) {
      case 0:
        drawSpinningArcs(cell, t);
        break;
      case 1:
        drawPulsingRects(cell, t);
        break;
      case 2:
        drawOrbitingDots(cell, t);
        break;
      case 3:
        drawBreathingDiamond(cell, t);
        break;
    }

    pop();
  }
}

function drawSpinningArcs(cell, t) {
  noFill();
  for (let i = 0; i < 4; i++) {
    let p = cell.parts[i];
    let col = color(p.col);
    col.setAlpha(220);
    stroke(col);
    strokeWeight(p.weight);
    let angle = p.offset + t * p.speed;
    arc(0, 0, p.size * 2, p.size * 2, angle, angle + HALF_PI);
  }
}

function drawPulsingRects(cell, t) {
  noStroke();
  rectMode(CENTER);
  for (let i = 0; i < 4; i++) {
    let p = cell.parts[i];
    let s = p.size * map(sin(t * p.speed + p.offset), -1, 1, 0.4, 1);
    let col = color(p.col);
    col.setAlpha(170);
    fill(col);
    push();
    rotate(t * p.speed * 0.3 + p.offset);
    rect(0, 0, s, s, 3);
    pop();
  }
}

function drawOrbitingDots(cell, t) {
  noStroke();
  for (let i = 0; i < 4; i++) {
    let p = cell.parts[i];
    let angle = p.offset + t * p.speed + i * HALF_PI;
    let radius = p.size * 0.7;
    let dx = cos(angle) * radius;
    let dy = sin(angle) * radius;
    let dotSize = map(sin(t + p.offset), -1, 1, 5, 14);
    let col = color(p.col);
    col.setAlpha(210);
    fill(col);
    circle(dx, dy, dotSize);
  }
}

function drawBreathingDiamond(cell, t) {
  noStroke();
  for (let i = 0; i < 4; i++) {
    let p = cell.parts[i];
    let s = p.size * map(sin(t * p.speed + p.offset + i), -1, 1, 0.5, 1);
    let col = color(p.col);
    col.setAlpha(180);
    fill(col);
    push();
    rotate(PI / 4 + t * p.speed * 0.2);
    let shrink = map(i, 0, 3, 1, 0.4);
    rect(0, 0, s * shrink, s * shrink, 2);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildGrid();
}
