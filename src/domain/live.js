// draftsage/src/domain/live.js — seguimiento de la build durante la partida (reglas puras)
//
// Entrada: los ítems que tienes (Live Client Data API → `playeritems`), tu oro y la maquetación de ítems (domain/items.js).
// Salida: qué ítems de la build ya tienes y cuál es el siguiente por comprar, con el oro que falta contando los componentes que ya llevas.
// `info(id)` = { priceTotal, from:number[] } del catálogo del cliente, o null si no se conoce.

import { roleFromPosition } from './lobby.js'

/** Mapa ítem → cantidad con lo que llevas (ids inválidos fuera). */
export function ownedCounts(items) {
  const m = new Map()
  for (const i of items ?? []) {
    const id = i?.item
    if (!Number.isInteger(id) || id <= 0) continue
    m.set(id, (m.get(id) ?? 0) + (Number.isInteger(i.count) && i.count > 0 ? i.count : 1))
  }
  return m
}

/**
 * Oro que costaría tener `id` ahora mismo, aprovechando los componentes (o el propio ítem) que ya llevas.
 * 0 si ya lo tienes; null si el catálogo no conoce el ítem o alguno de sus componentes.
 * @param {number} id
 * @param {Map<number,number>} owned  no se modifica
 * @param {(id:number)=>({priceTotal:number, from:number[]}|null)} info
 */
export function remainingCost(id, owned, info) {
  const pool = new Map(owned)
  const go = (item, depth) => {
    if ((pool.get(item) ?? 0) > 0) { pool.set(item, pool.get(item) - 1); return 0 }
    const it = info(item)
    if (!it || !Number.isFinite(it.priceTotal) || depth > 6) return null
    const parts = it.from ?? []
    if (!parts.length) return it.priceTotal
    let sum = 0, partsTotal = 0
    for (const p of parts) {
      const pi = info(p)
      if (!pi || !Number.isFinite(pi.priceTotal)) return null
      partsTotal += pi.priceTotal
      const r = go(p, depth + 1)
      if (r == null) return null
      sum += r
    }
    return sum + Math.max(0, it.priceTotal - partsTotal) // + coste de la receta
  }
  return go(id, 0)
}

/**
 * @param {{core:number[], next:{item:number}[]}} layout  maquetación de domain/items.js
 * @param {{item:number,count?:number}[]} items           lo que llevas
 * @param {number} gold
 * @param {(id:number)=>object|null} info
 * @returns {{owned:Set<number>, done:boolean, next:null|{item:number, cost:number, missing:number, progress:number, ready:boolean}}}
 *   owned: ids que llevas; next: el primer ítem del núcleo (o el mejor «siguiente») que aún no tienes; done: ya tienes todo el núcleo
 */
export function trackBuild(layout, items, gold, info) {
  const counts = ownedCounts(items)
  const owned = new Set(counts.keys())
  const targets = [...(layout?.core ?? []), ...(layout?.next ?? []).slice(0, 1).map((s) => s.item)]
  const id = targets.find((t) => !owned.has(t))
  if (id == null) return { owned, done: targets.length > 0, next: null }
  const cost = remainingCost(id, counts, info)
  if (cost == null) return { owned, done: false, next: null }
  const g = Number.isFinite(gold) ? gold : 0
  return { owned, done: false, next: { item: id, cost, missing: Math.max(0, Math.ceil(cost - g)), progress: cost <= 0 ? 1 : Math.max(0, Math.min(1, g / cost)), ready: g >= cost } }
}

/**
 * Contexto de la partida (MatchContext) a partir de una foto de la Live Client Data API; sirve para recuperar la recomendación si el cliente
 * se cerró y volvió a abrirse en plena partida (el plugin ya no recuerda la selección). `findChampion(alias|nombre)` → { id } | null.
 * No se conoce el rango de la lobby (la partida en curso no lo expone): se usan los rangos por defecto.
 * @returns {import('./match-context.js').MatchContext|null}  null si no se reconoce al campeón
 */
export function contextFromSnapshot(snap, findChampion) {
  if (!snap?.ok || !snap.me) return null
  const idOf = (p) => (findChampion(p.alias) ?? findChampion(p.championName))?.id ?? 0
  const championId = idOf(snap.me)
  if (!championId) return null
  const pos = (p) => String(p.position ?? '').toLowerCase()
  const mine = snap.me
  const others = (snap.players ?? []).filter((p) => p !== mine && (p.alias !== mine.alias || p.team !== mine.team))
  const toList = (list) => list.map((p) => ({ championId: idOf(p), position: pos(p) })).filter((p) => p.championId > 0)
  const enemies = toList(others.filter((p) => p.team !== mine.team))
  const opponent = pos(mine) ? enemies.find((e) => e.position === pos(mine))?.championId : undefined
  return {
    championId, role: roleFromPosition(mine.position), ...(opponent && { opponentChampionId: opponent }), ...(snap.mode && { mode: snap.mode }),
    enemies, allies: toList(others.filter((p) => p.team === mine.team)), source: 'lcu',
  }
}
