let t = 0;
function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}
function draw() {
    background(0);
    let s = sin(t) * 100 + 200;
    fill(100, 150, 255);
    ellipse(width/2, height/2, s);
    t += 0.05;
}
