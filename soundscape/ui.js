// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize engines
    const audioEngine = new AmbientAudioEngine();
    const canvasEngine = new CanvasEngine('drawingCanvas');
    const soundMapper = new SoundMapper(audioEngine);
    const playbackEngine = new PlaybackEngine(canvasEngine, soundMapper);

    let audioInitialized = false;

    // Initialize audio on first user interaction
    function initAudio() {
        if (!audioInitialized) {
            try {
                audioEngine.init();
                if (audioEngine.audioContext && audioEngine.audioContext.state === 'suspended') {
                    audioEngine.audioContext.resume();
                }
                audioInitialized = true;

                // Start playback automatically
                setTimeout(() => {
                    playbackEngine.start();
                }, 200);
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        }
    }

    // Initialize audio immediately
    initAudio();

    // Also init on user interactions as fallback
    document.addEventListener('click', initAudio);
    canvasEngine.canvas.addEventListener('touchstart', initAudio);
    canvasEngine.canvas.addEventListener('mousedown', initAudio);

    // Initialize color palette
    const colorPalette = document.getElementById('colorPalette');
    const colors = soundMapper.getColors();

    colors.forEach((color, index) => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = color;
        btn.dataset.color = color;
        if (index === 0) btn.classList.add('active');

        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            canvasEngine.setColor(color);
        });

        colorPalette.appendChild(btn);
    });

    // Set initial color
    canvasEngine.setColor(colors[0]);

    // Brush size controls
    const brushSizes = [3, 5, 8, 12, 18, 25, 35, 50];
    let currentBrushIndex = 3; // Start at size 12

    const brushSmaller = document.getElementById('brushSmaller');
    const brushLarger = document.getElementById('brushLarger');

    function updateBrushSize() {
        canvasEngine.setBrushSize(brushSizes[currentBrushIndex]);
        brushSmaller.disabled = currentBrushIndex === 0;
        brushLarger.disabled = currentBrushIndex === brushSizes.length - 1;
    }

    brushSmaller.addEventListener('click', () => {
        if (currentBrushIndex > 0) {
            currentBrushIndex--;
            updateBrushSize();
        }
    });

    brushLarger.addEventListener('click', () => {
        if (currentBrushIndex < brushSizes.length - 1) {
            currentBrushIndex++;
            updateBrushSize();
        }
    });

    updateBrushSize();

    // Undo button
    const undoBtn = document.getElementById('undoBtn');
    undoBtn.addEventListener('click', () => {
        canvasEngine.undo();
        updateUndoButton();
    });

    function updateUndoButton() {
        undoBtn.disabled = canvasEngine.strokes.length === 0;
    }
    updateUndoButton();

    // Clear button
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.addEventListener('click', () => {
        canvasEngine.clear();
        updateUndoButton();
    });

    // Update undo button when drawing
    canvasEngine.setDrawCallback(() => {
        updateUndoButton();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            canvasEngine.undo();
            updateUndoButton();
        }

        // [ for smaller brush
        if (e.key === '[') {
            e.preventDefault();
            brushSmaller.click();
        }

        // ] for larger brush
        if (e.key === ']') {
            e.preventDefault();
            brushLarger.click();
        }

        // Number keys 1-9 for colors (0 = 10th color)
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            const colorBtn = colorPalette.children[index];
            if (colorBtn) colorBtn.click();
        }
        if (e.key === '0') {
            const colorBtn = colorPalette.children[9];
            if (colorBtn) colorBtn.click();
        }
    });
});
