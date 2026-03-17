let y = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  let t = frameCount * 0.005;

  for (let x = 0; x < width; x += 20) {
    let size = noise(x * 0.01, y * 0.01, t) * 25;
    let hue = (x + y + frameCount) % 360;

    fill(hue, 60, 85, 50);
    circle(x, y, size);
  }

  y += 5;
  if (y > height) y = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
