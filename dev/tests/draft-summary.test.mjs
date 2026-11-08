// Rediseño de UX (docs/UX-SPEC.md): disponibilidad de campeones, recomendación principal + alternativas y motivos con evidencia.
import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const DS = await import('../../src/domain/draft-summary.js')
const PF = await import('../../src/domain/pick-filters.js')
const { createPickFilters } = await import('../../src/application/pick-filters.js')

const lane = [
  { cid: 1, wr: 54, edge: 3.1, n: 2500 },   // matchup favorable de verdad
  { cid: 2, wr: 53, edge: 0.4, n: 800 },    // gana por fuerza general, no por el matchup
  { cid: 3, wr: 52, edge: null, n: 300 },   // sin media conocida
]
const team = [
  { championId: 10, score: 1.4, games: 9000, chips: [{ kind: 'syn', lane: 'JUNGLE', value: 2.3 }, { kind: 'weak', lane: 'MIDDLE', value: -3.5 }, { kind: 'dmg', value: 'ap' }] },
  { championId: 1, score: 0.9, games: 7000, chips: [], agree: 'agree' },
  { championId: 11, score: 0.5, games: 5000, chips: [], agree: 'conflict' },
]

test('unavailableIds: baneados y elegidos por otros (aliados y rivales); tu campeón no cuenta', () => {
  const s = PF.unavailableIds({ championId: 7, bans: [1, 0, -1, 2], allies: [{ championId: 3 }, { championId: 0 }], enemies: [{ championId: 4 }, { championId: 7 }] })
  assert.deepEqual([...s].sort(), [1, 2, 3, 4])
  assert.equal(PF.unavailableIds(null).size, 0)
})

test('pick-filters: las dos listas excluyen a los no disponibles', () => {
  const champions = { 1: { vs: { wr: 55, edge: 2, n: 900, low: false } }, 2: { vs: { wr: 54, edge: 1, n: 900, low: false } }, 3: { vs: { wr: 53, edge: 1, n: 900, low: false } } }
  const sub = () => () => {}
  const pf = createPickFilters({
    catalog: { champion: () => ({ classes: [] }) },
    overlay: { getState: () => ({ data: { rival: 99, champions } }), subscribe: sub },
    advisor: { getState: () => ({ data: { rows: [{ championId: 1 }, { championId: 5 }] } }), subscribe: sub },
    mastery: { getState: () => ({ status: 'idle' }), subscribe: sub, pointsOf: () => null },
    prefs: { get: () => ({}), set: (x) => x },
    getContext: () => ({ championId: 9, bans: [2], allies: [{ championId: 1 }], enemies: [{ championId: 99 }] }),
  })
  assert.deepEqual(pf.matchupPicks().map((p) => p.cid), [3])
  assert.deepEqual(pf.draftPicks().map((p) => p.championId), [5])
})

test('perspectiva: auto = línea si hay rival con datos, si no equipo; una pedida sin datos cae en la otra', () => {
  assert.equal(DS.resolvePerspective('auto', { lane: true, team: true }), 'lane')
  assert.equal(DS.resolvePerspective('auto', { lane: false, team: true }), 'team')
  assert.equal(DS.resolvePerspective('team', { lane: true, team: false }), 'lane')
  assert.equal(DS.resolvePerspective('lane', { lane: false, team: false }), null)
  assert.equal(DS.normalizePerspective('raro'), 'auto')
})

test('principal + alternativas con su porqué (no los puestos 2–4)', () => {
  const s = DS.buildDraftSummary({ lanePicks: lane, teamPicks: team })
  assert.equal(s.perspective, 'lane')
  assert.equal(s.primary.cid, 1)
  assert.deepEqual(s.alternatives.map((a) => [a.cid, a.why]), [[10, 'best-team'], [2, 'next-lane']])
  const t = DS.buildDraftSummary({ lanePicks: lane, teamPicks: team, perspective: 'team' })
  assert.equal(t.primary.cid, 10)
  assert.deepEqual(t.alternatives.map((a) => [a.cid, a.why]), [[1, 'best-lane'], [11, 'next-team']])
  assert.equal(DS.buildDraftSummary({}).primary, null)
})

