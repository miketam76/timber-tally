# Timber Tally

# Disclaimer
Inspired by Tetris. Tetris is a registered trademark of The Tetris Company, and Timber Tally is not affiliated with or endorsed by them.

# Story
Timber Tally is an alternate-history lumber trade story set in the late 1800s, where humans and highly intelligent beavers run the river timber economy together. The opening handshake marks the Great Log Accord, a business deal that links beaver timber supply with human industry and technology.

You play a beaver fulfillment specialist managing logs as they float down the river. The goal is not just to clear lines, but to complete orders, keep the ledger moving, and ship perfect stacks off to human cities by wagon or steamboat. As contracts grow, the work gets bigger and the stakes rise, from cabins to railroads and Victorian megaprojects.

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

At the start screen, choose your music, review the controls, or open About to see the story artwork and background. Press Start Shift when you are ready to begin the run.

### Controls

**Desktop Keyboard:**
- `←  →` - Move log left/right
- `↑  W  X` - Rotate log
- `↓  S` - Soft drop (accelerated falling)
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

| Lines Cleared | Points |
|---|---|
| 1 Line | base shipment |
| 2 Lines | 100 bonus |
| 3 Lines | 200 bonus |
| 4 Lines (Full Load) | 1000 bonus |

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

### 🎵 Music Themes

- **🌲 Woodland** - Cheerful river-country melody
- **🧘 Zen** - Calm, meditative theme
- **🎻 Celtic** - Upbeat, energetic folk tune

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
// Woodland theme melody (in music.js):
woodlandMelody() {
    return [
        { pitch: 'E4', duration: 1, volume: 0.15 },
        { pitch: 'G4', duration: 1, volume: 0.15 },
        { pitch: 'E5', duration: 2, volume: 0.12 },
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

Enjoy! 🎮
