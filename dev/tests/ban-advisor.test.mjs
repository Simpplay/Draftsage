import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const { createBanAdvisor, createBanAdvisorController } = await import('../../src/application/ban-advisor.js')

const NOW = Date.UTC(2026, 10, 23)
const players = [
  { gameName: 'A', rank: { solo: { tier: 'EMERALD' }, flex: null }, pool: [{ cid: 10, level: 7, points: 300000, lastPlay: NOW - 864e5 }, { cid: 11, level: 5, points: 20000, lastPlay: NOW - 864e5 }], topMasteries: [], seasonChamps: [{ cid: 10, games: 12, wins: 9 }], clashPicks: [] },
  { gameName: 'B', rank: { solo: null, flex: { tier: 'DIAMOND' } }, pool: [], topMasteries: [{ cid: 20, level: 6, points: 50000 }], seasonChamps: [], clashPicks: [] },
]
const clash = (r) => ({ getScoutingContext: async (o) => (typeof r === 'function' ? r(o) : r) })
const okScout = { ok: true, data: { shortName: 'RIV', name: 'Rival', partial: [], fetchedAt: 1, players } }
const row = (wr, games, br) => ({ wr, games, br, pr: 5, tier: 3, rank: 1 })
const lola = (ok = true) => ({ tierlist: async ({ lane }) => (ok ? { ok: true, data: { rows: new Map([[10, row(52, lane === 'top' ? 900 : 10, 12)]]) } } : { ok: false, reason: 'network' }) })
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))

test('ban-advisor: scouting + meta → ranking, fichas y etiqueta de ban rate', async () => {
  const a = createBanAdvisor({ clash: clash(okScout), lola: lola(), now: () => NOW })
  const r = await a.advise({ tag: 'RIV' })
  assert.equal(r.ok, true); assert.equal(r.data.team.shortName, 'RIV'); assert.equal(r.data.hasMeta, true)
  assert.equal(r.data.bans[0].championId, 10); assert.ok(r.data.bans[0].tags.includes('high-ban-rate'))
  assert.equal(r.data.players.length, 2); assert.equal(r.data.players[0].name, 'A')
})

test('ban-advisor: si LoLalytics falla, sigue sin meta; si el scouting falla, propaga el motivo', async () => {
  const r = await createBanAdvisor({ clash: clash(okScout), lola: lola(false), now: () => NOW }).advise({ tag: 'RIV' })
  assert.equal(r.ok, true); assert.equal(r.data.hasMeta, false); assert.ok(r.data.bans.length)
  assert.deepEqual(await createBanAdvisor({ clash: clash({ ok: false, reason: 'no-opponent' }) }).advise(), { ok: false, reason: 'no-opponent' })
})

test('ban-advisor: excluye baneados y elegidos', async () => {
  const r = await createBanAdvisor({ clash: clash(okScout), now: () => NOW }).advise({ unavailable: [10] })
  assert.ok(!r.data.bans.some((b) => b.championId === 10))
})

test('controlador: idle → loading → ready, no repite, cancela lo obsoleto, error no reintenta hasta cerrar', async () => {
  let prefs = { enabled: true }; const calls = []
  const res = []
  const advisor = { advise: ({ tag }) => new Promise((r) => { calls.push(tag); res.push(r) }) }
  const c = createBanAdvisorController({ advisor, prefs: { get: () => prefs, set: (p) => (prefs = { ...prefs, ...p }) }, debounceMs: 0 })
  c.target('AAA'); assert.equal(c.getState().status, 'loading')
  await tick(); c.target('BBB')                         // cambia de roster antes de que llegue la primera
  await tick(); res[0]({ ok: true, data: { x: 'A' } }); await tick()
  assert.equal(c.getState().status, 'loading')           // la respuesta obsoleta se ignora
  res[1]({ ok: true, data: { x: 'B' } }); await tick()
  assert.equal(c.getState().status, 'ready'); assert.equal(c.getState().data.x, 'B')
  c.target('BBB'); await tick(); assert.equal(calls.length, 2)   // misma consulta: no se repite
  c.target(null); assert.equal(c.getState().status, 'idle')
  c.target('CCC'); await tick(); res[2]({ ok: false, reason: 'no-opponent' }); await tick()
  assert.equal(c.getState().status, 'error'); assert.equal(c.getState().reason, 'no-opponent')
  c.target('CCC'); await tick(); assert.equal(calls.length, 3)  // en error no se reintenta solo
  c.target(null); c.target('CCC'); await tick(); assert.equal(calls.length, 4)
})

test('controlador: apagado no consulta; al encenderlo consulta el roster visible', async () => {
  let prefs = { enabled: false }; let n = 0
  const c = createBanAdvisorController({ advisor: { advise: async () => (n++, { ok: true, data: {} }) }, prefs: { get: () => prefs, set: (p) => (prefs = { ...prefs, ...p }) }, debounceMs: 0 })
  c.target('AAA'); await tick(); assert.equal(n, 0); assert.equal(c.getState().status, 'idle')
  c.setEnabled(true); await tick(5); assert.equal(n, 1); assert.equal(c.getState().status, 'ready')
})
