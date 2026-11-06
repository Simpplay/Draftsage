import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const { createChampSelectController } = await import('../../src/application/champ-select.js')
const { createChampSelectProvider } = await import('../../src/infrastructure/lcu/champ-select-provider.js')
const { createGameData } = await import('../../src/infrastructure/lcu/game-data.js')

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))

function fakeProvider() {
  let cb = null
  return { getCurrentContext: async () => null, subscribeToChanges: (f) => { cb = f; return () => { cb = null } }, emit: (c) => cb?.(c), get active() { return !!cb } }
}

test('controlador: estados idle → waiting → loading → ready, y descarta respuestas obsoletas', async () => {
  const provider = fakeProvider()
  const pending = []
  const recommend = (ctx, { signal }) => new Promise((res) => pending.push({ ctx, signal, res }))
  let logged = true
  const c = createChampSelectController({ provider, recommend, isLoggedIn: () => logged, hasPremium: () => false })
  const seen = []
  c.subscribe((s) => seen.push(s.status))
  c.start(); assert.ok(provider.active)

  provider.emit({ championId: 0, role: 5 }); assert.equal(c.getState().status, 'waiting')
  provider.emit({ championId: 145, role: 3 }); assert.equal(c.getState().status, 'loading')
  provider.emit({ championId: 81, role: 3 })                       // cambia de campeón antes de que llegue la 1.ª
  assert.equal(pending[0].signal.aborted, true)
  pending[0].res({ ok: true, data: { for: 145 } }); await tick()   // respuesta tardía: se ignora
  assert.equal(c.getState().status, 'loading')
  pending[1].res({ ok: true, data: { for: 81 } }); await tick()
  assert.equal(c.getState().status, 'ready'); assert.equal(c.getState().data.for, 81)

  provider.emit({ championId: 81, role: 3 })                       // mismo contexto: no vuelve a pedir
  assert.equal(pending.length, 2)
  provider.emit(null); assert.equal(c.getState().status, 'idle')

  logged = false
  provider.emit({ championId: 81, role: 3 }); assert.equal(c.getState().status, 'needs-login')
  logged = true
  c.refresh(); assert.equal(c.getState().status, 'loading')
  pending[2].res({ ok: false, reason: 'network' }); await tick()
  assert.deepEqual([c.getState().status, c.getState().reason], ['error', 'network'])
  c.stop(); assert.equal(provider.active, false)
})

test('controlador: la simulación manual manda sobre el LCU y se puede quitar', async () => {
  const provider = fakeProvider()
  const c = createChampSelectController({ provider, recommend: async (ctx) => ({ ok: true, data: ctx }), isLoggedIn: () => true, hasPremium: () => true })
  c.start()
  await c.simulate({ championId: 145, opponentChampionId: 222, role: 3 })
  assert.equal(c.getState().status, 'ready'); assert.equal(c.getState().context.source, 'manual')
  provider.emit({ championId: 99, role: 4 })
  assert.equal(c.getState().context.championId, 145)
  await c.simulate(null)
  assert.equal(c.getState().context.championId, 99)
  provider.emit(null); assert.equal(c.getState().status, 'idle')
})

test('controlador: con debounce solo se consulta el último campeón', async () => {
  const provider = fakeProvider()
  const asked = []
  const c = createChampSelectController({ provider, recommend: async (ctx) => { asked.push(ctx.championId); return { ok: true, data: {} } }, isLoggedIn: () => true, hasPremium: () => false, debounceMs: 30 })
  c.start()
  for (const id of [1, 2, 3, 4]) { provider.emit({ championId: id, role: 5 }); await tick(5) }
  await tick(80)
  assert.deepEqual(asked, [4]); assert.equal(c.getState().status, 'ready')
})

test('controlador: elegir el rival a mano manda sobre el detectado y se reinicia al terminar', async () => {
  const provider = fakeProvider()
  const asked = []
  const c = createChampSelectController({ provider, recommend: async (ctx) => { asked.push([ctx.opponentChampionId, ctx.opponentSource]); return { ok: true, data: {} } }, isLoggedIn: () => true, hasPremium: () => true })
  c.start()
  provider.emit({ championId: 51, role: 3, enemies: [{ championId: 222 }, { championId: 119 }] }); await tick()
  await c.setOpponent(119); await tick()
  provider.emit({ championId: 51, role: 3, enemies: [{ championId: 222 }, { championId: 119 }, { championId: 238 }] }); await tick() // se revela otro rival: nueva consulta, el manual se mantiene
  await c.setOpponent(null); await tick()
  provider.emit(null); provider.emit({ championId: 51, role: 3, enemies: [] }); await tick()
  assert.deepEqual(asked, [[undefined, undefined], [119, 'manual'], [119, 'manual'], [undefined, undefined], [undefined, undefined]])
})

