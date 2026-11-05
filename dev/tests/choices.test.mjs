// Pruebas de alternativas, hechizos por contexto, elecciones del usuario y fijados (servicio, controlador y proveedor).
import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const { createRecommendationService } = await import('../../src/application/recommendation.js')
const { createChampSelectController } = await import('../../src/application/champ-select.js')
const { createChampSelectProvider } = await import('../../src/infrastructure/lcu/champ-select-provider.js')
const { createCache } = await import('../../src/infrastructure/coachless/cache.js')

const e = (rune, wpa, occurrence) => ({ rune, wpa, occurrence })
const sp = (spell, wpa, occurrence) => ({ spell, wpa, occurrence })
const log = { info() {}, warn() {}, error() {}, debug() {} }
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))
const PATCHES = [19, 20, 21, 22].map((p) => ({ major: 16, patch: p, label: '16.' + p, matchCount: p === 22 ? 243088 : 6800000 }))

// Lista de hechizos con Aplastar como mejor opción por WPA (para comprobar que se descarta fuera de la jungla).
const SPELLS = [sp(4, 0, 575250), sp(3, 0.78, 111388), sp(11, 2.5, 150000), sp(14, 0.1, 150000), sp(7, -0.2, 120000), sp(1, 0.3, 4000)]

function fakeClient(over = {}) {
  const calls = []
  const base = {
    championRole: async () => ({ ok: true, data: null }),
    patches: async () => ({ ok: true, data: PATCHES }),
    keystones: async () => ({ ok: true, data: [e(8005, -2.6, 25723), e(8008, 0.16, 538163), e(8021, -1, 60000), e(8010, 9, 119)] }),
    spells: async (f, paired) => ({ ok: true, data: paired ? SPELLS.filter((s) => s.spell !== paired) : SPELLS }),
    builds: async () => ({ ok: true, data: [{ keystone: 8008, primaryTree: 8000, secondaryTree: 8300, shards: [5005, 5008, 5011], occurrence: 98136 }] }),
    treeRunes: async (f, main, tree) => ({ ok: true, data: { rows: tree === main
      ? [[e(8009, -0.4, 404746), e(9111, 1.1, 157765)], [e(9104, 0.77, 65115), e(9103, -0.1, 497560)], [e(8017, 0.6, 197962), e(8014, -0.3, 364425)]]
      : tree === 8300 ? [[e(8321, 1, 3000)], [e(8313, 1, 3000)], []] : [[], [], []] } }),
  }
  const rec = (name) => (...a) => { calls.push([name, ...a]); return (over[name] ?? base[name])(...a) }
  return { client: Object.fromEntries(Object.keys(base).map((k) => [k, rec(k)])), calls }
}
const mk = (over) => { const f = fakeClient(over); return { ...f, svc: createRecommendationService({ client: f.client, log, cache: createCache() }) } }
const CTX = { championId: 145, role: 3, lobbyTier: 5, mode: 'CLASSIC' }

test('alternativas de runa clave: ordenadas, con cuota de uso y la recomendada marcada', async () => {
  const { svc } = mk()
  const d = (await svc.getRecommendation(CTX)).data
  assert.equal(d.keystone.rune, 8008); assert.equal(d.alternatives.autoKeystone, 8008)
  assert.deepEqual(d.alternatives.keystones.map((k) => k.rune), [8008, 8021, 8005])  // 8010 (119 partidas) no se ofrece
  assert.ok(d.alternatives.keystones.every((k) => k.share > 0 && k.share < 1))
  assert.deepEqual(d.custom, { keystone: false, spells: false })
})

