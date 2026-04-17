// Music.js - 8-bit Chiptune Music Generator using Web Audio API

class MusicManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentOscillators = [];
        this.currentGain = null;
        this.isMuted = false;
        this.currentTheme = 'woodland';
        this.isPlaying = false;
        this.playbackRate = 1.0;
        this.masterVolume = 0.15; // Lower volume for background music
        this.playbackSessionId = 0; // Invalidate older async theme loops

        // Note frequencies (C4 = 261.63 Hz)
        this.notes = {
            C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 391.99, A: 440, B: 493.88,
            'C#': 277.18, 'D#': 311.13, 'F#': 369.99, 'G#': 415.30, 'A#': 466.16,
            // Higher octaves
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880, 'B5': 987.77,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 391.99, 'A4': 440, 'B4': 493.88,
            // Lower octaves
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 195.99, 'A3': 220, 'B3': 246.94
        };

        this.themes = {
            woodland: {
                name: '🌲 8-bit Woodland',
                description: 'Retro chiptune melody'
            },
            zen: {
                name: '🧘 Zen Meditation',
                description: 'Calming lo-fi chiptune'
            },
            celtic: {
                name: '🎻 Celtic Jig',
                description: 'Energetic folk tune'
            },
            danceParty: {
                name: '🕺 Dance Party',
                description: 'High energy celebration'
            },
            victory: {
                name: '🏆 Victory Theme',
                description: 'Triumphant synth-pop finale'
            }
        };
    }

    // Ensure audio context is running (browser security requirement)
    ensureAudioContext() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(e => console.log('Audio context resume error:', e));
        }
    }

    // Play a single note
    playNote(frequency, duration, waveType = 'square', volume = 0.1) {
        if (this.isMuted) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gain.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);

        this.currentOscillators.push(osc);
        // Clean up completed oscillators
        setTimeout(() => {
            this.currentOscillators = this.currentOscillators.filter(o => o !== osc);
        }, duration * 1000);

        return { osc, gain };
    }

    // Play a sequence of notes
    async playSequence(noteSequence, bpm = 120, theme, sessionId, volumeMultiplier = 1) {
        const beatDuration = 60 / bpm / this.playbackRate; // In seconds

        for (let note of noteSequence) {
            if (
                !this.isPlaying ||
                (theme && this.currentTheme !== theme) ||
                sessionId !== this.playbackSessionId
            ) break;

            const freq = this.notes[note.pitch] || note.pitch;
            const duration = beatDuration * note.duration;

            this.playNote(
                freq,
                duration,
                note.waveType || 'square',
                (note.volume || 0.1) * volumeMultiplier
            );

            // Wait for note to finish
            await new Promise(resolve => setTimeout(resolve, duration * 1000 / this.playbackRate));
        }
    }

    // Wait helper that keeps playback session checks centralized.
    async waitForSession(ms, theme, sessionId) {
        await new Promise(resolve => setTimeout(resolve, ms));
        return this.isPlaying && this.currentTheme === theme && sessionId === this.playbackSessionId;
    }

    // Run a single looping track layer for the active theme/session.
    async playThemeLoop(theme, melody, bpm, sessionId, startDelayMs = 0, volumeMultiplier = 1) {
        if (startDelayMs > 0) {
            const stillActive = await this.waitForSession(startDelayMs, theme, sessionId);
            if (!stillActive) return;
        }

        while (
            this.isPlaying &&
            this.currentTheme === theme &&
            sessionId === this.playbackSessionId
        ) {
            await this.playSequence(melody, bpm, theme, sessionId, volumeMultiplier);
            if (
                !this.isPlaying ||
                this.currentTheme !== theme ||
                sessionId !== this.playbackSessionId
            ) break;
        }
    }

    // Woodland theme - cheerful retro chiptune
    woodlandMelody() {
        return [
            { pitch: 'E4', duration: 1, volume: 0.15 },
            { pitch: 'G4', duration: 1, volume: 0.15 },
            { pitch: 'E5', duration: 2, volume: 0.12 },
            { pitch: 'D5', duration: 1, volume: 0.15 },
            { pitch: 'E5', duration: 1, volume: 0.15 },
            { pitch: 'G4', duration: 2, volume: 0.12 },

            { pitch: 'C5', duration: 1, volume: 0.15 },
            { pitch: 'E4', duration: 1, volume: 0.15 },
            { pitch: 'G4', duration: 2, volume: 0.12 },
            { pitch: 'E4', duration: 1, volume: 0.15 },
            { pitch: 'G4', duration: 1, volume: 0.15 },
            { pitch: 'C5', duration: 2, volume: 0.12 },

            { pitch: 'B4', duration: 1, volume: 0.15 },
            { pitch: 'G4', duration: 1, volume: 0.15 },
            { pitch: 'E4', duration: 2, volume: 0.12 },
            { pitch: 'D4', duration: 2, volume: 0.15 },
            { pitch: 'E4', duration: 2, volume: 0.15 }
        ];
    }

    // Zen theme - calm, meditative
    zenMelody() {
        return [
            { pitch: 'A4', duration: 4, volume: 0.12 },
            { pitch: 'G4', duration: 2, volume: 0.12 },
            { pitch: 'E4', duration: 2, volume: 0.12 },
            { pitch: 'A4', duration: 4, volume: 0.12 },

            { pitch: 'A4', duration: 2, volume: 0.12 },
            { pitch: 'B4', duration: 2, volume: 0.12 },
            { pitch: 'C5', duration: 4, volume: 0.12 },
            { pitch: 'B4', duration: 2, volume: 0.12 },
            { pitch: 'A4', duration: 2, volume: 0.12 },

            { pitch: 'G4', duration: 4, volume: 0.12 },
            { pitch: 'E4', duration: 4, volume: 0.12 },
            { pitch: 'G4', duration: 2, volume: 0.12 },
            { pitch: 'A4', duration: 2, volume: 0.12 }
        ];
    }

    // Celtic theme - upbeat jig
    celticMelody() {
        return [
            { pitch: 'G4', duration: 0.5, volume: 0.15 },
            { pitch: 'A4', duration: 0.5, volume: 0.15 },
            { pitch: 'B4', duration: 1, volume: 0.15 },
            { pitch: 'A4', duration: 0.5, volume: 0.15 },
            { pitch: 'G4', duration: 0.5, volume: 0.15 },
            { pitch: 'E4', duration: 1, volume: 0.15 },

            { pitch: 'G4', duration: 0.5, volume: 0.15 },
            { pitch: 'A4', duration: 0.5, volume: 0.15 },
            { pitch: 'B4', duration: 0.5, volume: 0.15 },
            { pitch: 'C5', duration: 0.5, volume: 0.15 },
            { pitch: 'B4', duration: 1, volume: 0.15 },
            { pitch: 'A4', duration: 1, volume: 0.15 },

            { pitch: 'B4', duration: 0.5, volume: 0.15 },
            { pitch: 'C5', duration: 0.5, volume: 0.15 },
            { pitch: 'D5', duration: 1, volume: 0.15 },
            { pitch: 'C5', duration: 0.5, volume: 0.15 },
            { pitch: 'B4', duration: 0.5, volume: 0.15 },
            { pitch: 'A4', duration: 1, volume: 0.15 },

            { pitch: 'G4', duration: 1, volume: 0.15 },
            { pitch: 'A4', duration: 1, volume: 0.15 }
        ];
    }

    // Dance Party theme - upbeat celebration
    dancePartyMelody() {
        return [
            { pitch: 'C5', duration: 0.5, volume: 0.18 },
            { pitch: 'E5', duration: 0.5, volume: 0.18 },
            { pitch: 'G5', duration: 0.5, volume: 0.18 },
            { pitch: 'E5', duration: 0.5, volume: 0.18 },

            { pitch: 'A5', duration: 1, volume: 0.18 },
            { pitch: 'G5', duration: 1, volume: 0.18 },

            { pitch: 'F5', duration: 0.5, volume: 0.18 },
            { pitch: 'E5', duration: 0.5, volume: 0.18 },
            { pitch: 'D5', duration: 0.5, volume: 0.18 },
            { pitch: 'E5', duration: 0.5, volume: 0.18 },

            { pitch: 'C5', duration: 2, volume: 0.18 }
        ];
    }

    // Dance Party harmony layer - higher accents that answer the lead.
    dancePartyHarmonyMelody() {
        return [
            { pitch: 'E5', duration: 0.5, volume: 0.16, waveType: 'triangle' },
            { pitch: 'G5', duration: 0.5, volume: 0.16, waveType: 'triangle' },
            { pitch: 'B5', duration: 0.5, volume: 0.16, waveType: 'triangle' },
            { pitch: 'G5', duration: 0.5, volume: 0.16, waveType: 'triangle' },

            { pitch: 'C5', duration: 1, volume: 0.16, waveType: 'triangle' },
            { pitch: 'B5', duration: 1, volume: 0.16, waveType: 'triangle' },

            { pitch: 'A5', duration: 0.5, volume: 0.16, waveType: 'triangle' },
            { pitch: 'G5', duration: 0.5, volume: 0.16, waveType: 'triangle' },
            { pitch: 'F5', duration: 0.5, volume: 0.16, waveType: 'triangle' },
            { pitch: 'G5', duration: 0.5, volume: 0.16, waveType: 'triangle' },

            { pitch: 'E5', duration: 2, volume: 0.16, waveType: 'triangle' }
        ];
    }

    // Dance Party bass layer - steady pulse for groove and weight.
    dancePartyBassMelody() {
        return [
            { pitch: 'C3', duration: 1, volume: 0.17, waveType: 'sawtooth' },
            { pitch: 'C3', duration: 1, volume: 0.17, waveType: 'sawtooth' },
            { pitch: 'A3', duration: 1, volume: 0.17, waveType: 'sawtooth' },
            { pitch: 'A3', duration: 1, volume: 0.17, waveType: 'sawtooth' },
            { pitch: 'F3', duration: 1, volume: 0.17, waveType: 'sawtooth' },
            { pitch: 'G3', duration: 1, volume: 0.17, waveType: 'sawtooth' },
            { pitch: 'C3', duration: 2, volume: 0.17, waveType: 'sawtooth' }
        ];
    }

    // Victory lead - upbeat finale with confident melodic hooks.
    victoryLeadMelody() {
        return [
            { pitch: 'E4', duration: 0.5, volume: 0.18, waveType: 'square' },
            { pitch: 'G4', duration: 0.5, volume: 0.18, waveType: 'square' },
            { pitch: 'B4', duration: 1, volume: 0.18, waveType: 'square' },
            { pitch: 'G4', duration: 0.5, volume: 0.18, waveType: 'square' },
            { pitch: 'E4', duration: 0.5, volume: 0.18, waveType: 'square' },

            { pitch: 'A4', duration: 0.5, volume: 0.2, waveType: 'square' },
            { pitch: 'B4', duration: 0.5, volume: 0.2, waveType: 'square' },
            { pitch: 'C5', duration: 1, volume: 0.2, waveType: 'square' },
            { pitch: 'B4', duration: 0.5, volume: 0.2, waveType: 'square' },
            { pitch: 'A4', duration: 0.5, volume: 0.2, waveType: 'square' },

            { pitch: 'G4', duration: 0.5, volume: 0.18, waveType: 'square' },
            { pitch: 'E4', duration: 0.5, volume: 0.18, waveType: 'square' },
            { pitch: 'D4', duration: 1, volume: 0.18, waveType: 'square' },
            { pitch: 'E4', duration: 0.5, volume: 0.18, waveType: 'square' },
            { pitch: 'G4', duration: 0.5, volume: 0.18, waveType: 'square' },

            { pitch: 'C5', duration: 1, volume: 0.22, waveType: 'square' },
            { pitch: 'B4', duration: 1, volume: 0.22, waveType: 'square' },
            { pitch: 'A4', duration: 1, volume: 0.22, waveType: 'square' },
            { pitch: 'G4', duration: 1, volume: 0.22, waveType: 'square' }
        ];
    }

    // Victory bass - syncopated pulse for a celebratory winner groove.
    victoryBassMelody() {
        return [
            { pitch: 'E3', duration: 0.5, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'E3', duration: 0.5, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'B3', duration: 1, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'E3', duration: 1, volume: 0.18, waveType: 'sawtooth' },

            { pitch: 'A3', duration: 0.5, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'A3', duration: 0.5, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'E3', duration: 1, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'A3', duration: 1, volume: 0.18, waveType: 'sawtooth' },

            { pitch: 'G3', duration: 0.5, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'G3', duration: 0.5, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'D3', duration: 1, volume: 0.18, waveType: 'sawtooth' },
            { pitch: 'G3', duration: 1, volume: 0.18, waveType: 'sawtooth' }
        ];
    }

    // Victory chords - bright accents that reinforce the triumphant mood.
    victoryChordStabs() {
        return [
            { pitch: 'B4', duration: 0.5, volume: 0.14, waveType: 'triangle' },
            { pitch: 'E5', duration: 0.5, volume: 0.14, waveType: 'triangle' },
            { pitch: 'G5', duration: 1, volume: 0.14, waveType: 'triangle' },
            { pitch: 'E5', duration: 1, volume: 0.14, waveType: 'triangle' },

            { pitch: 'C5', duration: 0.5, volume: 0.14, waveType: 'triangle' },
            { pitch: 'E5', duration: 0.5, volume: 0.14, waveType: 'triangle' },
            { pitch: 'A5', duration: 1, volume: 0.14, waveType: 'triangle' },
            { pitch: 'E5', duration: 1, volume: 0.14, waveType: 'triangle' },

            { pitch: 'B4', duration: 0.5, volume: 0.14, waveType: 'triangle' },
            { pitch: 'D5', duration: 0.5, volume: 0.14, waveType: 'triangle' },
            { pitch: 'G5', duration: 1, volume: 0.14, waveType: 'triangle' },
            { pitch: 'D5', duration: 1, volume: 0.14, waveType: 'triangle' }
        ];
    }

    // Stop all current music
    stopAll() {
        this.playbackSessionId++;
        this.currentOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) { }
        });
        this.currentOscillators = [];
        this.isPlaying = false;
    }

    // Play a theme with looping
    async playTheme(theme) {
        if (!this.themes[theme]) return;

        this.ensureAudioContext(); // Resume audio context if suspended
        this.stopAll();
        const sessionId = this.playbackSessionId;
        this.currentTheme = theme;
        this.isPlaying = true;

        // Get the melody for this theme
        let melody;
        const bpm = this.getThemeBPM(theme);

        if (theme === 'woodland') melody = this.woodlandMelody();
        else if (theme === 'zen') melody = this.zenMelody();
        else if (theme === 'celtic') melody = this.celticMelody();
        else if (theme === 'danceParty') melody = this.dancePartyMelody();
        else if (theme === 'victory') melody = this.victoryLeadMelody();
        else return;

        // Woodland and Celtic intentionally use a delayed second layer for texture.
        if (theme === 'woodland') {
            this.playThemeLoop(theme, melody, bpm, sessionId, 0, 0.9);
            this.playThemeLoop(theme, melody, bpm, sessionId, 5000, 0.65);
            return;
        }

        // Zen intentionally uses three layers for a deeper ambient feel.
        if (theme === 'zen') {
            this.playThemeLoop(theme, melody, bpm, sessionId, 0, 0.85);
            this.playThemeLoop(theme, melody, bpm, sessionId, 3000, 0.6);
            this.playThemeLoop(theme, melody, bpm, sessionId, 9000, 0.45);
            return;
        }

        if (theme === 'celtic') {
            this.playThemeLoop(theme, melody, bpm, sessionId, 0, 0.9);
            this.playThemeLoop(theme, melody, bpm, sessionId, 5000, 0.65);
            return;
        }

        // Dance Party gets a 3-layer club mix: lead, harmony, and bass.
        if (theme === 'danceParty') {
            const harmonyMelody = this.dancePartyHarmonyMelody();
            const bassMelody = this.dancePartyBassMelody();

            this.playThemeLoop(theme, melody, bpm, sessionId, 0, 0.85);
            this.playThemeLoop(theme, harmonyMelody, bpm, sessionId, 2000, 0.55);
            this.playThemeLoop(theme, bassMelody, bpm, sessionId, 4000, 0.45);
            return;
        }

        if (theme === 'victory') {
            const bassMelody = this.victoryBassMelody();
            const chordMelody = this.victoryChordStabs();

            this.playThemeLoop(theme, melody, bpm, sessionId, 0, 0.9);
            this.playThemeLoop(theme, bassMelody, bpm, sessionId, 1000, 0.55);
            this.playThemeLoop(theme, chordMelody, bpm, sessionId, 2000, 0.5);
            return;
        }

        await this.playThemeLoop(theme, melody, bpm, sessionId);
    }

    // Get BPM for each theme
    getThemeBPM(theme) {
        const bpms = {
            woodland: 120,
            zen: 60,
            celtic: 140,
            danceParty: 160,
            victory: 128
        };
        return bpms[theme] || 120;
    }

    // Toggle mute
    toggleMute(isMuted) {
        this.isMuted = isMuted;
    }

    // Adjust difficulty (speed up music)
    setDifficulty(level) {
        this.playbackRate = 1 + ((level - 1) * 0.08);
        this.playbackRate = Math.min(this.playbackRate, 1.5);
    }

    // Get all themes
    getThemes() {
        return this.themes;
    }

    // Pause music playback
    pauseMusic() {
        this.stopAll();
    }

    // Resume music playback
    resumeMusic() {
        if (!this.isMuted) {
            this.playTheme(this.currentTheme); // Restart the theme
        }
    }
}

// Initialize music manager
const musicManager = new MusicManager();
