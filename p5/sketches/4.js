let t = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}

function draw() {
    background(0, 20);

    for (let i = 0; i < 200; i++) {
        let a = t + i * 0.1;
        let x = width / 2 + sin(a * 2) * (i * 2);
        let y = height / 2 + cos(a * 3) * (i * 1.5);
        let s = 20 + sin(a * 4) * 10;
        fill((a * 40) % 255, 200, 255, 150);
        ellipse(x, y, s);
    }

    t += 0.01;
}
