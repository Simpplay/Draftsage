// draftsage/src/domain/team-context.js — los 5 + 5 huecos del draft por línea (reglas puras; docs/UX-SPEC.md §4.2)
//
// Cada hueco dice QUIÉN y CÓMO SE SABE su línea, para que la interfaz no presente una deducción como un dato del cliente (spec §6.5, regla 5):
//   self       tú (tu rol lo da el cliente o la simulación)
//   confirmed  la línea la informa el cliente (posición asignada)
//   manual     la eligió el jugador en el panel
//   inferred   la dedujo el plugin (cuota de línea en LoLalytics, application/enemy-roles.js)
//   empty      todavía no hay campeón en esa línea
// Los campeones revelados sin línea conocida van aparte (`unplaced`).
// ❓ El cliente no distingue aquí entre campeón «seleccionado» y «bloqueado» (no se lee `actions[].completed`): ambos cuentan como revelados.

import { LANES, laneOfPosition } from './itero.js'

/**
 * @param {{me?:number|null, myRole?:number|null, allies?:{championId:number, position?:string}[], enemies?:{championId:number, position?:string}[],
 *          enemyRoles?:{byChampion?:Record<number,{lane:string, source:'manual'|'position'|'auto'}>}|null}} p
 * @returns {{allies:object[], enemies:object[], unplacedAllies:number[], unplacedEnemies:number[]}}
 */
export function teamSlots({ me = null, myRole = null, allies = [], enemies = [], enemyRoles = null } = {}) {
  const empty = (lane) => ({ lane, cid: null, status: 'empty' })
  const mine = Object.fromEntries(LANES.map((l) => [l, empty(l)]))
  const theirs = Object.fromEntries(LANES.map((l) => [l, empty(l)]))
  const unplacedAllies = [], unplacedEnemies = []

  const myLane = Number.isInteger(myRole) ? LANES[myRole] ?? null : null
  if (myLane) mine[myLane] = { lane: myLane, cid: me && me > 0 ? me : null, status: 'self' }
  for (const a of allies) {
    if (!(a?.championId > 0)) continue
    const lane = laneOfPosition(a.position)
    if (lane && mine[lane].status === 'empty') mine[lane] = { lane, cid: a.championId, status: 'confirmed' }
    else unplacedAllies.push(a.championId)
  }
  const SOURCE = { position: 'confirmed', manual: 'manual', auto: 'inferred' }
  for (const e of enemies) {
    if (!(e?.championId > 0)) continue
    const r = enemyRoles?.byChampion?.[e.championId]
    const lane = r?.lane ?? laneOfPosition(e.position)
    const status = r ? SOURCE[r.source] ?? 'inferred' : 'confirmed'
    if (lane && theirs[lane]?.status === 'empty') theirs[lane] = { lane, cid: e.championId, status }
    else unplacedEnemies.push(e.championId)
  }
  return { allies: LANES.map((l) => mine[l]), enemies: LANES.map((l) => theirs[l]), unplacedAllies, unplacedEnemies }
}
