# Timber Tally

# Disclaimer
Inspired by Tetris. Tetris is a registered trademark of The Tetris Company, and Timber Tally is not affiliated with or endorsed by them.

# Story
Timber Tally is an alternate-history lumber trade story set in the late 1800s, where humans and highly intelligent beavers run the river timber economy together. The opening handshake marks the Great Log Accord, a business deal that links beaver timber supply with human industry and technology.

You play a beaver named Chuck, a "Timber Tally" worker who manages logs as they float down the river. The goal is not just to clear lines, but to complete orders, keep the ledger moving, and ship perfect stacks off to human cities by wagon or steamboat. As contracts grow, the work gets bigger and the stakes rise, from cabins to railroads and Victorian megaprojects.

## Features
- 🦫 **Alternate-History Story** - A river trade partnership between humans and beavers
- 📜 **Great Log Accord** - Story-driven intro artwork and About panel
- 🪵 **Timber Shipment Gameplay** - Organize logs into clean stacks and fulfill contracts
- 💵 **Earnings System** - Contract bonuses add to your final total
- 🎮 **Responsive Controls** - Keyboard plus a mobile on-screen gamepad
- 👻 **Ghost Piece** - Preview showing where your current log stack will land
- 🔊 **Sound Effects** - Audio feedback with mute toggle
- 💾 **Local Leaderboard** - High scores saved to browser storage
- ⏸️ **Pause/Resume** - Play at your own pace
- 📱 **Mobile-Friendly** - Sidebar HUD and bottom gamepad for touch play

## How to Play

At the start screen, choose your music, review the controls, or open About to see the story artwork and background. Click the START SHIFT button to begin the run.

### Controls

**Desktop Keyboard:**
- `←` / `→` or `A` / `D` (or `WASD`) - Move log left/right
- `↑` / `W` / `X` - Rotate log
- `↓` / `S` - Soft drop (accelerated falling)
- `SPACE` - Hard drop (instant to bottom)
- `P` - Pause/Resume

**Mobile Gamepad:**
- **D-pad Left/Right** - Move piece left/right (hold to repeat)
- **D-pad Down** - Soft drop while held
- **D-pad Up** - Rotate piece
- **A Button** - Rotate piece
- **B Button** - Hard drop
- **Top Pause Button (⏸)** - Pause/Resume

### Scoring

Base line-clear points stay the same internally. Earnings are presented as period wages at `$0.01` per point:

| Lines Cleared | Points (Base) | 1880s Wage Value | Historical Context |
|---|---:|---:|---|
| 1 Line | 40 | $0.40 | About 1/3 of a full day's pay. |
| 2 Lines | 100 | $1.00 | A solid standard day's wage. |
| 3 Lines | 300 | $3.00 | A full day's pay for a highly skilled foreman. |
| 4 Lines (Full Load) | 1200 | $12.00 | A full week's wages in one move. |

Contract bonuses are also converted using the same rate so all in-game earnings remain consistent with the period economy theme.

#### Instant Shipment Premiums

These are paid instantly when the clear happens:

| Clear Type | Premium (Points) | Wage Value | Flavor |
|---|---:|---:|---|
| 2-Line Clear | 500 | $5.00 | Efficiency tip |
| 3-Line Clear | 1500 | $15.00 | Foreman's Notice |
| Timber! (4 Lines) | 5000 | $50.00 | Legend of the Woods status |

### Game Rules

1. Logs float down from the top of the river
2. Complete horizontal lines to fulfill a shipment order
3. Cleared stacks are hauled off to a waiting delivery vehicle
4. Speed increases with each contract level
5. High scores are automatically saved to your browser

## Installation

No build step is required. Open `index.html` directly in a browser, or run a local web server for the smoothest experience.

```bash
# Optional: Run a local server from the project folder
python -m http.server 8000
# Then visit http://localhost:8000
```

If you prefer Node.js, you can use any static file server such as `npx serve` or `npx http-server`.

## Files

- `index.html` - Game structure, start screen, and story/about modal
- `styles.css` - Styling, layout, and artwork
- `game.js` - Core game logic, contracts, scoring, and line handling
- `ui.js` - Canvas rendering, overlays, and input handling
- `audio.js` - Sound effects using Web Audio API
- `music.js` - Procedural music themes
- `storage.js` - Leaderboard persistence with localStorage
- `storage.js` - Leaderboard persistence with localStorage (uses localStorage key `TimberTally_leaderboard`; legacy `Stacker_leaderboard` will be migrated automatically)

