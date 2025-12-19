let streams = [];
let charSize = 18;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  textFont('monospace');
  textSize(charSize);

  let cols = ceil(width / charSize);
  for (let i = 0; i < cols; i++) {
    streams.push({
      x: i * charSize,
      y: random(-500, 0),
      speed: random(3, 8),
      chars: [],
      length: floor(random(10, 30))
    });

    // vul met random characters
    for (let j = 0; j < streams[i].length; j++) {
      streams[i].chars.push(randomChar());
    }
  }
}

function randomChar() {
  // mix van katakana en nummers
  let chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
  return chars.charAt(floor(random(chars.length)));
}

function draw() {
  // fade
  fill(0, 80);
  noStroke();
  rect(0, 0, width, height);

  for (let s of streams) {
    // teken characters
    for (let i = 0; i < s.chars.length; i++) {
      let y = s.y - i * charSize;

      if (y > -charSize && y < height + charSize) {
        // eerste char is wit/helder
        if (i === 0) {
          fill(200, 255, 200);
        } else {
          // fade naar donkerder groen
          let alpha = map(i, 0, s.chars.length, 255, 50);
          let green = map(i, 0, s.chars.length, 255, 100);
          fill(0, green, 0, alpha);
        }

        text(s.chars[i], s.x, y);

        // random char change
        if (random() < 0.02) {
          s.chars[i] = randomChar();
        }
      }
    }

    // beweeg
    s.y += s.speed;

    // reset als voorbij scherm
    if (s.y - s.chars.length * charSize > height) {
      s.y = random(-200, -50);
      s.speed = random(3, 8);
      s.length = floor(random(10, 30));
      s.chars = [];
      for (let j = 0; j < s.length; j++) {
        s.chars.push(randomChar());
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
