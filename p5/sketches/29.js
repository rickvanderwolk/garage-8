function setup() {
  createCanvas(800, 600);
  noStroke();
}

function draw() {
  // lucht
  background(135, 206, 250);

  // zon
  fill(255, 220, 0);
  circle(700, 80, 100);

  // bergen
  fill(100, 140, 110);
  triangle(500, 400, 350, 400, 650, 400);
  triangle(500, 250, 350, 400, 650, 400);

  // gras
  fill(100, 185, 85);
  rect(0, 400, 800, 200);

  // boom stam
  fill(100, 80, 60);
  rect(150, 300, 30, 100);

  // boom kruin
  fill(50, 150, 50);
  circle(165, 280, 100);

  // bloem steel
  fill(50, 180, 80);
  rect(400, 420, 6, 50);

  // bloem blaadjes
  fill(255, 100, 120);
  circle(385, 420, 25);
  circle(415, 420, 25);
  circle(403, 405, 25);
  circle(403, 435, 25);

  // bloem midden
  fill(255, 210, 80);
  circle(403, 420, 18);

  // wolk
  fill(255);
  circle(200, 100, 60);
  circle(250, 100, 80);
  circle(300, 100, 60);
}
