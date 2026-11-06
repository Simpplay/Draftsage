import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildHtml, tierlistHtml } from './fixtures/lolalytics-fixture.mjs'
const { createLolalyticsClient, buildPageUrl } = await import('../../src/infrastructure/lolalytics/client.js')
const { createCache } = await import('../../src/infrastructure/coachless/cache.js')
const { createLolalyticsSource } = await import('../../src/application/lolalytics-source.js')
const { createSourceRouter } = await import('../../src/application/sources.js')
const { createChampionStats, createOverlayController } = await import('../../src/application/overlay.js')
const { buildRunePage } = await import('../../src/domain/configuration.js')
const { treeOfRune } = await import('../../src/domain/runes.js')
const { normalizeSource, needsLogin, sourceOrder } = await import('../../src/domain/sources.js')
const { badgeOf, findTiles } = await import('../../src/presentation/overlay.js')

const NAMES = { 81: 'Ezreal', 145: 'Kaisa', 51: 'Caitlyn', 222: 'Jinx', 236: 'Lucian', 15: 'Sivir', 119: 'Draven', 67: 'Vayne', 412: 'Thresh' }
const catalog = { load: async () => {}, champion: (id) => ({ id, name: NAMES[id] ?? '#' + id, alias: NAMES[id] }), keystoneTrees: () => new Map(), runeTrees: () => new Map() }
const ok = (body) => ({ ok: true, status: 200, text: async () => body })
const status = (s) => ({ ok: false, status: s, text: async () => '' })

function fakeFetch(handler) {
  const calls = []
  const f = async (url) => { calls.push(String(url)); return handler(String(url)) }
  f.calls = calls
  return f
}
const standard = (url) => {
  if (url.includes('/tierlist/')) return ok(tierlistHtml())
  const vs = /\/vs\/([a-z]+)\//.exec(url)
  if (vs) return ok(buildHtml({ cid: 81, vs: { cid: 145 } }))
  return ok(buildHtml({ cid: 145 }))
}
const mkClient = (f, extra = {}) => createLolalyticsClient({ cache: createCache(), fetchImpl: f, ...extra })

test('dominio: fuentes y orden', () => {
  assert.equal(normalizeSource({ mode: 'raro' }).mode, 'coachless')
  assert.equal(needsLogin('coachless'), true); assert.equal(needsLogin('lolalytics'), false)
  assert.deepEqual(sourceOrder({ mode: 'lolalytics', loggedIn: true, premium: true, wantsMatchup: true }), ['lolalytics'])
  assert.equal(sourceOrder({ mode: 'auto', loggedIn: false, premium: false, wantsMatchup: false })[0], 'lolalytics')
})

test('dominio: treeOfRune respeta las excepciones 9xxx y 8299', () => {
  assert.equal(treeOfRune(9103), 8000); assert.equal(treeOfRune(8299), 8000); assert.equal(treeOfRune(8112), 8100)
})

test('cliente: URL, caché, sin cookies y una sola petición por consulta', async () => {
  assert.match(buildPageUrl({ slug: 'ezreal', lane: 'bottom', tier: 'emerald_plus', rival: 'kaisa' }), /ezreal\/vs\/kaisa\/build\/\?tier=emerald_plus&lane=bottom/)
  const f = fakeFetch(standard); const c = mkClient(f)
  const [a, b] = await Promise.all([c.build({ slug: 'kaisa', lane: 'bottom' }), c.build({ slug: 'kaisa', lane: 'bottom' })])
  assert.ok(a.ok && b.ok); await c.build({ slug: 'kaisa', lane: 'bottom' })
  assert.equal(f.calls.length, 1)
})

test('cliente: 404 = no-data; 503 activa backoff y se reanuda; HTML sin estado = blocked', async () => {
  let t = 0; let mode = 503
  const f = fakeFetch(() => (mode === 503 ? status(503) : mode === 404 ? status(404) : ok('<html>reto</html>')))
  const c = mkClient(f, { now: () => t })
  assert.equal((await c.build({ slug: 'a', lane: 'top' })).reason, 'blocked')
  const n = f.calls.length
  assert.equal((await c.build({ slug: 'b', lane: 'top' })).reason, 'blocked'); assert.equal(f.calls.length, n) // en backoff no se pide
  t += 61_000; mode = 404
  assert.equal((await c.build({ slug: 'c', lane: 'top' })).reason, 'no-data')
  mode = 200; t += 1
  assert.equal((await c.build({ slug: 'd', lane: 'top' })).reason, 'blocked') // sin qwik/json
})

test('cliente: rango no servido → emerald_plus', async () => {
  const f = fakeFetch((u) => (u.includes('tier=master_plus') ? status(500) : standard(u))); const c = mkClient(f)
  const r = await c.tierlist({ lane: 'bottom', tier: 'master_plus' })
  assert.ok(r.ok); assert.equal(r.tierUsed, 'emerald_plus')
})

