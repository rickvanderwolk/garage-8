let t=0;
function setup(){createCanvas(windowWidth,windowHeight);rectMode(CENTER);noStroke()}
function draw(){
    background(0,20);
    let m=min(width,height)*0.25, s=m*0.35;
    translate(width/2,height/2);
    for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
        push();translate(ix*m,iy*m);rotate(t+ix*0.3+iy*0.4);
        fill((frameCount+ix*40+iy*60)%255,180,255,170);
        rect(0,0,s,s);pop();
    }
    t+=0.02;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
