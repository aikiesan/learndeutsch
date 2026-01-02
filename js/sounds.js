// Sound Effects Manager for LearnDeutsch
// Uses Web Audio API for responsive feedback sounds

class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.sounds = {};
        this.init();
    }

    init() {
        // Check user preference
        const soundPref = localStorage.getItem('soundEffects');
        this.enabled = soundPref !== 'false';

        // Initialize on first user interaction
        document.addEventListener('click', () => this.initAudioContext(), { once: true });
        document.addEventListener('touchstart', () => this.initAudioContext(), { once: true });
    }

    initAudioContext() {
        if (this.audioContext) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Sound system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    toggle(enabled) {
        this.enabled = enabled;
        localStorage.setItem('soundEffects', enabled);
    }

    // Generate sounds programmatically (no external files needed)
    play(type) {
        if (!this.enabled || !this.audioContext) return;

        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        switch(type) {
            case 'correct':
                this.playCorrect();
                break;
            case 'wrong':
                this.playWrong();
                break;
            case 'click':
                this.playClick();
                break;
            case 'select':
                this.playSelect();
                break;
            case 'streak':
                this.playStreak();
                break;
            case 'levelUp':
                this.playLevelUp();
                break;
            case 'celebration':
                this.playCelebration();
                break;
            case 'whoosh':
                this.playWhoosh();
                break;
            case 'pop':
                this.playPop();
                break;
        }
    }

    // Correct answer - happy rising tone
    playCorrect() {
        const now = this.audioContext.currentTime;

        // Two-note rising melody
        [523.25, 659.25].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.25);
        });
    }

    // Wrong answer - descending tone
    playWrong() {
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Button click - subtle tap
    playClick() {
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 800;

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Option selection - gentle blip
    playSelect() {
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 600;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Streak achieved - triumphant chord
    playStreak() {
        const now = this.audioContext.currentTime;
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)

        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
            gain.gain.setValueAtTime(0.15, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(now);
            osc.stop(now + 0.6);
        });
    }

    // Level up - ascending arpeggio
    playLevelUp() {
        const now = this.audioContext.currentTime;
        const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.35);
        });
    }

    // Celebration - sparkly effect
    playCelebration() {
        const now = this.audioContext.currentTime;

        // Multiple sparkle sounds
        for (let i = 0; i < 5; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = 1000 + Math.random() * 1500;

            const startTime = now + i * 0.1 + Math.random() * 0.05;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
        }
    }

    // Whoosh - transition sound
    playWhoosh() {
        const now = this.audioContext.currentTime;

        // White noise filtered
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        filter.Q.value = 2;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        noise.start(now);
        noise.stop(now + 0.2);
    }

    // Pop - bubble pop effect
    playPop() {
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }
}

// Initialize global sound manager
window.soundManager = new SoundManager();
