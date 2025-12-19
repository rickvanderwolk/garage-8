let blobs = [];
let bg;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  // cache achtergrond
  createBackground();

  for (let i = 0; i < 7; i++) {
    blobs.push({
      x: width / 2 + random(-100, 100),
      y: random(height),
      r: random(120, 220),
      speed: random(0.3, 0.7),
      phase: random(TWO_PI),
      hue: random() > 0.5 ? random(280, 320) : random(340, 380)
    });
  }
}

function createBackground() {
  bg = createGraphics(width, height);
  bg.colorMode(HSB, 360, 100, 100, 100);
  for (let y = 0; y < height; y++) {
    let inter = y / height;
    let c = bg.lerpColor(bg.color(260, 50, 8), bg.color(280, 60, 4), inter);
    bg.stroke(c);
    bg.line(0, y, width, y);
  }
}

function draw() {
  image(bg, 0, 0);

  blendMode(ADD);

  let t = millis() * 0.001; // tijd in seconden voor consistente snelheid

  for (let blob of blobs) {
    // soepele beweging gebaseerd op tijd
    blob.y -= blob.speed;
    blob.displayX = blob.x + sin(t + blob.phase) * 40;
    blob.squeeze = sin(t * 0.5 + blob.phase) * 0.12;

    // reset
    if (blob.y < -blob.r) {
      blob.y = height + blob.r;
      blob.x = width / 2 + random(-150, 150);
    }

    drawBlob(blob);
  }

  blendMode(BLEND);
}

function drawBlob(b) {
  let x = b.displayX;
  let y = b.y;

  for (let i = 8; i > 0; i--) {
    let size = b.r * (0.4 + i * 0.15);
    let alpha = map(i, 8, 1, 5, 35);

    fill(b.hue % 360, 80, 70, alpha);
    ellipse(x, y, size * (1 - b.squeeze), size * (1 + b.squeeze));
  }

  fill(b.hue % 360, 50, 95, 50);
  let coreSize = b.r * 0.35;
  ellipse(x, y, coreSize * (1 - b.squeeze), coreSize * (1 + b.squeeze));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createBackground();
}
