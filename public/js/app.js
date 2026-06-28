// app.js — Ida studio controller.
import {
  loadState, saveState, roomState,
  putImage, getImages, deleteImage, fileToDataUrl,
} from './store.js';
import { renderMarkdown } from './md.js';

const STYLES = ['Modern', 'Minimalist', 'Scandinavian', 'Industrial', 'Mid-century', 'Traditional', 'Japandi', 'Luxury / Glam', 'Rustic', 'Contemporary'];
const BUDGETS = ['Budget-conscious', 'Mid-range', 'Premium', 'No limit'];

const app = {
  rooms: [],
  software: [],
  state: loadState(),
  view: 'dashboard', // 'dashboard' | roomId
  tab: 'overview',
  idaMode: 'curated',
  busy: false,
};

// ── boot ────────────────────────────────────────────────────────────────────
init();
async function init() {
  bindChrome();
  try {
    const [catalog, health] = await Promise.all([
      fetch('/api/rooms').then((r) => r.json()),
      fetch('/api/health').then((r) => r.json()).catch(() => ({ ida: 'curated' })),
    ]);
    app.rooms = catalog.rooms || [];
    app.software = catalog.software || [];
    app.idaMode = health.ida || 'curated';
  } catch (e) {
    console.error('Failed to load catalog', e);
  }
  setModeBadge();
  renderNav();
  render();
  renderIda();
}

function room(id) { return app.rooms.find((r) => r.id === id); }
function persist() { saveState(app.state); }

// ── chrome / sidebar ────────────────────────────────────────────────────────
function bindChrome() {
  const pn = document.getElementById('projectName');
  pn.value = app.state.projectName;
  pn.addEventListener('input', () => { app.state.projectName = pn.value; persist(); });

  document.getElementById('resetBtn').addEventListener('click', async () => {
    if (!confirm('Reset all project data, photos and chats? This cannot be undone.')) return;
    localStorage.clear();
    const imgs = await getImages();
    await Promise.all(imgs.map((i) => deleteImage(i.id)));
    app.state = loadState();
    location.reload();
  });

  document.getElementById('idaCollapse').addEventListener('click', () => toggleIda(false));
  document.getElementById('idaOpen').addEventListener('click', () => toggleIda(true));

  // Ida chat form
  const form = document.getElementById('idaForm');
  const input = document.getElementById('idaInput');
  form.addEventListener('submit', (e) => { e.preventDefault(); sendToIda(input.value); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToIda(input.value); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 130) + 'px';
  });
}

function toggleIda(open) {
  document.getElementById('app').classList.toggle('ida-collapsed', !open);
  document.getElementById('idaOpen').classList.toggle('hidden', open);
}

function setModeBadge() {
  const b = document.getElementById('idaModeBadge');
  if (app.idaMode === 'live') { b.textContent = '● Ida live'; b.className = 'badge live'; b.title = 'Connected to Claude'; }
  else { b.textContent = '● Ida ready'; b.className = 'badge curated'; b.title = 'Curated expert mode (set ANTHROPIC_API_KEY for live Claude)'; }
}

function renderNav() {
  const nav = document.getElementById('nav');
  const item = (active, icon, label, sub, onClick) => {
    const b = document.createElement('button');
    b.className = 'nav-item' + (active ? ' active' : '');
    b.innerHTML = `<span class="ic">${icon}</span><span>${label}${sub ? `<span class="nav-label-sub">${sub}</span>` : ''}</span>`;
    b.addEventListener('click', onClick);
    return b;
  };
  nav.innerHTML = '';
  nav.appendChild(item(app.view === 'dashboard', '🏠', 'Dashboard', '', () => go('dashboard')));
  const sep = document.createElement('div');
  sep.className = 'nav-sep';
  sep.textContent = 'Rooms';
  nav.appendChild(sep);
  for (const r of app.rooms) {
    const short = r.name.split(' — ')[0];
    const sub = r.name.includes(' — ') ? r.name.split(' — ')[1] : '';
    nav.appendChild(item(app.view === r.id, r.icon, short, sub, () => go(r.id)));
  }
}

function go(view) {
  app.view = view;
  app.tab = 'overview';
  renderNav();
  render();
  renderIda();
  document.getElementById('main').scrollTo(0, 0);
}

