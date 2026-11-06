// easy-coachless/src/domain/items.js — ítems de una build de Coachless (reglas puras: sin DOM, sin fetch)
//
// Entrada: una build normalizada por infrastructure/coachless/client.js (`builds`) y, opcionalmente, estadísticas sueltas de
// GetGlobalItemStatistics (botas y tercer ítem). Salida: un «plan» con los ítems clasificados y una función de maquetación
// que decide qué se ve y en qué orden (sin repetir ítems entre filas).
//
// ⚠ Los tipos de bloque (`itemBlocks[].type`) están DEDUCIDOS del contenido observado (docs/coachless-api.md §4.1):
//    0 inicial · 1 primera vuelta · 2 recorrido del núcleo (componentes + legendarios + botas) · 3 alternativas («elige uno») · 4 situacionales.
// Si Coachless cambia el significado, lo único que se rompe es qué ítem sale en qué fila; nunca se inventa un ítem.

export const BLOCK = { STARTER: 0, EARLY: 1, CORE: 2, OPTIONS: 3, SITUATIONAL: 4 }
export const LIMITS = { starters: 2, early: 4, boots: 3, next: 3, options: 4, situational: 6 }
export const TIER_LETTERS = ['S', 'A', 'B'] // 🔶 `tier` 0/1/2 de la build

/** Letra de la categoría de la build (S/A/B) o null si no se conoce. */
export const tierLetter = (tier) => (Number.isInteger(tier) ? (TIER_LETTERS[tier] ?? null) : null)

const validId = (x) => (Number.isInteger(x) && x > 0 ? x : null)

// Estadística de un ítem: con 0 partidas el WPA que manda la API es un 0 de relleno, no un dato → null.
const statOf = (e) => {
  const item = validId(e?.item)
  if (!item) return null
  const occurrence = Number.isFinite(e.occurrence) && e.occurrence > 0 ? e.occurrence : 0
  const wpa = occurrence > 0 && Number.isFinite(e.wpa) ? e.wpa : null
  // `wr` (% de victorias) lo aportan fuentes sin WPA (Lolalytics); con Coachless no viene y no se añade.
  return { item, wpa, occurrence, ...(Number.isFinite(e.wr) && { wr: e.wr }), ...(e.share != null && { share: e.share }), ...(e.highlighted && { highlighted: true }) }
}

// Lista sin repetidos (gana la primera aparición) y sin ids inválidos.
const stats = (list) => {
  const seen = new Set()
  const out = []
  for (const e of list ?? []) {
    const s = statOf(e)
    if (s && !seen.has(s.item)) { seen.add(s.item); out.push(s) }
  }
  return out
}

const byUse = (a, b) => b.occurrence - a.occurrence

/**
 * Elige la build cuyos ítems se enseñan: la de la runa clave elegida (la mejor categoría, y a igualdad la más jugada);
 * si no hay ninguna con esa runa, la mejor en general (`keystoneMatch: false`).
 * @returns {{build:object, keystoneMatch:boolean}|null}
 */
export function pickBuild(builds, keystone) {
  const list = (builds ?? []).filter((b) => b && typeof b === 'object')
  if (!list.length) return null
  const rank = (a, b) => (a.tier ?? 99) - (b.tier ?? 99) || (b.occurrence ?? 0) - (a.occurrence ?? 0)
  const same = list.filter((b) => b.keystone === keystone).sort(rank)
  if (same.length) return { build: same[0], keystoneMatch: true }
  return { build: [...list].sort(rank)[0], keystoneMatch: false }
}

/**
 * @typedef {{item:number, wpa:number|null, occurrence:number, wr?:number, share?:number, highlighted?:true}} ItemStat
 * @typedef {Object} ItemPlan
 * @property {number|null} tier           0 S · 1 A · 2 B (🔶)
 * @property {number|null} winrate        % de victorias de la build
 * @property {number} games               partidas de la build
 * @property {boolean} keystoneMatch      false = no había build con la runa clave elegida; son los ítems de la más usada
 * @property {number[]} starters          ítems iniciales
 * @property {number[]} core              1.º y 2.º ítem completos
 * @property {ItemStat[]} path            recorrido del núcleo, en el orden de la API (incluye botas y componentes)
 * @property {ItemStat[]} early           primera vuelta
 * @property {ItemStat[]} options         alternativas («elige uno»)
 * @property {ItemStat[]} situational     situacionales (los destacados primero)
 * @property {ItemStat[]} boots           botas ordenadas por WPA (GetGlobalItemStatistics, itemType 2); puede venir vacío
 * @property {ItemStat[]} next            3.er ítem ordenado por WPA (GetGlobalItemStatistics, itemSlots [3]); puede venir vacío
 */

