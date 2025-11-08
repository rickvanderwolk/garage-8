/**
 * Sequencer - Timing en scheduling engine
 */

class Sequencer {
    constructor() {
        this.bpm = 120;
        this.steps = 16;
        this.tracks = 4; // kick, snare, hihat, clap

        // Pattern data: array van arrays [track][step]
        this.pattern = this.createEmptyPattern();

        // Playback state
        this.isPlaying = false;
        this.isPaused = false;
        this.currentStep = 0;

        // Timing
        this.scheduleAheadTime = 0.1; // Hoeveel seconden vooruit schedulen
        this.nextNoteTime = 0;
        this.timerID = null;

        // Callbacks
        this.onStepChange = null; // Callback voor UI updates
    }

    /**
     * Maak een leeg pattern
     */
    createEmptyPattern() {
        const pattern = [];
        for (let track = 0; track < this.tracks; track++) {
            pattern[track] = new Array(this.steps).fill(false);
        }
        return pattern;
    }

    /**
     * Toggle een note aan/uit
     */
    toggleNote(track, step) {
        if (track >= 0 && track < this.tracks && step >= 0 && step < this.steps) {
            this.pattern[track][step] = !this.pattern[track][step];
        }
    }

    /**
     * Check of een note actief is
     */
    isNoteActive(track, step) {
        return this.pattern[track][step];
    }

    /**
     * Set BPM
     */
    setBPM(bpm) {
        this.bpm = Math.max(60, Math.min(200, bpm));
    }

    /**
     * Bereken de tijd tussen steps (in seconden)
     */
    getStepDuration() {
        // 16th notes bij 120 BPM = 0.125 seconden per step
        return (60.0 / this.bpm) / 4;
    }

    /**
     * Start playback
     */
    play() {
        if (this.isPlaying) return;

        audioEngine.init();
        audioEngine.resume();

        this.isPlaying = true;
        this.isPaused = false;

        // Reset als we van stop komen
        if (this.currentStep === 0) {
            this.nextNoteTime = audioEngine.getCurrentTime();
        }

        this.schedule();
    }

    /**
     * Pause playback
     */
    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.isPaused = true;

        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
    }

    /**
     * Stop playback
     */
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentStep = 0;

        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }

        // Update UI
        if (this.onStepChange) {
            this.onStepChange(this.currentStep);
        }
    }

    /**
     * Schedule notes (Web Audio timing)
     */
    schedule() {
        if (!this.isPlaying) return;

        const currentTime = audioEngine.getCurrentTime();

        // Schedule notes die binnen de scheduleAheadTime vallen
        while (this.nextNoteTime < currentTime + this.scheduleAheadTime) {
            this.playStep(this.currentStep, this.nextNoteTime);
            this.nextStep();
        }

        // Blijf schedulen (timeout voor CPU efficiency)
        this.timerID = setTimeout(() => this.schedule(), 25);
    }

    /**
     * Play alle actieve notes in een step
     */
    playStep(step, time) {
        // Update UI op juiste moment
        const uiUpdateDelay = (time - audioEngine.getCurrentTime()) * 1000;
        setTimeout(() => {
            if (this.onStepChange) {
                this.onStepChange(step);
            }
        }, Math.max(0, uiUpdateDelay));

        // Trigger alle actieve notes in deze step
        for (let track = 0; track < this.tracks; track++) {
            if (this.pattern[track][step]) {
                audioEngine.playInstrument(track, time);
            }
        }
    }

    /**
     * Ga naar volgende step
     */
    nextStep() {
        const stepDuration = this.getStepDuration();
        this.nextNoteTime += stepDuration;

        this.currentStep++;
        if (this.currentStep >= this.steps) {
            this.currentStep = 0;
        }
    }

    /**
     * Clear het hele pattern
     */
    clear() {
        this.pattern = this.createEmptyPattern();
    }

    /**
     * Demo pattern laden
     */
    loadDemoPattern() {
        this.clear();

        // Basic house beat
        // Kick op 1, 5, 9, 13
        this.pattern[0][0] = true;
        this.pattern[0][4] = true;
        this.pattern[0][8] = true;
        this.pattern[0][12] = true;

        // Snare op 4, 12
        this.pattern[1][4] = true;
        this.pattern[1][12] = true;

        // Hi-hat op alle even beats
        for (let i = 0; i < 16; i += 2) {
            this.pattern[2][i] = true;
        }

        // Clap op 4, 12 (samen met snare)
        this.pattern[3][4] = true;
        this.pattern[3][12] = true;
    }

    /**
     * Save pattern naar localStorage
     */
    save(name = 'pattern') {
        const data = {
            bpm: this.bpm,
            pattern: this.pattern
        };
        localStorage.setItem(`sequencer_${name}`, JSON.stringify(data));
    }

    /**
     * Load pattern van localStorage
     */
    load(name = 'pattern') {
        const stored = localStorage.getItem(`sequencer_${name}`);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.bpm = data.bpm || 120;
                this.pattern = data.pattern || this.createEmptyPattern();
                return true;
            } catch (e) {
                console.error('Failed to load pattern:', e);
            }
        }
        return false;
    }
}

// Global instance
const sequencer = new Sequencer();