test('runa clave elegida: cambia la página, pide las filas de ese keystone y se marca como personalizada', async () => {
  const { svc, calls } = mk()
  const d = (await svc.getRecommendation({ ...CTX, keystoneOverride: 8005 })).data
  assert.equal(d.keystone.rune, 8005); assert.equal(d.custom.keystone, true)
  assert.deepEqual([...new Set(calls.filter((c) => c[0] === 'treeRunes').map((c) => c[4]))], [8005])
  assert.equal(d.alternatives.autoKeystone, 8008)                                   // siempre se puede volver a la recomendada
  assert.ok(d.alternatives.keystones.some((k) => k.rune === 8005) && d.alternatives.keystones.some((k) => k.rune === 8008))
  // el mismo keystone que el recomendado no cuenta como personalizado
  assert.equal((await mk().svc.getRecommendation({ ...CTX, keystoneOverride: 8008 })).data.custom.keystone, false)
  // un keystone sin datos suficientes o inexistente se ignora
  for (const bad of [8010, 9999]) {
    const x = (await mk().svc.getRecommendation({ ...CTX, keystoneOverride: bad })).data
    assert.equal(x.keystone.rune, 8008); assert.equal(x.custom.keystone, false)
  }
})

test('caché: cada elección distinta tiene su propia entrada; repetirla no repite peticiones', async () => {
  const { svc, calls } = mk()
  const a = (await svc.getRecommendation(CTX)).data
  const b = (await svc.getRecommendation({ ...CTX, keystoneOverride: 8005 })).data
  assert.notEqual(a.keystone.rune, b.keystone.rune)
  const n = calls.length
  await svc.getRecommendation({ ...CTX, keystoneOverride: 8005 })
  assert.equal(calls.length, n + 1)                                                  // solo GetPatches
  const c = (await svc.getRecommendation({ ...CTX, mode: 'ARAM' })).data
  assert.equal(c.meta.mode, 'ARAM')
})

test('hechizos: fuera de la jungla nunca Aplastar, aunque tenga el mejor WPA, y se avisa', async () => {
  const { svc } = mk()
  const d = (await svc.getRecommendation(CTX)).data
  assert.ok(!d.spells.some((s) => s.spell === 11)); assert.equal(d.spells.length, 2)
  assert.ok(d.meta.notices.includes('spells-adjusted'))
  assert.ok(d.alternatives.spells.every((s) => s.spell !== 11))
})

test('hechizos: en jungla Aplastar es obligatorio y se empareja el otro', async () => {
  const { svc, calls } = mk()
  const d = (await svc.getRecommendation({ ...CTX, role: 1 })).data
  assert.ok(d.spells.some((s) => s.spell === 11)); assert.equal(d.spells.length, 2)
  assert.equal(calls.find((c) => c[0] === 'spells' && c[2] != null)[2], 11)           // GetGlobalSummonerSpellStatistics con pairedSpell 11
  assert.ok(!d.meta.notices.includes('spells-adjusted'))
  // el hechizo cambiable no es Aplastar
  assert.ok(d.alternatives.spells.every((s) => s.pair.includes(11)))
  // jungla sin datos de hechizos: Aplastar sigue apareciendo (sin cifras)
  const x = mk({ spells: async () => ({ ok: false, reason: 'network' }) })
  const y = (await x.svc.getRecommendation({ ...CTX, role: 1 })).data
  assert.deepEqual(y.spells.map((s) => [s.spell, s.wpa]), [[11, null]])
})

test('hechizos: ARAM sin Aplastar ni Teletransporte; Arena sin hechizos y sin consultas de emparejado', async () => {
  const withTp = [...SPELLS, sp(12, 3, 100000)]
  const { svc } = mk({ spells: async (f, p) => ({ ok: true, data: p ? withTp.filter((s) => s.spell !== p) : withTp }) })
  const aram = (await svc.getRecommendation({ ...CTX, role: 5, mode: 'ARAM' })).data
  assert.ok(aram.spells.every((s) => s.spell !== 11 && s.spell !== 12)); assert.equal(aram.spells.length, 2)
  const arena = mk()
  const d = (await arena.svc.getRecommendation({ ...CTX, role: 5, mode: 'CHERRY' })).data
  assert.deepEqual(d.spells, []); assert.deepEqual(d.alternatives.spells, [])
  assert.equal(arena.calls.filter((c) => c[0] === 'spells' && c[2] != null).length, 0)
})

