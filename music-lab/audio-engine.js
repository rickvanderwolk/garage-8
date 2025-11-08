/**
 * Audio Engine - Web Audio API synthesizers
 * Genereert drum sounds zonder samples
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
    }

    /**
     * Initialiseer de audio context (moet door user interaction)
     */
    init() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.7; // Master volume
        this.masterGain.connect(this.audioContext.destination);
    }

    /**
     * Resume audio context (nodig voor autoplay policy)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Get current audio context time
     */
    getCurrentTime() {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }

    /**
     * KICK DRUM
     * Lage frequentie oscillator met pitch envelope
     */
    playKick(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Oscillator voor de kick body
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Start hoog en ga snel naar laag (punch)
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

        // Amplitude envelope (met volume parameter)
        oscGain.gain.setValueAtTime(volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.5);
    }

    /**
     * SNARE DRUM
     * Combinatie van toon + noise
     */
    playSnare(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Tonal component (twee oscillators)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'triangle';
        osc1.frequency.value = 180;
        osc2.frequency.value = 330;

        oscGain.gain.setValueAtTime(0.7 * volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.masterGain);

        // Noise component
        const noise = this.createNoise(t, 0.2, 0.3 * volume);

        osc1.start(t);
        osc1.stop(t + 0.2);
        osc2.start(t);
        osc2.stop(t + 0.2);
    }

    /**
     * HI-HAT
     * High frequency noise met korte envelope
     */
    playHiHat(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Noise voor hi-hat
        const noise = this.createNoise(t, 0.05, 0.3 * volume);

        // High-pass filter voor metallic sound
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 7000;

        noise.gain.connect(highpass);
        highpass.connect(this.masterGain);
    }

    /**
     * CLAP
     * Multiple korte noise bursts
     */
    playClap(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // 3 korte noise bursts voor clap effect
        const delays = [0, 0.015, 0.03];

        delays.forEach(delay => {
            const noise = this.createNoise(t + delay, 0.1, 0.5 * volume);

            // Bandpass filter voor clap karakter
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 1500;
            bandpass.Q.value = 1;

            noise.gain.connect(bandpass);
            bandpass.connect(this.masterGain);
        });
    }

    /**
     * Helper: Genereer noise
     */
    createNoise(time, duration, volume) {
        const ctx = this.audioContext;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // White noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(volume, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        noise.connect(noiseGain);

        noise.start(time);

        return { source: noise, gain: noiseGain };
    }

    /**
     * TOM DRUM
     * Midrange drum sound
     */
    playTom(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Tom pitch envelope
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

        oscGain.gain.setValueAtTime(volume * 0.8, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.3);
    }

    /**
     * OPEN HI-HAT
     * Longer sustain hi-hat
     */
    playOpenHiHat(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const noise = this.createNoise(t, 0.3, 0.25 * volume);

        // High-pass filter voor metallic sound
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 7000;

        // Bandpass voor extra resonantie
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 10000;
        bandpass.Q.value = 1;

        noise.gain.connect(highpass);
        highpass.connect(bandpass);
        bandpass.connect(this.masterGain);
    }

    /**
     * 808 BASS
     * Sub bass synth
     */
    playBass(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 65; // C2 note

        oscGain.gain.setValueAtTime(volume * 0.9, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.4);
    }

    /**
     * PERCUSSION / SHAKER
     * Fast noise burst
     */
    playPerc(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const noise = this.createNoise(t, 0.08, 0.15 * volume);

        // Bandpass voor shaker karakter
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 4000;
        bandpass.Q.value = 2;

        noise.gain.connect(bandpass);
        bandpass.connect(this.masterGain);
    }

    /**
     * 808 KICK
     * Deep sub bass kick
     */
    play808Kick(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Deeper pitch envelope
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

        oscGain.gain.setValueAtTime(volume * 1.2, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.6);
    }

    /**
     * HARD KICK (Techno)
     * Punchy, short kick
     */
    playHardKick(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.03);

        oscGain.gain.setValueAtTime(volume * 1.1, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.3);
    }

    /**
     * PUNCHY SNARE (Hip Hop)
     */
    playPunchySnare(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'triangle';
        osc1.frequency.value = 200;
        osc2.frequency.value = 350;

        oscGain.gain.setValueAtTime(0.8 * volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.masterGain);

        const noise = this.createNoise(t, 0.15, 0.4 * volume);
        noise.gain.connect(this.masterGain);

        osc1.start(t);
        osc1.stop(t + 0.15);
        osc2.start(t);
        osc2.stop(t + 0.15);
    }

    /**
     * RIMSHOT
     */
    playRimshot(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = 400;

        oscGain.gain.setValueAtTime(0.5 * volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    /**
     * REESE BASS (DnB)
     */
    playReeseBass(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Two detuned oscillators for reese effect
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.value = 55; // A1
        osc2.frequency.value = 58; // Slightly detuned

        oscGain.gain.setValueAtTime(volume * 0.6, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc1.start(t);
        osc1.stop(t + 0.3);
        osc2.start(t);
        osc2.stop(t + 0.3);
    }

    /**
     * ACID BASS (Techno)
     */
    playAcidBass(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 65;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.2);
        filter.Q.value = 10;

        oscGain.gain.setValueAtTime(volume * 0.7, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.3);
    }

    /**
     * SUB BASS
     */
    playSubBass(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 55; // A1

        oscGain.gain.setValueAtTime(volume * 0.8, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.5);
    }

    /**
     * STAB SYNTH
     */
    playStab(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = 523; // C5

        oscGain.gain.setValueAtTime(volume * 0.4, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.2);
    }

    /**
     * PLUCK SYNTH
     */
    playPluck(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.value = 330; // E4

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, t);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.1);

        oscGain.gain.setValueAtTime(volume * 0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.15);
    }

    /**
     * COWBELL
     */
    playCowbell(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc1.frequency.value = 540;
        osc2.frequency.value = 800;

        oscGain.gain.setValueAtTime(volume * 0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc1.start(t);
        osc1.stop(t + 0.15);
        osc2.start(t);
        osc2.stop(t + 0.15);
    }

    /**
     * CRASH CYMBAL
     */
    playCrash(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const noise = this.createNoise(t, 1.5, 0.4 * volume);

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 8000;

        noise.gain.connect(highpass);
        highpass.connect(this.masterGain);
    }

    /**
     * Play instrument by name
     */
    playInstrumentByName(instrumentName, time = 0, volume = 1) {
        switch(instrumentName) {
            case 'kick':
                this.playKick(time, volume);
                break;
            case '808-kick':
                this.play808Kick(time, volume);
                break;
            case 'hard-kick':
                this.playHardKick(time, volume);
                break;
            case 'snare':
                this.playSnare(time, volume);
                break;
            case 'punchy-snare':
                this.playPunchySnare(time, volume);
                break;
            case 'rimshot':
                this.playRimshot(time, volume);
                break;
            case 'hihat':
                this.playHiHat(time, volume);
                break;
            case 'clap':
                this.playClap(time, volume);
                break;
            case 'tom':
                this.playTom(time, volume);
                break;
            case 'openhat':
                this.playOpenHiHat(time, volume);
                break;
            case 'bass':
                this.playBass(time, volume);
                break;
            case 'reese-bass':
                this.playReeseBass(time, volume);
                break;
            case 'acid-bass':
                this.playAcidBass(time, volume);
                break;
            case 'sub-bass':
                this.playSubBass(time, volume);
                break;
            case 'perc':
                this.playPerc(time, volume);
                break;
            case 'stab':
                this.playStab(time, volume);
                break;
            case 'pluck':
                this.playPluck(time, volume);
                break;
            case 'cowbell':
                this.playCowbell(time, volume);
                break;
            case 'crash':
                this.playCrash(time, volume);
                break;
        }
    }

    /**
     * Play instrument by index (backwards compatibility)
     */
    playInstrument(instrumentIndex, time = 0, volume = 1) {
        const instruments = ['kick', 'snare', 'hihat', 'clap', 'tom', 'openhat', 'bass', 'perc'];
        const instrument = instruments[instrumentIndex];
        this.playInstrumentByName(instrument, time, volume);
    }
}

