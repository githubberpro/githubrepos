// db.js — optional Postgres persistence layer (Neon-compatible).
// If DATABASE_URL is not set, the whole module reports "off" and the app runs
// in local-only mode (browser IndexedDB/localStorage). When it IS set, this
// provides cross-device sync: project state + images keyed by a workspace token.

import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

let pool = null;
let ready = false;

export function dbEnabled() {
  return ready;
}

export async function initDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('  💾  Sync: OFF (set DATABASE_URL to a Neon/Postgres URL to enable cross-device sync)');
    return false;
  }
  // Local Postgres needs no SSL; hosted (Neon) needs SSL. Detect by host.
  const local = /@(localhost|127\.0\.0\.1)/.test(url) || /sslmode=disable/.test(url);
  pool = new Pool({
    connectionString: url,
    ssl: local ? false : { rejectUnauthorized: false },
    max: 5,
  });
  pool.on('error', (e) => console.error('[db] pool error', e.message));

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id          TEXT PRIMARY KEY,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS project_state (
      workspace_id TEXT PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
      data         JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS images (
      id           TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      grp          TEXT NOT NULL,
      name         TEXT,
      data         TEXT NOT NULL,
      ts           BIGINT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS images_ws_grp ON images (workspace_id, grp);
  `);
  ready = true;
  console.log('  💾  Sync: ON (Postgres connected — cross-device sync enabled)');
  return true;
}

const q = (text, params) => pool.query(text, params);

export async function createWorkspace() {
  const id = crypto.randomBytes(18).toString('base64url'); // ~24 chars, unguessable
  await q('INSERT INTO workspaces(id) VALUES ($1)', [id]);
  return id;
}

// Insert the workspace if a client connects with a key that doesn't exist yet.
export async function ensureWorkspace(id) {
  if (!id) throw new Error('missing workspace');
  await q('INSERT INTO workspaces(id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [id]);
}

export async function getState(ws) {
  const r = await q('SELECT data FROM project_state WHERE workspace_id = $1', [ws]);
  return r.rows[0] ? r.rows[0].data : null;
}

export async function putState(ws, data) {
  await ensureWorkspace(ws);
  await q(
    `INSERT INTO project_state(workspace_id, data, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (workspace_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [ws, JSON.stringify(data || {})],
  );
}

export async function listImages(ws, group) {
  const r = await q(
    `SELECT id, grp AS group, name, ts FROM images
     WHERE workspace_id = $1 AND ($2::text IS NULL OR grp = $2)
     ORDER BY ts ASC`,
    [ws, group || null],
  );
  return r.rows;
}

export async function getImage(ws, id) {
  const r = await q('SELECT data FROM images WHERE id = $1 AND workspace_id = $2', [id, ws]);
  return r.rows[0] ? r.rows[0].data : null;
}

export async function putImage(ws, { id, group, name, dataUrl, ts }) {
  await ensureWorkspace(ws);
  await q(
    `INSERT INTO images(id, workspace_id, grp, name, data, ts)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, name = EXCLUDED.name`,
    [id, ws, group, name || '', dataUrl, ts || Date.now()],
  );
}

export async function deleteImage(ws, id) {
  await q('DELETE FROM images WHERE id = $1 AND workspace_id = $2', [id, ws]);
}
