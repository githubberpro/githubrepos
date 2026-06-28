// store.js — local persistence for Ida.
// Project state (name, style, budget, checked shopping items, notes) lives in
// localStorage. Uploaded images (floor plan + room photos) live in IndexedDB
// so we can keep larger binary blobs without blowing the localStorage quota.

const LS_KEY = 'ida.project.v1';
const DB_NAME = 'ida-images';
const DB_STORE = 'images';

// ── Project state (localStorage) ────────────────────────────────────────────
const defaultState = () => ({
  projectName: 'My Home Improvement Project',
  style: '',
  budget: '',
  rooms: {}, // roomId -> { notes, checked: {item:true}, chat: [...] }
});

export function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function roomState(state, roomId) {
  if (!state.rooms[roomId]) state.rooms[roomId] = { notes: '', checked: {}, chat: [] };
  return state.rooms[roomId];
}

// ── Image store (IndexedDB) ─────────────────────────────────────────────────
let dbPromise = null;
function db() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(DB_STORE)) {
        d.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode) {
  return db().then((d) => d.transaction(DB_STORE, mode).objectStore(DB_STORE));
}

export async function putImage(record) {
  // record: { id, group, name, dataUrl, ts }
  const store = await tx('readwrite');
  return new Promise((resolve, reject) => {
    const r = store.put(record);
    r.onsuccess = () => resolve(record);
    r.onerror = () => reject(r.error);
  });
}

export async function getImages(group) {
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

export async function deleteImage(id) {
  const store = await tx('readwrite');
  return new Promise((resolve, reject) => {
    const r = store.delete(id);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

// Read a File into a compressed data URL so big phone photos do not bloat IDB.
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
          resolve(reader.result); // fallback to original (e.g. for SVG/PDF)
        }
      };
      img.onerror = () => resolve(reader.result);
      img.src = reader.result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
