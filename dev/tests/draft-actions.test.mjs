import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const { parseDraftActions, allBans } = await import('../../src/domain/draft-actions.js')
const { createChampSelectProvider } = await import('../../src/infrastructure/lcu/champ-select-provider.js')
const { clashSession } = await import('./fixtures/clash-session.mjs')

test('draft-actions: sesión sin actions → vacío', () => {
  const r = parseDraftActions({})
  assert.deepEqual(r.bans, { ally: [], enemy: [] }); assert.equal(r.phase, null); assert.equal(r.turn, null)
  assert.deepEqual(allBans(null), [])
})

test('draft-actions: Clash a mitad de la 1.ª tanda de baneos (E A E hechos)', () => {
  const r = parseDraftActions(clashSession(4)) // marcador + 3 bans completados; el 4.º (A) en curso
  assert.equal(r.bans.enemy.length, 2); assert.equal(r.bans.ally.length, 1)
  assert.equal(r.phase, 'ban1'); assert.deepEqual(r.turn.type, 'ban'); assert.equal(r.turn.isAlly, true)
  assert.deepEqual(r.banSlotsLeft, { ally: 4, enemy: 3 }) // 5 por equipo menos los hechos: aliados 5-1, rivales 5-2
})

test('draft-actions: secuencia completa y fases', () => {
  const phaseAt = (n) => parseDraftActions(clashSession(n)).phase
  assert.equal(phaseAt(1), 'ban1')   // primer baneo en curso
  assert.equal(phaseAt(8), 'pick1')  // tras los 6 bans iniciales + marcador: empiezan los picks
  assert.equal(phaseAt(15), 'ban2')  // 6 picks hechos → 2.ª tanda de baneos
  assert.equal(phaseAt(20), 'pick2')
  const end = parseDraftActions(clashSession(99))
  assert.equal(end.phase, 'done'); assert.equal(end.turn, null)
  assert.equal(end.bans.ally.length + end.bans.enemy.length, 10); assert.equal(end.picks.ally.length + end.picks.enemy.length, 10)
  assert.equal(end.bans.ally.length, 5); assert.equal(end.bans.enemy.length, 5)
})

test('draft-actions: un hover (acción en curso con campeón) no cuenta; marcadores ignorados', () => {
  const r = parseDraftActions(clashSession(2, { hoverInProgress: true }))
  assert.equal(r.bans.ally.length + r.bans.enemy.length, 1)
})

test('allBans: Clash (bans vacío) usa actions; ranked normal usa session.bans; unión sin duplicados', () => {
  assert.equal(allBans(clashSession(99, { withBansObject: true })).length, 10)
  assert.deepEqual(allBans({ bans: { myTeamBans: [157, 0], theirTeamBans: [64] }, actions: [] }), [157, 64])
  assert.deepEqual(allBans({ bans: { myTeamBans: [157], theirTeamBans: [] }, actions: [[{ type: 'ban', championId: 157, completed: true, isAllyAction: true }, { type: 'ban', championId: 9, completed: true, isAllyAction: false }]] }), [157, 9])
})

test('proveedor: en Clash los bans salen de actions', async () => {
  const lcuGet = async (p) => (p === '/lol-gameflow/v1/gameflow-phase' ? 'ChampSelect' : p === '/lol-champ-select/v1/session' ? clashSession(10, { withBansObject: true }) : p === '/lol-gameflow/v1/session' ? { gameData: { queue: { gameMode: 'CLASSIC', id: 700 } } } : null)
  const ctx = await createChampSelectProvider({ lcuGet }).getCurrentContext()
  assert.equal(ctx.bans.length, 6)
  assert.equal(ctx.side, 'Red')
})
