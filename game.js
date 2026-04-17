// Game.js - Core game logic for Stacker

class Game {
    constructor() {
        // Game constants
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 30;

        // Game state
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.maxLevel = 30;
        this.linesCleared = 0;
        this.currentLevelLines = 0;
        this.linesToNextLevel = 10;
        this.gameOver = false;
        this.gameWon = false;
        this.paused = false;
        this.isDancing = false;
        this.onDanceStart = null;
        this.onDanceEnd = null;

        // Game timing
        this.dropInterval = 800; // ms between automatic drops
        this.lastDropTime = 0;
        this.gameLoopId = null;
        this.softDropActive = false; // Track if soft drop is active

        // Visual effects
        this.lastPlacedPiece = null; // Track last placed piece for flash effect
        this.lastPlacedTime = 0;
        this.lastClearedLines = [];
        this.lastClearedTime = 0;
        this.isDropping = false; // For drop animation
        this.lastClearMessage = null; // Track line clear message
        this.lastClearMessageTime = 0;

        // Start paused until player clicks "Start Game"
        this.paused = true;

        // Tetromino definitions (with colors and rotation states)
        this.tetrominoes = {
            I: {
                color: '#00ffff',
                shapes: [
                    [[1, 1, 1, 1]],
                    [[1], [1], [1], [1]]
                ]
            },
            O: {
                color: '#ffff00',
                shapes: [
                    [[1, 1], [1, 1]]
                ]
            },
            T: {
                color: '#ff00ff',
                shapes: [
                    [[1, 1, 1], [0, 1, 0]],
                    [[0, 1], [1, 1], [0, 1]],
                    [[0, 1, 0], [1, 1, 1]],
                    [[1, 0], [1, 1], [1, 0]]
                ]
            },
            S: {
                color: '#00ff00',
                shapes: [
                    [[0, 1, 1], [1, 1, 0]],
                    [[1, 0], [1, 1], [0, 1]]
                ]
            },
            Z: {
                color: '#ff0000',
                shapes: [
                    [[1, 1, 0], [0, 1, 1]],
                    [[0, 1], [1, 1], [1, 0]]
                ]
            },
            J: {
                color: '#0000ff',
                shapes: [
                    [[1, 0, 0], [1, 1, 1]],
                    [[1, 1], [1, 0], [1, 0]],
                    [[1, 1, 1], [0, 0, 1]],
                    [[1, 0], [1, 0], [1, 1]]
                ]
            },
            L: {
                color: '#ff8800',
                shapes: [
                    [[0, 0, 1], [1, 1, 1]],
                    [[1, 0], [1, 0], [1, 1]],
                    [[1, 1, 1], [1, 0, 0]],
                    [[1, 1], [0, 1], [0, 1]]
                ]
            }
        };

        this.initializeBoard();
        this.currentPiece = this.createNewPiece();
        this.nextPiece = this.createNewPiece();
    }

