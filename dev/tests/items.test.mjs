import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const { pickBuild, buildItemPlan, layoutItems, hasItems, tierLetter } = await import('../../src/domain/items.js')
const { createCoachlessClient } = await import('../../src/infrastructure/coachless/client.js')
const { createCache } = await import('../../src/infrastructure/coachless/cache.js')
const { createRecommendationService } = await import('../../src/application/recommendation.js')
const { createGameData } = await import('../../src/infrastructure/lcu/game-data.js')
const { createChampSelectProvider } = await import('../../src/infrastructure/lcu/champ-select-provider.js')
const { createChampSelectController } = await import('../../src/application/champ-select.js')

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))
const log = { info() {}, warn() {}, error() {}, debug() {} }
const it = (item, wpa = 0, occurrence = 0, extra = {}) => ({ item, wpa, occurrence, chooseOne: false, highlighted: false, ...extra })
const BOOTS = new Set([3006, 3009, 1001])
const isBoots = (id) => BOOTS.has(id)

const BUILD = {
  keystone: 8008, occurrence: 67479, tier: 0, winrate: 51.28, starterIds: [1055, 1055, 0, -4, 2003], firstItemId: 3087, secondItemId: 3124,
  itemBlocks: [
    { type: 0, items: [it(1055)] },
    { type: 1, items: [it(1055, 0.1, 25000), it(3006, 0.4, 30000), it(1036, 0.2, 9000)] },
    { type: 2, items: [it(3087, 0.9, 60000), it(3006, 0.5, 58000), it(3124, 0.6, 50000)] },
    { type: 3, items: [it(3085, 0.2, 9000, { chooseOne: true }), it(3124, 0.6, 50000, { chooseOne: true }), it(3046, 0.5, 20000, { chooseOne: true })] },
    { type: 4, items: [it(3139, 0.3, 4000), it(3036, 0.8, 20000, { highlighted: true }), it(3026, 0.1, 15000), it(3036, 0.8, 20000)] },
  ],
}

test('tier: S/A/B y desconocido', () => {
  assert.deepEqual([0, 1, 2, 3, null, undefined, '0'].map(tierLetter), ['S', 'A', 'B', null, null, null, null])
})

test('pickBuild: la de la runa clave elegida (mejor categoría, luego más jugada); si no hay, la mejor general y se avisa', () => {
  const a = { keystone: 8008, tier: 1, occurrence: 500 }, b = { keystone: 8008, tier: 0, occurrence: 100 }, c = { keystone: 8005, tier: 0, occurrence: 9999 }, d = { keystone: 8008, tier: 1, occurrence: 900 }
  assert.deepEqual(pickBuild([a, b, c], 8008), { build: b, keystoneMatch: true })
  assert.equal(pickBuild([a, d], 8008).build, d)                                // igual categoría: la más jugada
  assert.deepEqual(pickBuild([a, c], 8021), { build: c, keystoneMatch: false })  // ninguna con esa runa
  assert.equal(pickBuild([], 8008), null); assert.equal(pickBuild(null, 8008), null)
  assert.equal(pickBuild([{ keystone: 8008, tier: null, occurrence: 1 }, a], 8008).build, a) // sin categoría = la peor
})

test('plan de ítems: ids válidos sin repetir, 0 partidas = sin dato, destacados primero, sin ítems → null', () => {
  const p = buildItemPlan(BUILD)
  assert.deepEqual(p.starters, [1055, 2003]); assert.deepEqual(p.core, [3087, 3124])
  assert.equal(p.tier, 0); assert.equal(p.winrate, 51.28); assert.equal(p.games, 67479); assert.equal(p.keystoneMatch, true)
  assert.deepEqual(p.options.map((s) => s.item), [3124, 3046, 3085])             // por uso
  assert.deepEqual(p.situational.map((s) => s.item), [3036, 3026, 3139])          // destacado primero, sin repetir 3036
  assert.equal(p.situational[0].highlighted, true)
  const zero = buildItemPlan({ ...BUILD, itemBlocks: [{ type: 3, items: [it(3085, 0, 0), it(3124, 0.5, 100)] }] })
  assert.equal(zero.options.find((s) => s.item === 3085).wpa, null)               // 0 partidas: el 0 es relleno
  assert.equal(zero.options.find((s) => s.item === 3124).wpa, 0.5)
  assert.equal(buildItemPlan(null), null)
  assert.equal(buildItemPlan({ keystone: 8008, starterIds: [], itemBlocks: [] }), null)
  assert.equal(buildItemPlan({ keystone: 8008, itemBlocks: [{ type: 99, items: [it(1, 1, 1)] }, null] }), null) // tipos desconocidos no inventan filas
  const bad = buildItemPlan({ keystone: 8008, firstItemId: 3087, tier: 'x', winrate: NaN, occurrence: -1 })
  assert.deepEqual([bad.tier, bad.winrate, bad.games], [null, null, 0])
})

