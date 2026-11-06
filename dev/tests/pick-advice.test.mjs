import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { FIXTURE_ROWS } from './fixtures/itero-fixture.mjs'
const D = await import('../../src/domain/itero.js')
const A = await import('../../src/domain/pick-advice.js')
const { createPickAdvisor, createPickAdvisorController } = await import('../../src/application/pick-advisor.js')
const { getAdvisorPrefs, setAdvisorPrefs } = await import('../../src/application/preferences.js')

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))
// Candidato sintético: pred en puntos; el resto neutro
const cand = (name, pred, o = {}) => ({ name, pred, rating: 3, laning: 3, count: 50_000, pick: 0.02, champWr: 50, predGold: 0, synAvg: 1, ctrAvg: 1, syn: {}, ctr: {}, scale: {}, adRatio: 50, adRatioVar: 0, ...o })

test('assignLanes: posiciones del cliente directas; sin posición, por cuota de línea', () => {
  const share = (cid, lane) => ({ 22: { BOTTOM: 98 }, 412: { UTILITY: 95 }, 103: { MIDDLE: 80, UTILITY: 10 }, 266: { TOP: 90 }, 64: { JUNGLE: 97 } }[cid]?.[lane] ?? 0)
  const r = A.assignLanes([{ championId: 22 }, { championId: 412 }, { championId: 103 }, { championId: 266 }, { championId: 64 }], share)
  assert.deepEqual(r, { BOTTOM: 22, UTILITY: 412, MIDDLE: 103, TOP: 266, JUNGLE: 64 })
  // con posición informada no se consulta la cuota
  const r2 = A.assignLanes([{ championId: 22, position: 'bottom' }, { championId: 412, position: 'utility' }], () => { throw new Error('no debería') })
  assert.deepEqual(r2, { BOTTOM: 22, UTILITY: 412 })
})

test('assignLanes: el reparto óptimo resuelve flexibles; los dudosos se dejan fuera', () => {
  // Yone (top 50 / mid 50) + Ahri (mid 100): único reparto razonable = Yone top, Ahri mid
  const s1 = (cid, l) => ({ 777: { TOP: 50, MIDDLE: 50 }, 103: { MIDDLE: 100 } }[cid]?.[l] ?? 0)
  assert.deepEqual(A.assignLanes([{ championId: 777 }, { championId: 103 }], s1), { TOP: 777, MIDDLE: 103 })
  // dos flexibles idénticos entre top y mid: no se sabe cuál es cuál → ambos fuera
  const s2 = (cid, l) => ({ 1: { TOP: 50, MIDDLE: 50 }, 2: { TOP: 50, MIDDLE: 50 } }[cid]?.[l] ?? 0)
  assert.deepEqual(A.assignLanes([{ championId: 1 }, { championId: 2 }], s2), {})
  // un campeón que no llega al mínimo en ninguna línea (o sin datos) queda fuera sin romper al resto
  assert.deepEqual(A.assignLanes([{ championId: 9 }, { championId: 22 }], (c, l) => (c === 22 && l === 'BOTTOM' ? 90 : c === 9 ? 10 : null)), { BOTTOM: 22 })
  assert.deepEqual(A.assignLanes([], () => 0), {}); assert.deepEqual(A.assignLanes(undefined, () => 0), {})
  // posición duplicada (dato raro): el segundo se trata como desconocido
  assert.deepEqual(A.assignLanes([{ championId: 1, position: 'top' }, { championId: 2, position: 'top' }], (c, l) => (c === 2 && l === 'JUNGLE' ? 95 : 0)), { TOP: 1, JUNGLE: 2 })
})

