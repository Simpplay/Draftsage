import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeFilters, resolveTiers, resolveAdditions, toggleTier, MAX_PATCH_RANGE } from '../../src/domain/filters.js'
import { patchSpanLabel } from '../../src/domain/patch.js'
const { createRecommendationService } = await import('../../src/application/recommendation.js')
const { createCache } = await import('../../src/infrastructure/coachless/cache.js')

test('normalizeFilters: valores por defecto, saneado y límites', () => {
  assert.deepEqual(normalizeFilters(undefined), { tiers: { mode: 'auto', min: 5, max: 7 }, patches: { mode: 'auto', additions: 1 } })
  assert.deepEqual(normalizeFilters({ tiers: { mode: 'range', min: 9, max: 1 }, patches: { mode: 'manual', additions: 99 } }),
    { tiers: { mode: 'range', min: 3, max: 7 }, patches: { mode: 'manual', additions: MAX_PATCH_RANGE } })
  assert.deepEqual(normalizeFilters({ tiers: { mode: 'range', min: 6, max: 4 } }).tiers, { mode: 'range', min: 4, max: 6 }) // extremos invertidos
  assert.equal(normalizeFilters({ patches: { mode: 'manual', additions: -3 } }).patches.additions, 0)
  assert.equal(normalizeFilters({ patches: { mode: 'manual', additions: 'x' } }).patches.additions, 1)
  assert.equal(normalizeFilters('basura').tiers.mode, 'auto')
})

test('resolveTiers: automático = lobby ±1; manual = rango elegido (siempre 3..7)', () => {
  assert.deepEqual(resolveTiers(undefined, 5), { tiers: [4, 5, 6], manual: false })
  assert.deepEqual(resolveTiers(undefined, undefined), { tiers: [5, 6, 7], manual: false })
  assert.deepEqual(resolveTiers({ tiers: { mode: 'range', min: 3, max: 4 } }, 7), { tiers: [3, 4], manual: true })
  assert.deepEqual(resolveTiers({ tiers: { mode: 'range', min: 0, max: 2 } }, 5).tiers, [3]) // por debajo de Gold se acota
})

test('resolveAdditions: gratuita siempre 0 (y avisa si pidió más); premium auto = 1', () => {
  assert.deepEqual(resolveAdditions(undefined, true), { additions: 1, manual: false, limited: false })
  assert.deepEqual(resolveAdditions(undefined, false), { additions: 0, manual: false, limited: false })
  assert.deepEqual(resolveAdditions({ patches: { mode: 'manual', additions: 2 } }, true), { additions: 2, manual: true, limited: false })
  assert.deepEqual(resolveAdditions({ patches: { mode: 'manual', additions: 2 } }, false), { additions: 0, manual: true, limited: true })
  assert.deepEqual(resolveAdditions({ patches: { mode: 'manual', additions: 0 } }, false), { additions: 0, manual: true, limited: false })
})

test('toggleTier: amplía, acorta y vuelve a automático', () => {
  const R = (min, max) => ({ mode: 'range', min, max })
  assert.deepEqual(toggleTier({ mode: 'auto', min: 5, max: 7 }, 4), R(4, 4))
  assert.deepEqual(toggleTier(R(4, 4), 6), R(4, 6))
  assert.deepEqual(toggleTier(R(4, 6), 3), R(3, 6))
  assert.deepEqual(toggleTier(R(4, 6), 4), R(5, 6))
  assert.deepEqual(toggleTier(R(4, 6), 6), R(4, 5))
  assert.deepEqual(toggleTier(R(3, 7), 4), R(4, 7)) // en medio: mueve el extremo más cercano
  assert.deepEqual(toggleTier(R(3, 7), 6), R(3, 6))
  assert.equal(toggleTier(R(5, 5), 5).mode, 'auto')
})

test('patchSpanLabel', () => {
  const p = { major: 16, patch: 21, label: '16.21' }
  assert.equal(patchSpanLabel(p, 0), '16.21'); assert.equal(patchSpanLabel(p, 1), '16.20–21'); assert.equal(patchSpanLabel(p, 2), '16.19–21')
  assert.equal(patchSpanLabel({ major: 16, patch: 1, label: '16.1' }, 2), '16.1+2') // cruza de temporada: no se inventa el anterior
})

