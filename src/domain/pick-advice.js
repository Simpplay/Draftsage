// easy-coachless/src/domain/pick-advice.js — consejero de picks: reglas puras (sin red ni DOM)
//
// Fusiona dos señales (docs/ITERO-INTEGRATION.md §7):
//   · iTero  → cómo encaja cada campeón en la COMPOSICIÓN completa (`pred`, solo útil de forma RELATIVA dentro de una respuesta);
//   · LoLalytics → cómo le va contra el rival de tu línea, con tamaño de muestra (`vs` de domain/overlay-stats.js).
//   S(c) = Δi(c) + w · Es(c)     Δi = pred − mediana de los candidatos que pasan los filtros
//                                Es = (win rate contra el rival − su media) · n / (n + n0)   (encogido por muestra)
// El peso `w` es moderado (0,5) porque iTero ya incluye parte del counter de línea: sumar LoLalytics entero lo contaría dos veces.
// Nunca se devuelve la probabilidad absoluta de iTero (está inflada y depende del lado/rango): solo puntos relativos.
// La discrepancia entre fuentes se MUESTRA (`agree`), no se esconde.

import { LANES, laneOfPosition, nameKey } from './itero.js'

export const MIN_LANE_SHARE = 30 // % mínimo de las partidas de un campeón en una línea para colocarlo en ella (igual que overlay-stats)
export const DEFAULTS = Object.freeze({
  weight: 0.5,        // peso de LoLalytics en la mezcla (0 = solo iTero)
  minPick: 0.0025,    // uso mínimo (fracción 0–1) como en la web de iTero: oculta fuera de línea y raros
  minGames: 1000,     // partidas mínimas del campeón en la línea
  n0: 300,            // muestra a partir de la cual el matchup pesa la mitad
  top: 5,             // cuántos picks se enseñan
  agreeTop: 10,       // «ambas fuentes lo ven bien» = está en el top N de iTero y su matchup es favorable
  vetoWr: 47,         // matchup malo: win rate contra el rival por debajo de esto con ≥ vetoGames partidas
  vetoGames: 500,
  badEdge: -2,        // o ventaja sobre su media ≤ esto con muestra suficiente (no `low`)
})

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const round1 = (x) => Math.round(x * 10) / 10

