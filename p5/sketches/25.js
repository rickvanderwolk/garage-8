function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(135, 206, 250);

  var cx = width / 2;
  var cy = height / 2;

  push();
  translate(cx, cy);
  rotate(frameCount * 0.01);

  // stralen
  stroke(255, 200, 0);
  strokeWeight(4);
  line(0, -100, 0, -150);
  line(0, 100, 0, 150);
  line(-100, 0, -150, 0);
  line(100, 0, 150, 0);
  line(-70, -70, -110, -110);
  line(70, -70, 110, -110);
  line(-70, 70, -110, 110);
  line(70, 70, 110, 110);

  // zon
  noStroke();
  fill(255, 220, 0);
  circle(0, 0, 180);

  pop();
}
