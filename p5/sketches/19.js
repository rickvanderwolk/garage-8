let t=0;
function setup(){createCanvas(windowWidth,windowHeight);noStroke();colorMode(HSB,360,100,100,100)}
function draw(){
    background(0,10);
    let n=max(6,floor(min(width,height)/120)), cw=width/n, ch=height/n;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
        let h=(frameCount*2+x*10+y*10)%360, a=70+20*sin(t+x*0.3+y*0.3);
        fill(h,80,100,a);
        rect(x*cw,y*ch,cw+1,ch+1);
    }
    t+=0.03;
}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
