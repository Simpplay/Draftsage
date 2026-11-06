import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const { ownedCounts, remainingCost, trackBuild, contextFromSnapshot } = await import('../../src/domain/live.js')
const { createLiveClient } = await import('../../src/infrastructure/liveclient/live-client.js')
const { createChampSelectProvider } = await import('../../src/infrastructure/lcu/champ-select-provider.js')
const { createGameData } = await import('../../src/infrastructure/lcu/game-data.js')
const { createLiveGame } = await import('../../src/application/live-game.js')

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))
// Catálogo mínimo: Dagger 300, Pickaxe 875, Cloak 800 (componentes); Statikk 2600 = Pickaxe + Dagger + receta 1425 (inventada); Boots 300.
const R = { 1018: { priceTotal: 800, from: [] }, 1037: { priceTotal: 875, from: [] }, 1042: { priceTotal: 300, from: [] }, 3087: { priceTotal: 2600, from: [1037, 1042] }, 3124: { priceTotal: 3600, from: [3087, 1018] }, 1001: { priceTotal: 300, from: [] } }
const info = (id) => R[id] ?? null
const own = (...ids) => ids.map((item) => ({ item, count: 1 }))

test('ownedCounts: suma cantidades y descarta ids inválidos', () => {
  assert.deepEqual([...ownedCounts([{ item: 1042, count: 2 }, { item: 1042 }, { item: 0 }, { item: 'x' }, null, { item: 1037, count: -1 }])], [[1042, 3], [1037, 1]])
  assert.equal(ownedCounts(undefined).size, 0)
})

test('coste restante: ítem ya tenido = 0, componentes que llevas se descuentan, desconocido = null', () => {
  assert.equal(remainingCost(3087, ownedCounts([]), info), 2600)
  assert.equal(remainingCost(3087, ownedCounts(own(3087)), info), 0)
  assert.equal(remainingCost(3087, ownedCounts(own(1037)), info), 2600 - 875)            // con el pico: se descuenta su precio
  assert.equal(remainingCost(3087, ownedCounts(own(1037, 1042)), info), 2600 - 875 - 300)
  assert.equal(remainingCost(3124, ownedCounts(own(1037, 1042, 1018)), info), 3600 - 875 - 300 - 800) // receta anidada
  assert.equal(remainingCost(3124, ownedCounts(own(3087)), info), 3600 - 2600)
  assert.equal(remainingCost(9999, ownedCounts([]), info), null)
  assert.equal(remainingCost(3087, ownedCounts([]), (id) => (id === 1042 ? null : info(id))), null) // componente desconocido
  const m = ownedCounts(own(1037)); remainingCost(3087, m, info); assert.equal(m.get(1037), 1)       // no modifica lo que le pasas
  // un componente solo se descuenta una vez
  assert.equal(remainingCost(3087, ownedCounts(own(1042)), info), 2600 - 300)
})

test('seguimiento: tienes / siguiente por comprar / oro que falta / listo', () => {
  const L = { core: [3087, 3124], next: [{ item: 1001 }, { item: 9999 }] }
  let t = trackBuild(L, own(1037, 1055), 500, info)
  assert.deepEqual([...t.owned].sort(), [1037, 1055]); assert.equal(t.done, false)
  assert.deepEqual(t.next, { item: 3087, cost: 1725, missing: 1225, progress: 500 / 1725, ready: false })
  t = trackBuild(L, own(1037), 1800.5, info); assert.deepEqual([t.next.ready, t.next.missing, t.next.progress], [true, 0, 1])
  t = trackBuild(L, own(3087), 100, info); assert.equal(t.next.item, 3124); assert.equal(t.next.cost, 1000)      // el 1.º ya está: el 2.º
  t = trackBuild(L, own(3087, 3124), 0, info); assert.equal(t.next.item, 1001)                                    // núcleo completo: el mejor «siguiente»
  t = trackBuild(L, own(3087, 3124, 1001), 0, info); assert.deepEqual([t.next, t.done], [null, true])
  t = trackBuild({ core: [9999], next: [] }, [], 100, info); assert.deepEqual([t.next, t.done], [null, false])      // catálogo sin cargar: sin barra
  assert.deepEqual(trackBuild(null, own(1), NaN, info), { owned: new Set([1]), done: false, next: null })
})

