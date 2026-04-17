// UI.js - Rendering and input handling

class GameUI {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextPieceCanvas = document.getElementById('nextPieceCanvas');
        this.nextPieceCtx = this.nextPieceCanvas.getContext('2d');

        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.linesLeftDisplay = document.getElementById('linesLeft');
        this.finalScoreDisplay = document.getElementById('finalScore');

        this.startOverlay = document.getElementById('startOverlay');
        this.startBtn = document.getElementById('startBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.endGameBtn = document.getElementById('endGameBtn');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.gameWinOverlay = document.getElementById('gameWinOverlay');
        this.restartBtn = document.getElementById('restartBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.winRestartBtn = document.getElementById('winRestartBtn');
        this.winMainMenuBtn = document.getElementById('winMainMenuBtn');
        this.gameOverLeaderboardList = document.getElementById('gameOverLeaderboardList');
        this.winFinalScoreDisplay = document.getElementById('winFinalScore');

        // Mobile gamepad controls
        this.mobileGamepad = document.getElementById('mobileGamepad');
        this.dpadUp = document.getElementById('dpadUp');
        this.dpadLeft = document.getElementById('dpadLeft');
        this.dpadDown = document.getElementById('dpadDown');
        this.dpadRight = document.getElementById('dpadRight');
        this.btnA = document.getElementById('btnA');
        this.btnB = document.getElementById('btnB');
        this.btnPauseMobile = document.getElementById('btnPauseMobile');

        // Dance Cutscene overlays
        this.danceOverlay = document.getElementById('danceOverlay');
        this.danceTitle = document.getElementById('danceTitle');
        this.danceCountdown = document.querySelector('.dance-countdown');
        this.danceInterval = null;

        // Music dropdown
        this.musicDropdownToggle = document.getElementById('musicDropdownToggle');
        this.musicDropdownOptions = document.getElementById('musicDropdownOptions');

        // Music buttons
        this.musicButtons = {
            woodland: document.getElementById('musicWoodland'),
            zen: document.getElementById('musicZen'),
            celtic: document.getElementById('musicCeltic')
        };

        // In-game music dropdown
        this.inGameMusicToggle = document.getElementById('inGameMusicToggle');
        this.inGameMusicOptions = document.getElementById('inGameMusicOptions');
        this.inGameMusicButtons = {
            woodland: document.getElementById('inGameWoodland'),
            zen: document.getElementById('inGameZen'),
            celtic: document.getElementById('inGameCeltic')
        };

        // Input debouncing
        this.inputDebounce = {};
        this.debounceDelay = 50; // ms
        this.mobileHoldDelay = 95;
        this.mobileHoldInterval = 55;
        this.mobileHoldTimers = {};

        // Game state
        this.gameStarted = false;
        this.gameOverShown = false;
        this.gameWonShown = false;
        this.keysPressed = {}; // Track which keys are currently pressed

        // Touch gesture tuning for mobile responsiveness
        this.touchStartX = null;
        this.touchStartY = null;
        this.touchMoved = false;
        this.touchHorizontalThreshold = 45;
        this.touchVerticalThreshold = 50;
        this.touchHardDropThreshold = 65;
        this.touchAxisDominanceRatio = 1.25;

        // Dance Event Callbacks
        game.onDanceStart = () => {
            this.preDanceTheme = musicManager.currentTheme;
            musicManager.playTheme('danceParty');

            if (!this.danceOverlay) return;
            // The game has already leveled up, so the level just passed is game.level - 1
            if (this.danceTitle) {
                this.danceTitle.textContent = `Congratulations! You passed Level ${game.level - 1}`;
            }
            this.danceOverlay.classList.remove('hidden');
            let timeLeft = 10;
            this.danceCountdown.textContent = timeLeft;
            this.danceInterval = setInterval(() => {
                timeLeft--;
                this.danceCountdown.textContent = timeLeft;
                if (timeLeft <= 0) clearInterval(this.danceInterval);
            }, 1000);
        };

        game.onDanceEnd = () => {
            musicManager.playTheme(this.preDanceTheme || 'woodland');

            if (!this.danceOverlay) return;
            this.danceOverlay.classList.add('hidden');
            if (this.danceInterval) clearInterval(this.danceInterval);
        };

        this.initializeEventListeners();
        this.startGameLoop(); // Always start rendering loop
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Touch gestures remain for larger screens only.
        if (!this.isMobileViewport()) {
            this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        }

        // Button controls
        this.startBtn.addEventListener('click', () => this.startGame());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.endGameBtn.addEventListener('click', () => this.endGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.mainMenuBtn.addEventListener('click', () => this.showMainMenu());
        if (this.winRestartBtn) this.winRestartBtn.addEventListener('click', () => this.restartGame());
        if (this.winMainMenuBtn) this.winMainMenuBtn.addEventListener('click', () => this.showMainMenu());

        // Music dropdown toggle
        if (this.musicDropdownToggle) {
            this.musicDropdownToggle.addEventListener('click', () => {
                this.musicDropdownOptions.classList.toggle('hidden');
            });
        }

        // In-game music dropdown toggle
        if (this.inGameMusicToggle) {
            this.inGameMusicToggle.addEventListener('click', () => {
                this.inGameMusicOptions.classList.toggle('hidden');
            });
        }

        // Music theme selector (Start Menu)
        Object.entries(this.musicButtons).forEach(([theme, btn]) => {
            btn.addEventListener('click', () => {
                this.selectMusic(theme);
                if (this.musicDropdownOptions) this.musicDropdownOptions.classList.add('hidden');
            });
        });

        // Music theme selector (In-Game)
        Object.entries(this.inGameMusicButtons).forEach(([theme, btn]) => {
            btn.addEventListener('click', () => {
                this.selectMusic(theme);
                if (this.inGameMusicOptions) this.inGameMusicOptions.classList.add('hidden');
            });
        });

        this.bindMobileGamepadControls();
        window.addEventListener('resize', () => this.updateMobileControlsVisibility());
    }

    isMobileViewport() {
        return window.matchMedia('(max-width: 600px)').matches;
    }

    bindMobileGamepadControls() {
        if (!this.mobileGamepad) return;

        this.bindHeldActionButton(this.dpadLeft, 'left', () => game.movePieceLeft());
        this.bindHeldActionButton(this.dpadRight, 'right', () => game.movePieceRight());
        this.bindHeldActionButton(this.dpadUp, 'up', () => game.rotatePiece());

        const stopSoftDrop = () => game.endSoftDrop();

        if (this.dpadDown) {
            this.dpadDown.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                game.startSoftDrop();
            });
            this.dpadDown.addEventListener('pointerup', stopSoftDrop);
            this.dpadDown.addEventListener('pointercancel', stopSoftDrop);
            this.dpadDown.addEventListener('pointerleave', stopSoftDrop);
        }

        if (this.btnA) {
            this.btnA.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                game.rotatePiece();
            });
        }

        if (this.btnB) {
            this.btnB.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                game.dropPieceToBottom();
            });
        }

        if (this.btnPauseMobile) {
            this.btnPauseMobile.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                this.togglePause();
            });
        }
    }

    bindHeldActionButton(button, actionKey, actionFn) {
        if (!button) return;

        button.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.startHeldAction(actionKey, actionFn);
        });

        const stopAction = () => this.stopHeldAction(actionKey);
        button.addEventListener('pointerup', stopAction);
        button.addEventListener('pointercancel', stopAction);
        button.addEventListener('pointerleave', stopAction);
    }

    startHeldAction(actionKey, actionFn) {
        this.stopHeldAction(actionKey);
        actionFn();

        const timeoutId = setTimeout(() => {
            const intervalId = setInterval(() => {
                actionFn();
            }, this.mobileHoldInterval);

            if (this.mobileHoldTimers[actionKey]) {
                this.mobileHoldTimers[actionKey].intervalId = intervalId;
            }
        }, this.mobileHoldDelay);

        this.mobileHoldTimers[actionKey] = { timeoutId, intervalId: null };
    }

    stopHeldAction(actionKey) {
        const timer = this.mobileHoldTimers[actionKey];
        if (!timer) return;

        clearTimeout(timer.timeoutId);
        if (timer.intervalId !== null) {
            clearInterval(timer.intervalId);
        }

        delete this.mobileHoldTimers[actionKey];
    }

    stopAllHeldActions() {
        Object.keys(this.mobileHoldTimers).forEach((actionKey) => {
            this.stopHeldAction(actionKey);
        });
    }

    updateMobileControlsVisibility() {
        if (!this.mobileGamepad) return;

        const showControls = this.isMobileViewport() && this.gameStarted && !game.gameOver;
        this.mobileGamepad.classList.toggle('active', showControls);
        if (!showControls) {
            this.stopAllHeldActions();
        }
    }

    // Keyboard event handler
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        const now = Date.now();

        // Track key press
        this.keysPressed[key] = true;

        // Check if down key is pressed with other action keys
        const isDownPressed = this.keysPressed['arrowdown'] || this.keysPressed['s'];
        const isActionKey = ['arrowleft', 'a', 'arrowright', 'd', 'arrowup', 'w', 'x', ' '].includes(key);

        // If down is held and any other action key is pressed, hard drop
        if (isDownPressed && isActionKey && key !== 'arrowdown' && key !== 's') {
            e.preventDefault();
            game.endSoftDrop(); // End soft drop first
            game.dropPieceToBottom(); // Hard drop
            return;
        }

        // Prevent rapid repeated inputs for movement
        if (['arrowleft', 'a', 'arrowright', 'd', 'arrowup', 'w', 'x', 'arrowdown', 's'].includes(key)) {
            if (this.inputDebounce[key] && now - this.inputDebounce[key] < this.debounceDelay) {
                return;
            }
            this.inputDebounce[key] = now;
        }

        switch (key) {
            case 'arrowleft':
            case 'a':
                e.preventDefault();
                game.movePieceLeft();
                break;
            case 'arrowright':
            case 'd':
                e.preventDefault();
                game.movePieceRight();
                break;
            case 'arrowup':
            case 'w':
            case 'x':
                e.preventDefault();
                game.rotatePiece();
                break;
            case 'arrowdown':
            case 's':
                e.preventDefault();
                game.startSoftDrop();
                break;
            case ' ':
                e.preventDefault();
                game.dropPieceToBottom(); // Space = hard drop
                break;
            case 'p':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }

    // Keyboard up event handler - end soft drop
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        this.keysPressed[key] = false;

        if (key === 'arrowdown' || key === 's') {
            game.endSoftDrop();
        }
    }

    // Touch controls
    handleTouchStart(e) {
        if (this.isMobileViewport()) return;
        e.preventDefault(); // Prevent scrolling
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchMoved = false; // Track if it's a tap or swipe
    }

    handleTouchMove(e) {
        if (this.isMobileViewport()) return;
        if (this.touchStartX === null || this.touchStartY === null) return;
        e.preventDefault();

        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;

        const diffX = touchEndX - this.touchStartX;
        const diffY = touchEndY - this.touchStartY;
        const absDiffX = Math.abs(diffX);
        const absDiffY = Math.abs(diffY);

        const horizontalSwipe =
            absDiffX > this.touchHorizontalThreshold &&
            absDiffX > absDiffY * this.touchAxisDominanceRatio;
        const verticalSwipe =
            absDiffY > this.touchVerticalThreshold &&
            absDiffY > absDiffX * this.touchAxisDominanceRatio;

        if (horizontalSwipe || verticalSwipe) {
            this.touchMoved = true;

            if (horizontalSwipe) {
                // Horizontal swipe
                if (diffX > 0) {
                    game.movePieceRight();
                    audioManager.playSoundMove();
                } else {
                    game.movePieceLeft();
                    audioManager.playSoundMove();
                }
                // Reset X to allow continuous movement
                this.touchStartX = touchEndX;
            } else {
                // Vertical swipe
                if (diffY > 0) {
                    // Swipe down - soft drop
                    game.startSoftDrop();
                    this.touchStartY = touchEndY;
                } else {
                    // Swipe up - hard drop (requires a larger upward movement)
                    if (absDiffY > this.touchHardDropThreshold) {
                        game.dropPieceToBottom();
                        game.placePiece();
                        audioManager.playSoundLock();
                    }
                    this.touchStartY = touchEndY;
                }
            }
        }
    }

    handleTouchEnd(e) {
        if (this.isMobileViewport()) return;
        e.preventDefault();
        game.endSoftDrop();

        // If the user just tapped without swiping, rotate the piece
        if (!this.touchMoved && this.touchStartX !== null && this.touchStartY !== null) {
            game.rotatePiece();
            audioManager.playSoundRotate();
        }

        this.touchStartX = null;
        this.touchStartY = null;
        this.touchMoved = false;
    }

    // Toggle pause state
    togglePause() {
        game.togglePause();
        if (game.paused) {
            this.pauseBtn.textContent = '▶️';
            if (this.btnPauseMobile) this.btnPauseMobile.textContent = '▶';
            // Pause music by stopping playback
            musicManager.pauseMusic();
        } else {
            this.pauseBtn.textContent = '⏸️';
            if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';
            // Resume music
            musicManager.resumeMusic();
        }
    }

    // Toggle mute
    toggleMute() {
        const isMuted = audioManager.toggleMute();
        musicManager.toggleMute(isMuted);
        this.muteBtn.textContent = isMuted ? '🔇' : '🔊';
    }

    // Start the game
    startGame() {
        this.startOverlay.classList.add('hidden');
        this.gameOverShown = false;
        this.gameWonShown = false;
        this.gameStarted = true; // Mark game as started
        game.paused = false; // Unpause the game
        this.pauseBtn.textContent = '⏸️';
        if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';
        if (this.gameOverOverlay) this.gameOverOverlay.classList.add('hidden');
        if (this.gameWinOverlay) this.gameWinOverlay.classList.add('hidden');
        this.updateMobileControlsVisibility();

        // Start playing selected music
        const selectedTheme = Object.entries(this.musicButtons)
            .find(([_, btn]) => btn.classList.contains('active'))?.[0] || 'woodland';
        musicManager.stopAll();
        musicManager.playTheme(selectedTheme); // Async - runs in background
    }

    // Music theme selection
    selectMusic(theme) {
        // Update UI - mark this theme as active
        Object.entries(this.musicButtons).forEach(([t, btn]) => {
            if (btn) btn.classList.toggle('active', t === theme);
        });
        Object.entries(this.inGameMusicButtons).forEach(([t, btn]) => {
            if (btn) btn.classList.toggle('active', t === theme);
        });

        // Ensure both dropdown toggles reflect the latest selection (so they stay in sync)
        if (this.musicDropdownToggle && this.musicButtons[theme]) {
            this.musicDropdownToggle.innerHTML = `🎵 SELECT MUSIC: ${this.musicButtons[theme].innerHTML.trim()} ▾`;
        }
        if (this.inGameMusicToggle && this.inGameMusicButtons[theme]) {
            // Keep the in-game toggle as an icon to save space
            this.inGameMusicToggle.innerHTML = `🎵`;
        }

        // If a dance party is currently active, just override the preDanceTheme 
        // so it resumes the newly selected theme instead of immediately switching.
        if (game.isDancing) {
            this.preDanceTheme = theme;
            return;
        }

        // Prevent unnecessary restarts if the selected theme is already running.
        if (musicManager.currentTheme === theme && musicManager.isPlaying) {
            return;
        }

        // Do not preview music in the main menu or while paused/game over.
        // Music should start only when gameplay starts/resumes.
        const isActivelyPlaying = this.gameStarted && !game.paused && !game.gameOver;
        if (!isActivelyPlaying) {
            // Keep the selected theme for the next game start/restart.
            musicManager.currentTheme = theme;
            return;
        }

        musicManager.currentTheme = theme;
        musicManager.playTheme(theme); // Async - runs in background
    }

    // Restart game
    restartGame() {
        this.gameOverShown = false;
        this.gameWonShown = false;
        this.gameStarted = true; // Mark game as started
        game.restart();
        game.paused = false; // Unpause the game
        this.pauseBtn.textContent = '⏸️';
        if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';
        this.gameOverOverlay.classList.add('hidden');
        if (this.gameWinOverlay) this.gameWinOverlay.classList.add('hidden');
        this.updateMobileControlsVisibility();

        // Resume music
        const selectedTheme = Object.entries(this.musicButtons)
            .find(([_, btn]) => btn.classList.contains('active'))?.[0] || 'woodland';
        musicManager.stopAll();
        musicManager.playTheme(selectedTheme); // Async - runs in background
    }

    // Go back to main menu
    showMainMenu() {
        // First, ensure all overlays are hidden
        this.gameOverOverlay.classList.add('hidden');
        if (this.gameWinOverlay) this.gameWinOverlay.classList.add('hidden');

        // Reset game state
        this.gameOverShown = false;
        this.gameStarted = false; // Mark game as not started
        game.paused = true;

        // Reset game board
        game.restart();

        // Stop music
        musicManager.stopAll();
        this.pauseBtn.textContent = '⏸️';
        if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';

        this.updateMobileControlsVisibility();

        // Finally, show the start overlay
        this.startOverlay.classList.remove('hidden');
    }

    // End game during gameplay
    endGame() {
        // First, ensure all overlays are hidden
        this.gameOverOverlay.classList.add('hidden');
        if (this.gameWinOverlay) this.gameWinOverlay.classList.add('hidden');

        // Reset game state
        this.gameOverShown = false;
        this.gameStarted = false; // Mark game as not started
        game.paused = true;

        // Reset game board
        game.restart();

        // Stop music
        musicManager.stopAll();
        this.pauseBtn.textContent = '⏸️';
        if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';

        this.updateMobileControlsVisibility();

        // Finally, show the start overlay
        this.startOverlay.classList.remove('hidden');
    }

    // Show game over screen
    showGameOver() {
        this.finalScoreDisplay.textContent = game.score;
        this.gameStarted = false;
        musicManager.stopAll();
        this.pauseBtn.textContent = '⏸️';
        if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';
        this.gameOverOverlay.classList.remove('hidden');
        gameStorage.saveScore(game.score, game.level);
        this.updateLeaderboardDisplay();
        this.updateMobileControlsVisibility();
    }

    // Show winner screen at level cap
    showGameWon() {
        if (this.winFinalScoreDisplay) this.winFinalScoreDisplay.textContent = game.score;
        this.gameStarted = false;
        game.paused = true;
        musicManager.stopAll();
        musicManager.playTheme('victory');
        this.pauseBtn.textContent = '⏸️';
        if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';
        if (this.gameOverOverlay) this.gameOverOverlay.classList.add('hidden');
        if (this.gameWinOverlay) this.gameWinOverlay.classList.remove('hidden');
        gameStorage.saveScore(game.score, game.level);
        this.updateMobileControlsVisibility();
    }

    // Update leaderboard display
    updateLeaderboardDisplay() {
        const scores = gameStorage.getLeaderboard();
        if (!this.gameOverLeaderboardList) return;

        this.gameOverLeaderboardList.innerHTML = '';

        if (scores.length === 0) {
            this.gameOverLeaderboardList.innerHTML = '<div class="leaderboard-empty">No scores yet. Play to get on the board!</div>';
            return;
        }

        scores.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">Level ${entry.level || 1}</span>
                <span class="leaderboard-score">${entry.score} pts</span>
            `;
            this.gameOverLeaderboardList.appendChild(item);
        });
    }

    // Render game board
    renderBoard() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x <= game.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * game.CELL_SIZE, 0);
            this.ctx.lineTo(x * game.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= game.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * game.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * game.CELL_SIZE);
            this.ctx.stroke();
        }

        // Draw placed pieces
        for (let y = 0; y < game.BOARD_HEIGHT; y++) {
            for (let x = 0; x < game.BOARD_WIDTH; x++) {
                if (game.board[y][x]) {
                    this.drawCell(x, y, game.board[y][x], this.ctx);
                }
            }
        }

        // Draw line clear flash effect
        const now = Date.now();
        const clearFlashDuration = 150; // ms
        if (game.lastClearedLines && game.lastClearedLines.length > 0) {
            const timeSinceClear = now - game.lastClearedTime;
            if (timeSinceClear < clearFlashDuration) {
                // Flash effect for cleared lines
                const opacity = 1 - (timeSinceClear / clearFlashDuration);
                this.ctx.fillStyle = `rgba(0, 255, 0, ${opacity * 0.6})`;
                game.lastClearedLines.forEach(y => {
                    this.ctx.fillRect(0, y * game.CELL_SIZE, this.canvas.width, game.CELL_SIZE);
                });
            }
        }

        // Draw line clear message pop-up
        if (game.lastClearMessage) {
            const messageDisplayDuration = 800; // ms
            const timeSinceMessage = now - game.lastClearMessageTime;
            if (timeSinceMessage < messageDisplayDuration) {
                // Fade out effect
                const progress = timeSinceMessage / messageDisplayDuration;
                const opacity = 1 - progress;

                // Scale animation - starts bigger, shrinks and fades
                const scale = 1 + (0.3 * (1 - progress));

                // Vertical movement - moves up
                const moveUp = progress * 40;

                // Draw message with special styling for Stacker
                this.drawClearMessage(game.lastClearMessage, opacity, scale, moveUp);
            }
        }

        // Draw piece placement flash effect
        if (game.lastPlacedPiece) {
            const timeSincePlaced = now - game.lastPlacedTime;
            const placedFlashDuration = 100; // ms
            if (timeSincePlaced < placedFlashDuration) {
                // Glow effect around newly placed piece
                const opacity = 1 - (timeSincePlaced / placedFlashDuration);
                this.ctx.shadowColor = `rgba(255, 255, 255, ${opacity * 0.8})`;
                this.ctx.shadowBlur = 15 * opacity;

                const shape = game.lastPlacedPiece.shape;
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x] === 1) {
                            const boardX = game.lastPlacedPiece.x + x;
                            const boardY = game.lastPlacedPiece.y + y;
                            if (boardY >= 0) {
                                this.drawCell(boardX, boardY, game.lastPlacedPiece.color, this.ctx);
                            }
                        }
                    }
                }
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
            }
        }

        // Draw ghost piece (preview of where piece will land)
        if (game.currentPiece) {
            const ghostY = game.getGhostPieceY();
            const shape = game.getCurrentShape();
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] === 1) {
                        const boardX = game.currentPiece.x + x;
                        const boardY = ghostY + y;
                        if (boardY >= 0 && boardY < game.BOARD_HEIGHT) {
                            // Draw ghost with transparent color
                            const px = boardX * game.CELL_SIZE;
                            const py = boardY * game.CELL_SIZE;
                            this.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
                            this.ctx.fillRect(px + 1, py + 1, game.CELL_SIZE - 2, game.CELL_SIZE - 2);
                            this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
                            this.ctx.lineWidth = 1;
                            this.ctx.strokeRect(px + 1, py + 1, game.CELL_SIZE - 2, game.CELL_SIZE - 2);
                        }
                    }
                }
            }
        }

        // Draw current piece
        if (game.currentPiece) {
            const shape = game.getCurrentShape();

            // Add glow effect if piece is being dropped
            if (game.isDropping) {
                this.ctx.shadowColor = 'rgba(255, 255, 100, 0.8)';
                this.ctx.shadowBlur = 20;
            }

            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] === 1) {
                        const boardX = game.currentPiece.x + x;
                        const boardY = game.currentPiece.y + y;
                        if (boardY >= 0) {
                            this.drawCell(boardX, boardY, game.currentPiece.color, this.ctx);
                        }
                    }
                }
            }

            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
        }

        // Draw 'PAUSED' text overlaid directly on canvas if the game is paused
        if (game.paused && !game.gameOver && this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Text shadow effect for PAUSED
            this.ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
        }
    }

    // Draw line clear message pop-up
    drawClearMessage(message, opacity, scale, moveUp) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2 - moveUp;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-centerX, -centerY);

        // Draw background box
        const textSize = message.linesCount === 4 ? 32 : 24;
        this.ctx.font = `bold ${textSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Shadow effect
        this.ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
        this.ctx.fillRect(centerX - 120, centerY - 35, 240, 70);

        // Border
        this.ctx.strokeStyle = message.linesCount === 4 ? '#ffff00' : '#00ff00';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(centerX - 120, centerY - 35, 240, 70);

        // Text color - special for Stacker!
        if (message.linesCount === 4) {
            // Stacker! - yellow with glow
            this.ctx.fillStyle = '#ffff00';
            this.ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
            this.ctx.shadowBlur = 10;
        } else {
            // Regular line clear - green
            this.ctx.fillStyle = '#00ff00';
            this.ctx.shadowColor = 'rgba(0, 255, 0, 0.6)';
            this.ctx.shadowBlur = 8;
        }

        this.ctx.fillText(message.text, centerX, centerY - 10);

        // Points display
        this.ctx.font = `bold 16px Arial`;
        this.ctx.fillStyle = message.linesCount === 4 ? '#ffff00' : '#00ff00';
        this.ctx.shadowBlur = 5;
        this.ctx.fillText(`+ ${message.points} PTS`, centerX, centerY + 15);

        this.ctx.restore();
    }

    // Render next piece preview
    renderNextPiece() {
        // Clear canvas
        this.nextPieceCtx.fillStyle = '#000';
        this.nextPieceCtx.fillRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);

        if (!game.nextPiece) return;

        const shape = game.nextPiece.shapes[0];
        const cellSize = 25;

        // Center the preview
        const offsetX = (this.nextPieceCanvas.width - shape[0].length * cellSize) / 2;
        const offsetY = (this.nextPieceCanvas.height - shape.length * cellSize) / 2;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 1) {
                    const px = offsetX + x * cellSize;
                    const py = offsetY + y * cellSize;

                    // 1. Draw outer bark (Dark brown square edge)
                    this.nextPieceCtx.fillStyle = '#3e2723';
                    this.nextPieceCtx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

                    // 2. Draw inner wood (Tinted with the piece's color to tell them apart)
                    this.nextPieceCtx.fillStyle = game.nextPiece.color;
                    this.nextPieceCtx.beginPath();
                    this.nextPieceCtx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 3, 0, Math.PI * 2);
                    this.nextPieceCtx.fill();

                    // 3. Draw concentric tree rings
                    this.nextPieceCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                    this.nextPieceCtx.lineWidth = 1.5;

                    this.nextPieceCtx.beginPath();
                    this.nextPieceCtx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 6, 0, Math.PI * 2);
                    this.nextPieceCtx.stroke();

                    this.nextPieceCtx.beginPath();
                    this.nextPieceCtx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 9, 0, Math.PI * 2);
                    this.nextPieceCtx.stroke();

                    // 4. Draw highlight for depth
                    this.nextPieceCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    this.nextPieceCtx.beginPath();
                    this.nextPieceCtx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 4, Math.PI * 0.8, Math.PI * 1.5);
                    this.nextPieceCtx.stroke();
                }
            }
        }
    }

    // Draw individual cell
    drawCell(x, y, color, ctx) {
        const px = x * game.CELL_SIZE;
        const py = y * game.CELL_SIZE;
        const size = game.CELL_SIZE;

        // 1. Draw outer bark (Dark brown square edge)
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(px + 1, py + 1, size - 2, size - 2);

        // 2. Draw inner wood (Tinted with the piece's color to tell them apart)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size / 2 - 3, 0, Math.PI * 2);
        ctx.fill();

        // 3. Draw concentric tree rings
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size / 2 - 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size / 2 - 10, 0, Math.PI * 2);
        ctx.stroke();

        // 4. Add a slight shine on the rings to give it depth
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size / 2 - 4, Math.PI * 0.8, Math.PI * 1.5);
        ctx.stroke();
    }

    // Update UI displays
    updateUI() {
        this.scoreDisplay.textContent = game.score;
        this.levelDisplay.textContent = game.level;
        if (this.linesLeftDisplay) {
            this.linesLeftDisplay.textContent = Math.max(0, game.linesToNextLevel - game.currentLevelLines);
        }

        // Adjust music tempo with difficulty
        musicManager.setDifficulty(game.level);
    }

    // Start game loop
    startGameLoop() {
        let lastTime = 0;

        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // Only update game if it's started and not paused
            if (this.gameStarted && !game.paused && !game.gameOver) {
                // Update game state
                game.update(currentTime);
            }

            // Check for game win (priority over game-over modal)
            if (game.gameWon && !this.gameWonShown) {
                this.gameWonShown = true;
                this.showGameWon();
            }

            // Check for game over
            if (game.gameOver && !game.gameWon && !this.gameOverShown) {
                this.gameOverShown = true;
                this.showGameOver();
            }

            // Render everything
            this.renderBoard();
            this.renderNextPiece();
            this.updateUI();

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gameUI = new GameUI();
});
