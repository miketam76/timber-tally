// Audio.js - Sound effects using Web Audio API

class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;
    }

    // Play a simple beep sound
    playBeep(frequency = 800, duration = 100, volume = 0.3) {
        if (this.isMuted) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            // Audio context errors are silently ignored
        }
    }

    // Sound for piece movement (low beep)
    playSoundMove() {
        this.playBeep(400, 50, 0.1);
    }

    // Sound for piece locked/placed
    playSoundLock() {
        this.playBeep(600, 150, 0.2);
    }

    // Sound for line clear (higher pitch)
    playSoundLineClear() {
        this.playBeep(1000, 200, 0.3);
    }

    // Sound for Stacker (4-line clear - special!)
    playSoundStacker() {
        // Play ascending notes for Stacker
        this.playBeep(800, 100, 0.3);
        setTimeout(() => this.playBeep(1000, 100, 0.3), 120);
        setTimeout(() => this.playBeep(1200, 100, 0.3), 240);
        setTimeout(() => this.playBeep(1400, 200, 0.3), 360);
    }

    // Sound for game over
    playSoundGameOver() {
        this.playBeep(300, 300, 0.3);
    }

    // Sound for rotation
    playSoundRotate() {
        this.playBeep(500, 80, 0.15);
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}

const audioManager = new AudioManager();
