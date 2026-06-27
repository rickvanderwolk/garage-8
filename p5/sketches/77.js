let drops = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);

  const base = min(width, height);

  drops = [];
  for (let i = 0; i < 2600; i++) {
    drops.push(newDrop(base, true));
  }
}

function newDrop(base, anywhere) {
  const depth = random();
  return {
    x: random(width),
    y: anywhere ? random(height) : -base * 0.25,
    depth: depth,
    len: base * lerp(0.06, 0.26, depth),
    speed: base * lerp(0.018, 0.075, depth),
    w: lerp(1.0, 5.0, depth),
    a: lerp(160, 255, depth)
  };
}

function draw() {
  const base = min(width, height);

  // zeer lage clear-alpha: zwart hoopt sneller op naar vol zwart
  background(225, 22);

  // sterkere horizontale component (wind)
  const wind = base * 0.009;

  strokeCap(ROUND);
  for (const d of drops) {
    stroke(0, d.a);
    strokeWeight(d.w);
    line(d.x, d.y, d.x + wind * (d.len / base) * 45, d.y + d.len);

    d.x += wind;
    d.y += d.speed;

    if (d.y - d.len > height) {
      Object.assign(d, newDrop(base, false));
      d.x = random(-width * 0.7, width);
    }
  }

  // extra donkere waas die met de tijd toeneemt en periodiek terugloopt
  const t = (frameCount % 1800) / 1800;
  const veil = pow(0.5 - 0.5 * cos(t * TWO_PI), 1.5);
  noStroke();
  fill(0, 90 * veil);
  rect(0, 0, width, height);
}
