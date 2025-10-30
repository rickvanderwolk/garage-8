let t=0;
function setup(){createCanvas(windowWidth,windowHeight);rectMode(CENTER);noStroke();colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,10); translate(width/2,height/2);
    let m=min(width,height)*0.25, s=m*0.36;
    for(let k=3;k>=0;k--){
        let a=t-k*0.12, al=40+k*10;
        for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
            push(); translate(ix*m,iy*m); rotate(a+ix*0.3+iy*0.4);
            fill((frameCount+ix*40+iy*60+k*20)%360,80,100,al);
            rect(0,0,s,s,6); pop();
        }
    }
    t+=0.02;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