/**
 * Construye el plan de ítems de una build.
 * @param {object|null} build   build normalizada (ver client.builds)
 * @param {{keystoneMatch?:boolean, boots?:object[], next?:object[]}} [extra]
 * @returns {ItemPlan|null}  null si no hay build o no trae ningún ítem
 */
export function buildItemPlan(build, { keystoneMatch = true, boots = [], next = [] } = {}) {
  if (!build) return null
  const block = (type) => (build.itemBlocks ?? []).filter((b) => b?.type === type).flatMap((b) => b.items ?? [])
  const uniq = (ids) => [...new Set((ids ?? []).map(validId).filter(Boolean))]
  const plan = {
    tier: Number.isInteger(build.tier) ? build.tier : null,
    winrate: Number.isFinite(build.winrate) ? build.winrate : null,
    games: Number.isFinite(build.occurrence) && build.occurrence > 0 ? build.occurrence : 0,
    keystoneMatch,
    starters: uniq(build.starterIds).slice(0, LIMITS.starters),
    core: uniq([build.firstItemId, build.secondItemId]),
    path: stats(block(BLOCK.CORE)),
    early: stats(block(BLOCK.EARLY)).sort(byUse),
    options: stats(block(BLOCK.OPTIONS)).sort(byUse),
    situational: stats(block(BLOCK.SITUATIONAL)).sort((a, b) => Number(!!b.highlighted) - Number(!!a.highlighted) || byUse(a, b)),
    boots: stats(boots),
    next: stats(next),
  }
  const any = plan.starters.length || plan.core.length || plan.path.length || plan.early.length || plan.options.length || plan.situational.length
  return any ? plan : null
}

/**
 * Qué se ve y en qué fila. Ningún ítem sale en dos filas (el núcleo manda, luego las botas…).
 * `isBoots(id)` lo da el catálogo del cliente (puede ser `() => false`: entonces solo salen las botas que mandó la API).
 * `compact` (Champion Select): solo inicio, botas, núcleo y siguientes; completo (en partida): todas las filas.
 * @param {ItemPlan} plan
 * @param {{isBoots?:(id:number)=>boolean, compact?:boolean}} [o]
 */
export function layoutItems(plan, { isBoots = () => false, compact = false } = {}) {
  if (!plan) return null
  const used = new Set([...plan.core, ...plan.starters])
  const fresh = (s) => !used.has(s.item)
  const take = (list, max) => {
    const out = []
    for (const s of list) {
      if (out.length >= max) break
      if (fresh(s)) { out.push(s); used.add(s.item) } // al marcarlo como usado, un repetido dentro de la misma lista tampoco entra
    }
    return out
  }
  // Botas: las que mandó la API; si no hay, las que aparecen en el recorrido o en la primera vuelta.
  const bootsPool = plan.boots.length ? plan.boots : [...plan.path, ...plan.early].filter((s) => isBoots(s.item))
  const boots = take(bootsPool, LIMITS.boots)
  const notBoots = (s) => !isBoots(s.item)
  const next = take(plan.next.filter(notBoots), LIMITS.next)
  if (compact) return { tier: plan.tier, winrate: plan.winrate, games: plan.games, keystoneMatch: plan.keystoneMatch, starters: plan.starters, boots, core: plan.core, next, early: [], options: [], situational: [] }
  const early = take(plan.early.filter(notBoots), LIMITS.early)
  const options = take(plan.options.filter(notBoots), LIMITS.options)
  const situational = take(plan.situational.filter(notBoots), LIMITS.situational)
  return { tier: plan.tier, winrate: plan.winrate, games: plan.games, keystoneMatch: plan.keystoneMatch, starters: plan.starters, boots, core: plan.core, next, early, options, situational }
}

/** ¿Hay algo que enseñar en esta maquetación? */
export const hasItems = (l) => !!l && !!(l.starters.length || l.boots.length || l.core.length || l.next.length || l.early.length || l.options.length || l.situational.length)