    // Initialize empty board
    initializeBoard() {
        this.board = [];
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.board[y][x] = null;
            }
        }
    }

    // Create a random tetromino piece
    createNewPiece() {
        const keys = Object.keys(this.tetrominoes);
        const randomType = keys[Math.floor(Math.random() * keys.length)];
        const tetromino = this.tetrominoes[randomType];

        return {
            type: randomType,
            color: tetromino.color,
            shapes: tetromino.shapes,
            rotation: 0,
            x: Math.floor(this.BOARD_WIDTH / 2) - 2,
            y: 0
        };
    }

    // Get lowest Y position for ghost piece
    getGhostPieceY() {
        let lowestY = this.currentPiece.y;
        while (!this.checkCollision(this.currentPiece, this.currentPiece.x, lowestY + 1, this.currentPiece.rotation)) {
            lowestY++;
        }
        return lowestY;
    }

    // Get current shape of piece based on rotation
    getCurrentShape() {
        const shape = this.currentPiece.shapes[this.currentPiece.rotation % this.currentPiece.shapes.length];
        return shape;
    }

    // Check collision between piece and board
    checkCollision(piece, newX, newY, rotation) {
        const shape = piece.shapes[rotation % piece.shapes.length];

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 0) continue;

                const boardX = newX + x;
                const boardY = newY + y;

                // Check boundaries
                if (boardX < 0 || boardX >= this.BOARD_WIDTH || boardY >= this.BOARD_HEIGHT) {
                    return true;
                }

                // Check collision with placed pieces
                if (boardY >= 0 && this.board[boardY][boardX] !== null) {
                    return true;
                }
            }
        }

        return false;
    }

    // Move piece left
    movePieceLeft() {
        if (!this.currentPiece || this.paused || this.gameOver) return;
        if (!this.checkCollision(this.currentPiece, this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.rotation)) {
            this.currentPiece.x--;
            audioManager.playSoundMove();
        }
    }

    // Move piece right
    movePieceRight() {
        if (!this.currentPiece || this.paused || this.gameOver) return;
        if (!this.checkCollision(this.currentPiece, this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.rotation)) {
            this.currentPiece.x++;
            audioManager.playSoundMove();
        }
    }

    // Rotate piece
    rotatePiece() {
        if (!this.currentPiece || this.paused || this.gameOver) return;
        const newRotation = (this.currentPiece.rotation + 1) % this.currentPiece.shapes.length;

        if (!this.checkCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y, newRotation)) {
            this.currentPiece.rotation = newRotation;
            audioManager.playSoundRotate();
        }
    }

    // Soft drop - accelerate falling (gradual, not instant)
    startSoftDrop() {
        this.softDropActive = true;
        this.isDropping = true;
    }

    // End soft drop
    endSoftDrop() {
        this.softDropActive = false;
        this.isDropping = false;
    }

    // Hard drop - instant to bottom (for spacebar or other control)
    dropPieceToBottom() {
        if (!this.currentPiece || this.paused || this.gameOver) return;
        while (!this.checkCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
            this.currentPiece.y++;
        }
    }

    // Place piece on board
    placePiece() {
        const shape = this.getCurrentShape();

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 0) continue;

                const boardX = this.currentPiece.x + x;
                const boardY = this.currentPiece.y + y;

                if (boardY >= 0 && boardY < this.BOARD_HEIGHT && boardX >= 0 && boardX < this.BOARD_WIDTH) {
                    this.board[boardY][boardX] = this.currentPiece.color;
                }
            }
        }

        // Track when piece was placed for visual effect
        this.lastPlacedPiece = {
            x: this.currentPiece.x,
            y: this.currentPiece.y,
            color: this.currentPiece.color,
            shape: shape
        };
        this.lastPlacedTime = Date.now();

        audioManager.playSoundLock();

        // Check for line clears
        this.clearLines();

        // Get next piece
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createNewPiece();

        // Check for game over
        if (this.checkCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y, this.currentPiece.rotation)) {
            this.gameOver = true;
            audioManager.playSoundGameOver();
        }
    }

    // Clear completed lines and award points
    clearLines() {
        const linesCleared = [];

        // Find completed lines
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            const isLineFull = this.board[y].every(cell => cell !== null);
            if (isLineFull) {
                linesCleared.push(y);
            }
        }

        if (linesCleared.length === 0) return;

        // Track cleared lines for visual effect
        this.lastClearedLines = linesCleared;
        this.lastClearedTime = Date.now();

        // Sort in descending order to avoid index shifting issues
        // We must delete from bottom to top so indices don't change
        linesCleared.sort((a, b) => b - a);

        // Remove cleared lines starting from bottom
        linesCleared.forEach(y => {
            this.board.splice(y, 1);
        });

        // Add new empty lines at the top for each cleared line
        for (let i = 0; i < linesCleared.length; i++) {
            this.board.unshift(new Array(this.BOARD_WIDTH).fill(null));
        }

        // Award points based on Stacker bonus
        const pointsPerLine = {
            1: 40,
            2: 100,
            3: 300,
            4: 1200 // Stacker bonus!
        };

        const pointsAwarded = pointsPerLine[linesCleared.length] || 0;
        this.score += pointsAwarded;
        this.linesCleared += linesCleared.length;
        this.currentLevelLines += linesCleared.length;

        // Create line clear message
        let message = '';
        if (linesCleared.length === 1) {
            message = '1 LINE CLEARED';
        } else if (linesCleared.length === 2) {
            message = '2 LINES CLEARED';
        } else if (linesCleared.length === 3) {
            message = '3 LINES CLEARED';
        } else if (linesCleared.length === 4) {
            message = 'STACKER!';
        }

        this.lastClearMessage = {
            text: message,
            linesCount: linesCleared.length,
            points: pointsAwarded
        };
        this.lastClearMessageTime = Date.now();

        // Play appropriate sound
        if (linesCleared.length === 4) {
            audioManager.playSoundStacker(); // Special sound for Stacker!
        } else {
            audioManager.playSoundLineClear();
        }

        // Increase level logic (progressive requirements)
        let leveledUp = false;
        if (this.currentLevelLines >= this.linesToNextLevel) {
            this.currentLevelLines = 0; // Reset, do not carry over overflow lines
            this.level++;
            this.linesToNextLevel += 1; // Requirement goes up by only 1 instead of 2
            this.dropInterval = Math.max(200, 800 - (this.level - 1) * 50); // Speed increases with level
            leveledUp = true;
        }

        // Winning condition: reaching level 30 ends the run with a victory state.
        if (leveledUp && this.level >= this.maxLevel) {
            this.gameWon = true;
            this.paused = true;
            this.isDancing = false;
            return;
        }

        // Trigger dance cutscene every 5 levels passed
        if (leveledUp && (this.level - 1) % 5 === 0) {
            this.triggerDanceParty();
        }
    }

    triggerDanceParty() {
        this.isDancing = true;
        if (this.onDanceStart) this.onDanceStart();

        setTimeout(() => {
            this.isDancing = false;
            if (this.onDanceEnd) this.onDanceEnd();
        }, 10000); // 10 seconds
    }

    // Main game loop
    update(currentTime) {
        if (this.gameOver || this.paused || this.isDancing) return;

        // Determine the effective drop interval
        const effectiveInterval = this.softDropActive ? this.dropInterval / 3 : this.dropInterval;

        if (currentTime - this.lastDropTime > effectiveInterval) {
            // Try to move piece down
            if (!this.checkCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
                this.currentPiece.y++;
            } else {
                // Piece can't move down, place it
                this.placePiece();
            }
            this.lastDropTime = currentTime;
        }
    }

    // Toggle pause
    togglePause() {
        this.paused = !this.paused;
    }

    // Restart game
    restart() {
        this.initializeBoard();
        this.currentPiece = this.createNewPiece();
        this.nextPiece = this.createNewPiece();
        this.score = 0;
        this.level = 1;
        this.maxLevel = 30;
        this.linesCleared = 0;
        this.currentLevelLines = 0;
        this.linesToNextLevel = 10;
        this.isDancing = false;
        this.gameOver = false;
        this.gameWon = false;
        this.paused = false;
        this.dropInterval = 800;
        this.lastDropTime = 0;
        this.softDropActive = false;

        // Reset visual effects
        this.lastPlacedPiece = null;
        this.lastPlacedTime = 0;
        this.lastClearedLines = [];
        this.lastClearedTime = 0;
        this.isDropping = false;
        this.lastClearMessage = null;
        this.lastClearMessageTime = 0;
    }
}

// Initialize game
const game = new Game();
