let t=0, cells=[];
function setup(){createCanvas(windowWidth,windowHeight);noStroke();colorMode(HSB,360,100,100,100)}
function subdiv(x,y,w,h,depth){
    if(depth==0){cells.push({x,y,w,h});return}
    let mw=w/2, mh=h/2;
    subdiv(x,y,mw,mh,depth-1);
    subdiv(x+mw,y,mw,mh,depth-1);
    subdiv(x,y+mh,mw,mh,depth-1);
    subdiv(x+mw,y+mh,mw,mh,depth-1);
}
function draw(){
    if(cells.length==0){let d=3+((frameCount/60)|0)%3; subdiv(0,0,width,height,d)}
    background(0,12);
    for(let i=0;i<cells.length;i++){
        let c=cells[i], hu=(frameCount+i*3)%360, a=70+30*sin(t+i*0.01);
        fill(hu,80,100,a);
        rect(c.x,c.y,c.w+1,c.h+1);
    }
    t+=0.02;
    if(frameCount%90==0)cells=[];
}
function windowResized(){resizeCanvas(windowWidth,windowHeight);cells=[]}
