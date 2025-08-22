const canvasMargin = 20;

let cx, cy, arenaR, rot, rotSpeed, rotAccel, rotMax;
let bucketCount, bucketR, bucketsOrbitR;
let balls, particles, totalToCatch, released, caught, missed, gameOver, startTime, timeLimit, lastDropTime, dropCooldown;
let inputLocked, hitFlash, missFlash;

function setup () {
    initialise();
}

function windowResized () {
    initialise();
}

function initialise () {
    createCanvas((window.innerWidth - canvasMargin), (window.innerHeight - canvasMargin));
    cx = width/2;
    cy = height/2 + min(width,height)*0.04;
    arenaR = min(width,height)*0.38;
    bucketCount = 8;
    bucketR = arenaR*0.16;
    bucketsOrbitR = arenaR - bucketR*0.25;
    rot = 0;
    rotSpeed = 1.05/60;
    rotAccel = 0.0006;
    rotMax = 2.05/60;
    balls = [];
    particles = [];
    totalToCatch = 50;
    released = 0;
    caught = 0;
    missed = 0;
    gameOver = false;
    timeLimit = 35;
    startTime = millis();
    lastDropTime = -9999;
    dropCooldown = 70;
    inputLocked = false;
    hitFlash = 0;
    missFlash = 0;
}

function draw() {
    drawBackGlow();
    drawFlashes();
    drawScanlines();
    drawHUD();
    if (gameOver){
        drawResetButtons();
        return;
    }
    rotSpeed = min(rotMax, rotSpeed + rotAccel);
    rot += rotSpeed;
    updateBalls();
    updateParticles();
    checkGameOver();
}

function drawBackGlow(){
    background(2,2,8);
    push();
    translate(cx,cy);
    noStroke();
    for (let i=6;i>=1;i--){
        const r = arenaR*2.08*i/6;
        fill(18,30+15*i,80+25*i,18+i*10);
        circle(0,0,r);
    }
    pop();
    push();
    translate(cx, cy);
    noFill();
    strokeWeight(8);
    stroke(0,200,255,120);
    circle(0,0, arenaR*2);
    strokeWeight(18);
    stroke(0,90,255,28);
    circle(0,0, arenaR*2.12);
    pop();
    drawBuckets();
    drawChute();
    drawBalls();
    drawParticles();
}

function drawFlashes(){
    if (hitFlash>0){
        push();
        noStroke();
        fill(0,200,255, 120*hitFlash);
        rect(0,0,width,height);
        pop();
        hitFlash*=0.88;
    }
    if (missFlash>0){
        push();
        noStroke();
        fill(255,60,60, 120*missFlash);
        rect(0,0,width,height);
        pop();
        missFlash*=0.88;
    }
}

function drawScanlines(){
    stroke(255,14);
    for (let y=0;y<height;y+=4){
        line(0,y,width,y);
    }
}

function drawHUD() {
    const elapsed = (millis()-startTime)/1000;
    const remaining = max(0, floor(timeLimit - elapsed));
    noStroke();
    fill(255);
    textAlign(LEFT,TOP);
    textSize(22);
    text('Catch All 50', 20, 18);
    textSize(18);
    text('Tijd: ' + nf(remaining,2), 20, 44);
    text('Drops: ' + released + ' / ' + totalToCatch, 20, 66);
    textAlign(CENTER,TOP);
    textSize(min(width,height)*0.06);
    text('✓ ' + caught + '    ✖ ' + missed, width/2, 18);
    if (gameOver) {
        fill(0,210);
        rect(0,0,width,height);
        textAlign(CENTER,CENTER);
        fill(255);
        textSize(min(width,height)*0.09);
        text('GAME OVER', width/2, height*0.42);
        textSize(min(width,height)*0.05);
        text('Gevangen: ' + caught + '    Gemist: ' + missed, width/2, height*0.52);
        textSize(min(width,height)*0.035);
        text('Klik een hoekknop om te resetten', width/2, height*0.58);
    }
}

function drawBuckets(){
    for (let i=0;i<bucketCount;i++){
        const a = rot + i*TWO_PI/bucketCount;
        const bx = cx + cos(a)*bucketsOrbitR;
        const by = cy + sin(a)*bucketsOrbitR;
        noStroke();
        fill(185);
        circle(bx, by, bucketR*2);
        push();
        blendMode(ADD);
        noStroke();
        fill(0,160,255,90);
        circle(bx, by, bucketR*2.8);
        fill(0,100,255,60);
        circle(bx, by, bucketR*2.2);
        pop();
    }
    push();
    translate(cx,cy);
    noFill();
    strokeWeight(10);
    stroke(0,200,255,120);
    circle(0,0, bucketsOrbitR*2);
    pop();
}

function drawChute(){
    const chuteX = cx;
    const chuteTop = 0.06*height;
    const chuteBottom = cy - arenaR - 18;
    stroke(80,180,255,190);
    strokeWeight(8);
    line(chuteX, chuteTop, chuteX, chuteBottom);
    push();
    blendMode(ADD);
    stroke(0,120,255,90);
    strokeWeight(18);
    line(chuteX, chuteTop, chuteX, chuteBottom);
    pop();
    noStroke();
    fill(255);
    circle(chuteX, chuteTop, 22);
    push();
    blendMode(ADD);
    fill(0,200,255,160);
    circle(chuteX, chuteTop, 32);
    pop();
}

function drawBalls(){
    noStroke();
    for (let b of balls){
        push();
        blendMode(ADD);
        fill(b.missCounted? color(255,120,120,80) : color(180,220,255,80));
        circle(b.x, b.y, b.r*3.2);
        pop();
        fill(b.missCounted? color(255,150,150) : color(235));
        circle(b.x, b.y, b.r*2.1);
        fill(b.missCounted? color(255,90,90) : color(255));
        circle(b.x - b.r*0.35, b.y - b.r*0.35, b.r*0.95);
    }
}