// Global instance
const audioEngine = new AudioEngine();

// Available instruments list (sorted alphabetically by displayName)
const AVAILABLE_INSTRUMENTS = [
    { name: '808-kick', displayName: '808 Kick' },
    { name: 'acid-bass', displayName: 'Acid Bass' },
    { name: 'bass', displayName: 'Bass' },
    { name: 'clap', displayName: 'Clap' },
    { name: 'cowbell', displayName: 'Cowbell' },
    { name: 'crash', displayName: 'Crash' },
    { name: 'hard-kick', displayName: 'Hard Kick' },
    { name: 'hihat', displayName: 'Hi-Hat' },
    { name: 'kick', displayName: 'Kick' },
    { name: 'openhat', displayName: 'Open HH' },
    { name: 'perc', displayName: 'Perc' },
    { name: 'pluck', displayName: 'Pluck' },
    { name: 'punchy-snare', displayName: 'Punchy Snare' },
    { name: 'reese-bass', displayName: 'Reese Bass' },
    { name: 'rimshot', displayName: 'Rimshot' },
    { name: 'snare', displayName: 'Snare' },
    { name: 'stab', displayName: 'Stab' },
    { name: 'sub-bass', displayName: 'Sub Bass' },
    { name: 'tom', displayName: 'Tom' }
];
