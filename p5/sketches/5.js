function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}
function draw() {
    background(
        sin(frameCount * 0.01) * 127 + 128,
        sin(frameCount * 0.013) * 127 + 128,
        sin(frameCount * 0.017) * 127 + 128
    );
    fill(255, 100);
    ellipse(width/2, height/2, 400 + sin(frameCount*0.05)*100);
}
