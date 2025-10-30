let dots = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < 100; i++) {
        dots.push({x: random(width), y: random(height), dx: random(-1,1), dy: random(-1,1)});
    }
    noStroke();
}

function draw() {
    background(0, 40);
    for (let d of dots) {
        d.x += d.dx;
        d.y += d.dy;
        if (d.x < 0 || d.x > width) d.dx *= -1;
        if (d.y < 0 || d.y > height) d.dy *= -1;
        fill((d.x + d.y) % 255, 200, 255);
        ellipse(d.x, d.y, 6);
    }
}
