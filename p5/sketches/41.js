let palette = [
  '#F72585', '#B5179E', '#7209B7', '#560BAD',
  '#480CA8', '#3A0CA3', '#3F37C9', '#4361EE',
  '#4895EF', '#4CC9F0'
];

let cols, rows;
let spacing = 80;
let margin = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  noStroke();
  calcGrid();
}

function calcGrid() {
  cols = floor((width - margin * 2) / spacing);
  rows = floor((height - margin * 2) / spacing);
}

function draw() {
  background(15, 15, 25);

  let t = millis() * 0.001;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = margin + (width - margin * 2 - (cols - 1) * spacing) / 2 + c * spacing;
      let y = margin + (height - margin * 2 - (rows - 1) * spacing) / 2 + r * spacing;

      let seed = r * cols + c;

      for (let i = 0; i < 4; i++) {
        let angle = i * HALF_PI + t * 0.5 + seed * 0.3;
        let offset = 6 + sin(t + seed * 0.2 + i) * 4;
        let cx = x + cos(angle) * offset;
        let cy = y + sin(angle) * offset;

        let size = map(sin(t * 0.8 + seed * 0.15 + i * 1.5), -1, 1, 12, 35);

        let colIndex = (seed * 3 + i * 2) % palette.length;
        let col = color(palette[colIndex]);
        col.setAlpha(180);

        fill(col);
        circle(cx, cy, size);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcGrid();
}
