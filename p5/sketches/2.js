let t = 0;
function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}
function draw() {
    background(0, 20);
    fill(255);
    for (let i = 0; i < 100; i++) {
        let x = width/2 + sin(t + i)*200;
        let y = height/2 + cos(t*1.5 + i)*100;
        ellipse(x, y, 4);
    }
    t += 0.02;
}
