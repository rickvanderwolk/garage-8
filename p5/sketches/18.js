let t=0;
function setup(){createCanvas(windowWidth,windowHeight);noStroke();colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,22); translate(width/2,height/2);
    let m=min(width,height)*0.26, s=m*0.12;
    for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
        push(); let a=t+ix*0.4+iy*0.6; translate(ix*m,iy*m); rotate(a);
        fill((frameCount+ix*50+iy*80)%360,70,100,90);
        ellipse(cos(a)*m*0.25,sin(a)*m*0.25,s,s); pop();
    }
    t+=0.024;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
