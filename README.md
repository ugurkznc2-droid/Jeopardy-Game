# Jeopardy Tournament Game

A polished, browser-based Jeopardy game built for in-person school tournaments. One operator manages everything from a single laptop connected to a projector.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:5173` in your browser. Use fullscreen (F11 or press F in-game) for projector display.

## How to Use

### 1. Create a Game

- Click **"+ New Game"** on the home screen, or **"Load Sample Game"** for a pre-built demo
- Give your game a title
- Add teams (at least 2) with custom names and colors
- Set the countdown timer duration (default: 30 seconds)

### 2. Set Up Questions

- Click a category to expand and edit its questions
- Each question has: point value, question text, answer text, and optional Daily Double toggle
- Add/remove categories and questions as needed
- Add multiple rounds and a Final Jeopardy round
- Everything autosaves to your browser

### 3. Start the Game

- Click **"Start Game"** when ready
- The game board displays a classic Jeopardy grid: categories across the top, point values down the side

### 4. Run a Live Game

1. Click any dollar amount on the board
2. The question appears fullscreen
3. Timer counts down automatically (ticks in the last 5 seconds)
4. Press **"Reveal Answer"** (or R key) to show the answer
5. Click the check or X next to a team name to award/deduct points
6. Board returns with the cell marked as used and scores updated
7. When all questions are answered, advance to the next round or Final Jeopardy

### 5. Final Jeopardy

1. Category is revealed first
2. Operator enters each team's wager
3. Question is displayed
4. Operator judges each team's answer (correct/wrong)
5. Scores update and the winner is announced

## Keyboard Shortcuts (During Play)

| Key | Action |
|-----|--------|
| **Space** | Start/pause timer |
| **R** | Reveal answer |
| **1-9** | Mark that team number as correct (after answer is revealed) |
| **Escape** | Close question / go back |
| **F** | Toggle fullscreen |
| **M** | Toggle sound mute |

## Features

- **Game board**: Classic 6-category Jeopardy grid with animated cells
- **Timer**: Configurable countdown with visual bar and audio ticks
- **Scoring**: Automatic score tracking with animated counters
- **Daily Double**: Surprise reveal animation, team selection, custom wager
- **Final Jeopardy**: Category reveal, wager collection, team-by-team judging
- **Sound effects**: Correct/wrong buzzer, timer ticks, Daily Double fanfare (all generated via Web Audio API, no files needed)
- **Animations**: Green/red flash on correct/wrong, score pop, Daily Double spin
- **Scoreboard page**: Full-screen standings with podium display and animated score counting
- **Import/Export**: Save and load games as JSON files
- **Duplicate games**: Copy an existing game setup for a new round
- **Autosave**: All data persists in browser localStorage
- **Confirmation dialogs**: Before resetting, deleting, or starting games
- **Multiple rounds**: Support for Round 1, Round 2, Final Jeopardy

## Customizing

### Adding Questions

Edit questions directly in the Setup page, or modify `src/utils/sampleData.ts` for the demo game.

### Sound Effects

All sounds are generated programmatically in `src/utils/sounds.ts` using the Web Audio API. Modify frequencies, durations, and waveforms to customize. No audio files needed.

### Styling

Colors are defined as Tailwind theme tokens in `src/index.css`:
- `--color-jeopardy-blue`: Board cell blue
- `--color-jeopardy-gold`: Dollar amount gold
- `--color-jeopardy-dark`: Background dark blue
- `--color-jeopardy-cell`: Active cell color
- `--color-jeopardy-used`: Answered cell color

### Importing a Game

Export a game as JSON from the home screen, edit the JSON file, then import it back. The JSON structure follows the `Game` type in `src/types.ts`.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v4 (styling)
- Zustand (state management with localStorage persistence)
- Framer Motion (animations)
- React Router (navigation)
- Web Audio API (sound effects)

## Project Structure

```
src/
  types.ts              # TypeScript interfaces (Game, Team, Question, etc.)
  store/gameStore.ts     # Zustand store with all game actions
  utils/
    sounds.ts            # Web Audio sound effects
    sampleData.ts        # Demo game seed data
    helpers.ts           # Utilities (ID generation, colors)
  pages/
    HomePage.tsx          # Game list, create/load/import
    SetupPage.tsx         # Game editor
    PlayPage.tsx          # Live game board
    ScoreboardPage.tsx    # Full-screen standings
  components/
    GameBoard.tsx         # Category/point grid
    QuestionModal.tsx     # Fullscreen question + timer + controls
    Timer.tsx             # Countdown timer
    Scoreboard.tsx        # Score display with animations
    FinalJeopardy.tsx     # Final Jeopardy flow
    ConfirmDialog.tsx     # Confirmation modal
    SoundToggle.tsx       # Mute/unmute button
```

## Tips for Tournament Use

- **Test before the event**: Load the sample game and practice the full flow
- **Use fullscreen**: Press F or F11 for clean projector display
- **Mute during setup**: Toggle sound off while configuring, on during play
- **Export backups**: Export your game JSON before the event
- **Multiple rounds**: Create separate games for each tournament round, or use the built-in multi-round support
- **Reset between matches**: Use the Reset button to clear scores and re-open all questions
