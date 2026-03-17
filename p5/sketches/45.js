let palette = [
  '#F72585', '#B5179E', '#7209B7', '#560BAD',
  '#480CA8', '#3A0CA3', '#3F37C9', '#4361EE',
  '#4895EF', '#4CC9F0'
];

let spacing = 80;
let margin = 40;
let cells = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
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
  background(15, 15, 25);

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
