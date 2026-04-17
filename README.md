# Forest Stacker

> ⚠️ **DISCLAIMER**: This is a **prototype/educational project** created for learning purposes only. This project is NOT intended for public distribution, commercial use, or any public release. Tetris is a registered trademark owned by The Tetris Company, and this implementation is not affiliated with or endorsed by them. Please do not distribute or use this project publicly.

A fully-featured game inspired by Tetris built with HTML/CSS/JavaScript featuring:

## Features
- ⬇️ **Classic Tetris Gameplay** - 7 tetrominoes with proper collision detection
- 🎯 **Stacker Bonus** - Clear all 4 lines at once for maximum points (1200 pts!)
- 📊 **Scoring System** - Points for 1/2/3/4-line clears, progressive levels
- 🎮 **Responsive Controls** - Keyboard plus a mobile on-screen gamepad
- 👻 **Ghost Piece** - Preview showing where your piece will land
- 🔊 **Sound Effects** - Retro audio feedback with mute toggle
- 💾 **Local Leaderboard** - Top 10 high scores saved to browser storage (shown on game over)
- ⏸️ **Pause/Resume** - Play at your own pace
- 📱 **Mobile-Friendly** - Game Boy-style layout with a bottom gamepad
- 🎨 **Retro Aesthetic** - Classic neon green on black

## How to Play

### Controls

**Desktop Keyboard:**
- `←  →` - Move piece left/right
- `↑  W  X` - Rotate piece
- `↓  S` - Soft drop (accelerated falling)
- `SPACE` - Hard drop (instant to bottom)
- `P` - Pause/Resume
- **Combo**: Hold `↓` + press any action key (arrows, rotate, space) = Hard drop

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
| 1 Line | 40 pts |
| 2 Lines | 100 pts |
| 3 Lines | 300 pts |
| 4 Lines (Stacker!) | 1200 pts 🎉 |

### Game Rules

1. Pieces fall from the top
2. Complete horizontal lines to clear them and earn points
3. Game ends when a new piece can't fit at the top
4. Speed increases with each level (every 10 lines cleared)
5. High scores are automatically saved to your browser

## Installation

Simply open `index.html` in a web browser. No installation required!

```bash
# Optional: Run a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

## Files

- `index.html` - Game structure and UI elements
- `styles.css` - Styling and animations
- `game.js` - Core game logic (board, pieces, collision, line clearing)
- `ui.js` - Canvas rendering and input handling
- `audio.js` - Sound effects using Web Audio API
- `music.js` - **8-bit chiptune music generation** using procedural composition
- `storage.js` - Leaderboard persistence with localStorage

## Browser Support

Works on all modern browsers with HTML5 Canvas and Web Audio API support:
- Chrome/Edge (all versions)
- Firefox (all versions)
- Safari 11+
- Mobile browsers (iOS Safari, Android Chrome, Firefox Mobile)

## Tips

1. **Look for the ghost piece** - It shows where your current piece will land
2. **Go for Stacker!** - 4-line clears award massive points (1200 pts)
3. **Speed matters** - Higher levels move faster but award more points
4. **Mobile gameplay** - Use the bottom gamepad controls; hold directional buttons for smoother movement
5. **Music selection** - Choose your music theme before starting the game!

## Music & Audio

The game includes a **procedurally generated 8-bit chiptune music system** with 3 selectable themes. No external files needed - the music is created in real-time using the Web Audio API!

### 🎵 Music Themes

- **🌲 8-bit Woodland** - Cheerful retro chiptune (120 BPM)
- **🧘 Zen Meditation** - Calm, meditative melody (60 BPM)
- **🎻 Celtic Jig** - Upbeat, energetic folk tune (140 BPM)

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

- Optimized canvas rendering for smooth 60 FPS gameplay
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
