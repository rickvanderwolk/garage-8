function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  background(20);
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  let x = width / 2 + sin(frameCount * 0.02) * 200;
  let y = height / 2 + cos(frameCount * 0.03) * 200;
  let hue = frameCount % 360;
  let size = 20 + sin(frameCount * 0.05) * 15;

  noStroke();
  fill(hue, 70, 90, 30);
  circle(x, y, size);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
