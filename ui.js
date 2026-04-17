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
        this.aboutOverlay = document.getElementById('aboutOverlay');
        this.startBtn = document.getElementById('startBtn');
        this.aboutBtn = document.getElementById('aboutBtn');
        this.aboutCloseBtn = document.getElementById('aboutCloseBtn');
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

        // Contract completion overlay
        this.contractOverlay = document.getElementById('contractOverlay');
        this.contractTitle = document.getElementById('contractTitle');
        this.contractSubtitle = document.getElementById('contractSubtitle');
        this.contractOneCount = document.getElementById('contractOneCount');
        this.contractTwoCount = document.getElementById('contractTwoCount');
        this.contractTwoBonus = document.getElementById('contractTwoBonus');
        this.contractThreeCount = document.getElementById('contractThreeCount');
        this.contractThreeBonus = document.getElementById('contractThreeBonus');
        this.contractFourCount = document.getElementById('contractFourCount');
        this.contractFourBonus = document.getElementById('contractFourBonus');
        this.contractTotalBonus = document.getElementById('contractTotalBonus');
        this.contractOkBtn = document.getElementById('contractOkBtn');

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

        // Contract summary callbacks
        game.onContractSummaryStart = (summary) => {
            if (!this.contractOverlay) return;

            // Pause background music while contract summary is shown.
            musicManager.pauseMusic();

            if (this.contractTitle) {
                this.contractTitle.textContent = `Contract ${summary.completedLevel} completed`;
            }
            if (this.contractSubtitle) {
                this.contractSubtitle.textContent = summary.reachedMaxLevel
                    ? 'This was the final contract. Click OK to finish the run.'
                    : `Review instant shipment premiums before continuing to Contract ${summary.nextLevel}.`;
            }
            if (this.contractOneCount) this.contractOneCount.textContent = summary.oneLineShipments;
            if (this.contractTwoCount) this.contractTwoCount.textContent = summary.twoLineShipments;
            if (this.contractThreeCount) this.contractThreeCount.textContent = summary.threeLineShipments;
            if (this.contractFourCount) this.contractFourCount.textContent = summary.fullLoadShipments;
            if (this.contractTwoBonus) this.contractTwoBonus.textContent = `${summary.twoLineShipments} x ${this.formatCurrency(500)} = ${this.formatCurrency(summary.twoLineShipments * 500)}`;
            if (this.contractThreeBonus) this.contractThreeBonus.textContent = `${summary.threeLineShipments} x ${this.formatCurrency(1500)} = ${this.formatCurrency(summary.threeLineShipments * 1500)}`;
            if (this.contractFourBonus) this.contractFourBonus.textContent = `${summary.fullLoadShipments} x ${this.formatCurrency(5000)} = ${this.formatCurrency(summary.fullLoadShipments * 5000)}`;
            if (this.contractTotalBonus) this.contractTotalBonus.textContent = this.formatCurrency(summary.totalBonus);

            this.contractOverlay.classList.remove('hidden');
            this.updateMobileControlsVisibility();
        };

        game.onContractSummaryEnd = () => {
            if (!this.contractOverlay) return;
            this.contractOverlay.classList.add('hidden');
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
        if (this.aboutBtn) this.aboutBtn.addEventListener('click', () => this.showAbout());
        if (this.aboutCloseBtn) this.aboutCloseBtn.addEventListener('click', () => this.hideAbout());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.endGameBtn.addEventListener('click', () => this.endGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.mainMenuBtn.addEventListener('click', () => this.showMainMenu());
        if (this.winRestartBtn) this.winRestartBtn.addEventListener('click', () => this.restartGame());
        if (this.winMainMenuBtn) this.winMainMenuBtn.addEventListener('click', () => this.showMainMenu());
        if (this.contractOkBtn) this.contractOkBtn.addEventListener('click', () => this.dismissContractSummary());

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

        const showControls = this.isMobileViewport() && this.gameStarted && !game.gameOver && !game.isContractReview;
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
        if (game.isContractReview) return;

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
        audioManager.playSoundHandshake();
        this.startOverlay.classList.add('hidden');
        if (this.aboutOverlay) this.aboutOverlay.classList.add('hidden');
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

        // Keep selection stable while the contract summary is blocking gameplay.
        if (game.isContractReview) {
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
        if (this.contractOverlay) this.contractOverlay.classList.add('hidden');
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
        if (this.contractOverlay) this.contractOverlay.classList.add('hidden');
        if (this.aboutOverlay) this.aboutOverlay.classList.add('hidden');

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

    showAbout() {
        if (this.aboutOverlay) this.aboutOverlay.classList.remove('hidden');
    }

    hideAbout() {
        if (this.aboutOverlay) this.aboutOverlay.classList.add('hidden');
    }

    // End game during gameplay
    endGame() {
        // First, ensure all overlays are hidden
        this.gameOverOverlay.classList.add('hidden');
        if (this.gameWinOverlay) this.gameWinOverlay.classList.add('hidden');
        if (this.contractOverlay) this.contractOverlay.classList.add('hidden');
        if (this.aboutOverlay) this.aboutOverlay.classList.add('hidden');

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
        this.finalScoreDisplay.textContent = this.formatCurrency(game.score);
        this.gameStarted = false;
        musicManager.stopAll();
        this.pauseBtn.textContent = '⏸️';
        if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';
        if (this.contractOverlay) this.contractOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.remove('hidden');
        gameStorage.saveScore(game.score, game.level);
        this.updateLeaderboardDisplay();
        this.updateMobileControlsVisibility();
    }

    // Show winner screen at level cap
    showGameWon() {
        if (this.winFinalScoreDisplay) this.winFinalScoreDisplay.textContent = this.formatCurrency(game.score);
        this.gameStarted = false;
        game.paused = true;
        musicManager.stopAll();
        musicManager.playTheme('victory');
        this.pauseBtn.textContent = '⏸️';
        if (this.btnPauseMobile) this.btnPauseMobile.textContent = '⏸';
        if (this.contractOverlay) this.contractOverlay.classList.add('hidden');
        if (this.gameOverOverlay) this.gameOverOverlay.classList.add('hidden');
        if (this.gameWinOverlay) this.gameWinOverlay.classList.remove('hidden');
        gameStorage.saveScore(game.score, game.level);
        this.updateMobileControlsVisibility();
    }

    dismissContractSummary() {
        this.resetInputState();
        const shouldShowWin = game.resumeAfterContractSummary();
        if (this.contractOverlay) this.contractOverlay.classList.add('hidden');

        if (shouldShowWin) {
            this.showGameWon();
            return;
        }

        if (this.gameStarted && !game.paused && !game.gameOver) {
            const selectedTheme = Object.entries(this.musicButtons)
                .find(([_, btn]) => btn.classList.contains('active'))?.[0] || musicManager.currentTheme || 'woodland';
            musicManager.stopAll();
            musicManager.playTheme(selectedTheme);
        }

        this.updateMobileControlsVisibility();
    }

    resetInputState() {
        this.keysPressed = {};
        this.inputDebounce = {};
        this.stopAllHeldActions();
        game.endSoftDrop();
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
                <span class="leaderboard-name">Earner ${index + 1} - Contract ${entry.level || 1}</span>
                <span class="leaderboard-score">${this.formatCurrency(entry.score || 0)}</span>
            `;
            this.gameOverLeaderboardList.appendChild(item);
        });
    }

    formatCurrency(value) {
        const dollars = Math.max(0, value) / 100;
        return `$${dollars.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    // Render game board
    renderBoard() {
        const now = Date.now();
        const flow = (now % 9000) / 9000;

        // Clear canvas
        const waterGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        waterGradient.addColorStop(0, '#183e52');
        waterGradient.addColorStop(0.45, '#102e42');
        waterGradient.addColorStop(1, '#071a28');
        this.ctx.fillStyle = waterGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // River current and banks.
        this.drawRiverBackground(flow);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(178, 226, 255, 0.14)';
        this.ctx.lineWidth = 0.45;
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
        const pendingLines = game.pendingClear ? new Set(game.pendingClear.lines) : null;
        for (let y = 0; y < game.BOARD_HEIGHT; y++) {
            if (pendingLines && pendingLines.has(y)) {
                continue;
            }
            for (let x = 0; x < game.BOARD_WIDTH; x++) {
                if (game.board[y][x]) {
                    this.drawCell(x, y, game.board[y][x], this.ctx);
                }
            }
        }

        // During shipment, move the full line(s) off-screen before they are removed.
        this.drawPendingClearRows(now);

        // Draw line clear flash effect
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

        // Draw a short shipment animation after a successful line delivery.
        this.drawShipmentAnimation(now);

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
            const renderMap = this.buildPieceRenderMap(shape);

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
                            this.drawCell(boardX, boardY, game.currentPiece.color, this.ctx, renderMap[y][x]);
                        }
                    }
                }
            }

            // Static beaver sprite that rides with the active piece and reads as pushing it downstream.
            this.drawCurrentPieceGuideBeaver(shape, game.currentPiece.x, game.currentPiece.y);

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

    drawRiverBackground(flow) {
        const bankWidth = 18;
        const midX = this.canvas.width / 2;

        // Deepen the river edges to make the playfield feel like a flowing channel.
        const edgeFade = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        edgeFade.addColorStop(0, 'rgba(13, 36, 49, 0.9)');
        edgeFade.addColorStop(0.12, 'rgba(23, 68, 88, 0.12)');
        edgeFade.addColorStop(0.5, 'rgba(64, 133, 160, 0.08)');
        edgeFade.addColorStop(0.88, 'rgba(23, 68, 88, 0.12)');
        edgeFade.addColorStop(1, 'rgba(13, 36, 49, 0.9)');
        this.ctx.fillStyle = edgeFade;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Soft current bands that drift across the board.
        for (let row = 0; row < game.BOARD_HEIGHT; row++) {
            const y = row * game.CELL_SIZE;
            const waveOffset = Math.sin((row * 0.55) + (flow * Math.PI * 2)) * 5;
            const alpha = 0.05 + (row % 3) * 0.015;
            const streamGradient = this.ctx.createLinearGradient(0, y, this.canvas.width, y);
            streamGradient.addColorStop(0, `rgba(12, 38, 54, ${alpha})`);
            streamGradient.addColorStop(0.5, `rgba(95, 172, 198, ${alpha * 1.5})`);
            streamGradient.addColorStop(1, `rgba(12, 38, 54, ${alpha})`);
            this.ctx.fillStyle = streamGradient;
            this.ctx.fillRect(0, y + waveOffset, this.canvas.width, 2);
        }

        // Floating ripples moving diagonally downstream.
        this.ctx.save();
        this.ctx.globalAlpha = 0.35;
        this.ctx.strokeStyle = 'rgba(205, 245, 255, 0.45)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 7; i++) {
            const y = (i * 92 + (flow * 92)) % (this.canvas.height + 80) - 40;
            const wobble = Math.sin(flow * Math.PI * 2 + i) * 10;
            this.ctx.beginPath();
            this.ctx.moveTo(bankWidth - 2, y);
            this.ctx.quadraticCurveTo(midX - 28, y + 8 + wobble, this.canvas.width - bankWidth + 2, y + 1);
            this.ctx.stroke();
        }
        this.ctx.restore();

        // Riverbank shadows to frame the stream.
        const leftBank = this.ctx.createLinearGradient(0, 0, bankWidth + 16, 0);
        leftBank.addColorStop(0, 'rgba(34, 19, 12, 0.55)');
        leftBank.addColorStop(1, 'rgba(34, 19, 12, 0)');
        this.ctx.fillStyle = leftBank;
        this.ctx.fillRect(0, 0, bankWidth + 16, this.canvas.height);

        const rightBank = this.ctx.createLinearGradient(this.canvas.width - bankWidth - 16, 0, this.canvas.width, 0);
        rightBank.addColorStop(0, 'rgba(34, 19, 12, 0)');
        rightBank.addColorStop(1, 'rgba(34, 19, 12, 0.55)');
        this.ctx.fillStyle = rightBank;
        this.ctx.fillRect(this.canvas.width - bankWidth - 16, 0, bankWidth + 16, this.canvas.height);

        // Occasional reeds at the edges.
        this.ctx.strokeStyle = 'rgba(95, 133, 72, 0.55)';
        this.ctx.lineWidth = 2;
        const reedPositions = [34, 150, 266, 378, 486, 574];
        reedPositions.forEach((baseY, index) => {
            const sway = Math.sin(flow * Math.PI * 2 + index * 1.8) * 6;
            this.ctx.beginPath();
            this.ctx.moveTo(10, baseY);
            this.ctx.lineTo(6 + sway * 0.2, baseY - 20);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width - 10, baseY + 6);
            this.ctx.lineTo(this.canvas.width - 6 - sway * 0.2, baseY - 14);
            this.ctx.stroke();
        });
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

        // Earnings display (period wage value) with raw points retained for clarity.
        this.ctx.font = `bold 16px Arial`;
        this.ctx.fillStyle = message.linesCount === 4 ? '#ffff00' : '#00ff00';
        this.ctx.shadowBlur = 5;
        this.ctx.fillText(`+ ${this.formatCurrency(message.points)} (${message.points} pts)`, centerX, centerY + 15);

        this.ctx.restore();
    }

    // Draw a steamboat carrying shipped logs off-screen.
    drawShipmentAnimation(now) {
        if (!game.lastShipment) return;

        const duration = game.lastShipment.duration || 2200;
        const elapsed = now - game.lastShipment.startedAt;
        if (elapsed < 0 || elapsed > duration) return;

        const progress = elapsed / duration;
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const alpha = 1 - progress * 0.35;
        const startX = this.canvas.width + 120;
        const endX = -180;
        const x = startX + (endX - startX) * eased;
        const y = this.canvas.height - 62 - Math.sin(progress * Math.PI) * 6;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        // Water line to anchor the shipment.
        this.ctx.strokeStyle = 'rgba(120, 190, 255, 0.45)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 20);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 20);
        this.ctx.stroke();

        this.drawShipmentBoat(x, y, game.lastShipment.linesCount);

        this.ctx.restore();
    }

    drawPendingClearRows(now) {
        if (!game.pendingClear) return;

        const pending = game.pendingClear;
        const elapsed = now - pending.startedAt;
        const duration = pending.duration || 2200;
        if (elapsed < 0 || elapsed > duration) return;

        const progress = Math.min(1, Math.max(0, elapsed / duration));
        const towStart = 0.42; // Let steamboat show first, then begin hauling.
        const pullPhase = progress <= towStart
            ? 0
            : (progress - towStart) / (1 - towStart);
        const easedPull = 1 - Math.pow(1 - pullPhase, 2);
        const slideX = -easedPull * (this.canvas.width + 110);
        const alpha = 1 - easedPull * 0.65;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        pending.lines.forEach((rowY) => {
            // Subtle wake line behind hauled logs.
            this.ctx.strokeStyle = 'rgba(180, 226, 255, 0.22)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width, rowY * game.CELL_SIZE + game.CELL_SIZE * 0.55);
            this.ctx.lineTo(Math.min(this.canvas.width, this.canvas.width + slideX + 12), rowY * game.CELL_SIZE + game.CELL_SIZE * 0.55);
            this.ctx.stroke();

            for (let x = 0; x < game.BOARD_WIDTH; x++) {
                if (!game.board[rowY][x]) continue;
                const px = x * game.CELL_SIZE + slideX;
                const py = rowY * game.CELL_SIZE;
                this.drawLogCell(px, py, game.CELL_SIZE, game.board[rowY][x], this.ctx, false, null);
            }
        });

        this.ctx.restore();
    }

    drawCurrentPieceGuideBeaver(shape, pieceX, pieceY) {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let contactRow = 0;
        let bestRowCount = -1;

        for (let y = 0; y < shape.length; y++) {
            let rowCount = 0;
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 1) continue;
                rowCount++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }

            if (rowCount > bestRowCount) {
                bestRowCount = rowCount;
                contactRow = y;
            }
        }

        if (!Number.isFinite(minX) || !Number.isFinite(minY)) return;

        const centerX = pieceX + ((minX + maxX + 1) / 2);
        const contactY = pieceY + contactRow + 0.5;
        const leftEdgeX = pieceX + minX;
        const topEdgeY = pieceY + minY;

        // Keep the guide beaver above the active timber so the pose reads as pushing downriver.
        const beaverX = Math.max(20, Math.min(this.canvas.width - 20, (centerX * game.CELL_SIZE) - 2));
        const beaverY = Math.max(20, (topEdgeY * game.CELL_SIZE) - 26);

        this.ctx.save();
        this.ctx.translate(beaverX, beaverY);
        this.ctx.rotate(0.04);

        // Tail and body.
        this.ctx.fillStyle = '#4d2f1e';
        this.ctx.beginPath();
        this.ctx.ellipse(-12, 12, 12, 7, -0.55, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#5a3a24';
        this.ctx.beginPath();
        this.ctx.roundRect(-10, -1, 22, 21, 8);
        this.ctx.fill();

        // Head and muzzle.
        this.ctx.fillStyle = '#8a5a38';
        this.ctx.beginPath();
        this.ctx.arc(2, -8, 9, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#c89a69';
        this.ctx.beginPath();
        this.ctx.ellipse(5, -6, 6.5, 4.5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes and nose.
        this.ctx.fillStyle = '#1f120c';
        this.ctx.beginPath();
        this.ctx.arc(0, -9, 1.1, 0, Math.PI * 2);
        this.ctx.arc(5, -9, 1.1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(5, -5, 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Push paws angled downward so the beaver reads as actively pressing the piece down.
        this.ctx.strokeStyle = '#5a3a24';
        this.ctx.lineWidth = 3.2;
        this.ctx.beginPath();
        this.ctx.moveTo(-2, 7);
        this.ctx.lineTo(2, 19);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#3e2a1d';
        this.ctx.lineWidth = 2.3;
        this.ctx.beginPath();
        this.ctx.moveTo(5, 7);
        this.ctx.lineTo(8, 20);
        this.ctx.stroke();

        // Paw pads at contact point.
        this.ctx.fillStyle = 'rgba(232, 206, 162, 0.62)';
        this.ctx.beginPath();
        this.ctx.ellipse(2, 21, 3.2, 2.1, 0, 0, Math.PI * 2);
        this.ctx.ellipse(8, 22, 3.1, 2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Optional mouth contact point.
        this.ctx.fillStyle = 'rgba(232, 206, 162, 0.45)';
        this.ctx.beginPath();
        this.ctx.ellipse(5.3, -4.8, 2.2, 1.2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Small pressure marks on the top face to sell a downward pushing gesture.
        const pressureX = (centerX * game.CELL_SIZE) - beaverX;
        const pressureY = (topEdgeY * game.CELL_SIZE) - beaverY;
        this.ctx.strokeStyle = 'rgba(255, 236, 190, 0.28)';
        this.ctx.lineWidth = 1.4;
        this.ctx.beginPath();
        this.ctx.moveTo(pressureX - 7, pressureY + 1);
        this.ctx.lineTo(pressureX - 4, pressureY + 7);
        this.ctx.moveTo(pressureX + 1, pressureY + 1);
        this.ctx.lineTo(pressureX + 3, pressureY + 8);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawShipmentLogs(baseX, baseY, count) {
        const logCount = Math.max(2, Math.min(4, count));
        const logWidth = 30;
        const logHeight = 12;
        const spacing = 7;
        const totalWidth = logCount * logWidth + (logCount - 1) * spacing;
        const startX = baseX - totalWidth / 2;

        for (let index = 0; index < logCount; index++) {
            const logX = startX + index * (logWidth + spacing);
            this.ctx.fillStyle = '#6b4425';
            this.ctx.beginPath();
            this.ctx.roundRect(logX, baseY, logWidth, logHeight, 6);
            this.ctx.fill();

            this.ctx.strokeStyle = 'rgba(255, 236, 204, 0.35)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.roundRect(logX + 2, baseY + 2, logWidth - 4, logHeight - 4, 5);
            this.ctx.stroke();

            this.ctx.strokeStyle = 'rgba(37, 23, 14, 0.45)';
            this.ctx.beginPath();
            this.ctx.moveTo(logX + 6, baseY + 3);
            this.ctx.lineTo(logX + 6, baseY + logHeight - 3);
            this.ctx.stroke();

            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            this.ctx.beginPath();
            this.ctx.moveTo(logX + 10, baseY + 2);
            this.ctx.lineTo(logX + 22, baseY + 2);
            this.ctx.stroke();
        }
    }

    drawShipmentWagon(x, y, count) {
        const cartX = x + 45;
        const cartY = y;

        // Wheels
        this.ctx.fillStyle = '#2b1b12';
        this.ctx.beginPath();
        this.ctx.arc(cartX - 18, cartY + 30, 12, 0, Math.PI * 2);
        this.ctx.arc(cartX + 28, cartY + 30, 12, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#d9b47e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(cartX - 18, cartY + 30, 5, 0, Math.PI * 2);
        this.ctx.arc(cartX + 28, cartY + 30, 5, 0, Math.PI * 2);
        this.ctx.stroke();

        // Wagon bed
        this.ctx.fillStyle = '#6a4526';
        this.ctx.fillRect(cartX - 45, cartY + 10, 80, 16);
        this.ctx.fillStyle = '#8a5a33';
        this.ctx.fillRect(cartX - 40, cartY + 6, 70, 6);

        // Harness rail
        this.ctx.strokeStyle = '#c79b6c';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(cartX - 60, cartY + 16);
        this.ctx.lineTo(cartX - 42, cartY + 16);
        this.ctx.stroke();

        // Wagon canopy and rails.
        this.ctx.fillStyle = 'rgba(226, 196, 145, 0.65)';
        this.ctx.fillRect(cartX - 32, cartY - 6, 48, 6);
        this.ctx.strokeStyle = 'rgba(226, 196, 145, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cartX - 28, cartY - 6);
        this.ctx.lineTo(cartX - 28, cartY + 10);
        this.ctx.lineTo(cartX + 12, cartY + 10);
        this.ctx.lineTo(cartX + 12, cartY - 6);
        this.ctx.stroke();

        // Beaver driver at the front of the wagon.
        this.drawShipmentBeaver(cartX - 68, cartY - 4, 1.15);

        // Cargo logs
        this.drawShipmentLogs(cartX - 2, cartY - 2, count);
    }

    drawShipmentBoat(x, y, count) {
        const boatX = x + 58;
        const boatY = y + 4;

        // Water ripple
        this.ctx.strokeStyle = 'rgba(120, 190, 255, 0.45)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(boatX - 76, boatY + 34);
        this.ctx.quadraticCurveTo(boatX - 26, boatY + 26, boatX + 24, boatY + 34);
        this.ctx.quadraticCurveTo(boatX + 72, boatY + 42, boatX + 120, boatY + 34);
        this.ctx.stroke();

        // Hull
        this.ctx.fillStyle = '#5a371f';
        this.ctx.beginPath();
        this.ctx.moveTo(boatX - 82, boatY + 20);
        this.ctx.lineTo(boatX + 56, boatY + 20);
        this.ctx.lineTo(boatX + 38, boatY + 46);
        this.ctx.lineTo(boatX - 60, boatY + 46);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#8e6138';
        this.ctx.beginPath();
        this.ctx.moveTo(boatX - 72, boatY + 18);
        this.ctx.lineTo(boatX + 44, boatY + 18);
        this.ctx.lineTo(boatX + 28, boatY + 30);
        this.ctx.lineTo(boatX - 56, boatY + 30);
        this.ctx.closePath();
        this.ctx.fill();

        // Cabin roof and pilot house for a period river steamer silhouette.
        this.ctx.fillStyle = '#d8c3a0';
        this.ctx.beginPath();
        this.ctx.roundRect(boatX - 30, boatY - 8, 42, 14, 3);
        this.ctx.fill();

        this.ctx.fillStyle = '#b48a57';
        this.ctx.beginPath();
        this.ctx.roundRect(boatX - 20, boatY - 17, 16, 10, 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(239, 226, 204, 0.85)';
        this.ctx.fillRect(boatX - 17, boatY - 14, 4, 4);
        this.ctx.fillRect(boatX - 10, boatY - 14, 4, 4);

        // Smokestack + smoke plumes for steam era feel.
        this.ctx.fillStyle = '#5f3f2a';
        this.ctx.beginPath();
        this.ctx.roundRect(boatX + 6, boatY - 18, 10, 20, 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(222, 222, 222, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(boatX + 12, boatY - 24, 4, 0, Math.PI * 2);
        this.ctx.arc(boatX + 18, boatY - 30, 3.2, 0, Math.PI * 2);
        this.ctx.arc(boatX + 24, boatY - 34, 2.8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = 'rgba(18, 93, 145, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(boatX - 86, boatY + 37);
        this.ctx.lineTo(boatX + 70, boatY + 37);
        this.ctx.stroke();

        // Beaver crew: one captain and two pushers at the stern helping drive leftward.
        this.drawShipmentBeaver(boatX - 22, boatY - 6, 1.2);
        this.drawShipmentBeaver(boatX + 42, boatY + 2, 1.02);
        this.drawShipmentBeaver(boatX + 58, boatY + 6, 0.92);

        // Push poles to make the assisting beavers read as pushing the craft along.
        this.ctx.strokeStyle = '#3f2a1d';
        this.ctx.lineWidth = 2.2;
        this.ctx.beginPath();
        this.ctx.moveTo(boatX + 50, boatY + 24);
        this.ctx.lineTo(boatX + 82, boatY + 42);
        this.ctx.moveTo(boatX + 64, boatY + 27);
        this.ctx.lineTo(boatX + 96, boatY + 46);
        this.ctx.stroke();

        // Cargo logs
        this.drawShipmentLogs(boatX - 8, boatY + 5, count);
    }

    drawShipmentBeaver(x, y, scale = 1) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-x, -y);

        // Tail behind the body.
        this.ctx.fillStyle = '#4d2f1e';
        this.ctx.beginPath();
        this.ctx.ellipse(x - 10, y + 20, 12, 7, -0.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Suit jacket / body.
        this.ctx.fillStyle = '#5a3a24';
        this.ctx.beginPath();
        this.ctx.roundRect(x - 8, y + 10, 18, 24, 7);
        this.ctx.fill();

        // White shirt front.
        this.ctx.fillStyle = '#eadcc6';
        this.ctx.beginPath();
        this.ctx.roundRect(x - 2, y + 16, 6, 10, 2);
        this.ctx.fill();

        // Head.
        this.ctx.fillStyle = '#8a5a38';
        this.ctx.beginPath();
        this.ctx.arc(x, y + 6, 11, 0, Math.PI * 2);
        this.ctx.fill();

        // Muzzle.
        this.ctx.fillStyle = '#c89a69';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 1, y + 9, 7, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Ears.
        this.ctx.fillStyle = '#7b4d30';
        this.ctx.beginPath();
        this.ctx.arc(x - 7, y - 2, 3, 0, Math.PI * 2);
        this.ctx.arc(x + 7, y - 2, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes and nose.
        this.ctx.fillStyle = '#1f120c';
        this.ctx.beginPath();
        this.ctx.arc(x - 3, y + 5, 1.2, 0, Math.PI * 2);
        this.ctx.arc(x + 4, y + 5, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + 1, y + 10, 1.8, 0, Math.PI * 2);
        this.ctx.fill();

        // Arms on the tiller.
        this.ctx.strokeStyle = '#5a3a24';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 1, y + 18);
        this.ctx.lineTo(x + 10, y + 22);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#3e2a1d';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y + 22);
        this.ctx.lineTo(x + 18, y + 18);
        this.ctx.stroke();

        // Little cap so the beaver reads as a ship captain.
        this.ctx.fillStyle = '#2f2018';
        this.ctx.beginPath();
        this.ctx.roundRect(x - 6, y - 8, 12, 5, 2);
        this.ctx.fill();

        // Reins / tiller so the beaver reads as the driver.
        this.ctx.strokeStyle = 'rgba(53, 34, 22, 0.85)';
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y + 20);
        this.ctx.lineTo(x + 28, y + 18);
        this.ctx.stroke();

        this.ctx.restore();
    }

    // Render next piece preview
    renderNextPiece() {
        // Clear canvas
        const previewGradient = this.nextPieceCtx.createLinearGradient(0, 0, 0, this.nextPieceCanvas.height);
        previewGradient.addColorStop(0, '#102532');
        previewGradient.addColorStop(1, '#06131c');
        this.nextPieceCtx.fillStyle = previewGradient;
        this.nextPieceCtx.fillRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);

        if (!game.nextPiece) return;

        const shape = game.nextPiece.shapes[0];
        const cellSize = 25;
        const renderMap = this.buildPieceRenderMap(shape);

        // Center the preview
        const offsetX = (this.nextPieceCanvas.width - shape[0].length * cellSize) / 2;
        const offsetY = (this.nextPieceCanvas.height - shape.length * cellSize) / 2;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 1) {
                    const px = offsetX + x * cellSize;
                    const py = offsetY + y * cellSize;
                    this.drawLogCell(px, py, cellSize, game.nextPiece.color, this.nextPieceCtx, true, renderMap[y][x]);
                }
            }
        }
    }

    buildPieceRenderMap(shape) {
        const map = [];
        const cells = [];

        for (let y = 0; y < shape.length; y++) {
            map[y] = [];
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 1) {
                    map[y][x] = null;
                    continue;
                }

                const neighbors = this.getShapeNeighbors(shape, x, y);
                map[y][x] = {
                    neighbors,
                    endCaps: {
                        left: false,
                        right: false,
                        up: false,
                        down: false
                    }
                };
                cells.push({ x, y, neighbors });
            }
        }

        if (cells.length === 0) return map;

        const minX = Math.min(...cells.map(cell => cell.x));
        const maxX = Math.max(...cells.map(cell => cell.x));
        const minY = Math.min(...cells.map(cell => cell.y));
        const maxY = Math.max(...cells.map(cell => cell.y));
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const horizontalMajorAxis = (maxX - minX) >= (maxY - minY);

        if (horizontalMajorAxis) {
            let startCandidates = cells.filter(cell => cell.x === minX && !cell.neighbors.left);
            let endCandidates = cells.filter(cell => cell.x === maxX && !cell.neighbors.right);
            if (startCandidates.length === 0) startCandidates = cells.filter(cell => cell.x === minX);
            if (endCandidates.length === 0) endCandidates = cells.filter(cell => cell.x === maxX);

            const startCell = startCandidates.reduce((best, cell) => {
                if (!best) return cell;
                return Math.abs(cell.y - centerY) < Math.abs(best.y - centerY) ? cell : best;
            }, null);

            const endCell = endCandidates.reduce((best, cell) => {
                if (!best) return cell;
                return Math.abs(cell.y - centerY) < Math.abs(best.y - centerY) ? cell : best;
            }, null);

            if (startCell) map[startCell.y][startCell.x].endCaps.left = true;
            if (endCell) map[endCell.y][endCell.x].endCaps.right = true;
        } else {
            let startCandidates = cells.filter(cell => cell.y === minY && !cell.neighbors.up);
            let endCandidates = cells.filter(cell => cell.y === maxY && !cell.neighbors.down);
            if (startCandidates.length === 0) startCandidates = cells.filter(cell => cell.y === minY);
            if (endCandidates.length === 0) endCandidates = cells.filter(cell => cell.y === maxY);

            const startCell = startCandidates.reduce((best, cell) => {
                if (!best) return cell;
                return Math.abs(cell.x - centerX) < Math.abs(best.x - centerX) ? cell : best;
            }, null);

            const endCell = endCandidates.reduce((best, cell) => {
                if (!best) return cell;
                return Math.abs(cell.x - centerX) < Math.abs(best.x - centerX) ? cell : best;
            }, null);

            if (startCell) map[startCell.y][startCell.x].endCaps.up = true;
            if (endCell) map[endCell.y][endCell.x].endCaps.down = true;
        }

        return map;
    }

    getShapeNeighbors(shape, x, y) {
        return {
            left: x > 0 && shape[y][x - 1] === 1,
            right: x < shape[y].length - 1 && shape[y][x + 1] === 1,
            up: y > 0 && shape[y - 1][x] === 1,
            down: y < shape.length - 1 && shape[y + 1][x] === 1
        };
    }

    // Draw individual cell
    drawCell(x, y, color, ctx, renderInfo = null) {
        const px = x * game.CELL_SIZE;
        const py = y * game.CELL_SIZE;
        const size = game.CELL_SIZE;

        this.drawLogCell(px, py, size, color, ctx, false, renderInfo);
    }

    drawLogCell(px, py, size, color, ctx, isPreview, renderInfo = null) {
        const inset = isPreview ? 2 : 1;
        const width = size - inset * 2;
        const height = size - inset * 2;
        const left = px + inset;
        const top = py + inset;
        const barkDark = this.adjustColor(color, -40);
        const barkLight = this.adjustColor(color, 4);
        const woodTone = this.adjustColor(color, 28);
        const amberTone = this.adjustColor(color, 38);
        const neighbors = renderInfo && renderInfo.neighbors ? renderInfo.neighbors : null;
        const endCaps = renderInfo && renderInfo.endCaps ? renderInfo.endCaps : null;
        const hasLeftNeighbor = neighbors && neighbors.left;
        const hasRightNeighbor = neighbors && neighbors.right;
        const hasUpNeighbor = neighbors && neighbors.up;
        const hasDownNeighbor = neighbors && neighbors.down;
        const drawLeftEnd = endCaps ? endCaps.left : !hasLeftNeighbor;
        const drawRightEnd = endCaps ? endCaps.right : !hasRightNeighbor;
        const drawTopEnd = endCaps ? endCaps.up : false;
        const drawBottomEnd = endCaps ? endCaps.down : false;

        ctx.save();

        // Main log body.
        const logGradient = ctx.createLinearGradient(left, top, left, top + height);
        logGradient.addColorStop(0, barkLight);
        logGradient.addColorStop(0.18, woodTone);
        logGradient.addColorStop(0.55, amberTone);
        logGradient.addColorStop(0.82, color);
        logGradient.addColorStop(1, barkDark);
        ctx.fillStyle = logGradient;
        ctx.beginPath();
        ctx.roundRect(left, top + 4, width, height - 8, 9);
        ctx.fill();

        // Bridge tiny cell gaps so connected tetromino cells read as one piece.
        if (hasLeftNeighbor) {
            ctx.fillStyle = woodTone;
            ctx.fillRect(left - inset - 1, top + 6, inset + 2, height - 12);
        }
        if (hasRightNeighbor) {
            ctx.fillStyle = woodTone;
            ctx.fillRect(left + width - 1, top + 6, inset + 2, height - 12);
        }
        if (hasUpNeighbor) {
            ctx.fillStyle = amberTone;
            ctx.fillRect(left + 6, top - inset - 1, width - 12, inset + 2);
        }
        if (hasDownNeighbor) {
            ctx.fillStyle = amberTone;
            ctx.fillRect(left + 6, top + height - 1, width - 12, inset + 2);
        }

        // Bark bands at the ends.
        const barkWidth = Math.max(5, Math.round(width * 0.14));
        if (drawLeftEnd) {
            ctx.fillStyle = barkDark;
            ctx.beginPath();
            ctx.roundRect(left, top + 4, barkWidth + 1, height - 8, 8);
            ctx.fill();
        }
        if (drawRightEnd) {
            ctx.fillStyle = barkDark;
            ctx.beginPath();
            ctx.roundRect(left + width - barkWidth - 1, top + 4, barkWidth + 1, height - 8, 8);
            ctx.fill();
        }
        if (drawTopEnd) {
            ctx.fillStyle = barkDark;
            ctx.beginPath();
            ctx.roundRect(left + 4, top, width - 8, barkWidth + 1, 8);
            ctx.fill();
        }
        if (drawBottomEnd) {
            ctx.fillStyle = barkDark;
            ctx.beginPath();
            ctx.roundRect(left + 4, top + height - barkWidth - 1, width - 8, barkWidth + 1, 8);
            ctx.fill();
        }

        // End grain rings so each segment reads as cut timber.
        const ringRadiusX = Math.max(2.2, barkWidth - 1.8);
        const ringRadiusY = Math.max(2.8, (height - 10) * 0.34);
        const ringCenterY = top + height / 2;
        const leftRingX = left + barkWidth * 0.52;
        const rightRingX = left + width - barkWidth * 0.52;

        if (drawLeftEnd || drawRightEnd || drawTopEnd || drawBottomEnd) {
            ctx.fillStyle = this.adjustColor(color, 20);
            ctx.beginPath();
            if (drawLeftEnd) {
                ctx.ellipse(leftRingX, ringCenterY, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
            }
            if (drawRightEnd) {
                ctx.ellipse(rightRingX, ringCenterY, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
            }
            ctx.fill();

            ctx.strokeStyle = 'rgba(73, 44, 24, 0.48)';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            if (drawLeftEnd) {
                ctx.ellipse(leftRingX, ringCenterY, ringRadiusX * 0.88, ringRadiusY * 0.86, 0, 0, Math.PI * 2);
                ctx.ellipse(leftRingX, ringCenterY, ringRadiusX * 0.55, ringRadiusY * 0.52, 0, 0, Math.PI * 2);
            }
            if (drawRightEnd) {
                ctx.ellipse(rightRingX, ringCenterY, ringRadiusX * 0.88, ringRadiusY * 0.86, 0, 0, Math.PI * 2);
                ctx.ellipse(rightRingX, ringCenterY, ringRadiusX * 0.55, ringRadiusY * 0.52, 0, 0, Math.PI * 2);
            }
            ctx.stroke();
        }

        // Midline shadow and grain.
        ctx.strokeStyle = 'rgba(32, 18, 11, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(left + 6, top + height / 2);
        ctx.lineTo(left + width - 6, top + height / 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 236, 184, 0.26)';
        ctx.lineWidth = 1;
        const grainLines = isPreview ? 2 : 3;
        for (let i = 0; i < grainLines; i++) {
            const grainY = top + 7 + (i * (height - 14) / Math.max(1, grainLines - 1));
            ctx.beginPath();
            ctx.moveTo(left + barkWidth + 5, grainY);
            ctx.quadraticCurveTo(left + width / 2, grainY - 2 + (i % 2), left + width - barkWidth - 5, grainY);
            ctx.stroke();
        }

        // Keep surface details flat; avoid circular knots that read as raised bumps.

        ctx.strokeStyle = 'rgba(255, 240, 214, 0.16)';
        ctx.lineWidth = 1;
        if (drawLeftEnd) {
            ctx.beginPath();
            ctx.moveTo(left + barkWidth + 2, top + 6);
            ctx.lineTo(left + barkWidth + 2, top + height - 6);
            ctx.stroke();
        }
        if (drawRightEnd) {
            ctx.beginPath();
            ctx.moveTo(left + width - barkWidth - 2, top + 6);
            ctx.lineTo(left + width - barkWidth - 2, top + height - 6);
            ctx.stroke();
        }

        // Highlight along the top to show a rounded timber surface.
        ctx.fillStyle = 'rgba(255, 243, 204, 0.2)';
        ctx.beginPath();
        ctx.roundRect(left + barkWidth + 3, top + 6, width - (barkWidth * 2) - 6, 3, 2);
        ctx.fill();

        ctx.restore();
    }

    adjustColor(hex, amount) {
        const normalized = hex.replace('#', '');
        const value = normalized.length === 3
            ? normalized.split('').map(ch => ch + ch).join('')
            : normalized;
        const num = parseInt(value, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
        const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Update UI displays
    updateUI() {
        this.scoreDisplay.textContent = this.formatCurrency(game.score);
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
