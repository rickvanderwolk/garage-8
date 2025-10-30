let t=0;
function setup(){createCanvas(windowWidth,windowHeight);noStroke();colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,12); translate(width/2,height/2);
    let r=min(width,height)*0.28, N=16;
    for(let i=0;i<N;i++){
        push(); rotate(t+i*TAU/N); translate(r*0.5,0);
        fill((frameCount*2+i*15)%360,90,100,80);
        rect(0,0,r*0.6,r*0.18,4); pop();
    }
    t+=0.02;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
