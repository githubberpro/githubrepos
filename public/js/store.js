// store.js — persistence for Ida, with two interchangeable backends:
//   • LOCAL  — project state in localStorage, images in IndexedDB (single device)
//   • CLOUD  — project state + images on the server (Neon/Postgres), shared
//              across every device that uses the same workspace key.
// The app calls the same Store API regardless of mode.

const LS_KEY = 'ida.project.v1';
const WS_KEY = 'ida.workspace';
const DB_NAME = 'ida-images';
const DB_STORE = 'images';

const defaultState = () => ({
  projectName: 'My Home Improvement Project',
  style: '',
  budget: '',
  rooms: {}, // roomId -> { notes, checked, chat }
});

function mergeDefaults(s) {
  return { ...defaultState(), ...(s || {}) };
}

// ── module state ────────────────────────────────────────────────────────────
let mode = 'local'; // 'local' | 'cloud'
let workspace = null; // cloud workspace key
let memState = defaultState();
let saveTimer = null;

export const Store = {
  dbAvailable: false, // set by app from /api/health before init()

  mode() { return mode; },
  workspace() { return workspace; },
  isCloud() { return mode === 'cloud'; },

  async init() {
    workspace = localStorage.getItem(WS_KEY) || null;
    if (this.dbAvailable && workspace) {
      mode = 'cloud';
      memState = await cloudGetState().catch(() => localGetState());
    } else {
      mode = 'local';
      if (workspace && !this.dbAvailable) {
        // Had a workspace but server lost its DB — fall back, keep the key.
        mode = 'local';
      } else {
        workspace = workspace && this.dbAvailable ? workspace : null;
      }
      memState = localGetState();
    }
    return memState;
  },

  state() { return memState; },

  save(state) {
    memState = state;
    localStorage.setItem(LS_KEY, JSON.stringify(state)); // always keep a local cache
    if (mode === 'cloud') {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => cloudPutState(state).catch((e) => console.warn('cloud save failed', e)), 600);
    }
  },

  // Create a brand-new cloud workspace and migrate current local data into it.
  async enableSync(onProgress) {
    const r = await fetch('/api/workspace', { method: 'POST' }).then((x) => x.json());
    if (!r.workspace) throw new Error('could not create workspace');
    workspace = r.workspace;
    localStorage.setItem(WS_KEY, workspace);
    mode = 'cloud';
    await cloudPutState(memState);
    const local = await idbGetAll();
    let n = 0;
    for (const im of local) {
      await cloudPutImage(im);
      if (onProgress) onProgress(++n, local.length);
    }
    return workspace;
  },

  // Connect this device to an existing workspace key.
  async connect(key) {
    workspace = String(key || '').trim();
    if (!workspace) throw new Error('empty key');
    localStorage.setItem(WS_KEY, workspace);
    mode = 'cloud';
    memState = mergeDefaults(await cloudGetState());
    localStorage.setItem(LS_KEY, JSON.stringify(memState));
    return memState;
  },

  // Stop syncing on this device (data stays in the cloud; local cache kept).
  disconnect() {
    localStorage.removeItem(WS_KEY);
    workspace = null;
    mode = 'local';
    memState = localGetState();
    return memState;
  },

  // ── images (mode-aware) ──
  async putImage(record) {
    return mode === 'cloud' ? cloudPutImage(record) : idbPut(record);
  },
  async getImages(group) {
    return mode === 'cloud' ? cloudListImages(group) : idbGet(group);
  },
  async deleteImage(id) {
    return mode === 'cloud' ? cloudDeleteImage(id) : idbDelete(id);
  },
};

// helper for app.js: per-room state slice
export function roomState(state, roomId) {
  if (!state.rooms[roomId]) state.rooms[roomId] = { notes: '', checked: {}, chat: [] };
  return state.rooms[roomId];
}

// ── LOCAL: state ────────────────────────────────────────────────────────────
function localGetState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? mergeDefaults(JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}

// ── CLOUD: state ────────────────────────────────────────────────────────────
async function cloudGetState() {
  const r = await fetch(`/api/state?ws=${encodeURIComponent(workspace)}`).then((x) => x.json());
  return mergeDefaults(r.state);
}
async function cloudPutState(state) {
  await fetch(`/api/state?ws=${encodeURIComponent(workspace)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state }),
  });
}

// ── CLOUD: images ───────────────────────────────────────────────────────────
async function cloudPutImage(record) {
  await fetch(`/api/images?ws=${encodeURIComponent(workspace)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(record),
  });
  return record;
}
async function cloudListImages(group) {
  const url = `/api/images?ws=${encodeURIComponent(workspace)}${group ? `&group=${encodeURIComponent(group)}` : ''}`;
  const r = await fetch(url).then((x) => x.json());
  // Point dataUrl at the byte-serving endpoint so <img src> just works.
  return (r.images || []).map((im) => ({
    ...im,
    dataUrl: `/api/image/${encodeURIComponent(im.id)}?ws=${encodeURIComponent(workspace)}`,
  }));
}
async function cloudDeleteImage(id) {
  await fetch(`/api/image/${encodeURIComponent(id)}?ws=${encodeURIComponent(workspace)}`, { method: 'DELETE' });
}

// ── LOCAL: image store (IndexedDB) ──────────────────────────────────────────
let dbPromise = null;
function idb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(DB_STORE)) d.createObjectStore(DB_STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}
function tx(mode2) {
  return idb().then((d) => d.transaction(DB_STORE, mode2).objectStore(DB_STORE));
}
async function idbPut(record) {
  const store = await tx('readwrite');
  return new Promise((resolve, reject) => {
    const r = store.put(record);
    r.onsuccess = () => resolve(record);
    r.onerror = () => reject(r.error);
  });
}
async function idbGet(group) {
  const store = await tx('readonly');
  return new Promise((resolve, reject) => {
    const out = [];
    const cur = store.openCursor();
    cur.onsuccess = () => {
      const c = cur.result;
      if (c) {
        if (!group || c.value.group === group) out.push(c.value);
        c.continue();
      } else {
        out.sort((a, b) => a.ts - b.ts);
        resolve(out);
      }
    };
    cur.onerror = () => reject(cur.error);
  });
}
async function idbGetAll() { return idbGet(null); }
async function idbDelete(id) {
  const store = await tx('readwrite');
  return new Promise((resolve, reject) => {
    const r = store.delete(id);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

// ── shared: compress a File into a data URL (keeps uploads small) ────────────
export function fileToDataUrl(file, maxDim = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(reader.result);
        }
      };
      img.onerror = () => resolve(reader.result);
      img.src = reader.result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Try to make local storage durable (defeats browser eviction, incl. Safari).
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
  } catch {}
  return false;
}
