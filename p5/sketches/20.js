let t=0;
function setup(){createCanvas(windowWidth,windowHeight);noStroke();colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,12);
    let h=max(8,floor(height/80)), ch=height/h, cw=ch*2;
    for(let r=0;r<h;r++){
        let offset=(r%2)*cw*0.5+sin(t+r*0.2)*cw*0.1;
        for(let x=-1;x<width/cw+1;x++){
            let X=x*cw+offset, hu=(frameCount+r*8+x*5)%360;
            fill(hu,80,100,80);
            rect(X,r*ch,cw+1,ch+1);
        }
    }
    t+=0.02;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
