import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
const ER = await import('../../src/domain/enemy-roles.js')
const PF = await import('../../src/domain/pick-filters.js')
const IT = await import('../../src/domain/itero.js')

test('enemy-roles: setManual deja una línea por rival y un rival por línea; pruneManual descarta lo obsoleto', () => {
  let m = ER.setManual({}, 10, 'TOP')
  m = ER.setManual(m, 11, 'TOP')                       // la línea pasa al segundo
  assert.deepEqual(m, { 11: 'TOP' })
  m = ER.setManual(m, 11, 'MIDDLE')                    // un rival, una línea
  assert.deepEqual(m, { 11: 'MIDDLE' })
  assert.deepEqual(ER.setManual(m, 11, null), {})      // quitar
  assert.deepEqual(ER.pruneManual({ 11: 'MIDDLE', 99: 'TOP', 12: 'basura' }, [{ championId: 11 }, { championId: 12 }]), { 11: 'MIDDLE' })
})

test('enemy-roles: la elección manual gana al cliente y fija el rival de mi línea', () => {
  const enemies = [{ championId: 1, position: 'top' }, { championId: 2, position: '' }]
  const r = ER.resolveEnemyRoles(enemies, { 2: 'TOP' }, () => null)
  assert.equal(r.byChampion[2].lane, 'TOP'); assert.equal(r.byChampion[2].source, 'manual')
  assert.equal(r.byLane.TOP, 2)
  assert.equal(ER.opponentByManual({ 2: 'TOP' }, 'TOP'), 2)
  assert.equal(ER.opponentByManual({}, 'TOP'), null)
  assert.equal(ER.needsShares([{ championId: 3, position: '' }], {}), true)
  assert.equal(ER.needsShares([{ championId: 3, position: '' }], { 3: 'JUNGLE' }), false)
})

test('pick-filters: normaliza, cuenta y filtra; un filtro sin fuente no se aplica', () => {
  const f = PF.normalizePickFilters({ classes: ['Mage', 'x', 'mage'], mastery: 'zzz', matchup: 'favorable' })
  assert.deepEqual(f.classes, ['mage']); assert.equal(f.mastery, 'any'); assert.equal(PF.activeCount(f), 2)
  assert.deepEqual(PF.normalizePickFilters('basura'), PF.DEFAULT_PICK_FILTERS)
  const all = { mastery: true, matchup: true, itero: true, meta: true }
  assert.equal(PF.matches(f, { classes: ['mage'], vs: { wr: 52, low: false } }, all), true)
  assert.equal(PF.matches(f, { classes: ['mage'], vs: { wr: 48, low: false } }, all), false)
  assert.equal(PF.matches(f, { classes: ['tank'], vs: { wr: 52, low: false } }, all), false)
  assert.equal(PF.matches(f, { classes: ['mage'], vs: null }, { ...all, matchup: false }), true)   // sin datos de matchup no se aplica
  const m = PF.normalizePickFilters({ mastery: 'pool' })
  assert.equal(PF.matches(m, { classes: [], mastery: 12_000 }, all), true)
  assert.equal(PF.matches(m, { classes: [], mastery: 500 }, all), false)
  assert.equal(PF.matches(m, { classes: [], mastery: null }, all), false)
  assert.deepEqual(PF.toggleClass(PF.DEFAULT_PICK_FILTERS, 'tank').classes, ['tank'])
})

test('itero: normalizeBasicInfo toma la maestría por id, ignora avg y no arrastra datos personales', () => {
  const r = IT.normalizeBasicInfo({ info: { player_puuid: 'secreto' }, mastery: { 1: 5000, 2: 200, avg: 21168, foo: 3 }, current_rank: {} })
  assert.deepEqual(r.points, { 1: 5000, 2: 200 }); assert.equal(r.avg, 21168); assert.equal(r.count, 2)
  assert.ok(!JSON.stringify(r).includes('secreto'))
  assert.equal(IT.normalizeBasicInfo({}), null); assert.equal(IT.normalizeBasicInfo(null), null)
  assert.deepEqual(IT.masteryDataOf(r), { 1: 5000, 2: 200, avg: 21168 })
  assert.equal(IT.platformOf('LA1') != null, true)
})
