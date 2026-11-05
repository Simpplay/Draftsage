// node --test dev/tests   (sin dependencias: usa node:test)
import test from 'node:test'
import assert from 'node:assert/strict'
import { roleFromPosition, rawTierFromLcu, lobbyTierFromRaw, tiersForLobby, tiersLabel, parseRole, parseTier } from '../../src/domain/lobby.js'
import { choosePatch } from '../../src/domain/patch.js'
import { treeOfKeystone } from '../../src/domain/runes.js'
import { pickBest, pickKeystone, pickSecondary, pickSpell } from '../../src/domain/selection.js'

const e = (rune, wpa, occurrence) => ({ rune, wpa, occurrence })

test('roleFromPosition: posiciones del LCU → roles de Coachless', () => {
  assert.deepEqual(['top', 'jungle', 'middle', 'bottom', 'utility', '', undefined].map(roleFromPosition), [0, 1, 2, 3, 4, 5, 5])
})

test('rangos: nunca por debajo de 3 (Gold) y lobby ±1', () => {
  assert.equal(rawTierFromLcu('GOLD'), 3)
  assert.equal(rawTierFromLcu('grandmaster'), 7)
  assert.equal(rawTierFromLcu('NONE'), null)
  assert.equal(lobbyTierFromRaw([0, 1, 2]), 3)          // todos bajo Gold → 3
  assert.equal(lobbyTierFromRaw([5, 6, 7, 5, 5]), 6)
  assert.equal(lobbyTierFromRaw([]), undefined)
  assert.deepEqual(tiersForLobby(3), [3, 4])
  assert.deepEqual(tiersForLobby(5), [4, 5, 6])
  assert.deepEqual(tiersForLobby(7), [6, 7])
  assert.deepEqual(tiersForLobby(1), [3, 4])            // clamp
  assert.deepEqual(tiersForLobby(undefined), [5, 6, 7]) // sin dato → valor por defecto de la web
  assert.ok(tiersForLobby(0).every((t) => t >= 3))
  assert.equal(tiersLabel([4, 5, 6]), 'Platino – Diamante')
})

test('parseRole / parseTier aceptan alias en español e inglés', () => {
  assert.equal(parseRole('Soporte'), 4); assert.equal(parseRole(' ADC '), 3); assert.equal(parseRole('jungla'), 1)
  assert.equal(parseRole('3'), 3); assert.equal(parseRole('xx'), undefined)
  assert.equal(parseTier('Esmeralda'), 5); assert.equal(parseTier('master+'), 7); assert.equal(parseTier('1'), 3); assert.equal(parseTier('zz'), undefined)
})

test('choosePatch: descarta el último parche si tiene muy poca muestra', () => {
  const ps = [19, 20, 21, 22].map((p, i) => ({ major: 16, patch: p, matchCount: i === 3 ? 243088 : 6800000 }))
  const c = choosePatch(ps)
  assert.equal(c.label, '16.21'); assert.equal(c.fallback, true)
  ps[3].matchCount = 5000000
  assert.deepEqual([choosePatch(ps).label, choosePatch(ps).fallback], ['16.22', false])
  assert.equal(choosePatch([]), null)
  assert.equal(choosePatch([{ major: 16, patch: 1, matchCount: 10 }]).label, '16.1')
  // desordenado
  assert.equal(choosePatch([ps[2], ps[0], ps[1], ps[3]]).label, '16.22')
})

test('treeOfKeystone: tabla estática y prioridad del cliente', () => {
  assert.equal(treeOfKeystone(8008), 8000); assert.equal(treeOfKeystone(8992), 8200); assert.equal(treeOfKeystone(9923), 8100)
  assert.equal(treeOfKeystone(1), undefined)
  assert.equal(treeOfKeystone(8008, new Map([[8008, 9999]])), 9999)
})

test('pickBest: ignora opciones con muy poca muestra y desempata por ocurrencias', () => {
  // 8010: WPA enorme pero 119 partidas de 540 k → no cuenta
  assert.equal(pickKeystone([e(8008, 0.16, 538163), e(8005, -2.63, 25723), e(8010, 9, 119)]).rune, 8008)
  assert.equal(pickBest([e(1, 1, 100), e(2, 1, 300)]).rune, 2)
  // ninguna llega al umbral (suma 40 < minAbs): gana la más jugada
  assert.equal(pickBest([e(1, 5, 10), e(2, -1, 30)]).rune, 2)
  assert.equal(pickBest([]), null)
  assert.equal(pickBest([{ rune: 1, wpa: null, occurrence: 5 }]), null)
})

test('pickSecondary: mejor suma de dos filas distintas; filas vacías no rompen', () => {
  const rows = {
    8100: [[e(8126, -1.9, 588), e(8139, -1.8, 15425)], [], [e(8135, -1.7, 14064), e(8106, -3.6, 3610)]], // suma ≈ -3.5
    8200: [[e(8226, -3.8, 1199), e(8275, 8.2, 1761)], [e(8233, -2.6, 3436), e(8234, 7.1, 2290)], [e(8236, -0.8, 7121)]], // 15.3
    8300: [[], [], [e(8347, 2, 500)]],                                                                        // 1 fila → descartada
  }
  const r = pickSecondary(rows)
  assert.equal(r.tree, 8200)
  assert.deepEqual(r.picks.map((p) => p.rune), [8275, 8234]) // ordenadas por fila
  // un árbol casi sin uso con un WPA enorme no puede ganar (caso real: Valor con 465 partidas frente a 100 000)
  const rare = { 8100: [[e(1, 1, 50000)], [e(2, 1, 50000)], []], 8400: [[e(8401, 4, 465)], [e(8453, 1.5, 1021)], []] }
  assert.equal(pickSecondary(rare).tree, 8100)
  assert.equal(pickSecondary({ 8100: [[], [], []] }), null)
  assert.equal(pickSecondary({}), null)
})

test('pickSpell: excluye el ya elegido', () => {
  const s = (spell, wpa, occurrence) => ({ spell, wpa, occurrence })
  const list = [s(4, 0, 575250), s(3, 0.78, 111388), s(6, 1.4, 7838)]
  assert.equal(pickSpell(list).spell, 3)             // 6 tiene <5 % de muestra
  assert.equal(pickSpell(list, [3]).spell, 4)
})
