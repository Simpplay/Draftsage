import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const { createRecommendationService } = await import('../../src/application/recommendation.js')
const { createCoachlessClient } = await import('../../src/infrastructure/coachless/client.js')
const { createCache } = await import('../../src/infrastructure/coachless/cache.js')

const e = (rune, wpa, occurrence) => ({ rune, wpa, occurrence })
const log = { info() {}, warn() {}, error() {}, debug() {} }
const PATCHES = [19, 20, 21, 22].map((p) => ({ major: 16, patch: p, label: '16.' + p, matchCount: p === 22 ? 243088 : 6800000 }))

// Cliente falso: guarda las llamadas para comprobar qué filtros se enviaron.
function fakeClient(over = {}) {
  const calls = []
  const rec = (name) => (...a) => { calls.push([name, ...a]); return over[name] ? over[name](...a) : base[name](...a) }
  const base = {
    championRole: async (f) => ({ ok: true, data: ({ 222: 3, 238: 2, 412: 4, 64: 1 })[f.championIds[0]] ?? null }),
    patches: async () => ({ ok: true, data: PATCHES }),
    keystones: async () => ({ ok: true, data: [e(8005, -2.6, 25723), e(8008, 0.16, 538163), e(8010, 9, 119)] }),
    spells: async (f, paired) => ({ ok: true, data: paired
      ? [{ spell: 3, wpa: 0.8, occurrence: 111000 }, { spell: 4, wpa: 0.0, occurrence: 575000 }, { spell: 21, wpa: -0.2, occurrence: 400000 }]
      : [{ spell: 4, wpa: 0, occurrence: 575250 }, { spell: 3, wpa: 0.78, occurrence: 111388 }, { spell: 6, wpa: 1.4, occurrence: 7838 }] }),
    builds: async () => ({ ok: true, data: [{ keystone: 8008, primaryTree: 8000, secondaryTree: 8300, shards: [5005, 5008, 5011], occurrence: 98136 }] }),
    treeRunes: async (f, main, tree) => ({ ok: true, data: { rows: tree === main
      ? [[e(8009, -0.4, 404746), e(9111, 1.1, 157765)], [e(9104, 0.77, 65115), e(9103, -0.1, 497560)], [e(8017, 0.6, 197962), e(8014, -0.3, 364425)]]
      : tree === 8200 ? [[e(8275, 8.2, 1761)], [e(8234, 7.1, 2290)], []]
      : tree === 8300 ? [[e(8321, 1, 3000)], [e(8313, 1, 3000)], []]
      : [[], [], []] } }),
  }
  return { client: { patches: rec('patches'), keystones: rec('keystones'), spells: rec('spells'), builds: rec('builds'), treeRunes: rec('treeRunes'), championRole: rec('championRole') }, calls }
}
const mk = (over) => { const f = fakeClient(over); return { ...f, svc: createRecommendationService({ client: f.client, log, cache: createCache() }) } }
const CTX = { championId: 145, role: 3, lobbyTier: 5 }

test('rival sin posiciones del cliente: se deduce por el rol principal (solo premium)', async () => {
  const { svc, calls } = mk()
  const ctx = { ...CTX, enemies: [{ championId: 64 }, { championId: 222 }, { championId: 238 }] } // jungla, ADC, mid → ADC = Jinx
  const r = await svc.getRecommendation(ctx, { premium: true })
  assert.equal(r.data.meta.matchup, true); assert.equal(r.data.meta.opponent, 222); assert.equal(r.data.meta.opponentSource, 'role')
  assert.deepEqual(calls.find((c) => c[0] === 'keystones')[1].matchupChampionIds, [222])
  // gratuita: no se gastan peticiones en deducir un rival que no se podría usar
  const f = mk()
  await f.svc.getRecommendation(ctx, { premium: false })
  assert.equal(f.calls.filter((c) => c[0] === 'championRole').length, 0)
  // ningún rival revelado juega tu rol → sin matchup, sin avisos de error
  const g = mk()
  const r3 = await g.svc.getRecommendation({ ...CTX, enemies: [{ championId: 64 }, { championId: 238 }] }, { premium: true })
  assert.equal(r3.data.meta.opponent, null); assert.equal(r3.data.meta.matchup, false)
  // rol desconocido (ARAM…): no se deduce nada
  const h2 = mk()
  await h2.svc.getRecommendation({ championId: 145, role: 5, enemies: [{ championId: 222 }] }, { premium: true })
  assert.equal(h2.calls.filter((c) => c[0] === 'championRole').length, 0)
})