test('controlador: una excepción en recommend se convierte en error de red', async () => {
  const provider = fakeProvider()
  const c = createChampSelectController({ provider, recommend: async () => { throw new Error('x') }, isLoggedIn: () => true, hasPremium: () => false })
  c.start(); provider.emit({ championId: 1, role: 5 }); await tick()
  assert.deepEqual([c.getState().status, c.getState().reason], ['error', 'network'])
})

// ---------- proveedor del LCU ----------

function fakeLcu(script) {
  const calls = []
  return { calls, lcuGet: async (path) => { calls.push(path); const v = script[path]; return typeof v === 'function' ? v() : (v ?? null) } }
}
const session = (extra = {}) => ({
  localPlayerCellId: 2,
  myTeam: [
    { cellId: 0, puuid: 'p0', championId: 10, assignedPosition: 'top' }, { cellId: 1, puuid: 'p1', championId: 11, assignedPosition: 'jungle' },
    { cellId: 2, puuid: 'p2', championId: 103, assignedPosition: 'middle' }, { cellId: 3, puuid: 'p3', championId: 12, assignedPosition: 'bottom' },
    { cellId: 4, puuid: 'p4', championId: 13, assignedPosition: 'utility' },
  ],
  theirTeam: [{ cellId: 5, championId: 0, assignedPosition: 'top' }, { cellId: 7, championId: 238, assignedPosition: 'middle' }],
  actions: [],
  ...extra,
})
const ranked = (tier) => ({ queueMap: { RANKED_SOLO_5x5: { tier } } })

test('controlador: si solo cambian aliados, bans o lado se avisa SIN reconsultar la recomendación', async () => {
  const provider = fakeProvider(); let calls = 0
  const c = createChampSelectController({ provider, recommend: async () => { calls++; return { ok: true, data: {} } }, isLoggedIn: () => true, hasPremium: () => false })
  const seen = []; c.subscribe((s) => seen.push(s)); c.start()
  provider.emit({ championId: 145, role: 3, allies: [], bans: [], side: 'Blue' }); await tick()
  assert.equal(c.getState().status, 'ready'); assert.equal(calls, 1)
  const n = seen.length
  provider.emit({ championId: 145, role: 3, allies: [{ championId: 64, position: 'jungle' }], bans: [1], side: 'Blue' })
  assert.equal(calls, 1); assert.equal(seen.length, n + 1)                       // notificó, no consultó
  assert.equal(c.getState().status, 'ready'); assert.deepEqual(c.getState().context.bans, [1])
  provider.emit({ championId: 145, role: 3, allies: [{ championId: 64, position: 'jungle' }], bans: [1], side: 'Blue' })
  assert.equal(seen.length, n + 1)                                               // idéntico: nada
})

test('proveedor: rol, rival del mismo puesto y rango medio de la lobby', async () => {
  const { lcuGet } = fakeLcu({
    '/lol-gameflow/v1/gameflow-phase': 'ChampSelect',
    '/lol-champ-select/v1/session': session(),
    '/lol-ranked/v1/ranked-stats/p0': ranked('EMERALD'), '/lol-ranked/v1/ranked-stats/p1': ranked('DIAMOND'),
    '/lol-ranked/v1/ranked-stats/p2': ranked('EMERALD'), '/lol-ranked/v1/ranked-stats/p3': ranked('EMERALD'),
    '/lol-ranked/v1/ranked-stats/p4': ranked(''), // sin rango: se ignora
  })
  const p = createChampSelectProvider({ lcuGet })
  const ctx = await p.getCurrentContext()
  assert.deepEqual({ ...ctx, allies: undefined }, { championId: 103, opponentChampionId: 238, role: 2, lobbyTier: 5, bans: [], enemies: [{ championId: 238, position: 'middle' }], allies: undefined, source: 'lcu' })
  assert.deepEqual(ctx.allies.map((a) => a.championId), [10, 11, 12, 13]) // compañeros, sin ti
})

test('proveedor: lado (team 1 azul / 2 rojo), bans de ambos equipos y rango antes de elegir campeón', async () => {
  const s = session({ myTeam: [{ cellId: 2, championId: 0, assignedPosition: 'top', team: 2, puuid: 'p0' }], theirTeam: [{ cellId: 5, championId: 222, assignedPosition: '' }],
    bans: { myTeamBans: [157, 0, 238], theirTeamBans: [64, 0] } })
  const { lcuGet } = fakeLcu({ '/lol-gameflow/v1/gameflow-phase': 'ChampSelect', '/lol-champ-select/v1/session': s, '/lol-ranked/v1/ranked-stats/p0': ranked('DIAMOND') })
  const ctx = await createChampSelectProvider({ lcuGet }).getCurrentContext()
  assert.equal(ctx.championId, 0); assert.equal(ctx.side, 'Red'); assert.deepEqual(ctx.bans, [157, 238, 64]) // los 0 (sin ban todavía) se descartan
  assert.equal(ctx.lobbyTier, 6)
  const none = session({ myTeam: [{ cellId: 2, championId: 0, assignedPosition: 'top' }], theirTeam: [] })
  const c2 = await createChampSelectProvider({ lcuGet: fakeLcu({ '/lol-gameflow/v1/gameflow-phase': 'ChampSelect', '/lol-champ-select/v1/session': none }).lcuGet }).getCurrentContext()
  assert.equal('side' in c2, false); assert.deepEqual(c2.bans, [])
})

