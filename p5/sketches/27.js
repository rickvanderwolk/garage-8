var bloemenPosities = [];
var wolkenPosities = [];
var bomenPosities = [];
var bergenPosities = [];
var vlindersPosities = [];
var vogelsPosities = [];
var zonX, zonY;
var bloemenKleuren = [
  [255, 70, 70],
  [255, 200, 50],
  [255, 100, 200],
  [180, 100, 255],
  [255, 150, 50]
];

function setup() {
  createCanvas(windowWidth, windowHeight);

  zonX = width - 120;
  zonY = 150;

  var grond = height - 150;
  for (var i = 0; i < 10; i++) {
    bloemenPosities.push({
      x: random(100, width - 100),
      y: grond + random(30, 100),
      kleur: random(bloemenKleuren),
      grootte: random(0.6, 1.4)
    });
  }

  for (var i = 0; i < 5; i++) {
    wolkenPosities.push({
      x: random(0, width),
      y: random(100, 250),
      groot: random() > 0.5,
      snelheid: random(0.3, 0.8)
    });
  }

  for (var i = 0; i < 4; i++) {
    bergenPosities.push({
      x: random(100, width - 100),
      breedte: random(300, 500),
      hoogte: random(150, 280)
    });
  }

  for (var i = 0; i < 5; i++) {
    bomenPosities.push({
      x: random(50, width - 50),
      groenTint: random(30, 80),
      grootte: random(0.7, 1.5)
    });
  }

  for (var i = 0; i < 4; i++) {
    vlindersPosities.push({
      x: random(100, width - 100),
      y: random(grond - 50, grond + 50),
      kleur: random(bloemenKleuren),
      snelheid: random(1, 2)
    });
  }

  for (var i = 0; i < 3; i++) {
    vogelsPosities.push({
      x: random(0, width),
      y: random(80, 200),
      snelheid: random(1.5, 3)
    });
  }
}

function draw() {
  background(135, 206, 250);

  var grond = height - 150;

  // regenboog
  regenboog(200, grond);

  // zon
  zon(zonX, zonY);

  // wolken
  for (var i = 0; i < wolkenPosities.length; i++) {
    var w = wolkenPosities[i];
    w.x += w.snelheid;
    if (w.x > width + 100) {
      w.x = -100;
    }
    if (w.groot) {
      wolkGroot(w.x, w.y);
    } else {
      wolkKlein(w.x, w.y);
    }
  }

  // vogels
  for (var i = 0; i < vogelsPosities.length; i++) {
    var v = vogelsPosities[i];
    v.x += v.snelheid;
    if (v.x > width + 50) {
      v.x = -50;
    }
    vogel(v.x, v.y);
  }

  // bergen
  for (var i = 0; i < bergenPosities.length; i++) {
    var b = bergenPosities[i];
    berg(b.x, grond, b.breedte, b.hoogte);
  }

  // gras
  gras(grond);

  // bomen
  for (var i = 0; i < bomenPosities.length; i++) {
    var b = bomenPosities[i];
    boom(b.x, grond, b.groenTint, b.grootte);
  }

  // bloemen
  for (var i = 0; i < bloemenPosities.length; i++) {
    var bl = bloemenPosities[i];
    bloem(bl.x, bl.y, bl.kleur, bl.grootte);
  }

  // vlinders
  for (var i = 0; i < vlindersPosities.length; i++) {
    var vl = vlindersPosities[i];
    vl.x += sin(frameCount * 0.05 + i) * vl.snelheid;
    vl.y += cos(frameCount * 0.03 + i) * 0.5;
    vlinder(vl.x, vl.y, vl.kleur);
  }
}

function zon(x, y) {
  push();
  translate(x, y);
  rotate(frameCount * 0.01);

  stroke(255, 200, 0);
  strokeWeight(4);
  for (var i = 0; i < 8; i++) {
    var hoek = TWO_PI / 8 * i;
    line(cos(hoek) * 70, sin(hoek) * 70, cos(hoek) * 100, sin(hoek) * 100);
  }

  noStroke();
  fill(255, 220, 0);
  circle(0, 0, 120);
  pop();
}

