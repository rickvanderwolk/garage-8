let t=0, g;
function setup(){createCanvas(windowWidth,windowHeight);noStroke();colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,18); translate(width/2,height/2);
    let m=min(width,height)*0.24, s=m*0.5;
    for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
        push(); translate(ix*m,iy*m); rotate(t+ix*0.2+iy*0.2);
        for(let i=0;i<12;i++){
            let w=s*(1-i/12), h=s*0.1;
            fill((frameCount+i*6+ix*30+iy*30)%360,90,100,70);
            rect(0,-w*0.5+i*h,h,w);
        }
        pop();
    }
    t+=0.02;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