test('rankPicks: relativo a la mediana, filtros de uso/partidas/bans y límite', () => {
  const cs = [cand('A', 60), cand('B', 55), cand('C', 50), cand('Raro', 70, { pick: 0.0005 }), cand('Pocos', 70, { count: 200 }), cand('Baneado', 65), cand('D', 40), cand('E', 45), cand('F', 52), cand('G', 53)]
  const ids = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, Baneado: 8 }
  const r = A.rankPicks({ candidates: cs, idOf: (n) => ids[n] ?? null, banned: ['baneado'] })
  assert.deepEqual(r.picks.map((p) => p.name), ['A', 'B', 'G', 'F', 'C'])        // Raro, Pocos y Baneado fuera; top 5
  assert.equal(r.pool, 7); assert.equal(r.blended, false)
  const med = A.median([60, 55, 50, 40, 45, 52, 53])                              // 52
  assert.equal(r.picks[0].delta, 60 - med); assert.equal(r.picks[0].score, 60 - med)
  assert.ok(r.picks.every((p, i) => p.rank === i + 1 && !('pred' in p) && !('_s' in p)))   // nunca la probabilidad absoluta
  assert.deepEqual(A.rankPicks({ candidates: [], idOf: () => 1 }), { picks: [], blended: false, pool: 0 })
  assert.equal(A.rankPicks({ candidates: [cand('X', 50)], idOf: () => null }).picks.length, 0) // sin id no hay pick
})

test('rankPicks: mezcla con el matchup (encogido por muestra, peso 0,5) y etiquetas de acuerdo', () => {
  const cs = [cand('A', 56), cand('B', 55), cand('C', 54), cand('D', 50), cand('E', 49), cand('F', 48)]
  const ids = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 }
  const stats = { champions: {
    1: { vs: { wr: 44, edge: -8, n: 20_000, low: false } },   // iTero lo ve bien pero pierde el duelo → conflicto y baja
    2: { vs: { wr: 54, edge: 3, n: 900, low: false } },       // a favor → acuerdo
    3: { vs: { wr: 70, edge: 20, n: 40, low: true } },        // muestra ínfima: casi no pesa
    4: { vs: { wr: 60, edge: 10, n: 30_000, low: false } },   // gran matchup: sube, pero no está en el top de iTero (agreeTop 3)
  } }
  const r = A.rankPicks({ candidates: cs, idOf: (n) => ids[n], stats, options: { agreeTop: 3 } })
  assert.equal(r.blended, true)
  const by = Object.fromEntries(r.picks.map((p) => [p.name, p]))
  assert.equal(A.median([56, 55, 54, 50, 49, 48]), 52)
  const exp = (pred, edge, n) => Math.round((pred - 52 + 0.5 * edge * (n / (n + 300))) * 10) / 10
  assert.equal(by.A.score, exp(56, -8, 20_000)); assert.equal(by.B.score, exp(55, 3, 900)); assert.equal(by.C.score, exp(54, 20, 40)); assert.equal(by.D.score, exp(50, 10, 30_000))
  assert.equal(by.A.agree, 'conflict'); assert.equal(by.B.agree, 'agree'); assert.equal(by.C.agree, null) // C: muestra baja → ni acuerdo ni conflicto
  assert.equal(by.D.agree, null)                                                                      // fuera del top de iTero
  assert.deepEqual(by.B.matchup, { wr: 54, edge: 3, n: 900, low: false })
  assert.equal(by.E.matchup, null)                                                                    // sin dato: solo iTero
  // peso 0 = solo iTero
  const solo = A.rankPicks({ candidates: cs, idOf: (n) => ids[n], stats, options: { weight: 0 } })
  assert.deepEqual(solo.picks.slice(0, 3).map((p) => p.name), ['A', 'B', 'C'])
  // veto por win rate bajo con muestra grande
  const veto = A.rankPicks({ candidates: cs, idOf: (n) => ids[n], stats: { champions: { 2: { vs: { wr: 46, edge: 0.5, n: 800, low: false } } } }, options: { agreeTop: 3 } })
  assert.equal(veto.picks.find((p) => p.name === 'B').agree, 'conflict')
})

