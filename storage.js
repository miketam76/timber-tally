// Storage.js - Handle localStorage for leaderboard and high scores

class GameStorage {
    constructor() {
        // New canonical key for this project. Legacy key is preserved for migration.
        this.leaderboardKey = 'TimberTally_leaderboard';
        this.legacyKey = 'Stacker_leaderboard';
        this.maxScores = 10;
    }

    // Get all high scores (sorted by score, descending)
    getLeaderboard() {
        // Prefer the new key. If absent but a legacy key exists, migrate it.
        const data = localStorage.getItem(this.leaderboardKey);
        if (data) return JSON.parse(data);

        try {
            const legacy = localStorage.getItem(this.legacyKey);
            if (legacy) {
                // Migrate legacy leaderboard to the new key and keep data intact.
                localStorage.setItem(this.leaderboardKey, legacy);
                // Optionally remove legacy key to avoid confusion; keep for safety commented.
                // localStorage.removeItem(this.legacyKey);
                return JSON.parse(legacy);
            }
        } catch (e) {
            // If parsing fails, fall through to return empty array
        }

        return [];
    }

    // Save a new score to leaderboard
    saveScore(score, level) {
        const leaderboard = this.getLeaderboard();

        const newEntry = {
            score: score,
            level: level || 1,
            date: new Date().toLocaleString()
        };

        leaderboard.push(newEntry);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(this.maxScores); // Keep only top 10

        localStorage.setItem(this.leaderboardKey, JSON.stringify(leaderboard));

        return leaderboard;
    }

    // Check if score qualifies for leaderboard
    isHighScore(score) {
        const leaderboard = this.getLeaderboard();
        if (leaderboard.length < this.maxScores) return true;
        return score > leaderboard[leaderboard.length - 1].score;
    }

    // Clear all scores (for testing)
    clearLeaderboard() {
        localStorage.removeItem(this.leaderboardKey);
    }
}

const gameStorage = new GameStorage();
