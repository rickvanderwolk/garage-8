let center;
let orbiters = [];

const palette = [
  [220, 60, 60],    // rood
  [70, 170, 70],    // groen
  [160, 220, 50],   // lime groen
  [60, 90, 220],    // blauw
  [90, 190, 235],   // licht blauw
  [30, 50, 130],    // donker blauw
  [240, 150, 40],   // oranje
  [200, 70, 160],   // magenta
  [60, 200, 190],   // turquoise
  [250, 210, 60]    // geel
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);

  const base = min(width, height);

  center = {
    cx: width / 2,
    cy: height / 2,
    orbit: base * 0.06,
    r: base * 0.035,
    speed: 0.02,
    angle: random(TWO_PI),
    color: [250, 190, 120] // licht oranje / huidskleur
  };

  const count = 14;
  for (let i = 0; i < count; i++) {
    orbiters.push({
      orbit: base * random(0.16, 0.42),
      r: base * random(0.012, 0.03),
      speed: random(0.005, 0.025) * (random() < 0.5 ? -1 : 1),
      angle: random(TWO_PI),
      color: palette[i % palette.length]
    });
  }
}

function draw() {
  background(255);

  // middelste cirkel draait rondjes om het centrum
  const mx = center.cx + cos(center.angle) * center.orbit;
  const my = center.cy + sin(center.angle) * center.orbit;
  noStroke();
  fill(center.color[0], center.color[1], center.color[2]);
  circle(mx, my, center.r * 2);
  center.angle += center.speed;

  // de andere cirkels draaien om het midden
  for (const o of orbiters) {
    const x = center.cx + cos(o.angle) * o.orbit;
    const y = center.cy + sin(o.angle) * o.orbit;
    fill(o.color[0], o.color[1], o.color[2]);
    circle(x, y, o.r * 2);
    o.angle += o.speed;
  }
}