test('chipsOf: explica solo con lo que se ve (aliados y rivales revelados)', () => {
  const c = cand('X', 55, { syn: { JUNGLE: 1.05, BOTTOM: 1.01, UTILITY: 0.98 }, ctr: { TOP: 1.04, MIDDLE: 0.95, BOTTOM: 1.1 }, scale: { early: 0.04, mid: 0.01, late: -0.03 }, adRatio: 70 })
  const chips = A.chipsOf(c, { allyLanes: ['JUNGLE', 'BOTTOM'], enemyLanes: ['TOP', 'MIDDLE'] })
  assert.deepEqual(chips, [
    { kind: 'syn', lane: 'JUNGLE', value: 5 }, { kind: 'ctr', lane: 'TOP', value: 4 }, { kind: 'weak', lane: 'MIDDLE', value: -5 },
    { kind: 'scale', phase: 'early', value: 4 }, { kind: 'dmg', value: 'ad' },
  ])
  // BOTTOM (1.10) no sale: ese rival no está revelado; sin nada revelado solo queda escalado y daño
  assert.deepEqual(A.chipsOf(c).map((x) => x.kind), ['scale', 'dmg'])
  assert.deepEqual(A.chipsOf(cand('Y', 50, { adRatio: null })), [])
  assert.equal(A.chipsOf(cand('Z', 50, { adRatio: 20 })).at(-1).value, 'ap'); assert.equal(A.chipsOf(cand('Z', 50)).at(-1).value, 'balanced')
})

// ---------- aplicación ----------
const NAMES = { 64: 'Lee Sin', 222: 'Jinx', 51: 'Caitlyn', 62: 'Wukong', 266: 'Aatrox', 777: 'Yone' }
const champs = Object.fromEntries(FIXTURE_ROWS.slice(0, 20).map((r, i) => [1000 + i, r.champion]))
const ENG = { ...NAMES, ...champs }
function mkDeps(over = {}) {
  const reqs = []
  const itero = { draftPicks: async (req) => { reqs.push(req); return over.iteroResult ?? { ok: true, data: { candidates: D.normalizeResponse(FIXTURE_ROWS, req.lane).candidates, unrecognized: [] } } } }
  const names = { load: async () => true, name: (id) => (over.noNames ? null : ENG[id] ?? null), idOf: (n) => Object.entries(ENG).find(([, v]) => D.nameKey(v) === D.nameKey(n))?.[0] * 1 || null }
  const catalog = { load: async () => {}, champion: (id) => ({ id, name: ENG[id] ?? '#' + id }), findChampion: () => null }
  const calls = { tierlist: [], stats: [] }
  const lola = { tierlist: async (a) => { calls.tierlist.push(a); return over.tierlist?.(a) ?? { ok: false, reason: 'blocked' } } }
  const stats = over.stats === null ? null : { load: async (c) => { calls.stats.push(c); return over.stats?.(c) ?? { ok: false, reason: 'blocked' } } }
  return { reqs, calls, advisor: createPickAdvisor({ itero, names, catalog, lola, stats, getFilters: () => over.filters, getPrefs: () => over.prefs ?? {}, log: null }) }
}

test('consejero: línea, rango y lado; hueco propio vacío; posiciones del cliente sin pedir listas de tier', async () => {
  const { advisor, reqs, calls } = mkDeps()
  const r = await advisor.advise({ role: 2, lobbyTier: 4, side: 'Red', mode: 'CLASSIC', bans: [266], allies: [{ championId: 64, position: 'jungle' }, { championId: 222, position: 'bottom' }], enemies: [{ championId: 51, position: 'bottom' }] })
  assert.ok(r.ok); assert.equal(reqs.length, 1)
  assert.deepEqual(reqs[0], D.buildRequest({ lane: 'MIDDLE', rankClass: 'PLATINUM', side: 'Red', allies: { JUNGLE: 'Lee Sin', BOTTOM: 'Jinx' }, enemies: { BOTTOM: 'Caitlyn' }, bans: ['Aatrox'] }))
  assert.equal(calls.tierlist.length, 0)                         // todos con posición: no hace falta la cuota de línea
  assert.deepEqual(Object.keys(r.data.meta.allies).sort(), ['BOTTOM', 'JUNGLE']); assert.deepEqual(r.data.meta.allies, { JUNGLE: 64, BOTTOM: 222 }); assert.equal(r.data.meta.rankClass, 'PLATINUM'); assert.equal(r.data.meta.sideKnown, true)
  assert.ok(r.data.picks.length > 0 && r.data.picks.every((p) => Number.isInteger(p.championId)))
})

