function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
  background(135, 206, 250);

  var cx = width / 2;
  var cy = height / 2;

  // stralen
  stroke(255, 200, 0);
  strokeWeight(4);
  line(cx, cy - 100, cx, cy - 150);
  line(cx, cy + 100, cx, cy + 150);
  line(cx - 100, cy, cx - 150, cy);
  line(cx + 100, cy, cx + 150, cy);
  line(cx - 70, cy - 70, cx - 110, cy - 110);
  line(cx + 70, cy - 70, cx + 110, cy - 110);
  line(cx - 70, cy + 70, cx - 110, cy + 110);
  line(cx + 70, cy + 70, cx + 110, cy + 110);

  // zon
  noStroke();
  fill(255, 220, 0);
  circle(cx, cy, 180);
}
