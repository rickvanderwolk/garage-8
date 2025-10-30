let t=0;
function setup(){createCanvas(windowWidth,windowHeight);noFill();strokeWeight(8);colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,25); translate(width/2,height/2);
    let m=min(width,height)*0.23, s=m*0.8;
    for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
        push(); translate(ix*m,iy*m); rotate(t+ix*0.2+iy*0.2);
        stroke((frameCount+ix*60+iy*90)%360,80,100,80);
        line(-s,0,s,0); line(0,-s,0,s); pop();
    }
    t+=0.02;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
