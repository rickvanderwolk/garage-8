function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(135, 206, 250);

  var cx = width / 2;
  var cy = height / 2;

  // steel
  fill(50, 180, 80);
  rect(cx - 6, cy, 12, 200);

  // blaadje
  push();
  translate(cx + 25, cy + 120);
  rotate(0.7);
  ellipse(0, 0, 40, 70);
  pop();

  // bloemblaadjes
  fill(255, 70, 70);
  circle(cx, cy - 60, 60);
  circle(cx + 60, cy, 60);
  circle(cx, cy + 60, 60);
  circle(cx - 60, cy, 60);
  circle(cx + 45, cy - 45, 60);
  circle(cx + 45, cy + 45, 60);
  circle(cx - 45, cy + 45, 60);
  circle(cx - 45, cy - 45, 60);

  // midden
  fill(255, 200, 50);
  circle(cx, cy, 80);
}

