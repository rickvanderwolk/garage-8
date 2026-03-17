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
  noLoop();
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

      let type = floor(random(6));
      let rot = random([0, HALF_PI, PI, PI + HALF_PI]);
      let numLayers = floor(random(2, 7));
      let colors = [];
      for (let i = 0; i < numLayers; i++) {
        colors.push(random(palette));
      }

      cells.push({ x, y, type, rot, numLayers, colors });
    }
  }
}

function draw() {
  background(1, 22, 39);

  for (let cell of cells) {
    push();
    translate(cell.x, cell.y);
    rotate(cell.rot);

    switch (cell.type) {
      case 0: drawNested(cell); break;
      case 1: drawLines(cell); break;
      case 2: drawHalfCircles(cell); break;
      case 3: drawCross(cell); break;
      case 4: drawDotCluster(cell); break;
      case 5: drawBrokenRings(cell); break;
    }

    pop();
  }
}

function drawNested(cell) {
  noStroke();
  for (let i = cell.numLayers - 1; i >= 0; i--) {
    let col = color(cell.colors[i]);
    col.setAlpha(200);
    fill(col);
    let s = map(i, 0, cell.numLayers - 1, 8, 50);
    if (random() > 0.5) {
      circle(0, 0, s);
    } else {
      rectMode(CENTER);
      rect(0, 0, s, s, random(0, s * 0.3));
    }
  }
}

function drawLines(cell) {
  let n = floor(random(3, 8));
  let size = 30;
  for (let i = 0; i < n; i++) {
    let col = color(random(cell.colors));
    col.setAlpha(220);
    stroke(col);
    strokeWeight(random(1, 4));
    let y = map(i, 0, n - 1, -size / 2, size / 2);
    let len = random(10, size);
    line(-len / 2, y, len / 2, y);
  }
}

function drawHalfCircles(cell) {
  noStroke();
  for (let i = cell.numLayers - 1; i >= 0; i--) {
    let col = color(cell.colors[i]);
    col.setAlpha(190);
    fill(col);
    let s = map(i, 0, cell.numLayers - 1, 10, 48);
    let flip = random() > 0.5 ? 0 : PI;
    arc(0, 0, s, s, flip, flip + PI);
  }
}

function drawCross(cell) {
  noStroke();
  rectMode(CENTER);
  let col1 = color(random(cell.colors));
  let col2 = color(random(cell.colors));
  col1.setAlpha(200);
  col2.setAlpha(200);
  let w = random(4, 12);
  let h = random(20, 44);
  fill(col1);
  rect(0, 0, w, h, 2);
  fill(col2);
  rect(0, 0, h, w, 2);
}

function drawDotCluster(cell) {
  noStroke();
  let n = floor(random(5, 15));
  for (let i = 0; i < n; i++) {
    let col = color(random(cell.colors));
    col.setAlpha(210);
    fill(col);
    let angle = random(TWO_PI);
    let r = random(2, 20);
    let dotSize = random(3, 9);
    circle(cos(angle) * r, sin(angle) * r, dotSize);
  }
}

function drawBrokenRings(cell) {
  noFill();
  for (let i = 0; i < cell.numLayers; i++) {
    let col = color(cell.colors[i]);
    col.setAlpha(210);
    stroke(col);
    strokeWeight(random(1.5, 4));
    let s = map(i, 0, cell.numLayers - 1, 12, 48);
    let start = random(TWO_PI);
    let span = random(QUARTER_PI, PI + HALF_PI);
    arc(0, 0, s, s, start, start + span);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildGrid();
  redraw();
}