// Fixture recortada de un allgamedata real (partida con bots, Ezreal de Simpplay#UwU).
const P = (championName, raw, position, team, riotId, items = []) => ({ championName, rawChampionName: 'game_character_displayname_' + raw, position, team, riotId, summonerName: riotId, items })
const GAME = {
  activePlayer: { currentGold: 930.67, level: 14, riotId: 'Simpplay#UwU', summonerName: 'Simpplay#UwU' },
  allPlayers: [
    P('Ezreal', 'Ezreal', 'BOTTOM', 'ORDER', 'Simpplay#UwU', [{ itemID: 1055, count: 1, slot: 0 }, { itemID: 3078, count: 1, slot: 1 }, { itemID: 3340, count: 1, slot: 6 }, { itemID: 0 }, { nope: 1 }]),
    P('Soraka', 'Soraka', 'UTILITY', 'ORDER', 'Soraka#BOT', [{ itemID: 3870, count: 1, slot: 0 }]),
    P('Ashe', 'Ashe', 'BOTTOM', 'CHAOS', 'Ashe#BOT'),
    P('Alistar', 'Alistar', 'UTILITY', 'CHAOS', 'Alistar#BOT'),
  ],
  gameData: { gameMode: 'CLASSIC', gameTime: 1493.99 },
}
const ok = (o) => async () => ({ ok: true, json: async () => o })

test('cliente live: una llamada a allgamedata; ítems del jugador activo, oro, nivel, modo y jugadores', async () => {
  const urls = []
  const r = await createLiveClient({ fetchFn: async (u, o) => { urls.push(u); return ok(GAME)(u, o) } }).snapshot()
  assert.deepEqual(urls, ['https://127.0.0.1:2999/liveclientdata/allgamedata'])
  assert.equal(r.ok, true); assert.deepEqual([r.gold, r.level, r.gameTime, r.mode], [930.67, 14, 1493.99, 'CLASSIC'])
  assert.deepEqual(r.items, [{ item: 1055, count: 1, slot: 0 }, { item: 3078, count: 1, slot: 1 }, { item: 3340, count: 1, slot: 6 }]) // sin ids inválidos
  assert.deepEqual(r.me, { championName: 'Ezreal', alias: 'Ezreal', position: 'BOTTOM', team: 'ORDER' }); assert.equal(r.players.length, 4)
  // el activo también se encuentra por summonerName
  const g2 = { ...GAME, activePlayer: { currentGold: 1, summonerName: 'Soraka#BOT' } }
  assert.deepEqual((await createLiveClient({ fetchFn: ok(g2) }).snapshot()).items, [{ item: 3870, count: 1, slot: 0 }])
})

test('cliente live: sin partida → offline (nunca lanza); respuestas raras → shape; tiempo máximo', async () => {
  assert.deepEqual(await createLiveClient({ fetchFn: async () => { throw new TypeError('Failed to fetch') } }).snapshot(), { ok: false, reason: 'offline' })
  assert.deepEqual(await createLiveClient({ fetchFn: async () => ({ ok: false }) }).snapshot(), { ok: false, reason: 'offline' })
  for (const odd of [{}, { activePlayer: {}, allPlayers: [] }, { ...GAME, activePlayer: { riotId: 'otro#1' } }]) {
    assert.deepEqual(await createLiveClient({ fetchFn: ok(odd) }).snapshot(), { ok: false, reason: 'shape' })
  }
  const hang = (url, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('abort'))))
  assert.deepEqual(await createLiveClient({ fetchFn: hang, timeoutMs: 20 }).snapshot(), { ok: false, reason: 'offline' })
})

const CH = { Ezreal: 81, Soraka: 16, Ashe: 22, Alistar: 12 }
const find = (q) => (CH[q] ? { id: CH[q] } : null)

