let t=0;
function setup(){createCanvas(windowWidth,windowHeight);noFill();strokeWeight(3);colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,12); translate(width/2,height/2);
    let m=min(width,height)*0.25, s=m*0.5;
    for(let r=0;r<3;r++)for(let a=0;a<8;a++){
        push(); let R=m*(r-1); rotate(t*(r+1)+a); translate(R,0);
        stroke((frameCount*2+a*20+r*40)%360,70,100,70);
        ellipse(0,0,s,s); pop();
    }
    t+=0.02;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
