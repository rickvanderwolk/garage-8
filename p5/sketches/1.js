function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}
function draw() {
    fill(random(255), random(255), random(255), 100);
    ellipse(mouseX, mouseY, random(10, 80));
}