export function median(xs) {
  const v = xs.filter(isNum).sort((a, b) => a - b)
  if (!v.length) return 0
  const m = v.length >> 1
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

/**
 * Coloca en su línea a los campeones revelados de un equipo.
 *  · los que traen posición del LCU (`position`: top/jungle/…) van directos (en ranked, tu equipo; el rival casi nunca);
 *  · los demás se reparten entre las líneas libres maximizando la cuota de línea (`share(cid, LANE)` = % de sus partidas en ella);
 *  · si el reparto es dudoso (otro casi igual de bueno los pone en otra línea) ese campeón queda FUERA: mejor un hueco que un dato falso.
 * @param {{championId:number, position?:string}[]} members
 * @param {(cid:number, lane:string)=>number|null} share
 * @returns {Record<string, number>}  { LANE: championId }
 */
export function assignLanes(members, share, { minShare = MIN_LANE_SHARE, slack = 15 } = {}) {
  const byLane = {}
  const unknown = []
  for (const m of members ?? []) {
    const lane = laneOfPosition(m.position)
    if (lane && !byLane[lane]) byLane[lane] = m.championId
    else unknown.push(m.championId)
  }
  const free = LANES.filter((l) => !byLane[l])
  const sols = []
  const rec = (i, used, assign, score) => {
    if (i === unknown.length) { sols.push({ assign, score }); return }
    rec(i + 1, used, [...assign, null], score) // sin colocar
    for (const l of free) {
      if (used.has(l)) continue
      const s = share(unknown[i], l)
      if (isNum(s) && s >= minShare) rec(i + 1, new Set([...used, l]), [...assign, l], score + s)
    }
  }
  rec(0, new Set(), [], 0)
  if (!sols.length) return byLane
  const best = Math.max(...sols.map((s) => s.score))
  const near = sols.filter((s) => s.score >= best - slack)
  const top = near.find((s) => s.score === best)
  unknown.forEach((cid, i) => {
    const lane = top.assign[i]
    if (lane && near.every((s) => s.assign[i] === lane)) byLane[lane] = cid
  })
  return byLane
}

const pct = (mult) => (isNum(mult) ? round1((mult - 1) * 100) : null)

/**
 * Por qué encaja (chips para la interfaz, sin texto): sinergia con un aliado, counter contra un rival, punto débil, escalado y reparto de daño.
 * @param {object} c  candidato normalizado (domain/itero.js)
 * @param {{allyLanes:string[], enemyLanes:string[]}} reveal  líneas con campeón ya revelado (solo se explica con lo que se ve)
 * @returns {{kind:'syn'|'ctr'|'weak'|'scale'|'dmg', lane?:string, phase?:string, value:number|string}[]}
 */
export function chipsOf(c, { allyLanes = [], enemyLanes = [] } = {}) {
  const out = []
  const best = (map, lanes, sign) => {
    let pick = null
    for (const l of lanes) {
      const v = pct(map?.[l])
      if (v == null) continue
      if (!pick || (sign > 0 ? v > pick.value : v < pick.value)) pick = { lane: l, value: v }
    }
    return pick
  }
  const syn = best(c.syn, allyLanes, 1)
  if (syn && syn.value >= 2) out.push({ kind: 'syn', ...syn })
  const ctr = best(c.ctr, enemyLanes, 1)
  if (ctr && ctr.value >= 2) out.push({ kind: 'ctr', ...ctr })
  const weak = best(c.ctr, enemyLanes, -1)
  if (weak && weak.value <= -3) out.push({ kind: 'weak', ...weak })
  let phase = null
  for (const p of ['early', 'mid', 'late']) {
    const v = c.scale?.[p]
    if (isNum(v) && v >= 0.01 && (!phase || v > phase.v)) phase = { p, v }
  }
  if (phase) out.push({ kind: 'scale', phase: phase.p, value: round1(phase.v * 100) })
  if (isNum(c.adRatio)) out.push({ kind: 'dmg', value: c.adRatio > 65 ? 'ad' : c.adRatio < 35 ? 'ap' : 'balanced' })
  return out
}

/**
 * Ordena los candidatos de iTero y los mezcla con la ventaja de matchup de LoLalytics.
 * @param {{candidates:object[], idOf:(name:string)=>number|null, stats?:object|null, banned?:string[], reveal?:object, options?:object}} p
 *   stats = datos de application/overlay.js (`champions[cid].vs = {wr, edge, n, low}`); null/sin rival → solo iTero.
 * @returns {{picks:object[], blended:boolean, pool:number}}
 */
export function rankPicks({ candidates, idOf, stats = null, banned = [], reveal = {}, options = {} }) {
  const o = { ...DEFAULTS, ...options }
  const banSet = new Set(banned.map(nameKey))
  const pool = (candidates ?? []).filter((c) => c.pick >= o.minPick && c.count >= o.minGames && !banSet.has(nameKey(c.name)))
  if (!pool.length) return { picks: [], blended: false, pool: 0 }
  const med = median(pool.map((c) => c.pred))
  const byDelta = [...pool].sort((a, b) => b.pred - a.pred)
  const topSet = new Set(byDelta.slice(0, o.agreeTop).map((c) => c.name))
  let blended = false

  const rows = []
  for (const c of pool) {
    const cid = idOf(c.name)
    if (cid == null) continue // sin id no hay icono ni forma de enlazarlo con LoLalytics
    const vs = stats?.champions?.[cid]?.vs ?? null
    const usable = !!vs && isNum(vs.edge) && isNum(vs.n) && vs.n > 0
    const shrunk = usable ? vs.edge * (vs.n / (vs.n + o.n0)) : 0
    if (usable) blended = true
    const delta = c.pred - med
    const score = delta + o.weight * shrunk
    let agree = null
    if (topSet.has(c.name) && vs) {
      const bad = (vs.n >= o.vetoGames && vs.wr < o.vetoWr) || (!vs.low && isNum(vs.edge) && vs.edge <= o.badEdge)
      if (bad) agree = 'conflict'
      else if (!vs.low && isNum(vs.edge) && vs.edge > 0) agree = 'agree'
    }
    rows.push({
      championId: cid, name: c.name, score: round1(score), delta: round1(delta), games: c.count, agree,
      matchup: vs ? { wr: vs.wr, edge: vs.edge, n: vs.n, low: !!vs.low } : null,
      chips: chipsOf(c, reveal), _s: score,
    })
  }
  rows.sort((a, b) => b._s - a._s)
  return { picks: rows.slice(0, o.top).map(({ _s, ...r }, i) => ({ rank: i + 1, ...r })), blended, pool: pool.length }
}
