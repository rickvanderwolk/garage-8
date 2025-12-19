let angle = 0;
let segments = 8;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(0);
  noStroke();
}

function draw() {
  // langzame fade
  fill(0, 0, 0, 8);
  rect(0, 0, width, height);

  translate(width / 2, height / 2);

  let t = millis() * 0.001;

  // teken in segmenten voor kaleidoscope effect
  for (let i = 0; i < segments; i++) {
    push();
    rotate((TWO_PI / segments) * i);

    // mirror elk segment
    for (let m = 0; m < 2; m++) {
      push();
      if (m === 1) scale(-1, 1);

      // bewegende vormen
      for (let j = 0; j < 3; j++) {
        let r = 100 + sin(t * 0.7 + j) * 80 + j * 50;
        let a = t * 0.3 + j * 0.5;
        let x = cos(a) * r;
        let y = sin(a) * r * 0.3;

        let hue = (t * 30 + j * 40 + i * 20) % 360;
        let size = 20 + sin(t * 2 + j) * 10;

        fill(hue, 70, 90, 30);
        ellipse(x, y, size, size * 1.5);
      }

      // extra swirls
      let swirl = noise(t * 0.5, i * 0.1) * 150 + 50;
      let sx = cos(t + i) * swirl;
      let sy = sin(t * 0.8) * swirl * 0.4;
      let hue2 = (t * 50 + i * 45) % 360;

      fill(hue2, 60, 100, 20);
      ellipse(sx, sy, 30, 15);

      pop();
    }

    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
