import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const C = await import('../../src/domain/clash.js')
const { rankBans, playerProfiles, MODEL } = await import('../../src/domain/ban-advice.js')

const NOW = Date.UTC(2026, 10, 23)
const DAY = 864e5
const bracket = {
  rosters: [{ rosterId: 1, name: 'Mi equipo', shortName: 'MIO' }, { rosterId: 2, name: 'Rival Dos', shortName: 'zzz' }, { rosterId: 3, name: 'Tres', shortName: 'TRE' }],
  matches: [
    { id: 'a', round: 1, order: 1, status: 'COMPLETED', rosterId1: 1, rosterId2: 3, winnerId: 1 },
    { id: 'b', round: 2, order: 1, status: 'UPCOMING', rosterId1: 1, rosterId2: 2, winnerId: 0 },
    { id: 'c', round: 2, order: 2, status: 'UPCOMING', rosterId1: 3, rosterId2: 9, winnerId: 0 },
  ],
}

test('clash: findMyEntry prefiere SCOUTING / IN_GAME', () => {
  assert.equal(C.findMyEntry([{ bracketId: 1, rosterId: 5, state: 'DONE' }, { bracketId: 2, rosterId: 6, state: 'SCOUTING' }]).rosterId, 6)
  assert.equal(C.findMyEntry([]), null); assert.equal(C.findMyEntry(null), null)
})

test('clash: findOpponent (en curso / completada / indefinido / sin mi roster)', () => {
  assert.equal(C.findOpponent(bracket, 1).shortName, 'zzz')
  assert.equal(C.findOpponent(bracket, '1').rosterId, 2)                      // ids numéricos o texto
  assert.equal(C.findOpponent({ ...bracket, matches: [bracket.matches[0]] }, 1), null) // solo completadas
  assert.equal(C.findOpponent({ ...bracket, matches: [{ round: 2, status: 'UPCOMING', rosterId1: 1, rosterId2: -1, winnerId: 0 }] }, 1), null) // rival sin definir
  assert.equal(C.findOpponent(bracket, 77), null)
  assert.equal(C.findOpponent(null, 1), null)
})

test('clash: rosterByTag sin distinguir mayúsculas; duplicados → null', () => {
  assert.equal(C.rosterByTag(bracket, 'ZZZ').rosterId, 2)
  assert.equal(C.rosterByTag(bracket, ' nope '), null)
  assert.equal(C.rosterByTag({ rosters: [{ rosterId: 1, shortName: 'A' }, { rosterId: 2, shortName: 'a' }] }, 'a'), null)
})

test('clash: scouting se casa por playerId aunque venga en otro orden; formas raras no lanzan', () => {
  const m = C.normalizeScouting([{ playerId: 22, topMasteries: [{ championId: 5, championLevel: 7, championPoints: 100 }], topSeasonChampions: [{ championId: 5, gameCount: 2, winCount: 9 }, { championId: 6, gameCount: 0, winCount: 0 }] }, { playerId: 11, topMasteries: null }, null, {}])
  assert.deepEqual([...m.keys()].sort(), ['11', '22'])
  assert.deepEqual(m.get('22').seasonChamps, [{ cid: 5, games: 2, wins: 2 }])   // wins acotadas a games; 0 partidas fuera
  assert.deepEqual(m.get('11').topMasteries, [])
  assert.equal(C.normalizeScouting('x').size, 0)
})

test('clash: normalizeMastery y normalizeTiers', () => {
  assert.deepEqual(C.normalizeMastery([{ championId: 1, championLevel: 5, championPoints: 10, lastPlayTime: 5 }, { championId: 2, championPoints: 0 }, { championId: 3, championPoints: 7 }]),
    [{ cid: 1, level: 5, points: 10, lastPlay: 5 }, { cid: 3, level: 0, points: 7, lastPlay: null }])
  const t = C.normalizeTiers([{ summonerId: 9, achievedTiers: [{ queueType: 'RANKED_FLEX_SR', tier: 'gold', division: 2 }] }])
  assert.deepEqual(t.get('9'), { solo: null, flex: { tier: 'GOLD', division: 2 } })
  assert.equal(C.averageTier([{ solo: { tier: 'DIAMOND' } }, { flex: { tier: 'EMERALD' } }, { solo: null, flex: null }]), 6) // (6+5)/2 = 5,5 → 6
})

test('clash: clashPicks (win desde el punto de vista del jugador)', () => {
  const stats = { periodStats: [{ matchStats: [{ win: true, playerChampionIds: { 1: 10, 2: 20, 99: 30 } }, { win: false, playerChampionIds: { 1: 11 } }] }] }
  assert.deepEqual(C.clashPicks(stats, [1, 2]).map((p) => [p.summonerId, p.cid, p.win]), [['1', 10, true], ['2', 20, true], ['1', 11, false]])
  assert.equal(C.clashPicks(stats, [1], { ownRoster: false })[0].win, false) // estadísticas del equipo contrario: se invierte
  assert.deepEqual(C.clashPicks(null, [1]), [])
})

