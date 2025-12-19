let pendulums = [];
let numPendulums = 25;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  for (let i = 0; i < numPendulums; i++) {
    pendulums.push({
      freq: 1 + i * 0.04,
      hue: map(i, 0, numPendulums, 180, 300)
    });
  }
}

function draw() {
  background(250, 30, 8);

  let t = millis() * 0.002;
  let spacing = width / (numPendulums + 1);
  let maxRadius = min(spacing * 0.8, 30);

  for (let i = 0; i < pendulums.length; i++) {
    let p = pendulums[i];
    let x = spacing * (i + 1);

    // swing positie
    let swing = sin(t * p.freq);
    let y = height / 2 + swing * (height * 0.35);

    // trail
    for (let j = 10; j > 0; j--) {
      let pastSwing = sin((t - j * 0.02) * p.freq);
      let pastY = height / 2 + pastSwing * (height * 0.35);
      let alpha = map(j, 10, 0, 5, 20);
      let size = map(j, 10, 0, maxRadius * 0.3, maxRadius * 0.8);

      fill(p.hue, 70, 70, alpha);
      circle(x, pastY, size);
    }

    // hoofdbal
    fill(p.hue, 60, 95, 90);
    circle(x, y, maxRadius);

    // highlight
    fill(0, 0, 100, 40);
    circle(x - maxRadius * 0.2, y - maxRadius * 0.2, maxRadius * 0.3);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
