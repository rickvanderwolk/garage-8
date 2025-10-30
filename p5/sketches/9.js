let tris=[];
function setup(){
    createCanvas(windowWidth,windowHeight);noStroke();
    for(let i=0;i<120;i++){
        tris.push({x:random(width),y:random(-height,height),s:random(10,40),r:random(TWO_PI),v:random(1,4)});
    }
}
function draw(){
    background(0,30);
    for(let d of tris){
        push();translate(d.x,d.y);rotate(d.r);
        fill((d.y*0.2+frameCount)%255,200,255,200);
        triangle(0,-d.s, -d.s*0.9,d.s*0.6, d.s*0.9,d.s*0.6);
        pop();
        d.y+=d.v; if(d.y>height+50){d.y=-50; d.x=random(width)}
        d.r+=0.01;
    }
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
