// server.js
// Ida — home improvement & interior design studio.
// Serves the SPA, exposes the room catalog, and answers Ida chat requests.
// Ida uses the Anthropic Claude API when ANTHROPIC_API_KEY is set, and a
// built-in expert "curated brain" (no network needed) otherwise.

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ROOMS, { SOFTWARE_INSPIRATION } from './data/knowledge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const roomsById = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

// ── Catalog endpoints ──────────────────────────────────────────────────────
app.get('/api/rooms', (_req, res) => {
  res.json({ rooms: ROOMS, software: SOFTWARE_INSPIRATION });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ida: process.env.ANTHROPIC_API_KEY ? 'live' : 'curated' });
});

// ── Ida chat endpoint ──────────────────────────────────────────────────────
app.post('/api/ida', async (req, res) => {
  const { message = '', roomId = null, context = {} } = req.body || {};
  const room = roomsById[roomId] || null;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const reply = await askClaude({ message, room, context });
      return res.json({ reply, source: 'claude' });
    } catch (err) {
      // Fail soft to the curated brain so the app never goes dark.
      console.error('[ida] Claude call failed, falling back to curated brain:', err.message);
    }
  }

  const reply = curatedIda({ message, room, context });
  res.json({ reply, source: 'curated' });
});

// ── Live Ida (Claude API) ──────────────────────────────────────────────────
async function askClaude({ message, room, context }) {
  const model = process.env.IDA_MODEL || 'claude-sonnet-4-6';
  const roomBrief = room
    ? `The user is currently designing the "${room.name}". Here is your expert brief for this room:\n${JSON.stringify(
        {
          tagline: room.tagline,
          designPrinciples: room.designPrinciples,
          recommendations: room.recommendations,
          proTips: room.proTips,
          measurements: room.measurements,
        },
        null,
        2,
      )}`
    : 'The user is on the project dashboard and has not entered a specific room yet.';

  const ctx = [];
  if (context.photoCount) ctx.push(`${context.photoCount} room photo(s) uploaded`);
  if (context.hasFloorPlan) ctx.push('a floor plan is uploaded');
  if (context.style) ctx.push(`preferred style: ${context.style}`);
  if (context.budget) ctx.push(`budget: ${context.budget}`);

  const system =
    "You are Ida, a warm, sharp senior interior designer and home-improvement advisor. " +
    "You give concrete, actionable, room-specific recommendations — never generic filler. " +
    "Prefer short paragraphs and tight bullet lists. Use Markdown. When relevant, mention " +
    "specific dimensions, color directions, lighting temperatures, materials, and a rough budget tier. " +
    "Be encouraging but honest about trade-offs.\n\n" +
    roomBrief +
    (ctx.length ? `\n\nProject context: ${ctx.join('; ')}.` : '');

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: message || 'Give me your top recommendations for this room.' }],
    }),
  });

  if (!resp.ok) throw new Error(`Anthropic API ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return (data.content || []).map((b) => b.text || '').join('').trim() || curatedIda({ message, room, context });
}

// ── Curated Ida (offline expert brain) ──────────────────────────────────────
const TOPICS = [
  { key: 'lighting', label: 'Lighting', rx: /\b(light|lighting|lamp|bright|dim|glare|bias|led|glow|lux|kelvin|warm|cool|fixture)\b/i },
  { key: 'acoustics', label: 'Acoustics & sound', rx: /\b(sound|acoustic|echo|soundproof|noise|reflection|bass|treat|treatment|quiet|reverb|isolat|absorb|diffus|speaker|surround)\b/i },
  { key: 'color', label: 'Color', rx: /\b(colou?r|palette|paint|scheme|tone|hue|shade|accent)\b/i },
  { key: 'layout', label: 'Layout', rx: /\b(layout|arrange|arrangement|place|placement|position|where|fit|space|plan|seat|orient|flow|zone)\b/i },
  { key: 'furniture', label: 'Furniture', rx: /\b(furniture|chair|sofa|recliner|bench|desk|table|shelf|shelving|storage|stand|seating)\b/i },
  { key: 'technology', label: 'Technology', rx: /\b(tech|technology|projector|screen|monitor|heater|system|gear|equipment|av|electronic|smart|wiring|cable)\b/i },
  { key: 'materials', label: 'Materials', rx: /\b(material|wood|floor|flooring|wall|carpet|rug|fabric|panel|finish|tile|cedar)\b/i },
];

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function curatedIda({ message, room, context }) {
  if (!room) {
    const names = ROOMS.map((r) => `${r.icon} **${r.name.split(' — ')[0]}**`).join(', ');
    return (
      "Hi, I'm **Ida** — your interior design and home-improvement advisor. 👋\n\n" +
      "Pick a room from the sidebar and I'll give you tailored recommendations for layout, lighting, acoustics, " +
      "color, furniture, technology, and materials — plus a shopping list and budget.\n\n" +
      `You're focusing on: ${names}.\n\n` +
      "Upload a floor plan or room photos on the dashboard and tell me your style and budget so I can get specific."
    );
  }

  const text = (message || '').toLowerCase();
  const wantsBudget = /\b(budget|cost|price|shopping|buy|spend|afford|expensive|cheap|\$)\b/.test(text);
  const wantsMeasure = /\b(size|sized|dimension|measure|how big|how many|distance|height|clearance|fit|spacing|big enough)\b/.test(text);
  const matched = TOPICS.filter((t) => t.rx.test(text));

  const head = `**${room.name.split(' — ')[0]}** — ${room.tagline}\n`;
  const blocks = [];

  // Budget / shopping intent
  if (wantsBudget) {
    const lines = room.shoppingList
      .map((s) => `- **${s.item}** — ${s.why}. _${s.priceRange}_ · ${s.priority}`)
      .join('\n');
    blocks.push(`### 🛒 Shopping list & budget\n${lines}`);
  }

  // Measurement intent
  if (wantsMeasure) {
    const lines = room.measurements.map((m) => `- **${m.label}:** ${m.guidance}`).join('\n');
    blocks.push(`### 📐 Key measurements\n${lines}`);
  }

  // Topic-specific advice
  if (matched.length) {
    for (const t of matched.slice(0, 3)) {
      const recs = room.recommendations[t.key] || [];
      if (recs.length) {
        const lines = recs.slice(0, 4).map((r) => `- ${r}`).join('\n');
        blocks.push(`### ${t.label}\n${lines}`);
      }
      if (t.key === 'color') {
        const p = room.colorPalettes[0];
        blocks.push(`**Palette idea — _${p.name}_** (${p.mood}): ${p.colors.join('  ')}`);
      }
    }
  }

  // Nothing specific matched → give a structured overview.
  if (!matched.length && !wantsBudget && !wantsMeasure) {
    const principles = room.designPrinciples
      .slice(0, 4)
      .map((p) => `- **${p.title}** — ${p.detail}`)
      .join('\n');
    const top = ['layout', 'lighting', 'acoustics', 'color']
      .map((k) => {
        const r = (room.recommendations[k] || [])[0];
        return r ? `- _${titleCase(k)}:_ ${r}` : null;
      })
      .filter(Boolean)
      .join('\n');
    blocks.push(`### Where I'd start\n${principles}`);
    blocks.push(`### Quick wins\n${top}`);
  }

  // Always close with a pro tip.
  const tip = room.proTips[Math.min(blocks.length, room.proTips.length - 1)] || room.proTips[0];
  blocks.push(`> 💡 **Ida's pro tip:** ${tip}`);

  // Personalize lightly from context.
  const ctxBits = [];
  if (context.style) ctxBits.push(`I'll lean into your **${context.style}** style`);
  if (context.budget) ctxBits.push(`and keep an eye on your **${context.budget}** budget`);
  const ctxLine = ctxBits.length ? `\n\n_${ctxBits.join(' ')}._` : '';

  return head + '\n' + blocks.join('\n\n') + ctxLine;
}

app.listen(PORT, () => {
  const mode = process.env.ANTHROPIC_API_KEY ? 'LIVE (Claude API)' : 'CURATED (offline expert brain)';
  console.log(`\n  🏠  Ida home-improvement studio running at http://localhost:${PORT}`);
  console.log(`  🤖  Ida mode: ${mode}`);
  console.log(`  📐  Rooms loaded: ${ROOMS.map((r) => r.name.split(' — ')[0]).join(', ')}\n`);
});