test('maquetación: ningún ítem sale en dos filas; el núcleo manda; botas de la API primero', () => {
  const plan = buildItemPlan(BUILD, { boots: [{ item: 3009, wpa: 0.7, occurrence: 5000 }, { item: 3006, wpa: 0.2, occurrence: 9000 }], next: [{ item: 3031, wpa: 1.2, occurrence: 80000 }, { item: 3087, wpa: 9, occurrence: 1 }, { item: 3009, wpa: 9, occurrence: 1 }] })
  const L = layoutItems(plan, { isBoots })
  assert.deepEqual(L.boots.map((s) => s.item), [3009, 3006])
  assert.deepEqual(L.next.map((s) => s.item), [3031])                             // sin el 1.er ítem del núcleo ni botas
  assert.deepEqual(L.early.map((s) => s.item), [1036])                            // sin botas ni el ítem inicial
  assert.deepEqual(L.options.map((s) => s.item), [3046, 3085])                    // sin el 2.º ítem del núcleo
  assert.deepEqual(L.situational.map((s) => s.item), [3036, 3026, 3139])
  const all = [...L.starters, ...L.core, ...[L.boots, L.next, L.early, L.options, L.situational].flat().map((s) => s.item)]
  assert.equal(new Set(all).size, all.length, 'ítems repetidos: ' + all)
  assert.ok(hasItems(L))
})

test('maquetación: sin botas de la API se sacan del recorrido; compacto omite filas; sin catálogo no se rompe', () => {
  const plan = buildItemPlan(BUILD)
  assert.deepEqual(layoutItems(plan, { isBoots }).boots.map((s) => s.item), [3006])
  const c = layoutItems(plan, { isBoots, compact: true })
  assert.deepEqual([c.early, c.options, c.situational], [[], [], []]); assert.deepEqual(c.core, [3087, 3124])
  const noCat = layoutItems(plan) // isBoots por defecto: nada es bota
  assert.deepEqual(noCat.boots, []); assert.ok(noCat.early.some((s) => s.item === 3006))
  assert.equal(layoutItems(null), null); assert.equal(hasItems(null), false)
  const big = buildItemPlan({ keystone: 1, itemBlocks: [{ type: 4, items: Array.from({ length: 20 }, (_, i) => it(5000 + i, 0.1, 100 + i)) }] })
  assert.equal(layoutItems(big).situational.length, 6) // tope por fila
})

test('cliente: la build trae ítems normalizados y ítems sueltos con sus filtros', async () => {
  const seen = []
  const post = async (path, body) => {
    seen.push([path, body])
    if (path.endsWith('GetRecommendedBuilds')) return { ok: true, status: 200, data: { role: 3, builds: [{
      keystone: 8008, runes: { primaryTree: 8000, selectedShards: [5005] }, occurrence: 10, tier: 1, winrate: 50.5, mostPopular: true,
      starterIds: [1055], firstItemId: 3087, secondItemId: 3124,
      itemBlocks: [{ type: 3, items: [{ itemId: 3085, wpa: 0.2, occurrence: 9, chooseOne: true, highlighted: false }, null] }, null],
    }, { keystone: 8005 }] } }
    return { ok: true, status: 200, data: [{ itemId: 3006, wpaOverall: 0.6, occurrence: 20000 }, { itemId: 3009, occurrence: 1 }, { nope: 1 }] }
  }
  const client = createCoachlessClient({ post, get: async () => ({ ok: false }), cache: createCache() })
  const f = { patch: { major: 16, patch: 21, patchAdditions: 0 }, championIds: [145], matchupChampionIds: [222] }
  const b = (await client.builds(f)).data
  assert.deepEqual([b[0].tier, b[0].winrate, b[0].mostPopular, b[0].starterIds, b[0].firstItemId, b[0].secondItemId], [1, 50.5, true, [1055], 3087, 3124])
  assert.deepEqual(b[0].itemBlocks[0].items[0], { item: 3085, wpa: 0.2, occurrence: 9, chooseOne: true, highlighted: false })
  assert.equal(b[0].itemBlocks.length, 2)                                         // los bloques nulos no rompen
  assert.deepEqual([b[1].tier, b[1].winrate, b[1].starterIds, b[1].itemBlocks, b[1].firstItemId], [null, null, [], [], null]) // build mínima
  const r = await client.items(f, { type: 1, slots: [3], first: 3087, second: 3124 })
  assert.deepEqual(r.data, [{ item: 3006, wpa: 0.6, occurrence: 20000 }])         // sin WPA o sin forma, descartado
  const [path, body] = seen.at(-1)
  assert.equal(path, 'ChampionWinprob/GetGlobalItemStatistics')
  assert.deepEqual([body.itemSlots, body.itemType, body.firstLegendaryId, body.secondLegendaryId, body.keystone, body.includeSupportItems], [[3], 1, 3087, 3124, null, false])
  assert.deepEqual(body.commonFilters.matchupChampionIds, [222])
  await client.items(f, { type: 2 })
  assert.deepEqual([seen.at(-1)[1].itemSlots, seen.at(-1)[1].itemType, seen.at(-1)[1].firstLegendaryId], [null, 2, null])
  const bad = createCoachlessClient({ post: async () => ({ ok: true, status: 200, data: { builds: 'x' } }), get: async () => ({ ok: false }), cache: createCache() })
  assert.equal((await bad.builds(f)).reason, 'shape')
})

