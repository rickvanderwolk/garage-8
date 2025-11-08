/**
 * UI Controller - Grid interface en controls
 */

class UI {
    constructor() {
        this.gridContainer = document.getElementById('sequencerGrid');
        this.stepIndicators = document.getElementById('stepIndicators');
        this.gridCells = [];
        this.currentStepCells = [];

        this.init();
    }

    /**
     * Initialize UI
     */
    init() {
        this.createGrid();
        this.createStepIndicators();
        this.setupControls();
        this.setupKeyboardShortcuts();

        // Connect sequencer callback
        sequencer.onStepChange = (step) => this.updateStepIndicator(step);

        // Load demo pattern
        sequencer.loadDemoPattern();
        this.updateGrid();
    }

    /**
     * Genereer grid cells
     */
    createGrid() {
        this.gridCells = [];

        for (let track = 0; track < sequencer.tracks; track++) {
            this.gridCells[track] = [];

            for (let step = 0; step < sequencer.steps; step++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.track = track;
                cell.dataset.step = step;

                // Click handler
                cell.addEventListener('click', () => {
                    sequencer.toggleNote(track, step);
                    this.updateCell(track, step);

                    // Preview sound (alleen als niet playing)
                    if (!sequencer.isPlaying) {
                        audioEngine.init();
                        audioEngine.playInstrument(track);
                    }
                });

                this.gridContainer.appendChild(cell);
                this.gridCells[track][step] = cell;
            }
        }
    }

    /**
     * Genereer step indicators (1-16)
     */
    createStepIndicators() {
        for (let i = 0; i < sequencer.steps; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'step-indicator';
            indicator.textContent = i + 1;
            this.stepIndicators.appendChild(indicator);
            this.currentStepCells.push(indicator);
        }
    }

    /**
     * Update een enkele cell
     */
    updateCell(track, step) {
        const cell = this.gridCells[track][step];
        const isActive = sequencer.isNoteActive(track, step);

        if (isActive) {
            cell.classList.add('active');
        } else {
            cell.classList.remove('active');
        }
    }

    /**
     * Update hele grid
     */
    updateGrid() {
        for (let track = 0; track < sequencer.tracks; track++) {
            for (let step = 0; step < sequencer.steps; step++) {
                this.updateCell(track, step);
            }
        }
    }

    /**
     * Update step indicator
     */
    updateStepIndicator(currentStep) {
        // Remove previous highlights
        this.currentStepCells.forEach(cell => cell.classList.remove('current'));
        this.gridCells.forEach(track => {
            track.forEach(cell => {
                cell.classList.remove('current-step', 'playing');
            });
        });

        // Add new highlights
        this.currentStepCells[currentStep].classList.add('current');

        // Highlight current column
        for (let track = 0; track < sequencer.tracks; track++) {
            const cell = this.gridCells[track][currentStep];
            cell.classList.add('current-step');

            // Pulse effect voor actieve notes
            if (sequencer.isNoteActive(track, currentStep)) {
                cell.classList.add('playing');
            }
        }
    }

    /**
     * Setup transport controls
     */
    setupControls() {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const bpmSlider = document.getElementById('bpmSlider');
        const bpmValue = document.getElementById('bpmValue');

        // Play button
        playBtn.addEventListener('click', () => {
            sequencer.play();
            this.updateControlButtons('playing');
        });

        // Pause button
        pauseBtn.addEventListener('click', () => {
            sequencer.pause();
            this.updateControlButtons('paused');
        });

        // Stop button
        stopBtn.addEventListener('click', () => {
            sequencer.stop();
            this.updateControlButtons('stopped');
            this.updateStepIndicator(0);
        });

        // BPM slider
        bpmSlider.addEventListener('input', (e) => {
            const bpm = parseInt(e.target.value);
            sequencer.setBPM(bpm);
            bpmValue.textContent = bpm;
            sequencer.save('autosave'); // Auto-save
        });

        // Load saved pattern
        if (sequencer.load('autosave')) {
            bpmSlider.value = sequencer.bpm;
            bpmValue.textContent = sequencer.bpm;
            this.updateGrid();
        }

        // Auto-save op pattern changes
        this.gridContainer.addEventListener('click', () => {
            sequencer.save('autosave');
        });
    }

    /**
     * Update button states
     */
    updateControlButtons(state) {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');

        switch(state) {
            case 'playing':
                playBtn.disabled = true;
                pauseBtn.disabled = false;
                stopBtn.disabled = false;
                break;
            case 'paused':
                playBtn.disabled = false;
                pauseBtn.disabled = true;
                stopBtn.disabled = false;
                break;
            case 'stopped':
                playBtn.disabled = false;
                pauseBtn.disabled = true;
                stopBtn.disabled = true;
                break;
        }
    }

    /**
     * Keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Spacebar = play/pause
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (sequencer.isPlaying) {
                    sequencer.pause();
                    this.updateControlButtons('paused');
                } else {
                    sequencer.play();
                    this.updateControlButtons('playing');
                }
            }

            // Escape = stop
            if (e.code === 'Escape') {
                e.preventDefault();
                sequencer.stop();
                this.updateControlButtons('stopped');
                this.updateStepIndicator(0);
            }

            // C = clear
            if (e.code === 'KeyC' && !e.ctrlKey && !e.metaKey) {
                if (confirm('Clear hele pattern?')) {
                    sequencer.clear();
                    this.updateGrid();
                    sequencer.save('autosave');
                }
            }

            // D = load demo
            if (e.code === 'KeyD') {
                sequencer.loadDemoPattern();
                this.updateGrid();
                sequencer.save('autosave');
            }
        });
    }
}

// Start UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();

    // Welcome message in console
    console.log('%c🎵 Music Lab', 'font-size: 20px; font-weight: bold;');
    console.log('Keyboard shortcuts:');
    console.log('  Space - Play/Pause');
    console.log('  Escape - Stop');
    console.log('  D - Load demo pattern');
    console.log('  C - Clear pattern');
});