test('fuente: matchup con página vs, y página base + aviso si la muestra es baja', async () => {
  const src = createLolalyticsSource({ client: mkClient(fakeFetch(standard)), catalog })
  const r = await src.getRecommendation({ championId: 81, role: 3, lobbyTier: 5, opponentChampionId: 145, enemies: [] }, {})
  assert.ok(r.ok); assert.equal(r.data.meta.matchup, true); assert.equal(r.data.meta.source, 'lolalytics')
  assert.equal(buildRunePage(r.data, 'x').ok, true)
  const low = createLolalyticsSource({ client: mkClient(fakeFetch((u) => (/\/vs\//.test(u) ? ok(buildHtml({ cid: 81, n: 100, vs: { cid: 145 } })) : standard(u)))), catalog })
  const r2 = await low.getRecommendation({ championId: 81, role: 3, lobbyTier: 5, opponentChampionId: 145 }, {})
  assert.ok(r2.ok); assert.equal(r2.data.meta.matchup, false); assert.ok(r2.data.meta.notices.includes('matchup-low-sample'))
})

test('fuente: deduce el rival entre los revelados con la lista de tier', async () => {
  const f = fakeFetch(standard)
  const src = createLolalyticsSource({ client: mkClient(f), catalog })
  const r = await src.getRecommendation({ championId: 81, role: 3, lobbyTier: 5, enemies: [{ championId: 412 }, { championId: 145 }] }, {})
  assert.ok(r.ok); assert.equal(r.data.meta.opponent, 145)
})

test('router: modo auto cae a la otra fuente y lo avisa; el error lleva la fuente', async () => {
  const good = { getRecommendation: async () => ({ ok: true, data: { meta: { notices: [] } } }) }
  const bad = { getRecommendation: async () => ({ ok: false, reason: 'network' }) }
  const rt = createSourceRouter({ sources: { coachless: bad, lolalytics: good }, getMode: () => 'auto', isLoggedIn: () => true })
  const r = await rt.getRecommendation({ championId: 1 }, { premium: true })
  assert.ok(r.ok); assert.equal(r.data.meta.source, 'lolalytics'); assert.ok(r.data.meta.notices.includes('source-fallback'))
  const only = createSourceRouter({ sources: { coachless: bad, lolalytics: good }, getMode: () => 'coachless', isLoggedIn: () => true })
  const e = await only.getRecommendation({ championId: 1 }, {})
  assert.equal(e.ok, false); assert.equal(e.source, 'coachless')
})

test('estadísticas: win rate por campeón y mejores counters (los de pocas partidas no cuentan)', async () => {
  const stats = createChampionStats({ client: mkClient(fakeFetch(standard)), catalog })
  const r = await stats.load({ role: 3, lobbyTier: 5, opponentChampionId: 145, opponentSource: 'position', enemies: [] })
  assert.ok(r.ok)
  const d = r.data
  assert.equal(d.champions[81].wr, 50.6)
  assert.equal(d.counters[0].cid, 15); assert.equal(d.counters[0].wr, 54.5); assert.equal(d.counters[1].cid, 236)
  assert.equal(d.champions[119].vs.low, true); assert.equal(d.champions[119].counter, null)
  assert.equal((await stats.load({ role: 5 })).reason, 'no-lane')
  const b = badgeOf({ ...d.champions[15], cid: 15 }, 145)
  assert.match(b.cls, /ecb-top/); assert.equal(b.rank, 1)
})

test('estadísticas: si falla la página del rival se mantienen las de la línea', async () => {
  const f = fakeFetch((u) => (u.includes('/tierlist/') ? ok(tierlistHtml()) : status(404)))
  const r = await createChampionStats({ client: mkClient(f), catalog }).load({ role: 3, lobbyTier: 5, opponentChampionId: 145 })
  assert.ok(r.ok); assert.equal(r.data.counters.length, 0); assert.equal(r.data.vsReason, 'no-data')
})

test('overlay controller: reacciona al contexto, conserva datos, se apaga y no repite', async () => {
  let cb = null; let state = { status: 'idle', context: null }
  const source = { getState: () => state, subscribe: (f) => { cb = f; return () => {} } }
  let loads = 0; let prefs = { enabled: true }
  const stats = { load: async () => { loads++; return { ok: true, data: { champions: {}, counters: [], rival: null } } } }
  const c = createOverlayController({ stats, source, prefs: { get: () => prefs, set: (p) => (prefs = { ...prefs, ...p }) }, debounceMs: 0 })
  c.start()
  state = { status: 'waiting', context: { phase: 'champ-select', role: 3, lobbyTier: 5, enemies: [] } }; cb(state)
  await new Promise((r) => setTimeout(r, 5)); assert.equal(c.getState().status, 'ready'); assert.equal(loads, 1)
  cb(state); await new Promise((r) => setTimeout(r, 5)); assert.equal(loads, 1) // misma clave
  state = { ...state, context: { ...state.context, enemies: [{ championId: 145 }] } }; cb(state)
  assert.equal(c.getState().status, 'loading'); assert.ok(c.getState().data) // conserva lo anterior
  await new Promise((r) => setTimeout(r, 5)); assert.equal(loads, 2)
  await c.setEnabled(false); assert.equal(c.getState().status, 'idle')
  state = { status: 'ready', context: { phase: 'game', role: 3, enemies: [] } }; await c.setEnabled(true); assert.equal(c.getState().status, 'idle') // en partida, nada
})

test('presentación: selector inválido no rompe', () => { assert.deepEqual(findTiles('###', { querySelectorAll: () => { throw new Error('x') } }), []) })
