const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const buttons = document.querySelectorAll('.resolution-btn');
const aspectBtn = document.getElementById('aspectBtn');
const freezeBtn = document.getElementById('freezeBtn');
const saveBtn = document.getElementById('saveBtn');

let currentResolution = '8';
let isSquare = false;
let isFrozen = false;
let animationId;

// Start webcam
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: 'user'
            }
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            setupCanvas();
            render();
        };
    } catch (err) {
        console.error('Error accessing webcam:', err);
        alert('Unable to access webcam. Please grant camera permissions.');
    }
}

// Setup canvas size
function setupCanvas() {
    if (isSquare) {
        const size = Math.min(window.innerWidth, window.innerHeight);
        canvas.width = size;
        canvas.height = size;
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

// Render loop
function render() {
    if (!isFrozen) {
        // Calculate source dimensions to maintain aspect ratio
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = canvas.width / canvas.height;

        let sx, sy, sWidth, sHeight;

        if (canvasAspect > videoAspect) {
            // Canvas is wider than video - crop top/bottom of video
            sWidth = video.videoWidth;
            sHeight = video.videoWidth / canvasAspect;
            sx = 0;
            sy = (video.videoHeight - sHeight) / 2;
        } else {
            // Canvas is taller than video (or square) - crop left/right of video
            sHeight = video.videoHeight;
            sWidth = video.videoHeight * canvasAspect;
            sx = (video.videoWidth - sWidth) / 2;
            sy = 0;
        }

        if (currentResolution === 'normal') {
            // Normal resolution - draw cropped video to canvas
            ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        } else {
            // Pixelated effect - sample video to exact grid size (e.g., 4x4, 8x8, 16x16)
            const gridSize = parseInt(currentResolution);

            // Disable image smoothing for pixelated effect
            ctx.imageSmoothingEnabled = false;

            // Draw cropped video to tiny grid (e.g., 4x4 pixels)
            ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, gridSize, gridSize);

            // Scale up that tiny grid to fill entire canvas
            ctx.drawImage(canvas, 0, 0, gridSize, gridSize, 0, 0, canvas.width, canvas.height);
        }
    }

    animationId = requestAnimationFrame(render);
}

// Handle resolution button clicks
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        buttons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        button.classList.add('active');

        // Update current resolution
        currentResolution = button.dataset.resolution;
    });
});

// Handle aspect ratio toggle
aspectBtn.addEventListener('click', () => {
    isSquare = !isSquare;
    canvas.classList.toggle('square', isSquare);
    aspectBtn.classList.toggle('active', isSquare);
    setupCanvas();
});

// Handle freeze toggle
freezeBtn.addEventListener('click', () => {
    isFrozen = !isFrozen;
    freezeBtn.classList.toggle('active', isFrozen);
    saveBtn.style.display = isFrozen ? 'block' : 'none';
});

// Handle save image
saveBtn.addEventListener('click', () => {
    // Create download link
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `pixel-cam-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Handle window resize
window.addEventListener('resize', setupCanvas);

// Start the app
startWebcam();
