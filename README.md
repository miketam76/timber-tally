# Timber Tally

An alternate-history lumber trade story set in the late 1800s, where humans and highly intelligent beavers run the river timber economy together. The opening handshake marks the Great Log Accord, a business deal that links beaver timber supply with human industry and technology.

You play a beaver named Chuck, a "Timber Tally" worker who manages logs as they float down the river. The goal is not just to clear lines, but to complete orders, keep the ledger moving, and ship perfect stacks off to human cities by wagon or steamboat. As contracts grow, the work gets bigger and the stakes rise, from cabins to railroads and Victorian megaprojects.

## Features

- 💵 **Earnings System** - Contract bonuses add to your final total
- 🎮 **Responsive Controls** - Keyboard plus a mobile on-screen gamepad
- 👻 **Ghost Piece** - Preview showing where your current log stack will land
- 🔊 **Sound Effects** - Audio feedback with mute toggle
- 💾 **Local Leaderboard** - High scores saved to browser storage
- ⏸️ **Pause/Resume** - Play at your own pace
- 📱 **Mobile-Friendly** - Sidebar HUD and bottom gamepad for touch play

## Narrative Endings

The game includes three distinct narrative endings determined by both your **minimum level requirement** and **total money earned**. Earnings are displayed as dollars at $0.01 per point.

| Ending | Min Level | Earnings Range | Description |
|---|---:|---:|---|
| **Ending 1** | Level 9+ | $250–$450 | Humble Hauler |
| **Ending 2** | Level 9+ | $450–$1000 | Seasoned Shipper |
| **Ending 3** | Level 14+ | Over $1000 | Legend of the Woods |

You must reach **both** the minimum level **AND** earn within the corresponding earnings range to unlock each ending.

### Special Achievement

🏆 **BEST TIMBER TALLY EVER!**

If you reach **Level 20** (the final level) and earn over **$1000**, you'll unlock the special **"BEST TIMBER TALLY EVER!"** title on your final score display!

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

This build includes three distinct narrative endings selected by a combination of final earnings and which contracts (levels) you passed. Earnings are displayed as dollars at $0.01 per point.

- **Ending 1** (Humble Hauler): final earnings **$250–$450** (inclusive). Player must have passed **Level 9** to see this ending.
- **Ending 2** (Seasoned Shipper): final earnings **$450–$1,000** (inclusive). Player must have passed **Level 9** to see this ending.
- **Ending 3** (Legend of the Woods): final earnings **over $1,000**. Player must have reached at least **Level 14** to see this ending.

### BEST TIMBER TALLY EVER Achievement

Reach **Level 20** with over **$1,000** earned to unlock the **"BEST TIMBER TALLY EVER!"** title on your final score.

These endings are enforced in `ui.js` (chooseEndingVariant) and require both the dollar thresholds and the level progress conditions above.

If you'd like to test them quickly while running the game (for example using VS Code's Go Live):

1. Open the game page in your browser and open DevTools (F12).
2. Paste the helper below into the Console and run it once:

```javascript
function forceEnding(variant) {
    // Points chosen to meet the new dollar+level rules. Points = dollars * 100
    const scoreByVariant = {
        tradition: 20000, // $200 -> between $100 and $450
        expansion: 60000, // $600 -> between $450 and $1000
        township: 150000 // $1500 -> > $1000
    };
    if (!gameUI || !game) return console.error('gameUI/game not found');

    // Set a matching `game.level` for the chosen variant so the level checks pass
    if (variant === 'tradition') {
        game.level = 10; // passed level 9
    } else if (variant === 'expansion') {
        game.level = 10; // passed level 9
    } else if (variant === 'township') {
        game.level = 13; // minimum required for Township
    }

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