// ---- servicio ----
const PATCHES = [19, 20, 21, 22].map((p) => ({ major: 16, patch: p, label: '16.' + p, matchCount: p === 22 ? 243088 : 6800000 }))
const e = (rune, wpa, occurrence) => ({ rune, wpa, occurrence })
function fake(over = {}) {
  const calls = []
  const base = {
    championRole: async () => ({ ok: true, data: 3 }),
    patches: async () => ({ ok: true, data: PATCHES }),
    keystones: async () => ({ ok: true, data: [e(8005, 0.1, 100000), e(8008, 0.16, 500000)] }),
    spells: async () => ({ ok: true, data: [{ spell: 4, wpa: 0, occurrence: 575000 }, { spell: 3, wpa: 0.8, occurrence: 111000 }] }),
    builds: async () => ({ ok: true, data: [
      { ...BUILD, primaryTree: 8000, secondaryTree: 8300, shards: [5005, 5008, 5011] },
      { keystone: 8005, tier: 1, winrate: 49.9, occurrence: 20000, primaryTree: 8000, shards: [1, 2, 3], starterIds: [1054], firstItemId: 3031, secondItemId: 3033, itemBlocks: [] },
    ] }),
    items: async (f, o) => ({ ok: true, data: o.type === 2
      ? [{ item: 3009, wpa: -0.3, occurrence: 40000 }, { item: 3006, wpa: 0.6, occurrence: 200000 }, { item: 1001, wpa: 3, occurrence: 20 }]
      : [{ item: 3031, wpa: 1.2, occurrence: 80000 }, { item: 3036, wpa: 0.4, occurrence: 60000 }, { item: 3026, wpa: -0.2, occurrence: 50000 }, { item: 3000, wpa: 9, occurrence: 5 }] }),
    treeRunes: async () => ({ ok: true, data: { rows: [[e(8009, 0, 1000)], [e(9104, 0, 1000)], [e(8017, 0, 1000)]] } }),
  }
  const rec = (k) => (...a) => { calls.push([k, ...a]); return (over[k] ?? base[k])(...a) }
  const client = Object.fromEntries(Object.keys(base).map((k) => [k, rec(k)]))
  return { calls, svc: createRecommendationService({ client, log, cache: createCache() }) }
}
const CTX = { championId: 145, role: 3, lobbyTier: 5 }

test('servicio: ítems de la build de la runa clave, con botas y 3.er ítem por WPA (con muestra suficiente)', async () => {
  const { svc, calls } = fake()
  const d = (await svc.getRecommendation(CTX, { premium: true })).data
  assert.equal(d.keystone.rune, 8008)
  assert.deepEqual(d.items.core, [3087, 3124]); assert.equal(d.items.tier, 0); assert.equal(d.items.keystoneMatch, true)
  assert.deepEqual(d.items.boots.map((s) => s.item), [3006, 3009])                // 1001 (20 partidas) no llega al mínimo
  assert.deepEqual(d.items.next.map((s) => s.item), [3031, 3036, 3026])           // 3000 (5 partidas) tampoco
  const it = calls.filter((c) => c[0] === 'items')
  assert.equal(it.length, 2)
  assert.deepEqual(it.map((c) => c[2]).sort((a, b) => a.type - b.type), [{ type: 1, slots: [3], first: 3087, second: 3124 }, { type: 2 }])
  assert.equal(it[0][1].patch.patchAdditions, 1)                                  // mismos filtros que lo demás (premium: +1 parche)
})

