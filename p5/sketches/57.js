function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  background(240, 50, 12, 10);

  let x = random(width);
  let y = random(height);
  let hue = random([320, 340, 200, 170, 40, 280]);

  noFill();
  stroke(hue, 60, 90, 50);
  strokeWeight(2);

  for (let i = 0; i < 5; i++) {
    circle(x, y, i * 15);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
