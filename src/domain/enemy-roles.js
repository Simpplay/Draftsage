// draftsage/src/domain/enemy-roles.js — línea que ocupa cada rival revelado (reglas puras, sin red ni DOM)
//
// El cliente casi nunca informa la posición de los rivales, así que cada rival tiene una línea de tres orígenes posibles
// (de mayor a menor prioridad):
//   · 'manual'   — la eligió el jugador en el panel (es lo que CREE que va a jugar ese rival);
//   · 'position' — la informó el cliente (`assignedPosition`);
//   · 'auto'     — la dedujo el plugin con la cuota de línea de cada campeón (domain/pick-advice.js assignLanes).
// Las líneas son las de iTero (TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY); al LCU se le habla en minúsculas (`position`).

import { LANES, laneOfPosition } from './itero.js'
import { assignLanes } from './pick-advice.js'

/** Línea → posición con el formato del LCU ('top', 'jungle', 'middle', 'bottom', 'utility'). */
export const positionOfLane = (lane) => String(lane).toLowerCase()

/**
 * Elecciones manuales saneadas: solo líneas válidas, solo campeones que siguen entre los rivales y una línea por campeón y un campeón por línea.
 * @param {Record<string,string>} manual  { championId: LINEA }
 * @param {{championId:number}[]} enemies
 * @returns {Record<string,string>}
 */
export function pruneManual(manual, enemies) {
  const present = new Set((enemies ?? []).map((e) => e.championId))
  const out = {}
  const usedLanes = new Set()
  for (const [cid, raw] of Object.entries(manual ?? {})) {
    const lane = laneOfPosition(raw)
    if (!lane || !present.has(Number(cid)) || usedLanes.has(lane)) continue
    usedLanes.add(lane)
    out[cid] = lane
  }
  return out
}

/**
 * Asigna (o quita, con lane = null) la línea de un rival. Una línea solo puede tenerla un rival: si ya la tenía otro, la pierde.
 * No modifica el original.
 */
export function setManual(manual, championId, lane) {
  const target = laneOfPosition(lane)
  const out = {}
  for (const [cid, l] of Object.entries(manual ?? {})) if (Number(cid) !== Number(championId) && l !== target) out[cid] = l
  if (target) out[championId] = target
  return out
}

/** Rivales con la línea manual escrita como `position` (el resto, tal cual). Así todo lo que ya entiende `position` entiende la elección manual. */
export const withManualPositions = (enemies, manual) =>
  (enemies ?? []).map((e) => (manual?.[e.championId] ? { ...e, position: positionOfLane(manual[e.championId]) } : e))

/** El rival al que el jugador asignó MI línea (o null). `myLane` = 'TOP'… */
export function opponentByManual(manual, myLane) {
  if (!myLane) return null
  const hit = Object.entries(manual ?? {}).find(([, lane]) => lane === myLane)
  return hit ? Number(hit[0]) : null
}

/** ¿Hay algún rival sin línea conocida (ni manual ni del cliente)? Solo entonces hacen falta las cuotas de línea. */
export const needsShares = (enemies, manual) => withManualPositions(enemies, manual).some((e) => !laneOfPosition(e.position))

/**
 * Línea de cada rival y de dónde sale.
 * @param {{championId:number, position?:string}[]} enemies
 * @param {Record<string,string>} manual
 * @param {(cid:number, lane:string)=>number|null} share  % de las partidas del campeón en esa línea (null = sin dato)
 * @returns {{byLane:Record<string,number>, byChampion:Record<number,{lane:string, source:'manual'|'position'|'auto'}>}}
 */
export function resolveEnemyRoles(enemies, manual, share = () => null) {
  const clean = pruneManual(manual, enemies)
  // Los manuales van primero: si el cliente y el jugador discrepan en una línea, gana el jugador.
  const members = [...withManualPositions(enemies, clean)].sort((a, b) => (clean[b.championId] ? 1 : 0) - (clean[a.championId] ? 1 : 0))
  const byLane = assignLanes(members, share)
  const byChampion = {}
  for (const lane of LANES) {
    const cid = byLane[lane]
    if (cid == null) continue
    const original = (enemies ?? []).find((e) => e.championId === cid)
    const source = clean[cid] === lane ? 'manual' : laneOfPosition(original?.position) === lane ? 'position' : 'auto'
    byChampion[cid] = { lane, source }
  }
  return { byLane, byChampion }
}