test('servicio: runa clave elegida → ítems de esa build; sin build con esa runa → la mejor y se avisa', async () => {
  const { svc } = fake()
  const d = (await svc.getRecommendation({ ...CTX, keystoneOverride: 8005 }, { premium: false })).data
  assert.equal(d.items.keystoneMatch, true); assert.deepEqual(d.items.core, [3031, 3033]); assert.equal(d.items.tier, 1)
  const f = fake({ keystones: async () => ({ ok: true, data: [e(8021, 0.3, 100000), e(8008, 0.16, 500000)] }),
    treeRunes: async () => ({ ok: true, data: { rows: [[], [], []] } }) })
  const g = (await f.svc.getRecommendation({ ...CTX, keystoneOverride: 8021 }, {})).data
  assert.equal(g.keystone.rune, 8021); assert.equal(g.items.keystoneMatch, false); assert.deepEqual(g.items.core, [3087, 3124])
})

test('servicio: si fallan las peticiones de ítems solo faltan esas filas; sin builds no hay ítems (y no es un error)', async () => {
  const a = (await fake({ items: async () => ({ ok: false, reason: 'forbidden' }) }).svc.getRecommendation(CTX, {})).data
  assert.deepEqual([a.items.boots, a.items.next], [[], []]); assert.deepEqual(a.items.core, [3087, 3124])
  const t403 = await fake({ items: async () => ({ ok: false, reason: 'forbidden' }) }).svc.getRecommendation(CTX, { premium: true })
  assert.ok(t403.ok); assert.ok(!t403.data.meta.notices.includes('filters-downgraded')) // un 403 de ítems no degrada filtros
  const none = fake({ builds: async () => ({ ok: false, reason: 'network' }) })
  const b = await none.svc.getRecommendation(CTX, {})
  assert.ok(b.ok); assert.equal(b.data.items, null); assert.equal(none.calls.filter((c) => c[0] === 'items').length, 0)
  const noPath = fake({ builds: async () => ({ ok: true, data: [{ ...BUILD, firstItemId: null, primaryTree: 8000, shards: [] }] }) })
  await noPath.svc.getRecommendation(CTX, {})
  assert.deepEqual(noPath.calls.filter((c) => c[0] === 'items').map((c) => c[2].type), [2]) // sin 1.er/2.º ítem no se pide el 3.º
})

test('servicio: el matchup viaja también en las peticiones de ítems', async () => {
  const { svc, calls } = fake()
  await svc.getRecommendation({ ...CTX, opponentChampionId: 222 }, { premium: true })
  assert.deepEqual(calls.filter((c) => c[0] === 'items').map((c) => c[1].matchupChampionIds), [[222], [222]])
})

// ---- catálogo del cliente ----
test('catálogo: ítems con icono y botas por categoría; si items.json no carga, no pasa nada', async () => {
  const script = {
    '/lol-game-data/assets/v1/items.json': [{ id: 3006, name: 'Grebas', iconPath: '/i/3006.png', categories: ['Boots'], priceTotal: 1100, from: [1001] }, { id: 3087, name: 'Filo', iconPath: '/i/3087.png', categories: ['Damage'] }, { id: 0, name: 'x' }, null],
  }
  const lcuGet = async (p) => script[p] ?? null
  const gd = createGameData({ lcuGet }); await gd.load()
  assert.deepEqual(gd.item(3006), { id: 3006, name: 'Grebas', icon: '/i/3006.png', boots: true, priceTotal: 1100, from: [1001] })
  assert.deepEqual(gd.recipe(3006), { priceTotal: 1100, from: [1001] }); assert.equal(gd.recipe(3087), null); assert.equal(gd.recipe(999), null) // sin precio conocido
  assert.equal(gd.isBoots(3006), true); assert.equal(gd.isBoots(3087), false); assert.equal(gd.isBoots(1), false)
  assert.deepEqual(gd.item(999), { id: 999, name: '#999', icon: null, boots: false, priceTotal: null, from: [] })
  const none = createGameData({ lcuGet: async (p) => (p.endsWith('/items.json') ? { not: 'a list' } : null) }); await none.load()
  assert.equal(none.isBoots(3006), false)
})

