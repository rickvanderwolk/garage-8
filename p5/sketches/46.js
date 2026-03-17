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
  noFill();
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

      let arcs = [];
      for (let i = 0; i < 4; i++) {
        arcs.push({
          col: random(palette),
          weight: random(2, 6),
          diameter: random(15, 50),
          speed: random(0.3, 1.5) * random([-1, 1]),
          offset: random(TWO_PI)
        });
      }
      cells.push({ x, y, arcs });
    }
  }
}

function draw() {
  background(1, 22, 39);

  let t = millis() * 0.001;

  for (let cell of cells) {
    for (let i = 0; i < 4; i++) {
      let a = cell.arcs[i];
      let col = color(a.col);
      col.setAlpha(220);
      stroke(col);
      strokeWeight(a.weight);

      let startAngle = a.offset + t * a.speed + i * HALF_PI;
      arc(cell.x, cell.y, a.diameter, a.diameter, startAngle, startAngle + HALF_PI);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildGrid();
}
