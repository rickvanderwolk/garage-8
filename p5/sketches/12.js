let t=0;
function setup(){createCanvas(windowWidth,windowHeight);rectMode(CENTER);noStroke();colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,15); translate(width/2,height/2);
    let m=min(width,height)*0.25, b=m*0.35, k=sin(t)*0.4+1;
    for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
        push(); translate(ix*m,iy*m); rotate(t*1.2+ix*0.3-iy*0.3); scale(k);
        fill((frameCount+ix*40+iy*70)%360,70,100,80);
        rect(0,0,b,b); pop();
    }
    t+=0.03;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