test('hechizos elegidos: se usan si son válidos (sin pedir el emparejado) y alternativas con la pareja lista', async () => {
  const { svc, calls } = mk()
  const auto = (await svc.getRecommendation(CTX)).data
  const alt = auto.alternatives.spells[0]
  assert.ok(alt && alt.pair.length === 2 && alt.pair.includes(4))                    // Destello se conserva
  const d = (await svc.getRecommendation({ ...CTX, spellOverride: alt.pair })).data
  assert.deepEqual(d.spells.map((s) => s.spell), alt.pair); assert.equal(d.custom.spells, true)
  // la misma pareja que la recomendada (en cualquier orden) no cuenta como personalizada
  const same = (await svc.getRecommendation({ ...CTX, spellOverride: [...auto.spells.map((s) => s.spell)].reverse() })).data
  assert.equal(same.custom.spells, false)
  // inválidos (Aplastar en línea, repetidos, incompletos) se ignoran
  for (const bad of [[4, 11], [4, 4], [4]]) {
    const x = (await svc.getRecommendation({ ...CTX, spellOverride: bad })).data
    assert.equal(x.custom.spells, false); assert.ok(!x.spells.some((s) => s.spell === 11))
  }
  // hechizo sin estadísticas: sigue siendo válido, sin cifras
  const y = (await svc.getRecommendation({ ...CTX, spellOverride: [4, 21] })).data
  assert.deepEqual(y.spells.map((s) => [s.spell, s.wpa]), [[4, 0], [21, null]])
  // Marca (ARAM) en Grieta clásica no vale: el cliente la rechazaría
  assert.equal((await svc.getRecommendation({ ...CTX, spellOverride: [4, 32] })).data.custom.spells, false)
})

// ---------- controlador ----------

function fakeProvider() {
  let cb = null
  return { getCurrentContext: async () => null, subscribeToChanges: (f) => { cb = f; return () => { cb = null } }, emit: (c) => cb?.(c) }
}
function memoryPins() {
  const m = new Map()
  return {
    m,
    get: (c, r) => m.get(c + '|' + r) ?? null,
    set: (c, r, p) => m.set(c + '|' + r, p),
    remove: (c, r) => m.delete(c + '|' + r),
  }
}
const recData = (ctx) => ({
  keystone: { rune: ctx.keystoneOverride ?? 8008 }, custom: { keystone: !!ctx.keystoneOverride, spells: !!ctx.spellOverride },
  spells: (ctx.spellOverride ?? [4, 14]).map((spell) => ({ spell })), alternatives: { autoKeystone: 8008, keystones: [], spells: [] },
})

test('controlador: elegir runa clave y hechizos relanza la consulta con ellos y conserva lo mostrado mientras carga', async () => {
  const provider = fakeProvider()
  const asked = []
  const c = createChampSelectController({ provider, recommend: async (ctx) => { asked.push([ctx.keystoneOverride, ctx.spellOverride]); await tick(5); return { ok: true, data: recData(ctx) } }, isLoggedIn: () => true, hasPremium: () => false })
  c.start(); provider.emit({ championId: 51, role: 3 }); await tick(20)
  const first = c.getState().data
  c.setKeystone(8005)
  assert.equal(c.getState().status, 'loading'); assert.equal(c.getState().stale, first)  // la vista anterior sigue disponible
  await tick(20); assert.equal(c.getState().data.keystone.rune, 8005)
  await c.setSpells([4, 7]); assert.deepEqual(asked.at(-1), [8005, [4, 7]])               // lo elegido antes se conserva
  await c.setKeystone(null); assert.deepEqual(asked.at(-1), [undefined, [4, 7]])           // volver a la recomendada solo en la runa
  provider.emit({ championId: 51, role: 3, enemies: [{ championId: 222 }] }); await tick(20)
  assert.deepEqual(asked.at(-1), [undefined, [4, 7]])                                      // revelar un rival no borra tu elección
  provider.emit({ championId: 99, role: 3 }); await tick(20)
  assert.deepEqual(asked.at(-1), [undefined, undefined])                                   // otro campeón: automático
  provider.emit(null); provider.emit({ championId: 51, role: 3 }); await tick(20)
  assert.deepEqual(asked.at(-1), [undefined, undefined])                                   // nueva selección: automático
  assert.equal(c.getState().stale, undefined)
})

