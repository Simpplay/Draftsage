import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { FIXTURE_REQUEST, FIXTURE_ROWS } from './fixtures/itero-fixture.mjs'
const D = await import('../../src/domain/itero.js')
const { createIteroClient } = await import('../../src/infrastructure/itero/client.js')
const { createEnglishNames } = await import('../../src/infrastructure/ddragon/names.js')
const { createCache } = await import('../../src/infrastructure/coachless/cache.js')

const jsonOk = (body) => ({ ok: true, status: 200, json: async () => body })
const status = (s) => ({ ok: false, status: s, json: async () => ({ error: 'Server Error' }) })
function fakeFetch(handler) {
  const calls = []
  const f = async (url, init) => { calls.push({ url: String(url), init }); return handler(String(url), init) }
  f.calls = calls
  return f
}
// Filas sintéticas para las pruebas que necesitan más de 20 candidatos (la fixture real trae 25)
const req = () => D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', allies: { JUNGLE: 'Viego', BOTTOM: 'Jinx' }, enemies: { TOP: 'Malzahar' } })

test('parseNum: unidades de iTero y entradas raras', () => {
  assert.equal(D.parseNum('1.08x'), 1.08); assert.equal(D.parseNum('+365 G'), 365); assert.equal(D.parseNum('-12 G'), -12)
  assert.equal(D.parseNum('60.1%'), 60.1); assert.equal(D.parseNum('2k'), 2000); assert.equal(D.parseNum('-0.00x'), 0)
  assert.equal(D.parseNum(7), 7)
  for (const v of [null, undefined, {}, [], '', 'abc', '1.0.0x', NaN, Infinity]) assert.equal(D.parseNum(v), null)
})

test('rango: lobbyTier / rangos resueltos → franja de iTero', () => {
  assert.equal(D.rankClassOf(3), 'GOLD'); assert.equal(D.rankClassOf(5), 'EMERALD'); assert.equal(D.rankClassOf(7), 'MASTER+')
  assert.equal(D.rankClassOf(undefined), 'EMERALD'); assert.equal(D.rankClassOf(99), 'EMERALD')
  assert.equal(D.rankClassOfTiers([4, 5, 6]), 'EMERALD')  // lobby Esmeralda ±1 → la central
  assert.equal(D.rankClassOfTiers([3, 4]), 'PLATINUM')    // a igual distancia, la alta
  assert.equal(D.rankClassOfTiers([7]), 'MASTER+'); assert.equal(D.rankClassOfTiers([]), 'EMERALD')
})

test('línea y lado: del rol/posición/equipo del LCU', () => {
  assert.equal(D.laneOfRole(0), 'TOP'); assert.equal(D.laneOfRole(4), 'UTILITY'); assert.equal(D.laneOfRole(5), null); assert.equal(D.laneOfRole(undefined), null)
  assert.equal(D.laneOfPosition('utility'), 'UTILITY'); assert.equal(D.laneOfPosition('middle'), 'MIDDLE'); assert.equal(D.laneOfPosition(''), null)
  assert.equal(D.sideOfTeam(1), 'Blue'); assert.equal(D.sideOfTeam(2), 'Red'); assert.equal(D.sideOfTeam(0), null)
  assert.equal(D.supportsMode('CLASSIC'), true); assert.equal(D.supportsMode(undefined), true)
  for (const m of ['ARAM', 'kiwi', 'CHERRY']) assert.equal(D.supportsMode(m), false)
})

