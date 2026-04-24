/* music.js - 1800s Timber Tally Edition */

class MusicManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentOscillators = [];
        this.isMuted = false;
        this.currentTheme = 'morningWhistle';
        this.isPlaying = false;
        this.playbackRate = 1.0;
        this.masterVolume = 0.15;
        this.playbackSessionId = 0;

        this.notes = {
            'G2': 98.00,
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 195.99, 'A3': 220, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 391.99, 'A4': 440, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880, 'B5': 987.77
        };

        this.themes = {
            morningWhistle: { name: '🎹 Morning Whistle', description: 'Early morning Ragtime' },
            riverJig: { name: '🎻 River Driver Jig', description: 'Energetic logging folk' },
            sawmillScramble: { name: '⚙️ Sawmill Scramble', description: 'Fast Stride Piano' },
            victory: { name: '🏆 Contract Complete', description: 'Triumphant closing fanfare' }
        };

        // Keep backward compatibility with legacy UI theme keys.
        this.themeAliases = {
            woodland: 'morningWhistle',
            zen: 'riverJig',
            celtic: 'sawmillScramble'
        };
    }

    ensureAudioContext() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // UPDATED: Added the "Pluck" envelope for a 19th-century acoustic feel
    playNote(frequency, duration, waveType = 'square', volume = 0.1) {
        if (this.isMuted) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        const now = this.audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        // Sharp attack (hammer hit)
        gain.gain.linearRampToValueAtTime(volume * this.masterVolume, now + 0.01);
        // Natural decay (string vibration)
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + duration);

        this.currentOscillators.push(osc);
        return { osc, gain };
    }

    // --- NEW 1800s MELODIES ---

    // Ragtime Style: Bouncy and Syncopated
    morningWhistleMelody() {
        return [
            { pitch: 'C4', duration: 1, volume: 0.18 },
            { pitch: 'E4', duration: 0.5, volume: 0.15 },
            { pitch: 'G4', duration: 0.5, volume: 0.18 },
            { pitch: 'C5', duration: 1, volume: 0.2 },
            { pitch: 'A4', duration: 0.5, volume: 0.15 },
            { pitch: 'G4', duration: 0.5, volume: 0.15 },
            { pitch: 'E4', duration: 1, volume: 0.12 },
            { pitch: 'D4', duration: 1, volume: 0.15 },
            { pitch: 'C4', duration: 1, volume: 0.18 }
        ];
    }

    // Folk Jig Style: Fast 6/8 feel
    riverJigMelody() {
        return [
            { pitch: 'G4', duration: 0.5, volume: 0.15, waveType: 'sawtooth' },
            { pitch: 'A4', duration: 0.5, volume: 0.15, waveType: 'sawtooth' },
            { pitch: 'B4', duration: 0.5, volume: 0.15, waveType: 'sawtooth' },
            { pitch: 'G4', duration: 1, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'D5', duration: 1, volume: 0.2, waveType: 'sawtooth' },
            { pitch: 'B4', duration: 0.5, volume: 0.15, waveType: 'sawtooth' },
            { pitch: 'A4', duration: 0.5, volume: 0.15, waveType: 'sawtooth' },
            { pitch: 'G4', duration: 1, volume: 0.18, waveType: 'sawtooth' }
        ];
    }

    // Stride Piano: Frantic and Industrial
    sawmillScrambleMelody() {
        return [
            { pitch: 'C5', duration: 0.5, volume: 0.2 },
            { pitch: 'G4', duration: 0.5, volume: 0.18 },
            { pitch: 'E4', duration: 0.5, volume: 0.18 },
            { pitch: 'C4', duration: 0.5, volume: 0.18 },
            { pitch: 'A4', duration: 1, volume: 0.22 },
            { pitch: 'G4', duration: 1, volume: 0.22 }
        ];
    }

    sawmillBass() {
        return [
            { pitch: 'C3', duration: 1, volume: 0.2, waveType: 'triangle' },
            { pitch: 'G2', duration: 1, volume: 0.2, waveType: 'triangle' },
            { pitch: 'C3', duration: 1, volume: 0.2, waveType: 'triangle' },
            { pitch: 'G2', duration: 1, volume: 0.2, waveType: 'triangle' }
        ];
    }

    victoryMelody() {
        return [
            { pitch: 'C4', duration: 0.75, volume: 0.2, waveType: 'triangle' },
            { pitch: 'E4', duration: 0.75, volume: 0.2, waveType: 'triangle' },
            { pitch: 'G4', duration: 0.75, volume: 0.2, waveType: 'triangle' },
            { pitch: 'C5', duration: 1.5, volume: 0.24, waveType: 'triangle' },
            { pitch: 'G4', duration: 0.5, volume: 0.18, waveType: 'triangle' },
            { pitch: 'C5', duration: 1.25, volume: 0.22, waveType: 'triangle' }
        ];
    }

    resolveTheme(theme) {
        if (this.themes[theme]) return theme;
        return this.themeAliases[theme] || null;
    }

    async playTheme(theme) {
        const resolvedTheme = this.resolveTheme(theme);
        if (!resolvedTheme) return;

        this.ensureAudioContext();
        this.stopAll();
        const sessionId = this.playbackSessionId;
        this.currentTheme = resolvedTheme;
        this.isPlaying = true;

        const bpm = resolvedTheme === 'sawmillScramble' ? 150 : (resolvedTheme === 'victory' ? 112 : 120);

        if (resolvedTheme === 'morningWhistle') {
            this.playThemeLoop(resolvedTheme, this.morningWhistleMelody(), bpm, sessionId);
        } else if (resolvedTheme === 'riverJig') {
            this.playThemeLoop(resolvedTheme, this.riverJigMelody(), bpm, sessionId);
        } else if (resolvedTheme === 'sawmillScramble') {
            this.playThemeLoop(resolvedTheme, this.sawmillScrambleMelody(), bpm, sessionId);
            this.playThemeLoop(resolvedTheme, this.sawmillBass(), bpm, sessionId);
        } else if (resolvedTheme === 'victory') {
            this.playThemeLoop(resolvedTheme, this.victoryMelody(), bpm, sessionId);
        }
    }

    // (Remaining utility functions: stopAll, playSequence, playThemeLoop, etc. remain unchanged)
    stopAll() {
        this.playbackSessionId++;
        this.currentOscillators.forEach(osc => { try { osc.stop(); } catch (e) { } });
        this.currentOscillators = [];
        this.isPlaying = false;
    }

    pauseMusic() {
        this.stopAll();
    }

    resumeMusic() {
        if (this.isMuted) return;
        this.playTheme(this.currentTheme);
    }

    toggleMute(nextState) {
        this.isMuted = typeof nextState === 'boolean' ? nextState : !this.isMuted;
        if (this.isMuted) {
            this.stopAll();
        }
        return this.isMuted;
    }

    setDifficulty(level) {
        this.playbackRate = 1 + ((level - 1) * 0.08);
        this.playbackRate = Math.min(this.playbackRate, 1.5);
    }

    async playSequence(noteSequence, bpm, theme, sessionId) {
        const beatDuration = 60 / bpm / this.playbackRate;
        for (let note of noteSequence) {
            if (!this.isPlaying || sessionId !== this.playbackSessionId) break;
            const freq = this.notes[note.pitch] || note.pitch;
            this.playNote(freq, beatDuration * note.duration, note.waveType || 'square', note.volume || 0.1);
            await new Promise(r => setTimeout(r, beatDuration * note.duration * 1000));
        }
    }

    async playThemeLoop(theme, melody, bpm, sessionId) {
        while (this.isPlaying && sessionId === this.playbackSessionId) {
            await this.playSequence(melody, bpm, theme, sessionId);
        }
    }
}

const musicManager = new MusicManager();