// ---- proveedor: partida ----
function lcu(script) { return async (p) => { const v = script[p]; return typeof v === 'function' ? v() : (v ?? null) } }
const sess = () => ({ localPlayerCellId: 2, theirTeam: [{ cellId: 7, championId: 238, assignedPosition: 'middle' }], actions: [],
  myTeam: [{ cellId: 2, puuid: 'p2', championId: 103, assignedPosition: 'middle' }] })

test('proveedor: durante la partida devuelve el último contexto con phase game; al terminar, null', async () => {
  let phase = 'ChampSelect'
  const p = createChampSelectProvider({ lcuGet: lcu({ '/lol-gameflow/v1/gameflow-phase': () => phase, '/lol-champ-select/v1/session': sess() }) })
  const sel = await p.getCurrentContext(); assert.equal(sel.phase, undefined)
  for (const g of ['GameStart', 'InProgress', 'Reconnect']) {
    phase = g
    const ctx = await p.getCurrentContext()
    assert.deepEqual([ctx.championId, ctx.opponentChampionId, ctx.role, ctx.phase, ctx.source], [103, 238, 2, 'game', 'lcu'], g)
  }
  phase = 'WaitingForStats'; assert.equal(await p.getCurrentContext(), null)
  phase = 'InProgress'; assert.equal(await p.getCurrentContext(), null)            // ya no hay nada que recordar
})

test('proveedor: un fallo puntual del cliente en partida no vacía el panel; en una partida sin selección previa no devuelve nada', async () => {
  let phase = 'ChampSelect'
  const p = createChampSelectProvider({ lcuGet: lcu({ '/lol-gameflow/v1/gameflow-phase': () => phase, '/lol-champ-select/v1/session': sess() }) })
  await p.getCurrentContext(); phase = 'InProgress'; await p.getCurrentContext()
  phase = null; assert.equal((await p.getCurrentContext()).phase, 'game')          // fallo puntual
  phase = 'Lobby'; assert.equal(await p.getCurrentContext(), null)                 // fin real
  phase = null; assert.equal(await p.getCurrentContext(), null)
  const mid = createChampSelectProvider({ lcuGet: lcu({ '/lol-gameflow/v1/gameflow-phase': 'InProgress' }) }) // plugin arrancado ya en partida
  assert.equal(await mid.getCurrentContext(), null)
  // dodge: el campeón de una selección anterior no se arrastra a otra partida
  let ph = 'ChampSelect'
  const d = createChampSelectProvider({ lcuGet: lcu({ '/lol-gameflow/v1/gameflow-phase': () => ph, '/lol-champ-select/v1/session': sess() }) })
  await d.getCurrentContext(); ph = 'Lobby'; await d.getCurrentContext(); ph = 'InProgress'
  assert.equal(await d.getCurrentContext(), null)
})

// ---- controlador: partida ----
test('controlador: al empezar la partida conserva la recomendación sin consultar de nuevo; termina en idle', async () => {
  let cb = null
  const provider = { getCurrentContext: async () => null, subscribeToChanges: (f) => { cb = f; return () => { cb = null } } }
  let asked = 0
  const c = createChampSelectController({ provider, recommend: async (ctx) => { asked++; return { ok: true, data: { champ: ctx.championId } } }, isLoggedIn: () => true, hasPremium: () => false })
  c.start()
  cb({ championId: 145, role: 3, lobbyTier: 5, mode: 'CLASSIC', enemies: [] }); await tick()
  assert.equal(c.getState().status, 'ready'); assert.equal(asked, 1)
  cb({ championId: 145, role: 3, lobbyTier: 5, mode: 'CLASSIC', enemies: [], phase: 'game' })
  assert.equal(c.getState().status, 'ready'); assert.equal(c.getState().context.phase, 'game'); assert.deepEqual(c.getState().data, { champ: 145 })
  await tick(10); assert.equal(asked, 1)                                          // sin nueva consulta
  cb({ championId: 145, role: 3, lobbyTier: 5, mode: 'CLASSIC', enemies: [], phase: 'game' }); assert.equal(asked, 1)
  cb(null); assert.equal(c.getState().status, 'idle')
  // si la recomendación aún no estaba lista al empezar la partida, se consulta con normalidad
  cb({ championId: 81, role: 3, phase: 'game' }); await tick()
  assert.equal(c.getState().status, 'ready'); assert.equal(asked, 2)
})
