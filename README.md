# Civ VI Randomizer — Tome of Many Worlds

A single-page randomizer for Civilization VI game setup. Pick your DLC, set player counts, lock anything you want to keep, then roll the rest.

**[Play it live →](https://mringsby.github.io/civ6-randomizer/)**

## What it randomizes

- Leaders & civilizations (filtered to your owned DLC)
- Map type, size, difficulty, game speed, start era, resources
- World climate settings (age, temperature, rainfall, sea level, disasters)
- Game modes (Apocalypse, Heroes & Legends, Secret Societies, etc.)
- Victory conditions

## Features

- **Lock** any individual setting — it survives rolls
- **Collapse** entire sections to exclude them from "Roll Everything"
- **Per-setting reroll** — reroll just one thing without touching the rest
- DLC-aware: disabling a pack clears unlocked leaders that required it
- Up to 12 players (Civ VI's standard cap)

## How to run locally

No build step required. Just open `index.html` in a browser — it loads React and Babel from CDN.

```bash
# Or use any static server, e.g.:
npx serve .
```

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch**, branch `main`, folder `/ (root)`
4. GitHub Pages will serve `index.html` at `https://<username>.github.io/<repo>/`

## Tech

- React 18 (CDN) + Babel Standalone for JSX — no build pipeline needed
- Pure CSS with custom properties (no framework)
- No external dependencies beyond Google Fonts and React CDN

## Data

All Civ VI content (leaders, civilizations, DLC packs, game options) is in `data.js`. This is an unofficial fan tool — all names are factual product references. The visual design is original and not derived from the game's UI.
