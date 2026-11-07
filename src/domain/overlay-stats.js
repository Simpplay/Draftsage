// draftsage/src/domain/overlay-stats.js — estadísticas por campeón para mostrar sobre la selección (reglas puras)
//
// Fuente: Lolalytics (docs/lolalytics-counters-synergy.md). Dos tablas:
//   · lista de tier de TU línea → por campeón: win rate, uso, bans, partidas y nota (S+ … D−)
//   · página de build del RIVAL en esa línea → tabla `enemy[línea]`: [cid, wr, d1, d2, pr, n] con el win rate DEL RIVAL contra cada
//     campeón; el de ese campeón contra el rival es 100 − wr. Los mejores counters = los campeones con más win rate contra él.
// Los números con pocas partidas son ruido (aparecen 0 % y 100 %): nunca se muestran por debajo de MIN_SHOWN_GAMES y se atenúan
// por debajo de MIN_ROW_GAMES (el mismo umbral que usa la web en `header.counters`).

import { parseRow } from './lolalytics.js'

export const MIN_ROW_GAMES = 200      // por debajo, la cifra se marca como poco fiable (`low`) y no cuenta como counter
export const MIN_SHOWN_GAMES = 30     // por debajo, no se enseña
export const COUNTER_LIMIT = 5
export const MIN_LANE_SHARE = 30      // % de las partidas del campeón en esa línea para deducir que es el rival de tu línea

export const GRADES = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-']
/** Índice de nota de la lista de tier (1…15) → «S+» … «D-». (Solo 12 = «C-» está comprobado; el resto, por orden ❓.) */
export const gradeOf = (n) => (Number.isInteger(n) ? (GRADES[n - 1] ?? null) : null)

const round1 = (x) => Math.round(x * 10) / 10
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

/** Fila de la lista de tier → lo que se guarda por campeón. null si no trae los números básicos. */
export function statsOfTierRow(row) {
  if (!row || !isNum(row.wr) || !isNum(row.games)) return null
  return {
    wr: round1(row.wr), pr: isNum(row.pr) ? round1(row.pr) : null, br: isNum(row.br) ? round1(row.br) : null,
    games: row.games, grade: gradeOf(row.tier), rank: Number.isInteger(row.rank) ? row.rank : null,
  }
}

/**
 * Rival de tu línea cuando el cliente no informa posiciones: entre los rivales revelados, el que más juega TU línea según la lista de tier
 * (`pctLane` = % de sus partidas en esa línea). null si ninguno llega a MIN_LANE_SHARE o hay empate.
 * @param {{championId:number}[]} enemies
 * @param {Map<number,object>} tierRows  filas de la lista de tier de la línea
 */
export function inferOpponent(enemies, tierRows) {
  let best = null, tie = false
  for (const e of enemies ?? []) {
    const share = tierRows?.get(e.championId)?.pctLane
    if (!isNum(share) || share < MIN_LANE_SHARE) continue
    if (!best || share > best.share) { best = { id: e.championId, share }; tie = false } else if (share === best.share) tie = true
  }
  return best && !tie ? best.id : null
}

/**
 * Tabla `enemy[línea]` de la página del rival → su win rate DEL CAMPEÓN contra él (100 − wr del rival), ordenada de mejor a peor.
 * `baseOf(cid)` (win rate medio del campeón en la línea) permite calcular la ventaja sobre su media (`edge`).
 * @returns {{cid:number, wr:number, edge:number|null, n:number, low:boolean}[]}  todas las filas con al menos MIN_SHOWN_GAMES
 */
export function matchupsVs(rivalRows, baseOf = () => null) {
  const out = []
  for (const raw of rivalRows ?? []) {
    const r = parseRow(raw)
    if (!r || r.n < MIN_SHOWN_GAMES) continue
    const wr = round1(100 - r.wr)
    const base = baseOf(r.cid)
    out.push({ cid: r.cid, wr, edge: isNum(base) ? round1(wr - base) : null, n: r.n, low: r.n < MIN_ROW_GAMES })
  }
  return out.sort((a, b) => b.wr - a.wr)
}

/** Mejores counters: los de mayor win rate contra el rival con muestra suficiente (no `low`). */
export const topCounters = (matchups, limit = COUNTER_LIMIT) => (matchups ?? []).filter((m) => !m.low).slice(0, limit)

/**
 * Lo que consume la interfaz.
 * @returns {{lane:string, tiers:number[], rival:number|null, rivalSource:string|null,
 *            champions:Record<number,{wr:number|null, pr:number|null, br:number|null, games:number, grade:string|null, rank:number|null,
 *                                     vs:{wr:number, edge:number|null, n:number, low:boolean}|null, counter:number|null}>,
 *            counters:{cid:number, wr:number, edge:number|null, n:number, low:boolean}[], vsReason:string|null}}
 */
export function buildOverlayData({ lane, tiers, tierRows, rival = null, rivalSource = null, rivalRows = null, vsReason = null }) {
  const champions = {}
  for (const [cid, row] of tierRows ?? []) {
    const s = statsOfTierRow(row)
    if (s) champions[cid] = { ...s, vs: null, counter: null }
  }
  const base = (cid) => champions[cid]?.wr ?? null
  const all = rivalRows ? matchupsVs(rivalRows, base) : []
  const counters = topCounters(all)
  for (const m of all) {
    const c = champions[m.cid] ?? (champions[m.cid] = { wr: null, pr: null, br: null, games: 0, grade: null, rank: null, vs: null, counter: null })
    c.vs = { wr: m.wr, edge: m.edge, n: m.n, low: m.low }
  }
  counters.forEach((m, i) => { champions[m.cid].counter = i + 1 })
  return { lane, tiers, rival, rivalSource, champions, counters, vsReason }
}