test('consejero: rivales sin posición → cuota de línea de LoLalytics; dudosos fuera; rival de tu línea en la petición', async () => {
  const rows = { top: new Map([[266, { pctLane: 90 }]]), jungle: new Map(), middle: new Map(), bottom: new Map([[51, { pctLane: 95 }]]), support: new Map() }
  const { advisor, reqs, calls } = mkDeps({ tierlist: ({ lane }) => ({ ok: true, data: { rows: rows[lane] } }) })
  const r = await advisor.advise({ role: 3, lobbyTier: 5, enemies: [{ championId: 266, position: '' }, { championId: 51, position: '' }, { championId: 777, position: '' }] })
  assert.ok(r.ok)
  assert.equal(calls.tierlist.length, 5); assert.ok(calls.tierlist.every((c) => c.tier === 'emerald_plus' || typeof c.tier === 'string'))
  assert.deepEqual(reqs[0].teamComp, { t2_TOP_champion: 'Aatrox', t2_BOTTOM_champion: 'Caitlyn' }) // Yone no llega a la cuota en ninguna línea: fuera
  assert.deepEqual(Object.keys(r.data.meta.enemies).sort(), ['BOTTOM', 'TOP']); assert.equal(r.data.meta.rival, 51)
  assert.equal(reqs[0].side, 'Blue'); assert.equal(r.data.meta.sideKnown, false)                   // sin lado del cliente: azul asumido y marcado
})

test('consejero: el rival detectado por el controlador (o simulado) viaja en su línea aunque no haya enemigos', async () => {
  const { advisor, reqs } = mkDeps()
  await advisor.advise({ role: 2, lobbyTier: 5, opponentChampionId: 777 })
  assert.deepEqual(reqs[0].teamComp, { t2_MIDDLE_champion: 'Yone' })
})

test('consejero: ARAM/Arena y sin línea no consultan; rango manual manda sobre el de la lobby', async () => {
  const { advisor, reqs } = mkDeps({ filters: { tiers: { mode: 'range', min: 6, max: 7 } } })
  assert.deepEqual(await advisor.advise({ role: 3, mode: 'ARAM' }), { ok: false, reason: 'mode' })
  assert.deepEqual(await advisor.advise({ role: 3, mode: 'CHERRY' }), { ok: false, reason: 'mode' })
  assert.deepEqual(await advisor.advise({ role: 5 }), { ok: false, reason: 'no-lane' })
  assert.equal(reqs.length, 0)
  await advisor.advise({ role: 3, lobbyTier: 3 })
  assert.equal(reqs[0].rankClass, 'MASTER+') // rango manual 6–7: la central (a igual distancia, la alta)
})

test('consejero: nombres sin traducir no llegan a iTero (hueco) y se usa el nombre del cliente si Data Dragon falla', async () => {
  const a = mkDeps(); await a.advisor.advise({ role: 3, allies: [{ championId: 64, position: 'jungle' }, { championId: 99999, position: 'top' }] })
  assert.deepEqual(a.reqs[0].teamComp, { t1_JUNGLE_champion: 'Lee Sin' })  // 99999 sin nombre en ningún sitio: omitido
  const b = mkDeps({ noNames: true }); await b.advisor.advise({ role: 3, allies: [{ championId: 64, position: 'jungle' }] })
  assert.deepEqual(b.reqs[0].teamComp, { t1_JUNGLE_champion: 'Lee Sin' })  // vía catálogo del cliente
})