test('controlador: fijar guarda runa clave y hechizos, se aplican en la próxima selección y se pueden soltar', async () => {
  const provider = fakeProvider(); const pins = memoryPins()
  const asked = []
  const c = createChampSelectController({ provider, pins, recommend: async (ctx) => { asked.push([ctx.keystoneOverride, ctx.spellOverride]); return { ok: true, data: recData(ctx) } }, isLoggedIn: () => true, hasPremium: () => false })
  c.start(); provider.emit({ championId: 51, role: 3 }); await tick(10)
  assert.equal(c.getState().pinned, false); assert.equal(c.togglePin(), true)
  assert.deepEqual(pins.get(51, 3), { keystone: 8008, spells: [4, 14] }); assert.equal(c.getState().pinned, true)
  assert.equal(pins.get(51, 2), null)                                                      // por rol

  await c.setKeystone(8005); await c.setSpells([4, 7])
  assert.equal(c.getState().pinned, false)                                                 // lo visto ya no es lo fijado: el botón vuelve a ofrecer fijar
  assert.equal(c.togglePin(), true)                                                        // …y fijar reemplaza el anterior
  assert.deepEqual(pins.get(51, 3), { keystone: 8005, spells: [4, 7] })

  provider.emit(null); provider.emit({ championId: 51, role: 3 }); await tick(10)          // otra partida: se aplica lo fijado
  assert.deepEqual(asked.at(-1), [8005, [4, 7]]); assert.equal(c.getState().pinned, true)
  assert.equal(c.getState().data.custom.keystone, true)

  await c.setKeystone(null); assert.deepEqual(asked.at(-1), [undefined, [4, 7]])           // elegir «recomendada» manda sobre lo fijado
  assert.equal(c.getState().pinned, false)                                                 // y ya no coincide con lo fijado
  await c.setKeystone(8021)
  assert.equal(c.togglePin(), true)                                                        // fijar de nuevo con lo visto
  assert.equal(c.togglePin(), false); assert.equal(pins.get(51, 3), null)                  // soltar: ya no se aplica…
  assert.equal(c.getState().data.keystone.rune, 8021)                                      // …pero la vista no salta
  provider.emit(null); provider.emit({ championId: 51, role: 3 }); await tick(10)
  assert.deepEqual(asked.at(-1), [undefined, undefined])
})

test('controlador: sin almacén de fijados, togglePin no hace nada', async () => {
  const provider = fakeProvider()
  const c = createChampSelectController({ provider, recommend: async (ctx) => ({ ok: true, data: recData(ctx) }), isLoggedIn: () => true, hasPremium: () => false })
  c.start(); provider.emit({ championId: 51, role: 3 }); await tick(10)
  assert.equal(c.togglePin(), false); assert.equal(c.getState().pinned, false)
})

// ---------- proveedor ----------

test('proveedor: modo de juego desde gameflow/session, una vez por Champion Select', async () => {
  const calls = []
  const world = { phase: 'ChampSelect', queue: { gameMode: 'aram', id: 450 } }
  const lcuGet = async (path) => {
    calls.push(path)
    if (path === '/lol-gameflow/v1/gameflow-phase') return world.phase
    if (path === '/lol-gameflow/v1/session') return world.queue ? { gameData: { queue: world.queue } } : null
    if (path === '/lol-champ-select/v1/session') return { localPlayerCellId: 0, myTeam: [{ cellId: 0, championId: 103, assignedPosition: '' }], theirTeam: [], actions: [] }
    return null
  }
  const p = createChampSelectProvider({ lcuGet })
  assert.equal((await p.getCurrentContext()).mode, 'ARAM')
  await p.getCurrentContext()
  assert.equal(calls.filter((c) => c === '/lol-gameflow/v1/session').length, 1)
  world.phase = 'Lobby'; assert.equal(await p.getCurrentContext(), null)
  world.phase = 'ChampSelect'; world.queue = { gameMode: 'CLASSIC', id: 420 }
  assert.equal((await p.getCurrentContext()).mode, 'CLASSIC')                              // nueva partida: se vuelve a preguntar
  world.phase = 'Lobby'; await p.getCurrentContext(); world.phase = 'ChampSelect'; world.queue = null
  assert.equal('mode' in (await p.getCurrentContext()), false)                             // sin dato del modo: no se filtra por modo
})
