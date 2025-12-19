let ribbons = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noFill();

  for (let i = 0; i < 4; i++) {
    ribbons.push({
      yBase: height * 0.3 + i * 50,
      hue: 140 + i * 15,
      offset: i * 300,
      speed: 0.08 + i * 0.02
    });
  }
}

function draw() {
  background(220, 40, 6);

  // subtiele sterren
  randomSeed(55);
  noStroke();
  for (let i = 0; i < 100; i++) {
    let twinkle = noise(i, millis() * 0.0005) * 25 + 10;
    fill(0, 0, 100, twinkle);
    circle(random(width), random(height * 0.6), random(1, 2));
  }

  let t = millis() * 0.0003;

  // zachte ribbons
  for (let r of ribbons) {
    drawRibbon(r, t);
  }

  // donkere grond
  noStroke();
  fill(220, 30, 4);
  rect(0, height * 0.88, width, height * 0.12);
}

function drawRibbon(r, t) {
  // bouw punten voor de ribbon
  let points = [];

  for (let x = -50; x <= width + 50; x += 20) {
    let n1 = noise(x * 0.001 + r.offset, t * r.speed);
    let n2 = noise(x * 0.002 + r.offset + 100, t * r.speed * 0.7);
    let y = r.yBase + sin(x * 0.002 + t * 3) * 30 * n1 + n2 * 60;
    points.push({x, y});
  }

  // teken meerdere dunne lijnen met fade
  for (let offset = -20; offset <= 20; offset += 2) {
    let alpha = map(abs(offset), 0, 20, 12, 1);
    let hueShift = offset * 0.5;

    stroke(r.hue + hueShift, 50, 60, alpha);
    strokeWeight(1.5);

    beginShape();
    for (let p of points) {
      let yOff = offset + noise(p.x * 0.005, t + r.offset) * 10;
      curveVertex(p.x, p.y + yOff);
    }
    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