## Browser Support

Works on all modern browsers with HTML5 Canvas and Web Audio API support:
- Chrome/Edge (all versions)
- Firefox (all versions)
- Safari 11+
- Mobile browsers (iOS Safari, Android Chrome, Firefox Mobile)

## Tips

1. **Watch the ghost piece** - It shows where your current log stack will land
2. **Aim for full loads** - Bigger clears earn the largest contract bonuses
3. **Speed matters** - Higher contracts move faster and raise the pressure
4. **Mobile gameplay** - Use the bottom gamepad controls; hold directional buttons for smoother movement
5. **Music selection** - Choose your music theme before starting the game!

## Music & Audio

The game includes a **procedurally generated music system** with 3 selectable themes. No external files needed - the music is created in real-time using the Web Audio API!

Note: Some browsers (notably mobile Safari and other mobile browsers) require a user interaction (click/tap) before the Web Audio API will produce sound. If you don't hear audio immediately, interact with the page (for example, press the START SHIFT button or tap the screen) to enable sound.

### 🎵 Music Themes

- **🎹 Morning Whistle** - Early-morning ragtime-inspired melody
- **🎻 River Driver Jig** - Energetic logging folk rhythm
- **⚙️ Sawmill Scramble** - Fast stride-piano industrial drive

Music speeds up dynamically with difficulty levels (up to 1.5x speed) for extra intensity!

### How It Works

The music system generates authentic 8-bit chiptune melodies using:
- **Square wave oscillators** for that classic retro sound
- **Real-time procedural composition** with note sequences
- **Dynamic tempo adjustment** based on game level
- **Automatic looping** for continuous background music

### Customization

Want to modify the music? Edit the melody sequences in `music.js`:

```javascript
// Morning Whistle melody (in music.js):
morningWhistleMelody() {
    return [
        { pitch: 'C4', duration: 1, volume: 0.18 },
        { pitch: 'E4', duration: 0.5, volume: 0.15 },
        { pitch: 'G4', duration: 0.5, volume: 0.18 },
        // ... more notes
    ];
}
```

Change `pitch` values (note names), `duration` (beat length), or `volume` to customize the sound!

## Performance

- Optimized canvas rendering for smooth gameplay
- Efficient Web Audio API usage for procedural music
- Minimal CPU usage, works well on older devices
- No external dependencies - pure vanilla JavaScript

## Future Ideas

- Difficulty modes
- Multiplayer (local or online)
- Different themes/skins
- Sound effect options (8-bit vs. modern)
- Tutorials or challenging modes

## Endings & Testing

This build includes three distinct narrative endings determined by your final earnings (displayed as dollars at $0.01 per point):

- Tradition (Humble Hauler) — modest run, earned less than $100. Image: `images/Ending_Humble_Hauler.webp`.
- Expansion (Seasoned Shipper) — steady, mid-level success, $100 — $1,000. Image: `images/Ending_Seasoned_Shipper.webp`.
- Township (Legend of the Woods) — high-score/lucky runs, > $1,000. Uses the five-scene story sequence with `images/Ending_scene_1.webp` through `images/Ending_scene_5.webp` and the original scene texts.

These endings are selected by `ui.js` at the end-of-run sequence using your final `game.score`. If you'd like to test them quickly while running the game (for example using VS Code's Go Live):

1. Open the game page in your browser and open DevTools (F12).
2. Paste the helper below into the Console and run it once:

```javascript
function forceEnding(variant) {
    const scoreByVariant = { tradition: 5000, expansion: 30000, township: 150000 };
    if (!gameUI || !game) return console.error('gameUI/game not found');
    game.score = scoreByVariant[variant];
    gameUI.startEndingSequence();
    console.log('Triggered', variant, '->', gameUI.chooseEndingVariant(game.score));
}
// Examples:
// forceEnding('tradition');
// forceEnding('expansion');
// forceEnding('township');
```

3. To exercise the in-game contract -> win flow (closer to real gameplay):

```javascript
// Simulate a final contract summary that reaches the last level
game.triggerContractSummary({ reachedMaxLevel: true, completedLevel: game.level });
// Then dismiss the UI contract summary (this follows the normal flow)
gameUI.dismissContractSummary();
```

Files & hooks:
- Ending selection logic: `ui.js` (chooseEndingVariant / startEndingSequence)
- Contract summary flow: `game.js` (triggerContractSummary / resumeAfterContractSummary)

If you want a small debug UI to switch endings without the console I can add it as a temporary overlay.

Enjoy! 🎮
