// scripts/smoke.mjs — fast boot/health check used by CI before deploying.
// Starts the server in local-only mode (no DATABASE_URL) and asserts the core
// endpoints respond. Exits non-zero on any failure so a bad push never deploys.
import { spawn } from 'node:child_process';

const PORT = process.env.SMOKE_PORT || 3999;
const base = `http://localhost:${PORT}`;
const env = { ...process.env, PORT: String(PORT) };
delete env.DATABASE_URL; // exercise the local-only fallback path
delete env.ANTHROPIC_API_KEY; // exercise the curated brain

const srv = spawn('node', ['server.js'], { env, stdio: 'inherit' });

let failed = false;
const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✗'} ${msg}`); if (!cond) failed = true; };

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server did not come up in time');
}

try {
  await waitForServer();

  const health = await fetch(`${base}/api/health`).then((r) => r.json());
  ok(health.ok === true, 'GET /api/health is ok');
  ok(health.db === 'off', 'db reports off in local-only mode');

  const cat = await fetch(`${base}/api/rooms`).then((r) => r.json());
  ok(Array.isArray(cat.rooms) && cat.rooms.length === 5, 'catalog returns 5 rooms');
  ok(Array.isArray(cat.software) && cat.software.length > 0, 'software inspiration present');

  const ida = await fetch(`${base}/api/ida`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'lighting tips', roomId: 'home-theatre' }),
  }).then((r) => r.json());
  ok(typeof ida.reply === 'string' && ida.reply.length > 50, 'Ida returns a recommendation');

  const gated = await fetch(`${base}/api/workspace`, { method: 'POST' });
  ok(gated.status === 503, 'sync API is gated (503) without a database');
} catch (e) {
  console.error('smoke error:', e.message);
  failed = true;
} finally {
  srv.kill('SIGTERM');
}

console.log(failed ? '\n❌ SMOKE FAILED' : '\n✅ SMOKE PASSED');
process.exit(failed ? 1 : 0);
