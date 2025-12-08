function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
  background(135, 206, 250);

  let cx = width / 2;
  let cy = height / 2;
  let petalCount = 8;

  // Steel (gebogen)
  noFill();
  stroke(50, 180, 80);
  strokeWeight(12);
  strokeCap(ROUND);
  bezier(cx, cy + 40, cx - 20, cy + 120, cx + 20, cy + 180, cx, cy + 250);

  // Blaadjes aan steel
  noStroke();
  fill(50, 180, 80);
  push();
  translate(cx - 25, cy + 140);
  rotate(-PI / 3);
  ellipse(0, 0, 40, 70);
  pop();

  push();
  translate(cx + 25, cy + 190);
  rotate(PI / 3);
  ellipse(0, 0, 35, 60);
  pop();

  // Bloemblaadjes - allemaal rood
  noStroke();
  fill(255, 70, 70);
  for (let i = 0; i < petalCount; i++) {
    let angle = TWO_PI / petalCount * i;
    push();
    translate(cx, cy);
    rotate(angle);
    ellipse(0, -55, 60, 90);
    pop();
  }

  // Vrolijk midden
  fill(255, 200, 50);
  circle(cx, cy, 70);

  // Smiley
  fill(50);
  circle(cx - 12, cy - 8, 10);
  circle(cx + 12, cy - 8, 10);

  noFill();
  stroke(50);
  strokeWeight(3);
  arc(cx, cy + 5, 30, 25, 0.2, PI - 0.2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}
