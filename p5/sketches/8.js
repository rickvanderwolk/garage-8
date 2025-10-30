let tt=0;
function setup(){createCanvas(windowWidth,windowHeight);rectMode(CENTER);noStroke()}
function draw(){
    background(0);
    for(let x=40;x<width;x+=80){for(let y=40;y<height;y+=80){
        push();translate(x,y);let a=sin(tt+(x+y)*0.005);rotate(a);
        let s=30+20*a;fill((a*200+200)%255,180,255);rect(0,0,s,s);pop();
    }}
    tt+=0.03;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
