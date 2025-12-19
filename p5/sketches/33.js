let columns = [];
let numColumns = 80;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  for (let i = 0; i < numColumns; i++) {
    columns.push({
      x: map(i, 0, numColumns, 0, width),
      offset: random(1000),
      speed: random(0.2, 0.5),
      hueBase: random(100, 160)
    });
  }
}

function draw() {
  // donkere lucht
  background(240, 70, 4);

  // sterren
  drawStars();

  let t = millis() * 0.0008;

  // aurora curtains
  blendMode(ADD);

  for (let c of columns) {
    drawCurtain(c, t);
  }

  blendMode(BLEND);

  // horizon glow
  for (let y = height * 0.82; y < height; y++) {
    let alpha = map(y, height * 0.82, height, 10, 0);
    fill(140, 50, 30, alpha);
    rect(0, y, width, 1);
  }

  // bergen silhouet
  fill(240, 50, 2);
  drawMountains();
}

function drawStars() {
  randomSeed(99);
  for (let i = 0; i < 200; i++) {
    let x = random(width);
    let y = random(height * 0.7);
    let twinkle = noise(i, millis() * 0.001) * 60 + 20;
    fill(0, 0, 100, twinkle);
    circle(x, y, random(1, 2.5));
  }
}

function drawCurtain(c, t) {
  let x = c.x;
  let colWidth = width / numColumns + 4;

  // bewegende noise voor golvend effect
  let wave = noise(c.offset, t * c.speed) * 2 - 1;
  let heightVar = noise(c.offset + 100, t * 0.3);

  let baseY = height * 0.35 + wave * 80;
  let curtainHeight = heightVar * height * 0.5 + 100;

  // teken verticale gradient strook
  for (let y = baseY; y < baseY + curtainHeight; y += 2) {
    let progress = (y - baseY) / curtainHeight;

    // intensiteit: sterk in midden, fade aan randen
    let intensity = sin(progress * PI);
    intensity *= noise(c.offset, y * 0.01, t * 0.5);

    // kleur shift
    let hue = c.hueBase + sin(t + c.offset + y * 0.005) * 30;
    hue = (hue + 360) % 360;

    let alpha = intensity * 25;
    let brightness = 70 + intensity * 30;

    fill(hue, 60, brightness, alpha);
    rect(x - colWidth / 2, y, colWidth, 3);
  }
}

function drawMountains() {
  beginShape();
  vertex(0, height);

  let seed = 42;
  for (let x = 0; x <= width; x += 20) {
    let h = noise(x * 0.005, seed) * 120 + 30;
    vertex(x, height * 0.85 - h);
  }

  vertex(width, height);
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
