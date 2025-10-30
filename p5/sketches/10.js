function setup(){createCanvas(windowWidth,windowHeight);noStroke()}
function draw(){
    background(5);
    let w=60,h=52;
    for(let y=0;y<height+h;y+=h){
        for(let x=0;x<width+w;x+=w){
            let o=((x+y)/10+frameCount*0.02)%1;
            fill((o*255)%255,180,255);
            triangle(x,y-h/2, x+w/2,y+h/2, x-w/2,y+h/2);
            fill((o*255+120)%255,180,255);
            triangle(x,y+h/2, x+w/2,y-h/2, x-w/2,y-h/2);
        }
    }
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