// ── render dispatch ─────────────────────────────────────────────────────────
function render() {
  const main = document.getElementById('main');
  main.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view';
  main.appendChild(view);
  if (app.view === 'dashboard') renderDashboard(view);
  else renderRoom(view, room(app.view));
}

// ── dashboard ───────────────────────────────────────────────────────────────
async function renderDashboard(el) {
  el.innerHTML = `
    <div class="hero">
      <h1>Design your home, room by room — with Ida.</h1>
      <p>Upload your floor plan and room photos, set your style and budget, then step into any room.
      Ida gives you expert recommendations for layout, lighting, acoustics, color, furniture, technology and materials —
      complete with palettes, measurements and a shopping list.</p>
    </div>

    <div class="grid two">
      <div class="card">
        <h3>📐 Floor plan</h3>
        <p style="margin-bottom:12px">Upload a 2D floor plan to anchor the whole project.</p>
        <div class="dropzone" id="fpDrop">
          <div class="big">⬆️</div>
          <div>Drop a floor plan here or click to upload</div>
          <small>PNG, JPG or SVG</small>
        </div>
        <div id="fpView" class="floorplan-view" style="margin-top:14px"></div>
      </div>

      <div class="card">
        <h3>🎨 Your style & budget</h3>
        <p style="margin-bottom:12px">Ida tailors every recommendation to these.</p>
        <div class="field" style="margin-bottom:12px">
          <label for="styleSel">Preferred style</label>
          <select id="styleSel"><option value="">— choose a style —</option>${STYLES.map((s) => `<option ${app.state.style === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label for="budgetSel">Budget</label>
          <select id="budgetSel"><option value="">— choose a budget —</option>${BUDGETS.map((b) => `<option ${app.state.budget === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Your rooms</div>
      <div class="grid cards" id="roomGrid"></div>
    </div>

    <div class="section">
      <div class="section-title">Powered by pro-grade design features</div>
      <div class="grid cards" id="softGrid"></div>
    </div>
  `;

  // style/budget
  el.querySelector('#styleSel').addEventListener('change', (e) => { app.state.style = e.target.value; persist(); });
  el.querySelector('#budgetSel').addEventListener('change', (e) => { app.state.budget = e.target.value; persist(); });

  // rooms grid
  const grid = el.querySelector('#roomGrid');
  for (const r of app.rooms) {
    const short = r.name.split(' — ')[0];
    const imgs = await getImages('photos:' + r.id);
    const card = document.createElement('button');
    card.className = 'room-card';
    card.innerHTML = `
      <div class="stripe" style="background:${r.accent}"></div>
      <div class="ic">${r.icon}</div>
      <h3>${short}</h3>
      <p>${r.tagline}</p>
      <div class="meta">${imgs.length} photo${imgs.length === 1 ? '' : 's'} · ${r.shoppingList.length} recommended buys</div>
    `;
    card.addEventListener('click', () => go(r.id));
    grid.appendChild(card);
  }

  // software grid
  const sg = el.querySelector('#softGrid');
  for (const s of app.software) {
    const c = document.createElement('div');
    c.className = 'card';
    c.innerHTML = `<h3>${s.name}</h3><p>${s.features.join(' · ')}</p>`;
    sg.appendChild(c);
  }

  // floor plan dropzone
  wireDrop(el.querySelector('#fpDrop'), 'floorplan', () => renderFloorPlan(el.querySelector('#fpView')));
  renderFloorPlan(el.querySelector('#fpView'));
}

async function renderFloorPlan(host) {
  const imgs = await getImages('floorplan');
  if (!imgs.length) { host.innerHTML = ''; return; }
  const img = imgs[imgs.length - 1];
  host.innerHTML = `<img src="${img.dataUrl}" alt="Floor plan" /><div style="margin-top:8px"><button class="btn ghost small" id="fpDel">Remove floor plan</button></div>`;
  host.querySelector('#fpDel').addEventListener('click', async () => { await deleteImage(img.id); renderFloorPlan(host); });
}

// ── room view ───────────────────────────────────────────────────────────────
function renderRoom(el, r) {
  if (!r) { el.innerHTML = '<p>Room not found.</p>'; return; }
  const short = r.name.split(' — ')[0];
  const sub = r.name.includes(' — ') ? r.name.split(' — ')[1] : '';
  const tabs = [
    ['overview', 'Overview'],
    ['photos', 'Photos'],
    ['recs', "Ida's recommendations"],
    ['palette', 'Color & mood'],
    ['shopping', 'Shopping & budget'],
  ];
  el.innerHTML = `
    <div class="room-header">
      <div class="ic">${r.icon}</div>
      <div>
        <h1 class="page-title">${short}${sub ? ` <span style="color:var(--text-faint);font-weight:400">· ${sub}</span>` : ''}</h1>
        <p class="room-tagline">${r.tagline}</p>
        <span class="accent-pill"><span class="dot" style="background:${r.accent}"></span>Inspired by ${r.inspiredBy.join(', ')}</span>
      </div>
    </div>
    <div class="tabs">${tabs.map(([id, label]) => `<button class="tab ${app.tab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`).join('')}</div>
    <div id="tabBody"></div>
  `;
  el.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => { app.tab = t.dataset.tab; renderRoom(el, r); }));
  const body = el.querySelector('#tabBody');
  if (app.tab === 'overview') roomOverview(body, r);
  else if (app.tab === 'photos') roomPhotos(body, r);
  else if (app.tab === 'recs') roomRecs(body, r);
  else if (app.tab === 'palette') roomPalette(body, r);
  else if (app.tab === 'shopping') roomShopping(body, r);
}

function roomOverview(body, r) {
  body.innerHTML = `
    <p class="page-sub">${r.description}</p>

    <div class="section">
      <div class="section-title">Design principles</div>
      <ul class="rec-list">
        ${r.designPrinciples.map((p) => `<li class="principle"><b>${p.title}</b><span>${p.detail}</span></li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <div class="section-title">Key measurements</div>
      <div class="measure-grid">
        ${r.measurements.map((m) => `<div class="measure"><b>${m.label}</b><span>${m.guidance}</span></div>`).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Ida's pro tips</div>
      <div class="tips">${r.proTips.map((t) => `<div class="tip">💡 ${t}</div>`).join('')}</div>
    </div>

    <div class="section">
      <div class="field">
        <label>Your notes for this room</label>
        <textarea id="roomNotes" placeholder="Jot down ideas, measurements, links…">${escapeHtml(roomState(app.state, r.id).notes)}</textarea>
      </div>
    </div>

    <button class="btn" id="askIdaOverview">💬 Ask Ida about the ${r.name.split(' — ')[0]}</button>
  `;
  const ta = body.querySelector('#roomNotes');
  ta.addEventListener('input', () => { roomState(app.state, r.id).notes = ta.value; persist(); });
  body.querySelector('#askIdaOverview').addEventListener('click', () => { toggleIda(true); document.getElementById('idaInput').focus(); });
}

async function roomPhotos(body, r) {
  body.innerHTML = `
    <p class="page-sub">Upload photos of the ${r.name.split(' — ')[0].toLowerCase()} as it is today. They become your visual reference and mood board — and give Ida context.</p>
    <div class="dropzone" id="photoDrop">
      <div class="big">📷</div>
      <div>Drop room photos here or click to upload</div>
      <small>Add as many angles as you like</small>
    </div>
    <div class="gallery" id="photoGallery"></div>
  `;
  wireDrop(body.querySelector('#photoDrop'), 'photos:' + r.id, () => drawGallery(body.querySelector('#photoGallery'), r), true);
  drawGallery(body.querySelector('#photoGallery'), r);
}

async function drawGallery(host, r) {
  const imgs = await getImages('photos:' + r.id);
  host.innerHTML = imgs.length ? '' : '<p style="color:var(--text-faint);font-size:13px">No photos yet.</p>';
  for (const im of imgs) {
    const d = document.createElement('div');
    d.className = 'thumb';
    d.innerHTML = `<img src="${im.dataUrl}" alt="${escapeHtml(im.name)}" /><button class="del" title="Delete">🗑</button><div class="cap">${escapeHtml(im.name)}</div>`;
    d.querySelector('.del').addEventListener('click', async () => { await deleteImage(im.id); drawGallery(host, r); });
    host.appendChild(d);
  }
}

function roomRecs(body, r) {
  const groups = [
    ['layout', '🧭 Layout & flow'],
    ['lighting', '💡 Lighting'],
    ['acoustics', '🔊 Acoustics & sound'],
    ['color', '🎨 Color'],
    ['furniture', '🛋 Furniture'],
    ['technology', '🔌 Technology'],
    ['materials', '🧱 Materials & finishes'],
  ];
  body.innerHTML = `
    <p class="page-sub">Curated expert recommendations for the ${r.name.split(' — ')[0]}. Want something specific to your space? Ask Ida — she sees your photos, style and budget.</p>
    <button class="btn" id="genIda" style="margin-bottom:22px">✨ Ask Ida for a personalized plan</button>
    ${groups.map(([key, label]) => {
      const items = r.recommendations[key] || [];
      if (!items.length) return '';
      return `<div class="rec-group"><h4>${label}</h4><ul class="rec-list">${items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`;
    }).join('')}
  `;
  body.querySelector('#genIda').addEventListener('click', () => {
    toggleIda(true);
    sendToIda(`Give me a personalized design plan for my ${r.name.split(' — ')[0]}.`);
  });
}

function roomPalette(body, r) {
  body.innerHTML = `
    <p class="page-sub">Color palettes hand-picked for the ${r.name.split(' — ')[0]}. Click any swatch to copy its hex.</p>
    <div class="palettes">
      ${r.colorPalettes.map((p) => `
        <div class="palette">
          <div class="swatches">${p.colors.map((c) => `<span data-hex="${c}" style="background:${c}" title="${c} — click to copy"></span>`).join('')}</div>
          <div class="pl-body"><div class="pl-name">${p.name}</div><div class="pl-mood">${p.mood}</div>
          <div style="margin-top:8px;font-size:11px;color:var(--text-faint)">${p.colors.join('  ·  ')}</div></div>
        </div>`).join('')}
    </div>
    <div class="section">
      <div class="section-title">Build a mood board</div>
      <p class="page-sub">Your uploaded room photos double as a mood board. Add inspiration shots on the Photos tab.</p>
      <div class="gallery" id="moodGallery"></div>
    </div>
  `;
  body.querySelectorAll('.swatches span').forEach((s) => s.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(s.dataset.hex); s.title = 'Copied!'; setTimeout(() => (s.title = s.dataset.hex), 1200); } catch {}
  }));
  drawGallery(body.querySelector('#moodGallery'), r);
}

function roomShopping(body, r) {
  const rs = roomState(app.state, r.id);
  const midpoint = (range) => {
    const nums = (range.match(/[\d,]+/g) || []).map((n) => parseInt(n.replace(/,/g, ''), 10));
    if (!nums.length) return 0;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  };
  const total = r.shoppingList.reduce((s, it) => s + midpoint(it.priceRange), 0);
  const remaining = r.shoppingList.filter((it) => !rs.checked[it.item]).reduce((s, it) => s + midpoint(it.priceRange), 0);

  body.innerHTML = `
    <p class="page-sub">A prioritized shopping list for the ${r.name.split(' — ')[0]}. Check off what you've bought — Ida tallies the rough remaining budget.</p>
    <div class="shop">
      ${r.shoppingList.map((it) => {
        const done = !!rs.checked[it.item];
        return `<label class="shop-row ${done ? 'done' : ''}">
          <input type="checkbox" data-item="${escapeHtml(it.item)}" ${done ? 'checked' : ''}/>
          <div class="shop-main">
            <div class="shop-item">${it.item}</div>
            <div class="shop-why">${it.why}</div>
            <div class="shop-tags"><span class="tag ${it.priority === 'Must-have' ? 'must' : ''}">${it.priority}</span><span class="tag">${it.priceRange}</span></div>
          </div>
        </label>`;
      }).join('')}
    </div>
    <div class="budget-bar">
      <span>Estimated full build: <b>~$${total.toLocaleString()}</b></span>
      <span>Still to buy: <b>~$${remaining.toLocaleString()}</b></span>
    </div>
    <p class="inspired">Rough mid-range estimates for planning only — actual prices vary by region, brand and finish.</p>
  `;
  body.querySelectorAll('input[type=checkbox]').forEach((cb) => cb.addEventListener('change', () => {
    rs.checked[cb.dataset.item] = cb.checked;
    persist();
    roomShopping(body, r);
  }));
}

// ── uploads ─────────────────────────────────────────────────────────────────
function wireDrop(zone, group, onDone, multi = false) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  if (multi) input.multiple = true;
  input.style.display = 'none';
  zone.appendChild(input);
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => handleFiles(input.files, group, onDone));
  ['dragover', 'dragenter'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('drag'); }));
  zone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files, group, onDone));
}

