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
    playKick(time = 0) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Oscillator voor de kick body
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Start hoog en ga snel naar laag (punch)
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

        // Amplitude envelope
        oscGain.gain.setValueAtTime(1, t);
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
    playSnare(time = 0) {
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

        oscGain.gain.setValueAtTime(0.7, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.masterGain);

        // Noise component
        const noise = this.createNoise(t, 0.2, 0.3);

        osc1.start(t);
        osc1.stop(t + 0.2);
        osc2.start(t);
        osc2.stop(t + 0.2);
    }

    /**
     * HI-HAT
     * High frequency noise met korte envelope
     */
    playHiHat(time = 0) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Noise voor hi-hat
        const noise = this.createNoise(t, 0.05, 0.3);

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
    playClap(time = 0) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // 3 korte noise bursts voor clap effect
        const delays = [0, 0.015, 0.03];

        delays.forEach(delay => {
            const noise = this.createNoise(t + delay, 0.1, 0.5);

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
     * Play instrument by index
     */
    playInstrument(instrumentIndex, time = 0) {
        const instruments = ['kick', 'snare', 'hihat', 'clap'];
        const instrument = instruments[instrumentIndex];

        switch(instrument) {
            case 'kick':
                this.playKick(time);
                break;
            case 'snare':
                this.playSnare(time);
                break;
            case 'hihat':
                this.playHiHat(time);
                break;
            case 'clap':
                this.playClap(time);
                break;
        }
    }
}

// Global instance
const audioEngine = new AudioEngine();
