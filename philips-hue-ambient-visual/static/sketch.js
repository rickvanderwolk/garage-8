/**
 * Philips Hue Ambient Visuals - Atmospheric Edition
 */

// State from Hue Bridge
let hueState = { lamps: [], sensors: [], environment: {} };

// Visual elements
let blobs = [];
let particles = [];

// Environment state (from sensors)
let envTemp = 0.5;
let targetEnvTemp = 0.5;
let motionEnergy = 0;

// Graphics
let metaballLayer;
let glowLayer;
let time = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    colorMode(HSB, 360, 100, 100, 100);

    // Graphics layers
    metaballLayer = createGraphics(floor(width / 2), floor(height / 2));
    metaballLayer.pixelDensity(1);
    glowLayer = createGraphics(floor(width / 4), floor(height / 4));
    glowLayer.pixelDensity(1);

    // Connect to server via WebSocket (real-time)
    try {
        socket = io();
        socket.on('state', (data) => {
            handleState(data);
        });
    } catch (e) {}

    setInterval(fetchState, 200);
    fetchState();
}

function fetchState() {
    fetch('/api/state')
        .then(r => r.json())
        .then(handleState)
        .catch(() => {});
}

function handleState(data) {
    hueState = data;

    if (data.environment) {
        targetEnvTemp = data.environment.temperature || 0.5;

        // Motion detected - add energy burst
        if (data.environment.motion_triggered && data.environment.motion_triggered.length > 0) {
            motionEnergy = 1.0;
        }
    }

    updateBlobs();
}

function updateBlobs() {
    const lamps = hueState.lamps;
    const currentIds = new Set(lamps.map(l => l.id));

    // Fade out blobs for lamps that are gone
    for (let blob of blobs) {
        if (!currentIds.has(blob.lampId)) {
            blob.fadeOut();
        }
    }

    // One blob per lamp
    for (let lamp of lamps) {
        let existing = blobs.find(b => b.lampId === lamp.id);

        let hue = lamp.hue / 65535 * 360;
        let sat = lamp.saturation * 100;
        let bri = lamp.brightness * 100;

        if (existing) {
            existing.setTarget(hue, sat, bri);
            existing.fadeIn();
        } else {
            let x = random(width * 0.2, width * 0.8);
            let y = random(height * 0.2, height * 0.8);
            let blob = new Blob(x, y, lamp.id);
            blob.setTarget(hue, sat, bri);
            blobs.push(blob);
        }
    }

    blobs = blobs.filter(b => !b.isDead());
}

// Simple blob class - one per lamp
class Blob {
    constructor(x, y, lampId) {
        this.x = x;
        this.y = y;
        this.lampId = lampId;
        this.vx = random(-0.3, 0.3);
        this.vy = random(-0.3, 0.3);

        this.hue = random(360);
        this.sat = 80;
        this.bri = 80;
        this.targetHue = this.hue;
        this.targetSat = this.sat;
        this.targetBri = this.bri;

        this.radius = random(100, 140); // Medium blobs
        this.noiseOffset = random(1000);

        this.fade = 0;
        this.fadeDir = 1;
    }

    setTarget(h, s, b) {
        this.targetHue = h;
        this.targetSat = s;
        this.targetBri = b;
    }

    fadeIn() { this.fadeDir = 1; }
    fadeOut() { this.fadeDir = -1; }
    isDead() { return this.fade <= 0 && this.fadeDir === -1; }

    update() {
        // Fade in/out
        this.fade += this.fadeDir * 0.02;
        this.fade = constrain(this.fade, 0, 1);

        // Fast color transition (nearly instant)
        this.hue = lerp(this.hue, this.targetHue, 0.25);
        this.sat = lerp(this.sat, this.targetSat, 0.25);
        this.bri = lerp(this.bri, this.targetBri, 0.25);

        // Movement speed - boosted by temp and motion
        let speed = 0.6 + envTemp * 0.8 + motionEnergy * 2;

        // Stronger organic movement
        this.vx += (noise(this.noiseOffset, time * 0.8) - 0.5) * 0.15 * (1 + motionEnergy);
        this.vy += (noise(this.noiseOffset + 100, time * 0.8) - 0.5) * 0.15 * (1 + motionEnergy);

        // Stronger repulsion over larger distance - keeps blobs spread out
        for (let other of blobs) {
            if (other === this) continue;
            let dx = this.x - other.x;
            let dy = this.y - other.y;
            let d = sqrt(dx * dx + dy * dy);
            if (d < 250 && d > 0) {
                // Stronger when closer
                let force = map(d, 0, 250, 0.08, 0.01);
                this.vx += (dx / d) * force;
                this.vy += (dy / d) * force;
            }
        }

        // Random nudge to keep things interesting
        if (random() < 0.01) {
            this.vx += random(-0.5, 0.5);
            this.vy += random(-0.5, 0.5);
        }

        this.vx *= 0.97;
        this.vy *= 0.97;
        this.x += this.vx * speed;
        this.y += this.vy * speed;
        this.noiseOffset += 0.005;

        // Stay on screen with stronger bounce
        let margin = 120;
        if (this.x < margin) this.vx += 0.15;
        if (this.x > width - margin) this.vx -= 0.15;
        if (this.y < margin) this.vy += 0.15;
        if (this.y > height - margin) this.vy -= 0.15;
    }

    // Effective radius for metaball calculation
    getRadius() {
        let pulse = sin(time * 1.5 + this.noiseOffset) * 15;
        let motionPulse = motionEnergy * 30;
        return (this.radius + pulse + motionPulse) * this.fade;
    }
}

