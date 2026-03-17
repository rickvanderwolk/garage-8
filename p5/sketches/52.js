function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  background(20);
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  let x = random(width);
  let y = random(height);
  let size = random(5, 50);
  let hue = frameCount % 360;

  fill(hue, 70, 90, 40);
  circle(x, y, size);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