async function handleFiles(files, group, onDone) {
  const list = [...files].filter((f) => f.type.startsWith('image/'));
  for (const f of list) {
    const dataUrl = await fileToDataUrl(f);
    if (group === 'floorplan') {
      const existing = await getImages('floorplan');
      await Promise.all(existing.map((i) => deleteImage(i.id))); // single floor plan
    }
    await putImage({ id: `${group}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, group, name: f.name, dataUrl, ts: Date.now() });
  }
  if (onDone) onDone();
  if (app.view === 'dashboard') renderNav();
}

// ── Ida chat ────────────────────────────────────────────────────────────────
function renderIda() {
  const ctxEl = document.getElementById('idaContext');
  const r = app.view !== 'dashboard' ? room(app.view) : null;
  ctxEl.textContent = r ? `advising on your ${r.name.split(' — ')[0]}` : 'your design advisor';

  const msgWrap = document.getElementById('idaMessages');
  const startersWrap = document.getElementById('idaStarters');
  const history = r ? roomState(app.state, r.id).chat : (app.state.rooms.__dashboard__ ||= []);

  msgWrap.innerHTML = '';
  if (!history.length) {
    addMsgEl('ida', r
      ? `Hi! I'm **Ida**. I'm looking at your **${r.name.split(' — ')[0]}**. Ask me anything, or tap a prompt below to get started.`
      : `Hi, I'm **Ida** — your interior design advisor. 👋 Pick a room from the sidebar, or ask me where to begin.`);
  } else {
    for (const m of history) addMsgEl(m.role, m.content);
  }

  // starters
  startersWrap.innerHTML = '';
  const starters = r ? r.starters : ['Where should I start?', 'Compare my study rooms', 'What rooms can you help with?'];
  for (const s of starters) {
    const b = document.createElement('button');
    b.className = 'starter';
    b.textContent = s;
    b.addEventListener('click', () => sendToIda(s));
    startersWrap.appendChild(b);
  }
  scrollIda();
}

function currentHistory() {
  const r = app.view !== 'dashboard' ? room(app.view) : null;
  if (r) return roomState(app.state, r.id).chat;
  return (app.state.rooms.__dashboard__ ||= []);
}

function addMsgEl(role, content) {
  const wrap = document.getElementById('idaMessages');
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.innerHTML = role === 'ida' ? renderMarkdown(content) : escapeHtml(content);
  wrap.appendChild(div);
  return div;
}

function scrollIda() {
  const w = document.getElementById('idaMessages');
  w.scrollTop = w.scrollHeight;
}

async function sendToIda(text) {
  text = (text || '').trim();
  if (!text || app.busy) return;
  const input = document.getElementById('idaInput');
  input.value = '';
  input.style.height = 'auto';
  toggleIda(true);

  const hist = currentHistory();
  hist.push({ role: 'user', content: text });
  persist();
  addMsgEl('user', text);
  scrollIda();

  app.busy = true;
  const typing = addMsgEl('ida', '_Ida is thinking…_');
  typing.classList.add('typing');
  scrollIda();

  const r = app.view !== 'dashboard' ? room(app.view) : null;
  let photoCount = 0;
  if (r) { try { photoCount = (await getImages('photos:' + r.id)).length; } catch {} }
  let hasFloorPlan = false;
  try { hasFloorPlan = (await getImages('floorplan')).length > 0; } catch {}

  try {
    const resp = await fetch('/api/ida', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: text,
        roomId: r ? r.id : null,
        context: { style: app.state.style, budget: app.state.budget, photoCount, hasFloorPlan },
      }),
    });
    const data = await resp.json();
    typing.remove();
    const reply = data.reply || "Sorry, I couldn't generate a recommendation just now.";
    hist.push({ role: 'ida', content: reply });
    persist();
    addMsgEl('ida', reply);
  } catch (e) {
    typing.remove();
    addMsgEl('ida', 'I had trouble reaching the studio service. Please try again in a moment.');
  } finally {
    app.busy = false;
    scrollIda();
  }
}

// ── util ────────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