test('buildRequest: forma, hueco propio vacío, maestría a 0, bans únicos y ordenados', () => {
  const r = D.buildRequest({ lane: 'MIDDLE', rankClass: 'EMERALD', side: 'Red', allies: { MIDDLE: 'Ahri', JUNGLE: 'Viego' }, enemies: { MIDDLE: 'Sylas', TOP: 'Gnar' }, bans: ['Zed', 'Ahri', 'Zed', ''] })
  assert.deepEqual(r.teamComp, { t1_JUNGLE_champion: 'Viego', t2_TOP_champion: 'Gnar', t2_MIDDLE_champion: 'Sylas' }) // sin t1_MIDDLE
  assert.equal(r.side, 'Red'); assert.equal(r.rankClass, 'EMERALD'); assert.equal(r.lane, 'MIDDLE')
  assert.deepEqual(r.masteryData, {}); assert.deepEqual(r.userModelWeightings, { t1_MIDDLE_mastery: 0 })
  assert.deepEqual(r.bans, ['Ahri', 'Zed'])
  assert.equal(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', side: 'raro' }).side, 'Blue')
  assert.deepEqual(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD' }).teamComp, {}) // draft vacío válido
})

test('requestKey: no depende del orden y distingue lo que cambia la respuesta', () => {
  const a = D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', allies: { JUNGLE: 'Viego', BOTTOM: 'Jinx' } })
  const b = D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', allies: { BOTTOM: 'Jinx', JUNGLE: 'Viego' } })
  assert.equal(D.requestKey(a), D.requestKey(b))
  for (const o of [{ rankClass: 'EMERALD' }, { side: 'Red' }, { lane: 'MIDDLE' }, { bans: ['Zed'] }, { allies: { JUNGLE: 'Viego' } }])
    assert.notEqual(D.requestKey(a), D.requestKey(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', allies: { JUNGLE: 'Viego', BOTTOM: 'Jinx' }, ...o })))
})

test('normalizeResponse con datos REALES recortados: candidatos, sinergias, counters, escalado', () => {
  const n = D.normalizeResponse(FIXTURE_ROWS, 'TOP')
  assert.ok(n.ok); assert.equal(n.candidates.length, FIXTURE_ROWS.length)
  const c = n.candidates[0]
  assert.equal(typeof c.name, 'string'); assert.equal(typeof c.pred, 'number'); assert.ok(c.pred > 30 && c.pred < 80)
  assert.deepEqual(Object.keys(c.syn).sort(), ['BOTTOM', 'JUNGLE', 'MIDDLE', 'UTILITY'])   // sin la propia línea
  assert.deepEqual(Object.keys(c.ctr).sort(), ['BOTTOM', 'JUNGLE', 'MIDDLE', 'TOP', 'UTILITY'])
  assert.deepEqual(Object.keys(c.scale).sort(), ['early', 'late', 'mid'])
  assert.ok(c.count > 0 && c.pick > 0 && c.pick < 1)
  assert.ok(n.candidates.every((x, i, a) => i === 0 || i >= 15 || a[i - 1].pred >= x.pred)) // la cabeza viene ordenada
})

test('normalizeResponse: respuestas rotas no se pintan', () => {
  for (const bad of [null, {}, [], 'x', [{}], [{ champion: 'A' }]]) assert.deepEqual(D.normalizeResponse(bad, 'TOP'), { ok: false, reason: 'shape' })
  // más de un 10 % de filas inválidas = el esquema cambió
  const mixed = [...FIXTURE_ROWS.slice(0, 22), ...Array.from({ length: 5 }, () => ({ nope: 1 }))]
  assert.equal(D.normalizeResponse(mixed, 'TOP').ok, false)
  // campos opcionales ausentes/objeto vacío (como algunos *_gold) → null, nunca excepción
  const row = { champion: 'X', result_pred: '51.0%', stats: { player: { t1_LANE_syn_avg: {}, t1_LANE_champ_wr: null } } }
  const c = D.normalizeCandidate(row, 'TOP')
  assert.equal(c.synAvg, null); assert.equal(c.champWr, null); assert.deepEqual(c.syn, {}); assert.equal(c.count, 0)
})

test('findUnrecognized: un campeón elegido que sigue entre los candidatos no fue reconocido', () => {
  const n = D.normalizeResponse(FIXTURE_ROWS, 'TOP')
  const present = n.candidates[3].name
  const r = D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', enemies: { JUNGLE: present.toLowerCase() } }) // grafía distinta
  assert.deepEqual(D.findUnrecognized(r, n.candidates), [present.toLowerCase()])
  assert.deepEqual(D.findUnrecognized(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', enemies: { JUNGLE: 'Zzzz' } }), n.candidates), []) // desconocido total: lo evita `names`
  assert.deepEqual(D.findUnrecognized(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD' }), n.candidates), [])
})

test('cliente: POST sin cookies, caché, petición compartida y recorte', async () => {
  const f = fakeFetch(() => jsonOk(FIXTURE_ROWS))
  const c = createIteroClient({ cache: createCache(), fetchImpl: f })
  const [a, b] = await Promise.all([c.draftPicks(req()), c.draftPicks(req())])
  assert.ok(a.ok && b.ok); await c.draftPicks(req())
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].init.method, 'POST'); assert.equal(f.calls[0].init.credentials, 'omit')
  assert.equal(f.calls[0].url, 'https://www.itero.gg/api/draft-picks')
  assert.equal(JSON.parse(f.calls[0].init.body).lane, 'TOP')
  assert.equal(a.data.candidates.length, FIXTURE_ROWS.length); assert.deepEqual(a.data.unrecognized, [])
  assert.equal('stats' in a.data.candidates[0], false) // solo lo recortado
  await c.draftPicks(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', side: 'Red' })) // otra clave → otra petición
  assert.equal(f.calls.length, 2)
})

test('cliente: nombres no reconocidos se avisan en la respuesta', async () => {
  const n = D.normalizeResponse(FIXTURE_ROWS, 'TOP')
  const logs = []; const log = { warn: (...a) => logs.push(a.join(' ')), debug() {} }
  const c = createIteroClient({ cache: createCache(), fetchImpl: fakeFetch(() => jsonOk(FIXTURE_ROWS)), log })
  const r = await c.draftPicks(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', enemies: { JUNGLE: n.candidates[2].name } }))
  assert.ok(r.ok); assert.deepEqual(r.data.unrecognized, [n.candidates[2].name]); assert.ok(logs.some((l) => /no reconocidos/.test(l)))
})

test('cliente: errores → razón, backoff 1/5/30 min y recuperación; nada se cachea', async () => {
  let t = 0; let mode = 'err'
  const f = fakeFetch(() => (mode === 'err' ? status(503) : mode === 'bad' ? { ok: true, status: 200, json: async () => { throw new Error('json') } } : mode === '404' ? status(404) : jsonOk(FIXTURE_ROWS)))
  const c = createIteroClient({ cache: createCache(), fetchImpl: f, now: () => t })
  assert.equal((await c.draftPicks(req())).reason, 'blocked')
  const n = f.calls.length
  assert.equal((await c.draftPicks(req())).reason, 'blocked'); assert.equal(f.calls.length, n) // en backoff no se pide
  assert.ok(c.status().blockedForMs > 0)
  t += 61_000; mode = 'err'; assert.equal((await c.draftPicks(req())).reason, 'blocked') // 2.º fallo: ahora 5 min
  t += 61_000; mode = 'ok'; assert.equal((await c.draftPicks(req())).reason, 'blocked'); assert.equal(f.calls.length, n + 1)
  t += 5 * 60_000; assert.ok((await c.draftPicks(req())).ok)                                  // recupera y el backoff se reinicia
  assert.equal(c.status().failures, 0)
  mode = 'bad'; assert.equal((await c.draftPicks(D.buildRequest({ lane: 'TOP', rankClass: 'IRON' }))).reason, 'shape')
  mode = '404'; assert.equal((await c.draftPicks(D.buildRequest({ lane: 'TOP', rankClass: 'BRONZE' }))).reason, 'http')
  assert.equal(c.status().blockedForMs, 0)
})

test('cliente: tiempo máximo y fallo de red no lanzan', async () => {
  const slow = (url, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(new Error('abort'))))
  const c = createIteroClient({ cache: createCache(), fetchImpl: slow, timeoutMs: 20 })
  assert.equal((await c.draftPicks(req())).reason, 'network')
  const c2 = createIteroClient({ cache: createCache(), fetchImpl: async () => { throw new TypeError('Failed to fetch') } })
  assert.equal((await c2.draftPicks(req())).reason, 'network')
})

test('nombres ingleses: Data Dragon, validación, reintento tras fallo', async () => {
  const champs = Object.fromEntries(Array.from({ length: 120 }, (_, i) => [`C${i}`, { key: String(i + 1), name: `Champ ${i + 1}` }]))
  champs.MonkeyKing = { key: '62', name: 'Wukong' }; champs.Nunu = { key: '20', name: 'Nunu & Willump' }
  let t = 0; let fail = false
  const f = fakeFetch((url) => {
    if (fail) throw new Error('offline')
    if (url.endsWith('versions.json')) return jsonOk(['16.22.1', '16.21.1'])
    assert.match(url, /\/cdn\/16\.22\.1\/data\/en_US\/champion\.json$/)
    return jsonOk({ data: champs })
  })
  const n = createEnglishNames({ fetchImpl: f, now: () => t })
  assert.equal(n.name(62), null); assert.equal(n.isLoaded(), false)
  assert.equal(await n.load(), true)
  assert.equal(n.name(62), 'Wukong'); assert.equal(n.name(20), 'Nunu & Willump'); assert.equal(n.name(99999), null)
  await n.load(); assert.equal(f.calls.length, 2) // ya cargado: no vuelve a pedir
  // fallo: tabla vacía, no reintenta antes de 5 min y después sí
  fail = true; const m = createEnglishNames({ fetchImpl: f, now: () => t })
  assert.equal(await m.load(), false); assert.equal(m.name(62), null)
  const calls = f.calls.length; assert.equal(await m.load(), false); assert.equal(f.calls.length, calls)
  t += 5 * 60_000 + 1; fail = false; assert.equal(await m.load(), true); assert.equal(m.name(62), 'Wukong')
  // lista incompleta = fallo
  const small = createEnglishNames({ fetchImpl: fakeFetch((u) => (u.endsWith('versions.json') ? jsonOk(['16.22.1']) : jsonOk({ data: { A: { key: '1', name: 'A' } } }))) })
  assert.equal(await small.load(), false)
})

test('iteroRegion: solo con UNA región elegida (y conocida por iTero) se cambia la región del draft', () => {
  assert.equal(D.iteroRegion(null), null)            // «todas»
  assert.equal(D.iteroRegion([]), null)
  assert.equal(D.iteroRegion([2, 4]), null)          // varias: iTero no admite listas
  assert.equal(D.iteroRegion([2]), 'EUW1')
  assert.equal(D.iteroRegion([4]), 'KR')
  assert.equal(D.iteroRegion([5]), 'LA1'); assert.equal(D.iteroRegion([6]), 'LA2')
  assert.equal(D.iteroRegion([1]), 'EUN1'); assert.equal(D.iteroRegion([9]), 'OC1'); assert.equal(D.iteroRegion([7]), 'ME1')
  assert.equal(D.iteroRegion([11]), null)            // Rusia no está en la lista de iTero
  assert.equal(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD', region: 'LA1' }).region, 'LA1')
  assert.equal(D.buildRequest({ lane: 'TOP', rankClass: 'GOLD' }).region, 'euw1') // por defecto, sin cambios
})