test('consejero: errores de iTero se propagan con su razón; sin LoLalytics funciona solo con iTero', async () => {
  for (const reason of ['network', 'blocked', 'http', 'shape']) {
    const { advisor } = mkDeps({ iteroResult: { ok: false, reason } })
    assert.deepEqual(await advisor.advise({ role: 3 }), { ok: false, reason })
  }
  const { advisor } = mkDeps({ stats: null })
  const r = await advisor.advise({ role: 3, lobbyTier: 5 }); assert.ok(r.ok); assert.equal(r.data.meta.blended, false)
  const f = mkDeps({ stats: () => { throw new Error('boom') } })
  assert.ok((await f.advisor.advise({ role: 3 })).ok)                      // LoLalytics roto no tumba al consejero
})

test('consejero: mezcla con las estadísticas de LoLalytics y respeta los ajustes (peso, uso mínimo)', async () => {
  const top = D.normalizeResponse(FIXTURE_ROWS, 'MIDDLE').candidates.slice(0, 3).map((c) => c.name)
  const idOfName = (n) => Number(Object.entries(champs).find(([, v]) => v === n)?.[0])
  const stats = () => ({ ok: true, data: { champions: { [idOfName(top[0])]: { vs: { wr: 40, edge: -10, n: 50_000, low: false } }, [idOfName(top[1])]: { vs: { wr: 54, edge: 3, n: 50_000, low: false } } } } })
  const base = mkDeps({ stats, prefs: { weight: 0.5, minPick: 0 } })
  const r = await base.advisor.advise({ role: 2, lobbyTier: 5, opponentChampionId: 777 })
  assert.equal(r.data.meta.blended, true)
  assert.equal(r.data.picks.find((p) => p.name === top[1]).matchup.edge, 3)
  assert.equal(base.calls.stats[0].opponentChampionId, 777)
  const w0 = mkDeps({ stats, prefs: { weight: 0, minPick: 0 } })
  const r0 = await w0.advisor.advise({ role: 2, lobbyTier: 5 })
  assert.equal(r0.data.picks[0].name, top[0])                              // sin peso de LoLalytics: el primero de iTero sigue primero
  assert.notEqual(r.data.picks[0].name, top[0])                            // con peso: su mal matchup lo baja
})

// ---------- controlador ----------
function fakeSource() {
  let st = { status: 'idle', context: null }; const subs = new Set()
  return { getState: () => st, subscribe(cb) { subs.add(cb); return () => subs.delete(cb) }, set(s) { st = s; for (const cb of [...subs]) cb(st) } }
}
const READY = (c) => ({ status: 'ready', context: { championId: 0, role: 3, lobbyTier: 5, allies: [], enemies: [], bans: [], ...c } })
function mkController(o = {}) {
  const source = fakeSource(); const calls = []
  let enabled = o.enabled ?? true
  const advisor = { advise: async (ctx) => { calls.push(ctx); return o.result ?? { ok: true, data: { picks: [{ rank: 1 }], meta: {} } } } }
  const prefs = { get: () => ({ enabled, weight: 0.5, minPick: 0.0025 }), set: (p) => { if ('enabled' in p) enabled = p.enabled; return p } }
  const c = createPickAdvisorController({ advisor, source, prefs, debounceMs: 0, maxQueries: o.max ?? 12 })
  c.start(); return { c, source, calls }
}

test('controlador del consejero: apagado por defecto no consulta; al encenderlo sí', async () => {
  const { c, source, calls } = mkController({ enabled: false })
  source.set(READY({})); await tick()
  assert.equal(calls.length, 0); assert.equal(c.getState().status, 'idle')
  await c.setEnabled(true); await tick()
  assert.equal(calls.length, 1); assert.equal(c.getState().status, 'ready')
  await c.setEnabled(false); assert.equal(c.getState().status, 'idle')
})

