import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const { createClashProvider } = await import('../../src/infrastructure/lcu/clash-provider.js')

const BRACKET = { rosters: [{ rosterId: 1, name: 'Yo', shortName: 'YO' }, { rosterId: 2, name: 'Rival', shortName: 'RIV' }], matches: [{ round: 1, status: 'UPCOMING', rosterId1: 1, rosterId2: 2, winnerId: 0 }] }
function lcu(over = {}) {
  const calls = []
  const routes = {
    '/lol-clash/v1/tournament-summary': [{ bracketId: 10, rosterId: 1, state: 'SCOUTING', tournamentId: 5 }],
    '/lol-clash/v1/bracket/10': BRACKET,
    '/lol-clash/v1/roster/2': { members: [{ summonerId: 101 }, { summonerId: 102 }] },
    '/lol-clash/v1/roster/2/stats': { periodStats: [{ matchStats: [{ win: true, playerChampionIds: { 101: 7 } }] }] },
    ...over,
  }
  const get = async (path) => {
    calls.push(path)
    if (path.startsWith('/lol-summoner/v2/summoners')) return routes.summoners ?? [{ summonerId: 101, puuid: 'pa', gameName: 'A' }, { summonerId: 102, puuid: 'pb', gameName: 'B' }]
    if (path.startsWith('/lol-ranked/v2/tiers')) return 'tiers' in routes ? routes.tiers : [{ summonerId: 101, achievedTiers: [{ queueType: 'RANKED_SOLO_5x5', tier: 'DIAMOND', division: 2 }] }]
    if (path.startsWith('/lol-clash/v1/scouting/champions')) return 'scouting' in routes ? routes.scouting : [{ playerId: 102, topMasteries: [{ championId: 9, championLevel: 7, championPoints: 1000 }], topSeasonChampions: [] }, { playerId: 101, topMasteries: [], topSeasonChampions: [{ championId: 7, gameCount: 4, winCount: 3 }] }]
    if (path.includes('/lol-champion-mastery/v1/')) return 'mastery' in routes ? routes.mastery : [{ championId: 7, championLevel: 6, championPoints: 5000, lastPlayTime: 1 }]
    return routes[path] ?? null
  }
  return { get, calls }
}

test('clash-provider: flujo completo, casado por summonerId y degradación a null', async () => {
  const l = lcu()
  const p = createClashProvider({ lcuGet: l.get })
  const r = await p.getScoutingContext()
  assert.equal(r.ok, true); assert.equal(r.data.shortName, 'RIV'); assert.equal(r.data.players.length, 2)
  const [a, b] = r.data.players
  assert.equal(a.rank.solo.tier, 'DIAMOND'); assert.equal(b.rank.solo, null)
  assert.equal(a.seasonChamps[0].cid, 7); assert.equal(b.topMasteries[0].cid, 9)   // el scouting venía en orden distinto
  assert.deepEqual(a.clashPicks, [{ cid: 7, win: true }])
  assert.equal(a.pool.length, 1); assert.deepEqual(r.data.partial, [])
})

test('clash-provider: caché y petición compartida (una sola carga de roster)', async () => {
  const l = lcu(); let t = 0
  const p = createClashProvider({ lcuGet: l.get, now: () => t, ttlMs: 1000 })
  await Promise.all([p.getScoutingContext(), p.getScoutingContext()])
  assert.equal(l.calls.filter((c) => c === '/lol-clash/v1/roster/2').length, 1)
  await p.getScoutingContext(); assert.equal(l.calls.filter((c) => c === '/lol-clash/v1/roster/2').length, 1)
  t = 5000; await p.getScoutingContext(); assert.equal(l.calls.filter((c) => c === '/lol-clash/v1/roster/2').length, 2)
})

test('clash-provider: sin stats ni maestría degrada por partes', async () => {
  const l = lcu({ '/lol-clash/v1/roster/2/stats': null, mastery: null })
  const r = await createClashProvider({ lcuGet: l.get }).getScoutingContext()
  assert.equal(r.ok, true); assert.deepEqual(r.data.partial.sort(), ['mastery', 'stats'])
  assert.equal(r.data.players[0].pool.length, 0)
})

test('clash-provider: motivos de fallo (sin torneo, sin bracket, sin rival, rival por tag, roster propio)', async () => {
  const run = (over, opts) => createClashProvider({ lcuGet: lcu(over).get }).getScoutingContext(opts)
  assert.equal((await run({ '/lol-clash/v1/tournament-summary': [] })).reason, 'no-tournament')
  assert.equal((await run({ '/lol-clash/v1/bracket/10': null })).reason, 'no-bracket')
  assert.equal((await run({ '/lol-clash/v1/bracket/10': { ...BRACKET, matches: [] } })).reason, 'no-opponent')
  assert.equal((await run({}, { tag: 'riv' })).ok, true)
  assert.equal((await run({}, { tag: 'zzz' })).reason, 'no-roster')
  assert.equal((await run({}, { tag: 'YO' })).reason, 'own-roster')
  assert.equal((await run({ '/lol-clash/v1/roster/2': { members: [] } })).reason, 'no-roster')
  assert.equal((await run({ summoners: [] })).reason, 'no-players')
})

test('clash-provider: nunca lanza ni registra ids/nombres', async () => {
  const logs = []
  const p = createClashProvider({ lcuGet: async () => { throw new Error('boom') }, log: { warn: (...a) => logs.push(a.join(' ')), info: (...a) => logs.push(a.join(' ')) } })
  assert.equal((await p.getScoutingContext()).reason, 'error')
  const ok = createClashProvider({ lcuGet: lcu().get, log: { info: (...a) => logs.push(a.join(' ')) } })
  await ok.getScoutingContext()
  assert.ok(!logs.some((l) => l.includes('101') || l.includes('RIV')))
})
