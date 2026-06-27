let drops = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);

  const base = min(width, height);

  drops = [];
  for (let i = 0; i < 1400; i++) {
    drops.push(newDrop(base, true));
  }
}

function newDrop(base, anywhere) {
  const depth = random();
  return {
    x: random(width),
    y: anywhere ? random(height) : -base * 0.2,
    depth: depth,
    len: base * lerp(0.04, 0.18, depth),
    speed: base * lerp(0.012, 0.05, depth),
    w: lerp(0.8, 3.5, depth),
    a: lerp(120, 255, depth)
  };
}

function draw() {
  const base = min(width, height);

  // half-transparante achtergrond: zwart hoopt op tot bijna vol zwart
  background(230, 55);

  // schuine val: constante horizontale component (wind)
  const wind = base * 0.006;

  strokeCap(ROUND);
  for (const d of drops) {
    stroke(5, d.a);
    strokeWeight(d.w);
    line(d.x, d.y, d.x + wind * (d.len / base) * 40, d.y + d.len);

    d.x += wind;
    d.y += d.speed;

    if (d.y - d.len > height) {
      Object.assign(d, newDrop(base, false));
      // start ook ruim links van beeld zodat de wind de linker-onderhoek vult
      d.x = random(-width * 0.6, width);
    }
  }
}