function updateBalls(){
    const g = 0.62;
    const restitution = 0.64;
    const tangentialDamp = 0.986;
    const topCatchY = cy - arenaR - 18;
    for (let i=balls.length-1;i>=0;i--){
        const b = balls[i];
        if (b.caught){
            spawnBurst(b.x,b.y);
            hitFlash = 1;
            caught++;
            balls.splice(i,1);
            continue;
        }
        if (!b.enteredArena && b.y >= topCatchY){
            const hit = checkCatch(b);
            if (hit){
                b.caught = true;
                continue;
            } else {
                if (!b.missCounted){
                    missed++;
                    missFlash = 1;
                    b.missCounted = true;
                }
                b.enteredArena = true;
            }
        }
        b.vy += g;
        b.x += b.vx;
        b.y += b.vy;
        const dx = b.x - cx;
        const dy = b.y - cy;
        const dist = sqrt(dx*dx + dy*dy);
        const maxDist = arenaR - b.r;
        if (dist > maxDist){
            const nx = dx/dist;
            const ny = dy/dist;
            b.x = cx + nx*maxDist;
            b.y = cy + ny*maxDist;
            const vn = b.vx*nx + b.vy*ny;
            const vnx = vn*nx;
            const vny = vn*ny;
            const vtx = b.vx - vnx;
            const vty = b.vy - vny;
            const rvnx = -restitution*vnx;
            const rvny = -restitution*vny;
            b.vx = rvnx + vtx*tangentialDamp;
            b.vy = rvny + vty*tangentialDamp;
        }
    }
}

function checkCatch(b){
    let caughtNow = false;
    const rrAdj = (bucketR + b.r*0.95)*(bucketR + b.r*0.95);
    for (let i=0;i<bucketCount;i++){
        const a = rot + i*TWO_PI/bucketCount;
        const bx = cx + cos(a)*bucketsOrbitR;
        const by = cy + sin(a)*bucketsOrbitR;
        const d2 = (b.x-bx)*(b.x-bx) + (b.y-by)*(b.y-by);
        if (d2 <= rrAdj){
            caughtNow = true;
            break;
        }
    }
    return caughtNow;
}

function drawParticles(){
    noStroke();
    for (let p of particles){
        push();
        blendMode(ADD);
        fill(0,200,255, p.a*180);
        circle(p.x, p.y, p.r*2.4);
        pop();
        fill(200,240,255, p.a*220);
        circle(p.x, p.y, p.r);
    }
}

function updateParticles(){
    for (let i=particles.length-1;i>=0;i--){
        const p = particles[i];
        p.vy += 0.16;
        p.x += p.vx;
        p.y += p.vy;
        p.r *= 0.982;
        p.a *= 0.94;
        if (p.a<0.03 || p.r<0.8) particles.splice(i,1);
    }
}

function spawnBurst(x,y){
    for (let i=0;i<22;i++){
        const a = random(TWO_PI);
        const s = random(2,6.2);
        particles.push({x,y,vx:cos(a)*s,vy:sin(a)*s,r:random(3,8),a:1});
    }
}

function makeBall(){
    const x = cx;
    const y = 0.06*height;
    const r = max(12, arenaR*0.075);
    return {x,y,vx:0,vy:2,r,caught:false,missCounted:false,enteredArena:false};
}

function mousePressed () {
    if (gameOver){
        if (inResetButton(mouseX, mouseY)) initialise();
        return;
    }
    dropBall();
}

function touchStarted(){
    if (gameOver){
        if (inResetButton(mouseX, my)) initialise();
        return false;
    }
    dropBall();
    return false;
}

function dropBall(){
    const now = millis();
    if (now - lastDropTime < dropCooldown) return;
    if (inputLocked) return;
    if (released >= totalToCatch) return;
    balls.push(makeBall());
    released++;
    lastDropTime = now;
    if (released >= totalToCatch) inputLocked = true;
}

function checkGameOver(){
    const elapsed = (millis()-startTime)/1000;
    if (elapsed>=timeLimit){
        gameOver = true;
        return;
    }
    if (released>=totalToCatch && (caught+missed)>=totalToCatch){
        gameOver = true;
        return;
    }
}

function drawResetButtons(){
    const m = 16;
    const w = max(110, width*0.14), h = max(44, height*0.06);
    drawResetButton(m, m, w, h, 'RESET');
    drawResetButton(width-w-m, m, w, h, 'RESET');
    drawResetButton(m, height-h-m, w, h, 'RESET');
    drawResetButton(width-w-m, height-h-m, w, h, 'RESET');
}

function drawResetButton(x,y,w,h,label){
    push();
    noStroke();
    fill(0,0,0,160);
    rect(x-6,y-6,w+12,h+12,10);
    fill(0,180,255,200);
    rect(x,y,w,h,10);
    push();
    blendMode(ADD);
    fill(0,120,255,120);
    rect(x-4,y-4,w+8,h+8,12);
    pop();
    fill(255);
    textAlign(CENTER,CENTER);
    textSize(min(w,h)*0.38);
    text(label, x+w/2, y+h/2);
    pop();
}

function inResetButton(mx,my){
    const m = 16;
    const w = max(110, width*0.14), h = max(44, height*0.06);
    const rects = [
        {x:m,y:m,w,h},
        {x:width-w-m,y:m,w,h},
        {x:m,y:height-h-m,w,h},
        {x:width-w-m,y:height-h-m,w,h}
    ];
    for (let r of rects){
        if (mx>=r.x && mx<=r.x+r.w && my>=r.y && my<=r.y+r.h) return true;
    }
    return false;
}
