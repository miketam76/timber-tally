// Storage.js - Handle localStorage for leaderboard and high scores

class GameStorage {
    constructor() {
        this.leaderboardKey = 'Stacker_leaderboard';
        this.maxScores = 10;
    }

    // Get all high scores (sorted by score, descending)
    getLeaderboard() {
        const data = localStorage.getItem(this.leaderboardKey);
        return data ? JSON.parse(data) : [];
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
