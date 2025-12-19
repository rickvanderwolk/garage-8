let stars = [];
let numStars = 600;
let speed = 15;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  noStroke();

  for (let i = 0; i < numStars; i++) {
    stars.push(createStar());
  }
}

function createStar() {
  return {
    x: random(-width, width),
    y: random(-height, height),
    z: random(width),
    pz: 0
  };
}

function draw() {
  // trail effect
  fill(0, 40);
  rect(0, 0, width, height);

  translate(width / 2, height / 2);

  // speed varieert met tijd
  let t = millis() * 0.001;
  speed = 10 + sin(t * 0.5) * 8;

  for (let star of stars) {
    // beweeg naar camera
    star.z -= speed;

    // reset als voorbij camera
    if (star.z < 1) {
      star.x = random(-width, width);
      star.y = random(-height, height);
      star.z = width;
      star.pz = star.z;
    }

    // projecteer naar 2D
    let sx = map(star.x / star.z, 0, 1, 0, width);
    let sy = map(star.y / star.z, 0, 1, 0, height);

    // vorige positie voor lijn
    let px = map(star.x / star.pz, 0, 1, 0, width);
    let py = map(star.y / star.pz, 0, 1, 0, height);

    star.pz = star.z;

    // grootte gebaseerd op diepte
    let size = map(star.z, 0, width, 4, 0);

    // helderheid gebaseerd op diepte
    let brightness = map(star.z, 0, width, 255, 50);

    // teken lijn (trail)
    stroke(brightness);
    strokeWeight(size);
    line(px, py, sx, sy);

    // teken ster
    noStroke();
    fill(255);
    circle(sx, sy, size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
