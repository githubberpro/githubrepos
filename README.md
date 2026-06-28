# Ida — Home Improvement & Interior Design Studio

Upload your **floor plans** and **room photos**, then step into any room and get
expert, room‑by‑room recommendations from **Ida**, your built‑in design advisor.

Ida is modeled on the best interior‑design software — Houzz Pro, Planner 5D,
Foyr Neo, Morpholio Board, Modsy/Spacejoy and SketchUp — and folds their best
ideas (project dashboards, mood boards, auto color palettes, shoppable lists
with live budget tallies, dimensioning and lighting studies) into one tool.

## What it does

- **🏠 Project dashboard** — name your project, upload a 2D floor plan, and set
  your style + budget so every recommendation is tailored to you.
- **🛋 Room studio** — step into any room and get a full design brief:
  - **Overview** — design principles, key measurements, and Ida's pro tips
  - **Photos** — upload photos of the room (drag & drop); they become your
    visual reference and mood board
  - **Ida's recommendations** — curated advice across layout, lighting,
    acoustics, color, furniture, technology and materials
  - **Color & mood** — hand‑picked palettes (click a swatch to copy its hex)
  - **Shopping & budget** — a prioritized shopping list with a live budget tally
- **💬 Chat with Ida** — a context‑aware assistant docked beside every room.
  Ida knows which room you're in, how many photos you've uploaded, and your
  style + budget, and answers with concrete, specific recommendations.

### Focus rooms (the starting set)

| Room | Focus |
| --- | --- |
| 🎬 **Home Theatre** | Light control, acoustics, sightlines, Atmos surround |
| 🧖 **Sauna** | Wood selection, heater sizing, ventilation, safe warm lighting |
| 🎹 **Music Room** | Balanced acoustics (absorb *and* diffuse), isolation, layout |
| 📚 **Study Room 1 — Focus Office** | Ergonomics, glare‑free task light, calm color |
| 📖 **Study Room 2 — Reading & Collaboration** | Cozy reading nook, warm flexible space |

Adding more rooms is a matter of adding an entry to `data/knowledge.js`.

## Running it

```bash
npm install
npm start
# open http://localhost:3000
```

Node 18+ is required.

### Ida: live vs. curated

Ida works out of the box with **no API key** using a built‑in expert "curated
brain" (the same professional knowledge base that powers the room briefs).

To upgrade Ida to **live Claude‑powered** conversations, set an Anthropic API
key before starting:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
# optional: choose the model (defaults to claude-sonnet-4-6)
export IDA_MODEL=claude-sonnet-4-6
npm start
```

The badge in the sidebar shows the current mode (**Ida live** vs **Ida ready**).
If a live call fails for any reason, Ida automatically falls back to the curated
brain so the app never goes dark.

## How it's built

- **Backend** — a small [Express](https://expressjs.com/) server (`server.js`)
  that serves the app, exposes the room catalog (`/api/rooms`), and answers chat
  requests (`/api/ida`). No database required.
- **Knowledge base** — `data/knowledge.js` is the single source of truth: an
  expert brief per room (principles, recommendations, palettes, shopping list,
  measurements, pro tips) shared by the server brain and the UI.
- **Frontend** — a dependency‑free ES‑module SPA in `public/`. Project state
  lives in `localStorage`; uploaded images are compressed client‑side and stored
  in **IndexedDB**, so nothing leaves your machine.

```
server.js            Express server + Ida (Claude / curated)
data/knowledge.js    Expert design knowledge base (all rooms)
public/
  index.html         App shell
  css/styles.css     Studio UI
  js/app.js          Controller (dashboard, rooms, uploads, chat)
  js/store.js        localStorage + IndexedDB persistence
  js/md.js           Tiny Markdown renderer for Ida's replies
```

## Privacy

Your floor plan and room photos stay in your browser (IndexedDB) and are never
uploaded. When Ida is in **live** mode, only your typed message plus light
context (room, style, budget, photo count) is sent to the Claude API — never the
images themselves.