test('controlador del consejero: una consulta por cambio de composición, no por pasar el cursor', async () => {
  const { c, source, calls } = mkController()
  source.set(READY({})); await tick()
  source.set({ ...READY({}), data: { otra: 1 } }); await tick()                              // misma composición (cambió algo ajeno)
  source.set(READY({ championId: 145 })); await tick()                                        // pasar el cursor por un campeón: no es composición
  assert.equal(calls.length, 1)
  source.set(READY({ enemies: [{ championId: 51, position: '' }] })); await tick()            // se revela un rival
  source.set(READY({ enemies: [{ championId: 51, position: '' }], bans: [157] })); await tick() // y un ban
  source.set(READY({ enemies: [{ championId: 51, position: '' }], bans: [157], side: 'Red' })); await tick()
  assert.equal(calls.length, 4); assert.equal(c.getState().status, 'ready')
})

test('controlador del consejero: errores, tope por selección y reinicio al terminar el Champion Select', async () => {
  const { c, source, calls } = mkController({ result: { ok: false, reason: 'blocked' }, max: 3 })
  source.set(READY({})); await tick()
  assert.deepEqual([c.getState().status, c.getState().reason], ['error', 'blocked'])
  source.set(READY({ bans: [1] })); await tick()                                               // tras un error se reintenta en el siguiente cambio
  source.set(READY({ bans: [1, 2] })); await tick()
  assert.equal(calls.length, 3)
  source.set(READY({ bans: [1, 2, 3] })); await tick()                                         // 4.º: tope
  assert.equal(calls.length, 3); assert.equal(c.getState().reason, 'limit')
  source.set({ status: 'idle', context: null }); await tick(); assert.equal(c.getState().status, 'idle')
  source.set(READY({ bans: [9] })); await tick(); assert.equal(calls.length, 4)                // nueva selección: contador a cero
})

test('controlador del consejero: ignora la partida, descarta respuestas obsoletas y conserva lo anterior al cargar', async () => {
  const source = fakeSource(); const pend = []
  const advisor = { advise: (ctx) => new Promise((res) => pend.push({ ctx, res })) }
  const prefs = { get: () => ({ enabled: true, weight: 0.5, minPick: 0.0025 }), set: () => ({}) }
  const c = createPickAdvisorController({ advisor, source, prefs, debounceMs: 0 }); c.start()
  source.set(READY({})); await tick()
  source.set(READY({ bans: [1] })); await tick()                                               // llega otra composición antes de la 1.ª respuesta
  pend[0].res({ ok: true, data: { picks: [{ rank: 1, name: 'vieja' }], meta: {} } }); await tick()
  assert.equal(c.getState().status, 'loading')                                                 // la tardía se ignora
  pend[1].res({ ok: true, data: { picks: [{ rank: 1, name: 'nueva' }], meta: {} } }); await tick()
  assert.equal(c.getState().data.picks[0].name, 'nueva')
  source.set(READY({ bans: [1, 2] })); await tick()
  assert.equal(c.getState().status, 'loading'); assert.equal(c.getState().data.picks[0].name, 'nueva') // sin parpadeo
  source.set({ status: 'ready', context: { ...READY({}).context, phase: 'game' } }); await tick()
  assert.equal(c.getState().status, 'idle')                                                    // en partida desaparece
})

test('preferencias del consejero: apagado por defecto y valores saneados', () => {
  assert.deepEqual(getAdvisorPrefs(), { enabled: false, weight: 0.5, minPick: 0.0025 })
  assert.equal(setAdvisorPrefs({ enabled: 'si' }).enabled, false)                              // solo true estricto
  const p = setAdvisorPrefs({ enabled: true, weight: 9, minPick: -1 })
  assert.deepEqual(p, { enabled: true, weight: 1, minPick: 0.0005 })
  assert.equal(setAdvisorPrefs({ weight: 'x' }).weight, 0.5)
  DataStore.set('easy-coachless/advisor', 'basura'); assert.equal(getAdvisorPrefs().enabled, false)
  DataStore.remove('easy-coachless/advisor')
})
