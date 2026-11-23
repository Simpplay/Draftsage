// Sesión de champ select de Clash SINTÉTICA (solo la forma real: docs/CLASH-BANS.md §2.4; ids inventados, sin nombres ni puuids).
// Tu equipo = team 2 (rojo); secuencia de 24 grupos: [m] E A E A E A [m] pE pA pA pE pE pA [m] A E A E [m] pA pE pE pA  (E = rival, A = aliado).
const SEQ = [
  'm', 'bE', 'bA', 'bE', 'bA', 'bE', 'bA',
  'm', 'pE', 'pA', 'pA', 'pE', 'pE', 'pA',
  'm', 'bA', 'bE', 'bA', 'bE',
  'm', 'pA', 'pE', 'pE', 'pA',
]
const CHAMPS = [11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176, 187, 198, 209, 220, 231, 242, 253, 264, 275]

/**
 * @param {number} done  cuántos grupos están completados (el siguiente queda en curso; marcadores incluidos)
 * @param {{hoverInProgress?:boolean, withBansObject?:boolean}} [o]
 */
export function clashSession(done, { hoverInProgress = false, withBansObject = false } = {}) {
  let n = 0
  const actions = SEQ.map((k, i) => {
    if (k === 'm') return [{ id: 100 + i, type: 'ten_bans_reveal', championId: 0, actorCellId: -1, isAllyAction: false, isInProgress: false, completed: i < done }]
    const isAlly = k.endsWith('A')
    const type = k[0] === 'b' ? 'ban' : 'pick'
    const completed = i < done
    const inProgress = i === done
    return [{ id: i, type, championId: completed || (inProgress && hoverInProgress) ? CHAMPS[n++ % CHAMPS.length] : 0, actorCellId: 5 + (i % 5), isAllyAction: isAlly, isInProgress: inProgress, completed }]
  })
  return {
    localPlayerCellId: 8, actions,
    bans: withBansObject ? { myTeamBans: [], theirTeamBans: [], numBans: 0 } : undefined,
    myTeam: [5, 6, 7, 8, 9].map((c) => ({ cellId: c, team: 2, assignedPosition: ['top', 'jungle', 'middle', 'bottom', 'utility'][c - 5], championId: 0, puuid: 'p' + c, summonerId: c })),
    theirTeam: [0, 1, 2, 3, 4].map((c) => ({ cellId: c, team: 1, assignedPosition: '', championId: 0, puuid: '', summonerId: 0 })),
  }
}
