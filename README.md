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

## Cross-device sync

By default your photos and layouts live in **your browser** (durable, but tied to
one device). To access the same project from your phone, laptop and tablet, turn
on **cross-device sync**:

1. Deploy Ida with a free **Neon Postgres** database (see *Deploying* below) and
   set the `DATABASE_URL` environment variable.
2. In the app, click **Sync → Create my workspace**. Ida uploads your current
   project and photos and gives you a **workspace key**.
3. On any other device, open Ida and click **Sync → paste the key → Connect**.
   The same project (state + images) appears instantly, and every change syncs.

How it works: project state lives in a `project_state` table and images in an
`images` table, both keyed by an unguessable **workspace token**. The token acts
like a private share link — anyone with it can view/edit the project, so keep it
private. With no `DATABASE_URL`, sync is simply disabled and the app stays fully
functional in local-only mode (the **Sync** chip shows *Local only*).

> Storage note: images are compressed client-side (~1600px JPEG) before upload, so
> Neon's free 0.5 GB tier comfortably holds a personal multi-room project.

## Deploying (free)

Ida is a normal Node/Express app, so any Node host works. Two free paths:

**Render + Neon (recommended — keeps live Ida + cross-device sync):**
1. Create a free Postgres at [neon.tech](https://neon.tech) and copy its
   connection string.
2. Push this repo and deploy on [Render](https://render.com) — the included
   `render.yaml` makes it a one-click Blueprint (free web service).
3. In Render → your service → **Environment**, set `DATABASE_URL` (from Neon) and,
   optionally, `ANTHROPIC_API_KEY` for live Claude. Done.

   *(Free Render services sleep after ~15 min idle, so the first request after a
   nap takes a few seconds to wake.)*

**Auto-deploy on push (CI-gated).** A GitHub Action
(`.github/workflows/deploy.yml`) runs the smoke test on every push and, only if
it passes, triggers a Render deploy. One-time setup:

1. Create a free account at [render.com](https://render.com) (sign in with
   GitHub) and deploy this repo as a Blueprint (uses `render.yaml`).
2. In Render → your service → **Settings → Deploy Hook**, copy the hook URL.
3. In GitHub → repo **Settings → Secrets and variables → Actions → New
   repository secret**, add `RENDER_DEPLOY_HOOK_URL` = that URL.

That's it — every green push now auto-deploys. Until the secret is added, the
deploy step simply skips (CI still runs). `render.yaml` sets `autoDeploy: false`
so Render doesn't also deploy on its own (no double deploys).

**Fully static (free forever, no server):** if you don't need live Claude or
cross-device sync, Ida also runs as a local-only app you can host on any static
host — the curated Ida brain and room catalog run client-side. (Cross-device sync
requires the server + database described above.)

## How it's built

- **Backend** — a small [Express](https://expressjs.com/) server (`server.js`)
  that serves the app, exposes the room catalog (`/api/rooms`), answers chat
  requests (`/api/ida`), and — when a database is configured — provides the sync
  API (`/api/workspace`, `/api/state`, `/api/images`, `/api/image/:id`).
- **Knowledge base** — `data/knowledge.js` is the single source of truth: an
  expert brief per room (principles, recommendations, palettes, shopping list,
  measurements, pro tips) shared by the server brain and the UI.
- **Persistence** — `data/db.js` is an optional Postgres layer; the frontend
  `store.js` has two interchangeable backends (local IndexedDB/localStorage, or
  the cloud sync API) behind one API, chosen automatically.
- **Frontend** — a dependency‑free ES‑module SPA in `public/`. In local mode,
  images are compressed client‑side and stored in **IndexedDB**; in sync mode they
  go to the database keyed by your workspace.

```
server.js            Express server + Ida (Claude / curated) + sync API
data/knowledge.js    Expert design knowledge base (all rooms)
data/db.js           Optional Postgres persistence (cross-device sync)
public/
  index.html         App shell
  css/styles.css     Studio UI
  js/app.js          Controller (dashboard, rooms, uploads, chat, sync)
  js/store.js        Dual-backend persistence (local ↔ cloud)
  js/md.js           Tiny Markdown renderer for Ida's replies
```

## Privacy

In **local mode**, your floor plan and room photos never leave your browser. In
**sync mode**, they're stored in *your own* database (the Neon project you
provision) and served only to clients holding your workspace key. When Ida is in
**live** chat mode, only your typed message plus light context (room, style,
budget, photo count) is sent to the Claude API — never the images themselves.
