var bloemenPosities = [];
var wolkenPosities = [];
var bomenPosities = [];
var bergenPosities = [];
var vlindersPosities = [];
var vogelsPosities = [];
var grond;
var bloemenKleuren = [
  [255, 100, 120],
  [255, 200, 80],
  [255, 130, 200],
  [180, 130, 255],
  [255, 170, 80]
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  grond = height * 0.75;

  // wolken - bovenaan, 4 stuks verdeeld
  var wolkenAantal = 4;
  for (var i = 0; i < wolkenAantal; i++) {
    var basisX = width * 0.1 + (width * 0.8 / (wolkenAantal - 1)) * i;
    wolkenPosities.push({
      x: basisX + random(-width * 0.05, width * 0.05),
      y: random(height * 0.08, height * 0.18),
      groot: random() > 0.5,
      snelheid: random(0.2, 0.5)
    });
  }

  // vogels - in de lucht, 3 stuks
  var vogelsAantal = 3;
  for (var i = 0; i < vogelsAantal; i++) {
    var basisX = width * 0.2 + (width * 0.6 / (vogelsAantal - 1)) * i;
    vogelsPosities.push({
      x: basisX + random(-width * 0.1, width * 0.1),
      y: random(height * 0.15, height * 0.25),
      snelheid: random(1, 2)
    });
  }

  // bergen - rechts, 3 stuks
  bergenPosities.push({
    x: width * 0.55,
    breedte: width * 0.35,
    hoogte: height * 0.3
  });
  bergenPosities.push({
    x: width * 0.75,
    breedte: width * 0.4,
    hoogte: height * 0.38
  });
  bergenPosities.push({
    x: width * 0.9,
    breedte: width * 0.3,
    hoogte: height * 0.28
  });

  // bomen - op de grondlijn, 4 stuks
  var bomenAantal = 4;
  for (var i = 0; i < bomenAantal; i++) {
    var basisX = width * 0.15 + (width * 0.7 / (bomenAantal - 1)) * i;
    bomenPosities.push({
      x: basisX + random(-width * 0.03, width * 0.03),
      y: grond,
      groenTint: random(30, 80),
      grootte: random(1.0, 1.4)
    });
  }

  // bloemen - in het gras, 8 stuks, verspreid over hele gras
  var bloemenAantal = 8;
  for (var i = 0; i < bloemenAantal; i++) {
    var basisX = width * 0.1 + (width * 0.8 / (bloemenAantal - 1)) * i;
    bloemenPosities.push({
      x: basisX + random(-width * 0.04, width * 0.04),
      y: grond + random(height * 0.03, height * 0.22),
      kleur: random(bloemenKleuren),
      grootte: random(0.7, 1.3)
    });
  }

  // vlinders - bij de bloemen, 3 stuks
  var vlindersAantal = 3;
  for (var i = 0; i < vlindersAantal; i++) {
    var basisX = width * 0.25 + (width * 0.5 / (vlindersAantal - 1)) * i;
    vlindersPosities.push({
      x: basisX + random(-width * 0.05, width * 0.05),
      y: grond + random(height * 0.05, height * 0.12),
      kleur: random(bloemenKleuren),
      snelheid: random(0.8, 1.5)
    });
  }
}

