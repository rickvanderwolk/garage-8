let waves = [];
let numWaves = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  for (let i = 0; i < numWaves; i++) {
    waves.push({
      yBase: map(i, 0, numWaves, height * 0.3, height * 0.7),
      hue: map(i, 0, numWaves, 120, 180),
      speed: random(0.3, 0.6),
      amp: random(30, 60),
      offset: random(1000)
    });
  }
}

function draw() {
  // nachtlucht gradient
  background(240, 60, 5);

  // sterren
  randomSeed(42);
  fill(0, 0, 100, 40);
  for (let i = 0; i < 150; i++) {
    let x = random(width);
    let y = random(height * 0.6);
    let s = random(1, 2);
    circle(x, y, s);
  }

  let t = millis() * 0.001;

  // aurora golven
  blendMode(ADD);

  for (let w of waves) {
    drawAuroraWave(w, t);
  }

  blendMode(BLEND);

  // donkere horizon
  fill(240, 40, 3);
  rect(0, height * 0.85, width, height * 0.15);

  // silhouet bomen
  fill(0);
  randomSeed(123);
  for (let x = 0; x < width; x += 40) {
    let h = random(30, 80);
    triangle(x, height * 0.85, x + 15, height * 0.85 - h, x + 30, height * 0.85);
  }
}

function drawAuroraWave(w, t) {
  beginShape();

  for (let x = 0; x <= width; x += 8) {
    let noiseVal = noise(x * 0.003 + w.offset, t * w.speed);
    let y = w.yBase + sin(x * 0.01 + t + w.offset) * w.amp * noiseVal;

    // verticale strepen
    let intensity = noise(x * 0.01, t * 0.5 + w.offset) * 50 + 20;
    let h = map(noiseVal, 0, 1, 80, 200);

    // gradient naar boven
    for (let dy = 0; dy < h; dy += 4) {
      let alpha = map(dy, 0, h, intensity, 0);
      let hue = w.hue + sin(x * 0.005 + t) * 20;
      fill(hue, 70, 80, alpha * 0.3);
      rect(x, y - dy, 10, 5);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
