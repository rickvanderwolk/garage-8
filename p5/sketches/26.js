function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  noStroke();
}

function draw() {
  background(135, 206, 250);

  var cx = width / 2;
  var cy = height / 2;

  // wolk
  fill(255);
  circle(cx - 50, cy, 80);
  circle(cx + 50, cy, 80);
  circle(cx, cy - 30, 90);
  circle(cx, cy + 20, 70);
}