function draw() {
  background(135, 206, 250);

  // regenboog
  regenboog(width * 0.25, grond);

  // zon
  zon(width - width * 0.12, height * 0.15);

  // wolken
  for (var i = 0; i < wolkenPosities.length; i++) {
    var w = wolkenPosities[i];
    w.x += w.snelheid;
    if (w.x > width + width * 0.1) {
      w.x = -width * 0.1;
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
  var grootte = min(width, height) * 0.12;

  push();
  translate(x, y);
  rotate(frameCount * 0.01);

  stroke(255, 200, 0);
  strokeWeight(max(3, grootte * 0.05));
  for (var i = 0; i < 8; i++) {
    var hoek = TWO_PI / 8 * i;
    line(cos(hoek) * grootte * 0.6, sin(hoek) * grootte * 0.6, cos(hoek) * grootte * 0.9, sin(hoek) * grootte * 0.9);
  }

  noStroke();
  fill(255, 220, 0);
  circle(0, 0, grootte);
  pop();
}

function wolkKlein(x, y) {
  var s = min(width, height) * 0.04;
  noStroke();
  fill(255);
  circle(x - s, y, s * 1.6);
  circle(x + s, y, s * 1.6);
  circle(x, y - s * 0.6, s * 2);
}

function wolkGroot(x, y) {
  var s = min(width, height) * 0.04;
  noStroke();
  fill(255);
  circle(x - s * 1.8, y, s * 2);
  circle(x + s * 1.8, y, s * 2);
  circle(x - s * 0.7, y - s, s * 2.5);
  circle(x + s * 0.7, y - s, s * 2.5);
  circle(x, y, s * 2.8);
}

function berg(x, y, breedte, hoogte) {
  noStroke();
  fill(100, 140, 110);
  triangle(x, y - hoogte, x - breedte / 2, y, x + breedte / 2, y);

  // sneeuw
  fill(255);
  var sneeuwHoogte = hoogte * 0.2;
  var sneeuwBreedte = (sneeuwHoogte / hoogte) * (breedte / 2);
  triangle(x, y - hoogte, x - sneeuwBreedte, y - hoogte + sneeuwHoogte, x + sneeuwBreedte, y - hoogte + sneeuwHoogte);
}

function gras(y) {
  noStroke();
  fill(100, 185, 85);
  rect(0, y, width, height - y);

  stroke(80, 165, 65);
  strokeWeight(2);
  var stap = max(10, width * 0.012);
  for (var i = 0; i < width; i += stap) {
    var wind = sin(frameCount * 0.05 + i * 0.1) * 5;
    var grasHoogte = height * 0.025;
    line(i, y, i + wind, y - grasHoogte);
  }
}

function boom(x, y, groenTint, grootte) {
  var wiegen = sin(frameCount * 0.02 + x * 0.01) * 3;
  var basisGrootte = min(width, height) * 0.08;

  push();
  translate(x, y);
  scale(grootte);

  noStroke();
  fill(100, 80, 60);
  rect(-basisGrootte * 0.12, -basisGrootte, basisGrootte * 0.24, basisGrootte);

  translate(wiegen, 0);
  fill(groenTint, 155, 55);
  circle(0, -basisGrootte * 1.3, basisGrootte);
  pop();
}

function bloem(x, y, kleur, grootte) {
  var basisGrootte = min(width, height) * 0.025;

  push();
  translate(x, y);
  scale(grootte);

  noStroke();
  fill(50, 180, 80);
  rect(-basisGrootte * 0.15, -basisGrootte * 2, basisGrootte * 0.3, basisGrootte * 2);

  translate(0, -basisGrootte * 2);
  rotate(frameCount * 0.02);
  fill(kleur[0], kleur[1], kleur[2]);
  var blad = basisGrootte * 0.6;
  circle(-blad, 0, basisGrootte);
  circle(blad, 0, basisGrootte);
  circle(0, -blad, basisGrootte);
  circle(0, blad, basisGrootte);
  fill(255, 210, 80);
  circle(0, 0, basisGrootte * 0.7);
  pop();
}

function vlinder(x, y, kleur) {
  var grootte = min(width, height) * 0.015;

  push();
  translate(x, y);

  var vleugel = sin(frameCount * 0.2) * 0.3;

  noStroke();
  fill(kleur[0], kleur[1], kleur[2]);

  push();
  rotate(vleugel);
  ellipse(-grootte, 0, grootte * 2, grootte * 1.2);
  pop();

  push();
  rotate(-vleugel);
  ellipse(grootte, 0, grootte * 2, grootte * 1.2);
  pop();

  fill(50);
  ellipse(0, 0, grootte * 0.5, grootte * 1.4);
  pop();
}

function vogel(x, y) {
  var grootte = min(width, height) * 0.02;
  var vleugelBeweging = sin(frameCount * 0.15 + x) * grootte * 0.5;

  stroke(50);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(x - grootte, y + vleugelBeweging);
  vertex(x, y);
  vertex(x + grootte, y + vleugelBeweging);
  endShape();
}

function regenboog(x, y) {
  noFill();
  var boogGrootte = min(width, height) * 0.7;
  var puls = sin(frameCount * 0.02) * 10;
  strokeWeight(max(12, boogGrootte * 0.04));
  var kleuren = [
    [255, 120, 130],
    [255, 190, 110],
    [255, 245, 140],
    [160, 235, 160],
    [160, 210, 255],
    [210, 170, 255]
  ];
  var afstand = boogGrootte * 0.07;
  for (var i = 0; i < kleuren.length; i++) {
    stroke(kleuren[i][0], kleuren[i][1], kleuren[i][2]);
    arc(x, y, boogGrootte + puls - i * afstand, boogGrootte * 0.75 + puls * 0.75 - i * afstand * 0.75, PI, 0);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  grond = height * 0.75;
}
