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

        // Track controls
        this.trackVolumes = [0.7, 0.7, 0.7, 0.7]; // Volume per track (0-1)
        this.trackMuted = [false, false, false, false]; // Mute state per track
        this.trackSolo = [false, false, false, false]; // Solo state per track

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
     * Set volume voor een track (0-100)
     */
    setTrackVolume(track, volume) {
        if (track >= 0 && track < this.tracks) {
            this.trackVolumes[track] = volume / 100; // Convert to 0-1
        }
    }

    /**
     * Toggle mute voor een track
     */
    toggleMute(track) {
        if (track >= 0 && track < this.tracks) {
            this.trackMuted[track] = !this.trackMuted[track];
            return this.trackMuted[track];
        }
        return false;
    }

    /**
     * Toggle solo voor een track
     */
    toggleSolo(track) {
        if (track >= 0 && track < this.tracks) {
            this.trackSolo[track] = !this.trackSolo[track];
            return this.trackSolo[track];
        }
        return false;
    }

    /**
     * Check of een track gemute is
     */
    isTrackMuted(track) {
        return this.trackMuted[track];
    }

    /**
     * Check of een track solo is
     */
    isTrackSolo(track) {
        return this.trackSolo[track];
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

        // Check of er solo tracks zijn
        const hasSolo = this.trackSolo.some(solo => solo);

        // Trigger alle actieve notes in deze step
        for (let track = 0; track < this.tracks; track++) {
            if (this.pattern[track][step]) {
                // Check of track moet spelen (niet muted EN (geen solo OF track is solo))
                const shouldPlay = !this.trackMuted[track] && (!hasSolo || this.trackSolo[track]);

                if (shouldPlay) {
                    const volume = this.trackVolumes[track];
                    audioEngine.playInstrument(track, time, volume);
                }
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
            pattern: this.pattern,
            trackVolumes: this.trackVolumes,
            trackMuted: this.trackMuted,
            trackSolo: this.trackSolo
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
                this.trackVolumes = data.trackVolumes || [0.7, 0.7, 0.7, 0.7];
                this.trackMuted = data.trackMuted || [false, false, false, false];
                this.trackSolo = data.trackSolo || [false, false, false, false];
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
