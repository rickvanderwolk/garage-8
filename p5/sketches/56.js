let x, y;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);
  colorMode(HSB, 360, 100, 100, 100);
  x = width / 2;
  y = height / 2;
}

function draw() {
  x += random(-5, 5);
  y += random(-5, 5);

  let hue = frameCount % 360;

  noStroke();
  fill(hue, 70, 90, 40);
  circle(x, y, 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
