let palette = [
  '#F72585', '#B5179E', '#7209B7', '#560BAD',
  '#480CA8', '#3A0CA3', '#3F37C9', '#4361EE',
  '#4895EF', '#4CC9F0'
];

let spacing = 80;
let margin = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  noLoop();
}

function draw() {
  background(15, 15, 25);

  let cols = floor((width - margin * 2) / spacing);
  let rows = floor((height - margin * 2) / spacing);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = margin + (width - margin * 2 - (cols - 1) * spacing) / 2 + c * spacing;
      let y = margin + (height - margin * 2 - (rows - 1) * spacing) / 2 + r * spacing;

      let rotation = random([0, HALF_PI, PI, PI + HALF_PI]);

      for (let i = 0; i < 4; i++) {
        let col = color(random(palette));
        col.setAlpha(220);
        stroke(col);
        strokeWeight(random(2, 6));

        let diameter = random(15, 50);
        let startAngle = rotation + i * HALF_PI;

        arc(x, y, diameter, diameter, startAngle, startAngle + HALF_PI);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}