test('motivos: evidencia separada (dato / modelo / heurística), ventajas y desventajas, fuerza general ≠ matchup', () => {
  const s = DS.buildDraftSummary({ lanePicks: lane, teamPicks: team })
  const p = s.primary
  assert.equal(p.reasons[0].type, 'lane-matchup'); assert.equal(p.reasons[0].evidence, 'statistical'); assert.equal(p.reasons[0].polarity, 'positive')
  assert.ok(p.reasons.some((r) => r.type === 'team-fit' && r.evidence === 'model'))
  assert.ok(p.reasons.some((r) => r.type === 'both-sources' && r.evidence === 'heuristic'))
  assert.equal(p.confidence.level, 'high'); assert.equal(p.confidence.n, 2500)
  const general = s.alternatives.find((a) => a.cid === 2)
  assert.equal(general.reasons.find((r) => r.type === 'lane-matchup').polarity, 'neutral')
  assert.ok(general.reasons.some((r) => r.type === 'general-strength'), 'win rate alto con ventaja pequeña = fuerza general, no counter')
  assert.equal(general.confidence.level, 'medium')
  const fit = s.alternatives.find((a) => a.cid === 10)
  assert.equal(fit.confidence.level, 'model', 'solo iTero: predicción del modelo, no muestra observada')
  assert.ok(fit.tradeoffs.some((r) => r.type === 'enemy-weakness'), 'la debilidad no se oculta: va a tradeoffs')
  const t = DS.buildDraftSummary({ lanePicks: lane, teamPicks: team, perspective: 'team' })
  assert.ok(t.alternatives.find((a) => a.cid === 11).tradeoffs.some((r) => r.type === 'sources-disagree'))
})

test('maestría: alternativa «tu campeón» solo con puntos suficientes; dato desconocido = null, no 0', () => {
  const pts = { 3: 50_000, 11: 9_000 }
  const s = DS.buildDraftSummary({ lanePicks: lane, teamPicks: team, masteryOf: (c) => pts[c] ?? null })
  assert.deepEqual(s.alternatives.map((a) => a.why), ['best-team', 'next-lane', 'comfort'])
  assert.equal(s.alternatives[2].cid, 3)
  assert.ok(s.alternatives[2].reasons.some((r) => r.type === 'comfort' && r.points === 50_000))
  assert.equal(s.primary.mastery, null)
  assert.equal(DS.sampleLevel(0), null); assert.equal(DS.sampleLevel(200), 'low'); assert.equal(DS.sampleLevel(600), 'medium')
})

const TC = await import('../../src/domain/team-context.js')

test('contexto 5+5: tú, línea del cliente, elegida por ti, deducida y vacía; los sin línea van aparte', () => {
  const s = TC.teamSlots({
    me: 145, myRole: 3,
    allies: [{ championId: 10, position: 'top' }, { championId: 11, position: '' }],
    enemies: [{ championId: 20, position: 'middle' }, { championId: 21 }, { championId: 22 }, { championId: 23 }],
    enemyRoles: { byChampion: { 21: { lane: 'JUNGLE', source: 'auto' }, 22: { lane: 'BOTTOM', source: 'manual' }, 20: { lane: 'MIDDLE', source: 'position' } } },
  })
  assert.deepEqual(s.allies.map((x) => [x.lane, x.cid, x.status]), [['TOP', 10, 'confirmed'], ['JUNGLE', null, 'empty'], ['MIDDLE', null, 'empty'], ['BOTTOM', 145, 'self'], ['UTILITY', null, 'empty']])
  assert.deepEqual(s.unplacedAllies, [11])
  assert.deepEqual(s.enemies.map((x) => x.status), ['empty', 'inferred', 'confirmed', 'manual', 'empty'])
  assert.deepEqual(s.unplacedEnemies, [23])
  assert.equal(TC.teamSlots({}).allies.every((x) => x.status === 'empty'), true)
})