function wolkKlein(x, y) {
  noStroke();
  fill(255);
  circle(x - 25, y, 40);
  circle(x + 25, y, 40);
  circle(x, y - 15, 50);
}

function wolkGroot(x, y) {
  noStroke();
  fill(255);
  circle(x - 50, y, 60);
  circle(x + 50, y, 60);
  circle(x - 20, y - 25, 70);
  circle(x + 20, y - 25, 70);
  circle(x, y, 80);
}

function berg(x, y, breedte, hoogte) {
  noStroke();
  fill(100, 130, 100);
  triangle(x, y - hoogte, x - breedte / 2, y, x + breedte / 2, y);

  // sneeuw - zelfde hoek als berg
  fill(255);
  var sneeuwHoogte = hoogte * 0.2;
  var sneeuwBreedte = (sneeuwHoogte / hoogte) * (breedte / 2);
  triangle(x, y - hoogte, x - sneeuwBreedte, y - hoogte + sneeuwHoogte, x + sneeuwBreedte, y - hoogte + sneeuwHoogte);
}

function gras(y) {
  noStroke();
  fill(100, 180, 80);
  rect(0, y, width, height - y);

  // gras beweging
  stroke(80, 160, 60);
  strokeWeight(2);
  for (var i = 0; i < width; i += 15) {
    var wind = sin(frameCount * 0.05 + i * 0.1) * 5;
    line(i, y, i + wind, y - 15);
  }
}

function boom(x, y, groenTint, grootte) {
  var wiegen = sin(frameCount * 0.02 + x * 0.01) * 3;

  push();
  translate(x, y);
  scale(grootte);

  noStroke();
  fill(100, 80, 60);
  rect(-12, 0, 24, 100);

  translate(wiegen, 0);
  fill(groenTint, 150, 50);
  circle(0, -30, 100);
  pop();
}

function bloem(x, y, kleur, grootte) {
  push();
  translate(x, y);
  scale(grootte);

  noStroke();
  fill(50, 180, 80);
  rect(-3, -40, 6, 40);

  translate(0, -40);
  rotate(frameCount * 0.02);
  fill(kleur[0], kleur[1], kleur[2]);
  circle(-12, 0, 18);
  circle(12, 0, 18);
  circle(0, -12, 18);
  circle(0, 12, 18);
  fill(255, 200, 50);
  circle(0, 0, 14);
  pop();
}

function vlinder(x, y, kleur) {
  push();
  translate(x, y);

  var vleugel = sin(frameCount * 0.2) * 0.3;

  noStroke();
  fill(kleur[0], kleur[1], kleur[2]);

  push();
  rotate(vleugel);
  ellipse(-10, 0, 20, 12);
  pop();

  push();
  rotate(-vleugel);
  ellipse(10, 0, 20, 12);
  pop();

  fill(50);
  ellipse(0, 0, 6, 14);
  pop();
}

function vogel(x, y) {
  var vleugelBeweging = sin(frameCount * 0.15 + x) * 8;

  stroke(50);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(x - 15, y + vleugelBeweging);
  vertex(x, y);
  vertex(x + 15, y + vleugelBeweging);
  endShape();
}

function regenboog(x, y) {
  noFill();
  strokeWeight(12);
  var kleuren = [
    [255, 100, 100],
    [255, 180, 100],
    [255, 240, 120],
    [150, 230, 150],
    [150, 200, 255],
    [200, 150, 255]
  ];
  for (var i = 0; i < kleuren.length; i++) {
    stroke(kleuren[i][0], kleuren[i][1], kleuren[i][2]);
    arc(x, y, 400 - i * 25, 300 - i * 20, PI, 0);
  }
}
