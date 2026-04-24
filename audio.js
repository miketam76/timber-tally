// audio.js - 1800s Timber Tally Sound Effects

class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;
    }

    // UPDATED: A "Pluck/Mechanical" sound instead of a "Sine" beep
    playEffect(frequency, duration, type = 'triangle', volume = 0.2) {
        if (this.isMuted) return;

        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = type; // Triangle is "thumpier" and more organic than Sine
            osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(volume, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(now);
            osc.stop(now + duration / 1000);
        } catch (e) { }
    }

    // Movement: Sounds like a wooden gear click
    playSoundMove() {
        this.playEffect(150, 40, 'square', 0.05);
    }

    // Rotation: A slightly higher mechanical click
    playSoundRotate() {
        this.playEffect(300, 40, 'square', 0.05);
    }

    // Lock: The heavy "thud" of a log hitting the pile
    playSoundLock() {
        this.playEffect(100, 150, 'triangle', 0.3);
    }

    // Line Clear: The "Shimmer" of a saw blade
    playSoundLineClear() {
        this.playEffect(800, 200, 'sawtooth', 0.15);
        setTimeout(() => this.playEffect(1200, 150, 'sawtooth', 0.1), 50);
    }

    // Stacker (4 lines): The "Timber!" moment
    playSoundStacker() {
        // Ascending slide like a celebratory whistle
        let f = 400;
        for (let i = 0; i < 4; i++) {
            setTimeout(() => this.playEffect(f + (i * 200), 150, 'sawtooth', 0.2), i * 100);
        }
    }

    // Game Over: Steam whistle powering down
    playSoundGameOver() {
        if (this.isMuted) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            // Frequency slides down (the "power down" effect)
            osc.frequency.exponentialRampToValueAtTime(100, now + 1.0);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.0);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.start();
            osc.stop(now + 1.0);
        } catch (e) { }
    }

    // Intro contract handshake: two short wooden/chime taps.
    playSoundHandshake() {
        this.playEffect(360, 70, 'triangle', 0.1);
        setTimeout(() => this.playEffect(520, 85, 'triangle', 0.1), 65);
    }

    // Shipment departure cue with stronger tone for larger clears.
    playSoundShipment(linesCount = 1) {
        const baseFrequency = linesCount >= 3 ? 220 : 280;
        const baseVolume = linesCount >= 3 ? 0.16 : 0.12;
        this.playEffect(baseFrequency, 90, 'sawtooth', baseVolume);
        setTimeout(() => this.playEffect(baseFrequency + 140, 95, 'triangle', baseVolume * 0.9), 85);
        setTimeout(() => this.playEffect(baseFrequency + 260, 120, 'triangle', baseVolume * 0.85), 175);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}

const audioManager = new AudioManager();
