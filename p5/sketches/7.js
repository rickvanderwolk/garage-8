function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}
function draw() {
    background(0, 30);
    translate(width/2, height/2);
    for (let i = 0; i < 10; i++) {
        let s = sin(frameCount*0.03 + i)*200 + 250;
        fill((i*30 + frameCount) % 255, 150, 255, 150);
        ellipse(0, 0, s);
    }
}