test('proveedor: sin posiciones asignadas lista los rivales revelados (no inventa un rival)', async () => {
  const s = session({ myTeam: [{ cellId: 2, championId: 51, assignedPosition: '' }], theirTeam: [{ cellId: 5, championId: 222, assignedPosition: '' }, { cellId: 6, championId: 0, assignedPosition: '' }] })
  const { lcuGet } = fakeLcu({ '/lol-gameflow/v1/gameflow-phase': 'ChampSelect', '/lol-champ-select/v1/session': s })
  const ctx = await createChampSelectProvider({ lcuGet }).getCurrentContext()
  assert.equal(ctx.opponentChampionId, undefined); assert.deepEqual(ctx.enemies, [{ championId: 222, position: '' }])
})

test('proveedor: fuera de Champion Select → null; hover y sin puesto asignado', async () => {
  let phase = 'Lobby'
  const s = session({ myTeam: [{ cellId: 2, championId: 0, championPickIntent: 0, assignedPosition: '' }], theirTeam: [{ cellId: 7, championId: 238, assignedPosition: '' }],
    actions: [[{ actorCellId: 2, type: 'pick', championId: 157 }]] })
  const { lcuGet } = fakeLcu({ '/lol-gameflow/v1/gameflow-phase': () => phase, '/lol-champ-select/v1/session': s })
  const p = createChampSelectProvider({ lcuGet })
  assert.equal(await p.getCurrentContext(), null)
  phase = 'ChampSelect'
  const ctx = await p.getCurrentContext()
  assert.equal(ctx.championId, 157); assert.equal(ctx.role, 5)
  assert.equal(ctx.opponentChampionId, undefined); assert.equal(ctx.lobbyTier, undefined)
})

test('proveedor: emite solo cuando cambia el contexto y se detiene al cancelar', async () => {
  let phase = 'ChampSelect'
  const { lcuGet, calls } = fakeLcu({ '/lol-gameflow/v1/gameflow-phase': () => phase, '/lol-champ-select/v1/session': session({ myTeam: [{ cellId: 2, championId: 103, assignedPosition: 'middle' }] }) })
  const p = createChampSelectProvider({ lcuGet, activeMs: 5, idleMs: 5 })
  const got = []
  const off = p.subscribeToChanges((c) => got.push(c?.championId ?? null))
  await tick(60)
  phase = 'None'; await tick(40)
  off(); const n = calls.length; await tick(40)
  assert.deepEqual(got, [103, null]); assert.equal(calls.length, n) // sin suscriptores no se sondea
})

test('proveedor: LCU caído o respuesta rara no lanza', async () => {
  const p = createChampSelectProvider({ lcuGet: async () => null })
  assert.equal(await p.getCurrentContext(), null)
  const p2 = createChampSelectProvider({ lcuGet: async (path) => (path.includes('gameflow') ? 'ChampSelect' : { localPlayerCellId: 9, myTeam: [] }) })
  assert.equal(await p2.getCurrentContext(), null)
})

test('datos del cliente: nombres, iconos, árbol de cada keystone y búsqueda por nombre', async () => {
  const { lcuGet } = fakeLcu({
    '/lol-perks/v1/perks': [{ id: 8008, name: 'Ritmo Letal', iconPath: '/x/8008.png' }],
    '/lol-perks/v1/styles': [{ id: 8000, name: 'Precisión', iconPath: '/x/8000.png', slots: [{ type: 'kKeyStone', perks: [8005, 8008] }, { type: 'kMixedRegularSplashable', perks: [9101] }] }],
    '/lol-game-data/assets/v1/summoner-spells.json': [{ id: 4, name: 'Destello', iconPath: '/s/4.png' }],
    '/lol-game-data/assets/v1/champion-summary.json': [{ id: -1, name: 'None' }, { id: 145, name: "Kai'Sa", squarePortraitPath: '/c/145.png' }, { id: 222, name: 'Jinx', squarePortraitPath: '/c/222.png' }],
  })
  const gd = createGameData({ lcuGet }); await gd.load()
  assert.equal(gd.rune(8008).name, 'Ritmo Letal'); assert.equal(gd.rune(1).name, '#1'); assert.equal(gd.rune(1).icon, null)
  assert.equal(gd.keystoneTrees().get(8008), 8000); assert.equal(gd.spell(4).icon, '/s/4.png')
  assert.equal(gd.findChampion('kaisa').id, 145); assert.equal(gd.findChampion('KAI').id, 145); assert.equal(gd.findChampion('zzz'), null)
  assert.equal(gd.champion(-1).name, '#-1')
})
