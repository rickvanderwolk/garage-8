// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize engines
    const audioEngine = new AmbientAudioEngine();
    const canvasEngine = new CanvasEngine('drawingCanvas');
    const soundMapper = new SoundMapper(audioEngine);
    const playbackEngine = new PlaybackEngine(canvasEngine, soundMapper);

    // UI State
    let realtimeAudioEnabled = false; // Start with real-time disabled
    let audioInitialized = false;

    // Initialize audio on first user interaction
    function initAudio() {
        if (!audioInitialized) {
            try {
                // Initialize audio engine (creates audio context)
                audioEngine.init();

                // Resume audio context (required by browsers)
                if (audioEngine.audioContext && audioEngine.audioContext.state === 'suspended') {
                    audioEngine.audioContext.resume();
                }
                audioInitialized = true;
                console.log('Audio initialized - context state:', audioEngine.audioContext?.state);

                // Start playback automatically
                setTimeout(() => {
                    console.log('Starting continuous playback...');
                    console.log('Canvas size:', canvasEngine.canvas.width, 'x', canvasEngine.canvas.height);
                    playbackEngine.start();
                    playBtn.classList.add('playing');
                    playIcon.textContent = '■';
                    const btnText = playBtn.querySelector('span:last-child');
                    if (btnText) btnText.textContent = ' Stop';

                    // Test that audio works
                    audioEngine.playDrone();
                    console.log('Test drone played');
                }, 500);
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        }
    }

    // Initialize audio immediately (try early init)
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
            updateBrushPreview();
        });

        colorPalette.appendChild(btn);
    });

    // Initialize instrument legend
    const instrumentLegend = document.getElementById('instrumentLegend');
    soundMapper.getColorInstrumentMap().forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${item.color}"></div>
            <div class="legend-name">${item.name}</div>
        `;
        instrumentLegend.appendChild(legendItem);
    });

    // Brush size controls
    const brushSizes = document.getElementById('brushSizes');
    brushSizes.addEventListener('click', (e) => {
        if (e.target.classList.contains('brush-btn')) {
            const size = parseInt(e.target.dataset.size);
            document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            canvasEngine.setBrushSize(size);
            updateBrushPreview();
        }
    });

    // Update brush preview
    function updateBrushPreview() {
        const preview = document.getElementById('brushPreview');
        preview.style.width = canvasEngine.currentBrushSize + 'px';
        preview.style.height = canvasEngine.currentBrushSize + 'px';
        preview.style.backgroundColor = canvasEngine.currentTool === 'eraser' ? '#e0e0e0' : canvasEngine.currentColor;
    }
    updateBrushPreview();

    // Tool controls
    const drawTool = document.getElementById('drawTool');
    const eraserTool = document.getElementById('eraserTool');

    drawTool.addEventListener('click', () => {
        canvasEngine.setTool('draw');
        drawTool.classList.add('active');
        eraserTool.classList.remove('active');
        updateBrushPreview();
    });

    eraserTool.addEventListener('click', () => {
        canvasEngine.setTool('eraser');
        eraserTool.classList.add('active');
        drawTool.classList.remove('active');
        updateBrushPreview();
    });

    // Action controls
    const undoBtn = document.getElementById('undoBtn');
    const clearBtn = document.getElementById('clearBtn');

    undoBtn.addEventListener('click', () => {
        canvasEngine.undo();
        updateUndoButton();
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Weet je zeker dat je alles wilt wissen?')) {
            canvasEngine.clear();
            updateUndoButton();
        }
    });

    function updateUndoButton() {
        undoBtn.disabled = canvasEngine.strokes.length === 0;
    }
    updateUndoButton();

    // Real-time audio toggle
    const realtimeAudioToggle = document.getElementById('realtimeAudio');
    realtimeAudioToggle.checked = false; // Start unchecked
    realtimeAudioToggle.addEventListener('change', (e) => {
        realtimeAudioEnabled = e.target.checked;
    });

    // Setup canvas draw callback for real-time audio
    canvasEngine.setDrawCallback((params) => {
        if (realtimeAudioEnabled && !playbackEngine.isPlaying) {
            soundMapper.mapToSound(params);
        }
        updateUndoButton();
    });

    // Playback controls
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const playbackSpeed = document.getElementById('playbackSpeed');
    const speedValue = document.getElementById('speedValue');

    playbackSpeed.addEventListener('input', (e) => {
        const speed = parseInt(e.target.value);
        speedValue.textContent = speed;
        playbackEngine.setSpeed(speed);
    });

    playBtn.addEventListener('click', () => {
        if (playbackEngine.isPlaying) {
            // Stop playback
            playbackEngine.stop();
            playBtn.classList.remove('playing');
            playIcon.textContent = '▶';
            playBtn.querySelector('span:last-child').textContent = ' Afspelen';
        } else {
            // Start playback
            playbackEngine.start();
            playBtn.classList.add('playing');
            playIcon.textContent = '■';
            playBtn.querySelector('span:last-child').textContent = ' Stop';
        }
    });

    // Playback visual feedback (disabled)
    playbackEngine.setPlaybackUpdateCallback((scanPosition) => {
        // Scan line visual removed
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            canvasEngine.undo();
            updateUndoButton();
        }

        // D for draw tool
        if (e.key === 'd' || e.key === 'D') {
            drawTool.click();
        }

        // E for eraser
        if (e.key === 'e' || e.key === 'E') {
            eraserTool.click();
        }

        // Space for play/pause
        if (e.key === ' ') {
            e.preventDefault();
            playBtn.click();
        }

        // Number keys 1-9 for colors
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            const colorBtn = colorPalette.children[index];
            if (colorBtn) colorBtn.click();
        }
    });

    console.log('Soundscape initialized!');
    console.log('Keyboard shortcuts:');
    console.log('- Ctrl/Cmd+Z: Undo');
    console.log('- D: Draw tool');
    console.log('- E: Eraser');
    console.log('- Space: Play/Pause');
    console.log('- 1-9: Select color');
});