// Floating ambient particle
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = random(width);
        this.y = random(height);
        this.vx = random(-0.3, 0.3);
        this.vy = random(-0.3, 0.3);
        this.size = random(1, 3);
        this.alpha = random(20, 50);
        this.hue = 0;
    }

    update() {
        // Drift with noise
        this.vx += (noise(this.x * 0.005, time) - 0.5) * 0.05;
        this.vy += (noise(this.y * 0.005, time + 100) - 0.5) * 0.05;

        this.vx *= 0.99;
        this.vy *= 0.99;

        let speed = 0.5 + envTemp * 0.5 + motionEnergy;
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Wrap around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Pick up color from nearest blob
        let nearest = null;
        let nearestDist = Infinity;
        for (let blob of blobs) {
            let d = dist(this.x, this.y, blob.x, blob.y);
            if (d < nearestDist) {
                nearestDist = d;
                nearest = blob;
            }
        }
        if (nearest) {
            this.hue = lerp(this.hue, nearest.hue, 0.02);
        }
    }

    draw() {
        noStroke();
        fill(this.hue, 50, 90, this.alpha);
        circle(this.x, this.y, this.size);
    }
}

// Clean metaball rendering
function drawMetaballs() {
    if (blobs.length === 0) return;

    let w = metaballLayer.width;
    let h = metaballLayer.height;
    let scale = 2; // Because layer is half size

    metaballLayer.loadPixels();

    for (let px = 0; px < w; px++) {
        for (let py = 0; py < h; py++) {
            // World coordinates
            let wx = px * scale;
            let wy = py * scale;

            let sum = 0;
            let hueSum = 0, satSum = 0, briSum = 0;
            let totalWeight = 0;

            for (let blob of blobs) {
                let r = blob.getRadius();
                if (r <= 0) continue;

                let dx = wx - blob.x;
                let dy = wy - blob.y;
                let distSq = dx * dx + dy * dy;

                // Classic metaball formula with soft falloff
                let influence = (r * r) / (distSq + 1);
                sum += influence;

                if (influence > 0.05) {
                    hueSum += blob.hue * influence;
                    satSum += blob.sat * influence;
                    briSum += blob.bri * influence;
                    totalWeight += influence;
                }
            }

            let idx = (px + py * w) * 4;

            // Higher threshold = less blending, more separate shapes
            if (sum > 1.8) {
                let h = totalWeight > 0 ? hueSum / totalWeight : 0;
                let s = totalWeight > 0 ? satSum / totalWeight : 0;
                let b = totalWeight > 0 ? briSum / totalWeight : 0;

                // Intensity based on how "inside" the blob we are
                let intensity = min((sum - 1.8) / 3, 1);

                // Boost brightness significantly, keep colors vibrant
                let centerBoost = pow(intensity, 0.5);
                let finalBri = max(b * 1.3, 60) * (0.8 + centerBoost * 0.3); // Min 60% brightness
                finalBri = min(finalBri, 100);
                let finalSat = s * (0.9 + (1 - centerBoost) * 0.1);

                let edge = min((sum - 1.8) * 2.5, 1);
                let alpha = edge * 255;

                let c = hsbToRgb(h, finalSat, min(finalBri, 100));
                metaballLayer.pixels[idx] = c.r;
                metaballLayer.pixels[idx + 1] = c.g;
                metaballLayer.pixels[idx + 2] = c.b;
                metaballLayer.pixels[idx + 3] = alpha;
            } else if (sum > 0.8) {
                // Soft outer glow
                let h = totalWeight > 0 ? hueSum / totalWeight : 0;
                let s = totalWeight > 0 ? (satSum / totalWeight) * 0.4 : 0;
                let b = totalWeight > 0 ? (briSum / totalWeight) * 0.25 : 0;
                let alpha = (sum - 0.8) * 80;

                let c = hsbToRgb(h, s, b);
                metaballLayer.pixels[idx] = c.r;
                metaballLayer.pixels[idx + 1] = c.g;
                metaballLayer.pixels[idx + 2] = c.b;
                metaballLayer.pixels[idx + 3] = alpha;
            } else {
                metaballLayer.pixels[idx] = 0;
                metaballLayer.pixels[idx + 1] = 0;
                metaballLayer.pixels[idx + 2] = 0;
                metaballLayer.pixels[idx + 3] = 0;
            }
        }
    }

    metaballLayer.updatePixels();

    // Draw scaled up (bilinear filtering makes it smooth)
    image(metaballLayer, 0, 0, width, height);
}

function hsbToRgb(h, s, b) {
    h = h / 360; s = s / 100; b = b / 100;
    let r, g, bl;
    let i = floor(h * 6);
    let f = h * 6 - i;
    let p = b * (1 - s);
    let q = b * (1 - f * s);
    let t = b * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = b; g = t; bl = p; break;
        case 1: r = q; g = b; bl = p; break;
        case 2: r = p; g = b; bl = t; break;
        case 3: r = p; g = q; bl = b; break;
        case 4: r = t; g = p; bl = b; break;
        case 5: r = b; g = p; bl = q; break;
    }
    return { r: round(r * 255), g: round(g * 255), b: round(bl * 255) };
}

function draw() {
    envTemp = lerp(envTemp, targetEnvTemp, 0.05);
    motionEnergy *= 0.97;

    // Clean background
    background(0);

    time += 0.01 * (0.5 + envTemp * 0.8);

    // Update blobs
    for (let blob of blobs) blob.update();

    // Draw metaballs with built-in glow
    drawMetaballs();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    metaballLayer = createGraphics(floor(width / 2), floor(height / 2));
    metaballLayer.pixelDensity(1);
    glowLayer = createGraphics(floor(width / 4), floor(height / 4));
    glowLayer.pixelDensity(1);
}

function doubleClicked() { fullscreen(!fullscreen()); }
