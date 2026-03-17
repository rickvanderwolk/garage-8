function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  background(20);
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  if (mouseIsPressed) {
    let size = dist(mouseX, mouseY, pmouseX, pmouseY);
    let hue = frameCount % 360;

    fill(hue, 70, 90, 60);
    circle(mouseX, mouseY, size + 10);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