test('recuperar la partida: campeón, rol, rival del mismo puesto, aliados y modo; sin campeón conocido → null', async () => {
  const snap = await createLiveClient({ fetchFn: ok(GAME) }).snapshot()
  assert.deepEqual(contextFromSnapshot(snap, find), {
    championId: 81, role: 3, opponentChampionId: 22, mode: 'CLASSIC', source: 'lcu',
    enemies: [{ championId: 22, position: 'bottom' }, { championId: 12, position: 'utility' }], allies: [{ championId: 16, position: 'utility' }],
  })
  assert.equal(contextFromSnapshot(snap, () => null), null)                      // catálogo sin cargar
  assert.equal(contextFromSnapshot({ ok: false, reason: 'offline' }, find), null); assert.equal(contextFromSnapshot(null, find), null)
  // ARAM: sin posiciones → rol «cualquiera» y sin rival directo; el alias manda sobre el nombre (idioma del juego)
  const aram = { ...GAME, allPlayers: GAME.allPlayers.map((p) => ({ ...p, position: '' })), gameData: { gameMode: 'aram' } }
  const c = contextFromSnapshot(await createLiveClient({ fetchFn: ok(aram) }).snapshot(), (q) => (q === 'Ezreal' ? { id: 81 } : CH[q] ? { id: CH[q] } : null))
  assert.deepEqual([c.role, c.opponentChampionId, c.mode, c.enemies.length], [5, undefined, 'ARAM', 2])
  const es = { ...GAME, allPlayers: GAME.allPlayers.map((p) => (p.championName === 'Ezreal' ? { ...p, championName: 'Ezreal (es)' } : p)) }
  assert.equal(contextFromSnapshot(await createLiveClient({ fetchFn: ok(es) }).snapshot(), find).championId, 81)
})

test('proveedor: cliente reiniciado en partida → recupera el contexto con la Live Client Data API (y reintenta si aún no está)', async () => {
  let calls = 0, ready = false
  const lcuGet = async (p) => (p.endsWith('gameflow-phase') ? 'InProgress' : null)
  const p = createChampSelectProvider({ lcuGet, recoverGameContext: async () => { calls++; return ready ? { championId: 81, role: 3, source: 'lcu' } : null } })
  assert.equal(await p.getCurrentContext(), null); assert.equal(calls, 1)        // la partida aún no responde (pantalla de carga)
  ready = true
  const ctx = await p.getCurrentContext()
  assert.deepEqual([ctx.championId, ctx.phase], [81, 'game']); await p.getCurrentContext(); assert.equal(calls, 2) // ya recordado: no vuelve a llamar
  const bad = createChampSelectProvider({ lcuGet, recoverGameContext: async () => { throw new Error('x') } })
  assert.equal(await bad.getCurrentContext(), null)                              // un fallo al recuperar no lanza
})

test('catálogo: findChampion acepta el alias (lo que informa el juego)', async () => {
  const lcuGet = async (p) => (p.endsWith('champion-summary.json') ? [{ id: 145, name: "Kai'Sa", alias: 'Kaisa' }, { id: 62, name: 'Wukong', alias: 'MonkeyKing' }, { id: 22, name: 'Ashe', alias: 'Ashe' }] : null)
  const gd = createGameData({ lcuGet }); await gd.load()
  assert.equal(gd.findChampion('MonkeyKing').id, 62); assert.equal(gd.findChampion('Wukong').id, 62); assert.equal(gd.findChampion('kai').id, 145); assert.equal(gd.findChampion('zzz'), null)
})

test('seguimiento de la partida: sondea solo entre start y stop, avisa solo de cambios y conserva lo último si cae', async () => {
  const snaps = [{ ok: false, reason: 'offline' }, { ok: true, gold: 100, level: 1, items: [{ item: 1055, count: 1 }] }, { ok: true, gold: 110, level: 1, items: [{ item: 1055, count: 1 }] },
    { ok: true, gold: 400, level: 2, items: [{ item: 1055, count: 1 }] }, { ok: false, reason: 'offline' }]
  let n = 0
  const live = createLiveGame({ client: { snapshot: async () => snaps[Math.min(n++, snaps.length - 1)] }, intervalMs: 5, offlineMs: 5 })
  const seen = []
  live.subscribe((s) => seen.push(`${s.status}:${s.gold}`))
  assert.equal(live.getState().status, 'off'); assert.equal(n, 0)
  live.start(); live.start()                                                          // el segundo start no duplica el sondeo
  await tick(80)
  assert.deepEqual(seen.slice(0, 4), ['connecting:0', 'offline:0', 'live:100', 'live:400'])        // 100 → 110 no cambia el tramo de 25 en 25: sin aviso
  assert.equal(live.getState().status, 'offline'); assert.equal(live.getState().gold, 400) // conserva lo último
  live.stop(); const calls = n; await tick(40)
  assert.equal(n, calls); assert.equal(live.getState().status, 'off'); assert.deepEqual(live.getState().items, [])
  // un cliente que lanza no mata el sondeo
  const bad = createLiveGame({ client: { snapshot: async () => { throw new Error('x') } }, intervalMs: 5, offlineMs: 5 })
  bad.start(); await tick(30); assert.equal(bad.getState().status, 'offline'); bad.stop()
})