test('rival elegido a mano manda sobre la deducción', async () => {
  const { svc } = mk()
  const r = await svc.getRecommendation({ ...CTX, opponentChampionId: 238, opponentSource: 'manual', enemies: [{ championId: 222 }] }, { premium: true })
  assert.equal(r.data.meta.opponent, 238); assert.equal(r.data.meta.opponentSource, 'manual')
})

test('flujo completo con cuenta gratuita: parche anterior, sin rango de parches, sin matchup', async () => {
  const { svc, calls } = mk()
  const r = await svc.getRecommendation({ ...CTX, opponentChampionId: 222 }, { premium: false })
  assert.ok(r.ok)
  const d = r.data
  assert.equal(d.keystone.rune, 8008); assert.equal(d.primaryTree, 8000)
  assert.deepEqual(d.primaryPicks.map((p) => p.rune), [9111, 9104, 8017])
  assert.equal(d.secondaryTree, 8200); assert.deepEqual(d.secondaryPicks.map((p) => p.rune), [8275, 8234])
  assert.deepEqual(d.shards, [5005, 5008, 5011])
  assert.deepEqual(d.spells.map((s) => s.spell), [3, 4])
  assert.equal(d.meta.patch, '16.21'); assert.deepEqual(d.meta.tiers, [4, 5, 6]); assert.equal(d.meta.matchup, false)
  assert.deepEqual(d.meta.notices.sort(), ['matchup-requires-premium', 'patch-low-sample'])
  const f = calls.find((c) => c[0] === 'keystones')[1]
  assert.equal(f.patch.patchAdditions, 0); assert.equal(f.matchupChampionIds, null); assert.ok(f.leagueTiers.every((t) => t >= 3))
  assert.equal(calls.filter((c) => c[0] === 'treeRunes').length, 5) // principal + 4 candidatos
})

test('premium: rango de parches y matchup en los filtros; el resultado se cachea', async () => {
  const { svc, calls } = mk()
  const ctx = { ...CTX, opponentChampionId: 222 }
  const r = await svc.getRecommendation(ctx, { premium: true })
  const f = calls.find((c) => c[0] === 'keystones')[1]
  assert.equal(f.patch.patchAdditions, 1); assert.deepEqual(f.matchupChampionIds, [222])
  assert.equal(r.data.meta.matchup, true)
  const n = calls.length
  await svc.getRecommendation(ctx, { premium: true })
  assert.equal(calls.length, n + 1) // solo vuelve a pedir GetPatches (barato, cacheado en el cliente real)
})

test('403 con filtros premium: reintenta sin rango ni matchup y avisa (no es error de sesión)', async () => {
  let first = true
  const { svc, calls } = mk({ keystones: async (f) => {
    if (f.patch.patchAdditions > 0 || f.matchupChampionIds) return { ok: false, reason: 'forbidden' }
    return { ok: true, data: [e(8008, 0.1, 1000)] } } })
  const r = await svc.getRecommendation({ ...CTX, opponentChampionId: 222 }, { premium: true })
  assert.ok(r.ok); assert.ok(r.data.meta.notices.includes('filters-downgraded')); assert.equal(r.data.meta.matchup, false)
  assert.equal(calls.filter((c) => c[0] === 'keystones').length, 2)
})

test('403 incluso sin filtros premium → forbidden', async () => {
  const { svc } = mk({ keystones: async () => ({ ok: false, reason: 'forbidden' }) })
  assert.deepEqual(await svc.getRecommendation(CTX, { premium: false }), { ok: false, reason: 'forbidden' })
})

test('matchup con muy poca muestra: usa el campeón sin rival y avisa', async () => {
  const { svc, calls } = mk({ keystones: async (f) => ({ ok: true, data: f.matchupChampionIds ? [e(8008, 3, 40)] : [e(8008, 0.1, 500000)] }) })
  const r = await svc.getRecommendation({ ...CTX, opponentChampionId: 222 }, { premium: true })
  assert.ok(r.data.meta.notices.includes('matchup-low-sample')); assert.equal(r.data.meta.matchup, false)
  assert.equal(calls.filter((c) => c[0] === 'keystones').length, 2)
})

test('matchup sin ningún dato (rival raro): cae a la build del campeón, no a error', async () => {
  const { svc } = mk({ keystones: async (f) => ({ ok: true, data: f.matchupChampionIds ? [] : [e(8008, 0.1, 500000)] }) })
  const r = await svc.getRecommendation({ ...CTX, opponentChampionId: 222 }, { premium: true })
  assert.equal(r.ok, true); assert.equal(r.data.meta.matchup, false); assert.ok(r.data.meta.notices.includes('matchup-low-sample'))
})

