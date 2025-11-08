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
     * RIDE CYMBAL
     */
    playRide(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const noise = this.createNoise(t, 0.8, 0.2 * volume);

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 6000;
        bandpass.Q.value = 2;

        noise.gain.connect(bandpass);
        bandpass.connect(this.masterGain);
    }

    /**
     * 808 SNARE
     */
    play808Snare(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Tonal component
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'triangle';
        osc1.frequency.value = 185;
        osc2.frequency.value = 225;

        oscGain.gain.setValueAtTime(0.5 * volume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.masterGain);

        // Noise component
        const noise = this.createNoise(t, 0.1, 0.3 * volume);

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 2000;

        noise.gain.connect(highpass);
        highpass.connect(this.masterGain);

        osc1.start(t);
        osc1.stop(t + 0.1);
        osc2.start(t);
        osc2.stop(t + 0.1);
    }

    /**
     * BONGO
     */
    playBongo(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.05);

        oscGain.gain.setValueAtTime(volume * 0.6, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.15);
    }

    /**
     * CONGA
     */
    playConga(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

        oscGain.gain.setValueAtTime(volume * 0.7, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.2);
    }

    /**
     * TIMBALE
     */
    playTimbale(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = 350;

        oscGain.gain.setValueAtTime(volume * 0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        // Add some noise for metallic sound
        const noise = this.createNoise(t, 0.12, 0.15 * volume);
        noise.gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.12);
    }

    /**
     * FM BASS
     */
    playFMBass(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Carrier
        const carrier = ctx.createOscillator();
        const carrierGain = ctx.createGain();

        // Modulator
        const modulator = ctx.createOscillator();
        const modulatorGain = ctx.createGain();

        carrier.frequency.value = 55; // A1
        modulator.frequency.value = 110; // 2x carrier

        modulatorGain.gain.setValueAtTime(100, t);
        modulatorGain.gain.exponentialRampToValueAtTime(10, t + 0.3);

        carrierGain.gain.setValueAtTime(volume * 0.8, t);
        carrierGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        modulator.connect(modulatorGain);
        modulatorGain.connect(carrier.frequency);
        carrier.connect(carrierGain);
        carrierGain.connect(this.masterGain);

        carrier.start(t);
        carrier.stop(t + 0.4);
        modulator.start(t);
        modulator.stop(t + 0.4);
    }

    /**
     * LEAD SYNTH
     */
    playLead(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 440; // A4

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, t);
        filter.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        filter.Q.value = 8;

        oscGain.gain.setValueAtTime(volume * 0.4, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.25);
    }

    /**
     * PAD SYNTH
     */
    playPad(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Multiple detuned oscillators for thick pad sound
        const oscs = [];
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const detunes = [-7, 0, 7]; // Cents
        detunes.forEach(detune => {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = 220; // A3
            osc.detune.value = detune;
            osc.connect(oscGain);
            oscs.push(osc);
        });

        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        oscGain.gain.setValueAtTime(volume * 0.15, t);
        oscGain.gain.linearRampToValueAtTime(volume * 0.25, t + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

        oscGain.connect(filter);
        filter.connect(this.masterGain);

        oscs.forEach(osc => {
            osc.start(t);
            osc.stop(t + 0.8);
        });
    }

    /**
     * BELL SYNTH
     */
    playBell(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Multiple harmonics for bell sound
        const freqs = [523, 1046, 1568]; // C5 and harmonics
        const oscs = [];
        const gains = [];

        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const vol = volume * (1 / (i + 1)) * 0.3;
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);

            osc.connect(gain);
            gain.connect(this.masterGain);

            oscs.push(osc);
            gains.push(gain);
        });

        oscs.forEach(osc => {
            osc.start(t);
            osc.stop(t + 1.0);
        });
    }

    /**
     * ZAP/LASER
     */
    playZap(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

        oscGain.gain.setValueAtTime(volume * 0.4, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.1);
    }

    /**
     * BLIP
     */
    playBlip(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 1000;

        oscGain.gain.setValueAtTime(volume * 0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    /**
     * NOISE BURST
     */
    playNoiseBurst(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const noise = this.createNoise(t, 0.06, 0.3 * volume);
        noise.gain.connect(this.masterGain);
    }

    /**
     * CHORD STAB
     */
    playChord(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        // Major chord (C - E - G)
        const freqs = [261.63, 329.63, 392.00];
        const oscs = [];

        freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(volume * 0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + 0.3);
            oscs.push(osc);
        });
    }

    /**
     * VOCAL SYNTH (formant-like)
     */
    playVocal(time = 0, volume = 1) {
        const ctx = this.audioContext;
        const t = time || ctx.currentTime;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        // Formant filters
        const filter1 = ctx.createBiquadFilter();
        const filter2 = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 110;

        filter1.type = 'bandpass';
        filter1.frequency.value = 800;
        filter1.Q.value = 10;

        filter2.type = 'bandpass';
        filter2.frequency.value = 1200;
        filter2.Q.value = 10;

        oscGain.gain.setValueAtTime(volume * 0.3, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        osc.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.4);
    }

    /**
     * Play instrument by name
     */
    playInstrumentByName(instrumentName, time = 0, volume = 1) {
        switch(instrumentName) {
            // Kicks
            case 'kick':
                this.playKick(time, volume);
                break;
            case '808-kick':
                this.play808Kick(time, volume);
                break;
            case 'hard-kick':
                this.playHardKick(time, volume);
                break;
            // Snares
            case 'snare':
                this.playSnare(time, volume);
                break;
            case 'punchy-snare':
                this.playPunchySnare(time, volume);
                break;
            case '808-snare':
                this.play808Snare(time, volume);
                break;
            // Hats & Cymbals
            case 'hihat':
                this.playHiHat(time, volume);
                break;
            case 'openhat':
                this.playOpenHiHat(time, volume);
                break;
            case 'crash':
                this.playCrash(time, volume);
                break;
            case 'ride':
                this.playRide(time, volume);
                break;
            // Percussion
            case 'clap':
                this.playClap(time, volume);
                break;
            case 'tom':
                this.playTom(time, volume);
                break;
            case 'rimshot':
                this.playRimshot(time, volume);
                break;
            case 'cowbell':
                this.playCowbell(time, volume);
                break;
            case 'bongo':
                this.playBongo(time, volume);
                break;
            case 'conga':
                this.playConga(time, volume);
                break;
            case 'timbale':
                this.playTimbale(time, volume);
                break;
            case 'perc':
                this.playPerc(time, volume);
                break;
            // Bass
            case 'bass':
                this.playBass(time, volume);
                break;
            case 'sub-bass':
                this.playSubBass(time, volume);
                break;
            case 'reese-bass':
                this.playReeseBass(time, volume);
                break;
            case 'acid-bass':
                this.playAcidBass(time, volume);
                break;
            case 'fm-bass':
                this.playFMBass(time, volume);
                break;
            // Synths
            case 'stab':
                this.playStab(time, volume);
                break;
            case 'pluck':
                this.playPluck(time, volume);
                break;
            case 'lead':
                this.playLead(time, volume);
                break;
            case 'pad':
                this.playPad(time, volume);
                break;
            case 'bell':
                this.playBell(time, volume);
                break;
            case 'chord':
                this.playChord(time, volume);
                break;
            case 'vocal':
                this.playVocal(time, volume);
                break;
            // FX
            case 'zap':
                this.playZap(time, volume);
                break;
            case 'blip':
                this.playBlip(time, volume);
                break;
            case 'noise':
                this.playNoiseBurst(time, volume);
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

// Available instruments list (grouped by category)
const AVAILABLE_INSTRUMENTS = [
    {
        category: 'Kicks',
        instruments: [
            { name: 'kick', displayName: 'Kick' },
            { name: '808-kick', displayName: '808 Kick' },
            { name: 'hard-kick', displayName: 'Hard Kick' }
        ]
    },
    {
        category: 'Snares',
        instruments: [
            { name: 'snare', displayName: 'Snare' },
            { name: 'punchy-snare', displayName: 'Punchy Snare' },
            { name: '808-snare', displayName: '808 Snare' }
        ]
    },
    {
        category: 'Hats & Cymbals',
        instruments: [
            { name: 'hihat', displayName: 'Hi-Hat' },
            { name: 'openhat', displayName: 'Open HH' },
            { name: 'crash', displayName: 'Crash' },
            { name: 'ride', displayName: 'Ride' }
        ]
    },
    {
        category: 'Percussion',
        instruments: [
            { name: 'clap', displayName: 'Clap' },
            { name: 'tom', displayName: 'Tom' },
            { name: 'rimshot', displayName: 'Rimshot' },
            { name: 'cowbell', displayName: 'Cowbell' },
            { name: 'bongo', displayName: 'Bongo' },
            { name: 'conga', displayName: 'Conga' },
            { name: 'timbale', displayName: 'Timbale' },
            { name: 'perc', displayName: 'Shaker' }
        ]
    },
    {
        category: 'Bass',
        instruments: [
            { name: 'bass', displayName: 'Bass' },
            { name: 'sub-bass', displayName: 'Sub Bass' },
            { name: 'reese-bass', displayName: 'Reese Bass' },
            { name: 'acid-bass', displayName: 'Acid Bass' },
            { name: 'fm-bass', displayName: 'FM Bass' }
        ]
    },
    {
        category: 'Synths',
        instruments: [
            { name: 'stab', displayName: 'Stab' },
            { name: 'pluck', displayName: 'Pluck' },
            { name: 'lead', displayName: 'Lead' },
            { name: 'pad', displayName: 'Pad' },
            { name: 'bell', displayName: 'Bell' },
            { name: 'chord', displayName: 'Chord' },
            { name: 'vocal', displayName: 'Vocal' }
        ]
    },
    {
        category: 'FX',
        instruments: [
            { name: 'zap', displayName: 'Zap' },
            { name: 'blip', displayName: 'Blip' },
            { name: 'noise', displayName: 'Noise' }
        ]
    }
];