// ---- el servicio usa los filtros del usuario ----
const PATCHES = [19, 20, 21, 22].map((p) => ({ major: 16, patch: p, label: '16.' + p, matchCount: 6800000 }))
const e = (rune, wpa, occurrence) => ({ rune, wpa, occurrence })
function mk(filters, premium = true) {
  const calls = []
  const ok = (data) => async (...a) => { calls.push(a[0]); return { ok: true, data } }
  const client = {
    patches: async () => ({ ok: true, data: PATCHES }), championRole: async () => ({ ok: true, data: 3 }),
    keystones: ok([e(8008, 0.2, 50000)]), spells: ok([{ spell: 4, wpa: 0, occurrence: 50000 }, { spell: 7, wpa: 0.3, occurrence: 40000 }]),
    builds: ok([{ keystone: 8008, primaryTree: 8000, secondaryTree: 8300, shards: [5005, 5008, 5011], occurrence: 50000 }]),
    items: ok([]),
    treeRunes: ok({ rows: [[e(8009, 0, 1000)], [e(9104, 0, 1000)], [e(8017, 0, 1000)]] }),
  }
  const svc = createRecommendationService({ client, log: { info() {}, warn() {}, error() {}, debug() {} }, cache: createCache(), getFilters: () => filters })
  return { svc, calls, premium }
}
const CTX = { championId: 145, role: 3, lobbyTier: 5 }

test('servicio: rango de Elo manual manda sobre la lobby y se marca en meta', async () => {
  const { svc, calls } = mk({ tiers: { mode: 'range', min: 6, max: 7 } })
  const r = await svc.getRecommendation(CTX, { premium: true })
  assert.deepEqual(r.data.meta.tiers, [6, 7]); assert.equal(r.data.meta.tierSource, 'manual')
  assert.deepEqual(calls.find((f) => f.leagueTiers).leagueTiers, [6, 7])
  const auto = await mk(undefined).svc.getRecommendation(CTX, { premium: true })
  assert.deepEqual(auto.data.meta.tiers, [4, 5, 6]); assert.equal(auto.data.meta.tierSource, 'lobby')
})

test('servicio: rango de parches manual (premium) y límite para cuenta gratuita', async () => {
  const p2 = mk({ patches: { mode: 'manual', additions: 2 } })
  const r = await p2.svc.getRecommendation(CTX, { premium: true })
  assert.equal(p2.calls.find((f) => f.patch && f.leagueTiers).patch.patchAdditions, 2)
  assert.equal(r.data.meta.patchRange, 2); assert.equal(r.data.meta.patchSource, 'manual'); assert.equal(r.data.meta.patchSpan, '16.20–22')
  assert.ok(!r.data.meta.notices.includes('patch-range-requires-premium'))

  const cur = mk({ patches: { mode: 'manual', additions: 0 } })
  await cur.svc.getRecommendation(CTX, { premium: true })
  assert.equal(cur.calls.find((f) => f.patch && f.leagueTiers).patch.patchAdditions, 0) // premium puede pedir solo el actual

  const free = mk({ patches: { mode: 'manual', additions: 2 } })
  const g = await free.svc.getRecommendation(CTX, { premium: false })
  assert.equal(free.calls.find((f) => f.patch && f.leagueTiers).patch.patchAdditions, 0)
  assert.ok(g.data.meta.notices.includes('patch-range-requires-premium'))
})

test('servicio: cambiar los filtros no reutiliza una recomendación cacheada con otros', async () => {
  let filters = { tiers: { mode: 'range', min: 3, max: 3 } }
  const calls = []
  const svc = createRecommendationService({ client: { ...{ patches: async () => ({ ok: true, data: PATCHES }), championRole: async () => ({ ok: true, data: 3 }),
    keystones: async (x) => { calls.push(x.leagueTiers.join()); return { ok: true, data: [e(8008, 0.2, 50000)] } }, spells: async () => ({ ok: true, data: [] }),
    builds: async () => ({ ok: true, data: [{ keystone: 8008, primaryTree: 8000, shards: [1, 2, 3] }] }), items: async () => ({ ok: true, data: [] }), treeRunes: async () => ({ ok: true, data: { rows: [[], [], []] } }) } },
    log: { info() {}, warn() {}, error() {}, debug() {} }, cache: createCache(), getFilters: () => filters })
  await svc.getRecommendation(CTX, { premium: true }); filters = { tiers: { mode: 'range', min: 3, max: 4 } }
  await svc.getRecommendation(CTX, { premium: true })
  assert.deepEqual(calls, ['3', '3,4'])
})