test('errores de red y sin datos', async () => {
  assert.deepEqual(await mk({ patches: async () => ({ ok: false, reason: 'network' }) }).svc.getRecommendation(CTX, {}), { ok: false, reason: 'network' })
  assert.equal((await mk({ keystones: async () => ({ ok: true, data: [] }) }).svc.getRecommendation(CTX, {})).reason, 'no-data')
  assert.equal((await mk().svc.getRecommendation({ championId: 0 }, {})).reason, 'no-data')
  // fallos secundarios no tumban la recomendación
  const r = await mk({ spells: async () => ({ ok: false, reason: 'network' }), builds: async () => ({ ok: false, reason: 'network' }) }).svc.getRecommendation(CTX, {})
  assert.ok(r.ok); assert.deepEqual(r.data.spells, []); assert.deepEqual(r.data.shards, [])
})

test('petición obsoleta: devuelve aborted y no cachea', async () => {
  const ac = new AbortController()
  const { svc } = mk({ keystones: async () => { ac.abort(); return { ok: true, data: [e(8008, 0.1, 9999)] } } })
  assert.deepEqual(await svc.getRecommendation(CTX, { signal: ac.signal }), { ok: false, reason: 'aborted' })
})

test('keystone fuera de la tabla estática: el árbol sale de la build o del cliente', async () => {
  const { svc } = mk({ keystones: async () => ({ ok: true, data: [e(7777, 1, 1000)] }) })
  assert.equal((await svc.getRecommendation(CTX, {})).reason, 'no-data')
  const f = fakeClient({ keystones: async () => ({ ok: true, data: [e(7777, 1, 1000)] }) })
  const svc2 = createRecommendationService({ client: f.client, log, cache: createCache(), keystoneTrees: () => new Map([[7777, 8200]]) })
  assert.equal((await svc2.getRecommendation(CTX, {})).data.primaryTree, 8200)
})

test('cliente: normaliza respuestas, cachea aciertos y no cachea fallos', async () => {
  let n = 0
  const post = async (path, body) => {
    n++
    if (path.endsWith('GetKeystoneData')) return { ok: true, status: 200, data: [{ rune: 8008, runeType: 0, wpaOverall: 0.16, occurrence: 5, runeEffects: [] }] }
    if (path.endsWith('GetRunesForKeystoneAndTree')) return { ok: true, status: 200, data: { rowOnes: [{ rune: 1, wpaOverall: 2, occurrence: 3 }], rowTwos: [], rowThrees: null } }
    if (path.endsWith('GetGlobalSummonerSpellStatistics')) return { ok: true, status: 200, data: [{ summonerSpell: 4, wpaOverall: 0.5, occurrence: 9 }] }
    return { ok: false, status: 403, reason: 'forbidden' }
  }
  const client = createCoachlessClient({ post, get: async () => ({ ok: true, status: 200, data: [{ major: 16, patch: 21, matchCount: 7 }, { nope: 1 }] }), cache: createCache() })
  const f = { patch: { major: 16, patch: 21, patchAdditions: 0 }, championIds: [145] }
  assert.deepEqual((await client.keystones(f)).data, [{ rune: 8008, wpa: 0.16, occurrence: 5 }])
  await client.keystones(f); assert.equal(n, 1)
  assert.deepEqual((await client.treeRunes(f, 8000, 8100, 8008)).data.rows, [[{ rune: 1, wpa: 2, occurrence: 3 }], [], []])
  assert.deepEqual((await client.spells(f)).data, [{ spell: 4, wpa: 0.5, occurrence: 9 }])
  assert.equal((await client.patches()).data.length, 1)
  const roleClient = createCoachlessClient({ post: async () => ({ ok: true, status: 200, data: { role: 3, builds: [] } }), get: async () => ({ ok: false }), cache: createCache() })
  assert.equal((await roleClient.championRole(f)).data, 3)
  assert.equal((await roleClient.builds(f)).data.length, 0) // la clave de caché de «rol» no pisa a «builds»
  const a = await client.builds(f), b = await client.builds(f)
  assert.equal(a.reason, 'forbidden'); assert.equal(b.reason, 'forbidden'); assert.equal(n, 5) // el fallo se repitió (no cacheado)
})
