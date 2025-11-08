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
     * Play instrument by index
     */
    playInstrument(instrumentIndex, time = 0, volume = 1) {
        const instruments = ['kick', 'snare', 'hihat', 'clap', 'tom', 'openhat', 'bass', 'perc'];
        const instrument = instruments[instrumentIndex];

        switch(instrument) {
            case 'kick':
                this.playKick(time, volume);
                break;
            case 'snare':
                this.playSnare(time, volume);
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
            case 'perc':
                this.playPerc(time, volume);
                break;
        }
    }
}

// Global instance
const audioEngine = new AudioEngine();