// ---- modelo de bans ----
const pool = (list) => list.map(([cid, points, days]) => ({ cid, level: 7, points, lastPlay: NOW - days * DAY }))
const oneTrick = { pool: pool([[10, 400000, 1], [11, 20000, 2], [12, 15000, 3]]), topMasteries: [], seasonChamps: [{ cid: 10, games: 20, wins: 15 }, { cid: 11, games: 2, wins: 1 }], clashPicks: [] }
const wide = { pool: pool([[20, 90000, 1], [21, 85000, 1], [22, 80000, 2], [23, 78000, 2], [24, 75000, 3]]), topMasteries: [], seasonChamps: [{ cid: 20, games: 10, wins: 6 }, { cid: 21, games: 10, wins: 6 }, { cid: 22, games: 9, wins: 5 }, { cid: 23, games: 9, wins: 5 }], clashPicks: [] }

test('ban-advice: el one-trick vale más que el pool ancho', () => {
  const r = rankBans({ players: [oneTrick, wide], now: NOW, meta: () => ({ wr: 50, br: 2 }) })
  assert.equal(r[0].championId, 10)
  assert.ok(r[0].tags.includes('one-trick'))
  assert.ok(r[0].value > r.find((x) => x.championId === 20).value * 3)
  assert.equal(r[0].reliability, 'high')
  assert.ok(r[0].perPlayer[0].evidence.some((e) => e.key === 'season' && e.games === 20))
})

test('ban-advice: baneados y elegidos se excluyen; entonces el valor pasa a la siguiente opción', () => {
  const r = rankBans({ players: [oneTrick, wide], unavailable: [10], now: NOW })
  assert.ok(!r.some((x) => x.championId === 10))
})

test('ban-advice: una partida al 100 % se encoge (no supera a 20 partidas al 75 %)', () => {
  const lucky = { pool: pool([[30, 50000, 1], [31, 45000, 1]]), seasonChamps: [{ cid: 30, games: 1, wins: 1 }] }
  const solid = { pool: pool([[40, 50000, 1], [41, 45000, 1]]), seasonChamps: [{ cid: 40, games: 20, wins: 15 }] }
  const r = rankBans({ players: [lucky, solid], now: NOW })
  const v = (c) => r.find((x) => x.championId === c).value
  assert.ok(v(40) > v(30))
  assert.ok(r.find((x) => x.championId === 30).tags.includes('low-sample'))
})

test('ban-advice: jugador inactivo → solo maestría (sin recencia) y fiabilidad baja', () => {
  const idle = { pool: pool([[50, 90000, 200]]), topMasteries: [{ cid: 50, level: 7, points: 90000 }, { cid: 51, level: 5, points: 30000 }], seasonChamps: [] }
  const r = rankBans({ players: [idle], now: NOW })
  assert.ok(r.length >= 1); assert.equal(r[0].reliability, 'low')
  assert.ok(r[0].perPlayer[0].evidence.some((e) => e.key === 'mastery' && e.stale === true))
})

test('ban-advice: solapamiento, meta y desempate por ban rate; determinismo', () => {
  const a = { pool: pool([[60, 80000, 1], [61, 70000, 1]]), seasonChamps: [] }
  const b = { pool: pool([[60, 80000, 1], [62, 70000, 1]]), seasonChamps: [] }
  const meta = (c) => ({ wr: 50, br: c === 60 ? 20 : 1 })
  const r1 = rankBans({ players: [a, b], meta, now: NOW }), r2 = rankBans({ players: [a, b], meta, now: NOW })
  assert.deepEqual(r1, r2)
  assert.ok(r1.find((x) => x.championId === 60).tags.includes('overlap'))
  assert.ok(r1.find((x) => x.championId === 60).tags.includes('high-ban-rate'))
  // sin meta nunca llega a «high»
  assert.notEqual(rankBans({ players: [oneTrick], now: NOW })[0].reliability, 'high')
  assert.ok(MODEL.limit >= r1.length)
})

test('ban-advice: con 1–2 campeones disponibles no hay «one-trick» (datos escasos)', () => {
  const few = { pool: pool([[70, 90000, 1], [71, 5000, 1]]), seasonChamps: [] }
  assert.ok(!rankBans({ players: [few], now: NOW })[0].tags.includes('one-trick'))
  assert.equal(playerProfiles({ players: [few], now: NOW })[0].oneTrick, null)
})

test('ban-advice: entradas vacías no lanzan; fichas de jugador', () => {
  assert.deepEqual(rankBans({ players: [] }), []); assert.deepEqual(rankBans({}), [])
  const [p] = playerProfiles({ players: [oneTrick], now: NOW })
  assert.equal(p.oneTrick, 10); assert.equal(p.top[0].cid, 10); assert.equal(p.top.length, 3)
})
