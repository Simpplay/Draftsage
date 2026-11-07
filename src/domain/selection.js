// draftsage/src/domain/selection.js — qué runa/hechizo elegir de una lista de estadísticas (reglas puras)
//
// Cada entrada: { rune|spell, wpa, occurrence }. wpa = Win Probability Added (puntos %; mayor es mejor).
// Para no recomendar opciones raras con mucho ruido (p. ej. 119 partidas), solo cuentan las que tengan
// al menos `minShare` de las partidas del grupo (y `minAbs` partidas); si ninguna llega, gana la más jugada.
// (Con ~7 000 partidas el error típico del WPA ronda ±0,6 puntos: una ventaja menor es ruido.)

export const MIN_SHARE = 0.10        // una opción debe tener al menos el 10 % de las partidas de su grupo
export const MIN_TREE_SHARE = 0.10   // un árbol secundario, al menos el 10 % de las partidas del árbol más usado
export const MIN_ABS = 50

const better = (a, b) => (b.wpa > a.wpa || (b.wpa === a.wpa && b.occurrence > a.occurrence) ? b : a)

export function pickBest(entries, { minShare = MIN_SHARE, minAbs = MIN_ABS, exclude } = {}) {
  const list = (entries ?? []).filter((e) => e && Number.isFinite(e.wpa) && e.occurrence > 0 && !(exclude && exclude(e)))
  if (!list.length) return null
  const total = list.reduce((s, e) => s + e.occurrence, 0)
  const ok = list.filter((e) => e.occurrence >= Math.max(minAbs, total * minShare))
  const pool = ok.length ? ok : [list.reduce((a, b) => (b.occurrence > a.occurrence ? b : a))]
  return pool.reduce(better)
}

/**
 * Todas las opciones con muestra suficiente, de mejor a peor WPA (para ofrecer alternativas con un clic).
 * Cada una lleva `share` = fracción de las partidas del grupo. Aquí no hay «la más jugada» de reserva: puede salir vacío.
 */
export function rankBest(entries, { minShare = MIN_SHARE, minAbs = MIN_ABS, exclude } = {}) {
  const list = (entries ?? []).filter((e) => e && Number.isFinite(e.wpa) && e.occurrence > 0 && !(exclude && exclude(e)))
  const total = list.reduce((s, e) => s + e.occurrence, 0)
  return list
    .filter((e) => e.occurrence >= Math.max(minAbs, total * minShare))
    .map((e) => ({ ...e, share: e.occurrence / total }))
    .sort((a, b) => b.wpa - a.wpa || b.occurrence - a.occurrence)
}

/** Keystone: umbral de muestra más bajo (hay pocos y uno domina). */
export const KEYSTONE_MIN_SHARE = 0.03
export const pickKeystone = (entries) => pickBest(entries, { minShare: KEYSTONE_MIN_SHARE })
export const rankKeystones = (entries) => rankBest(entries, { minShare: KEYSTONE_MIN_SHARE })

/** Una runa por fila (null si la fila está vacía o sin datos). */
export const pickRows = (rows) => (rows ?? []).map((r) => pickBest(r))

/**
 * Árbol secundario: de cada árbol candidato se toma la mejor runa de cada fila y se queda con las dos mejores
 * de filas distintas; gana el árbol con mayor suma de WPA.
 * @param {Record<number, (object[])[]>} treeRows  árbol → [fila1, fila2, fila3]
 * @returns {{tree:number, picks:object[], score:number}|null}  picks ordenadas por fila
 */
export function pickSecondary(treeRows) {
  const trees = Object.entries(treeRows ?? {}).map(([tree, rows]) => ({
    tree: Number(tree), rows, total: (rows ?? []).flat().reduce((s, x) => s + (x?.occurrence ?? 0), 0),
  }))
  // Un árbol casi nunca usado como secundario (p. ej. 465 partidas frente a 100 000) puede tener un WPA enorme por azar.
  const maxTotal = Math.max(0, ...trees.map((t) => t.total))
  let best = null
  for (const { tree, rows, total } of trees) {
    if (total < maxTotal * MIN_TREE_SHARE) continue
    const cands = pickRows(rows).map((p, row) => (p ? { ...p, row } : null)).filter(Boolean)
    if (cands.length < 2) continue
    const top2 = [...cands].sort((a, b) => b.wpa - a.wpa || b.occurrence - a.occurrence).slice(0, 2)
    const score = top2[0].wpa + top2[1].wpa
    const occ = top2[0].occurrence + top2[1].occurrence
    if (!best || score > best.score || (score === best.score && occ > best.occ)) {
      best = { tree, picks: top2.sort((a, b) => a.row - b.row), score, occ }
    }
  }
  return best && { tree: best.tree, picks: best.picks, score: best.score }
}

/** Hechizo: mejor WPA con muestra suficiente, ignorando los ids de `excludeIds`. */
export const pickSpell = (entries, excludeIds = []) =>
  pickBest(entries, { exclude: (e) => excludeIds.includes(e.spell) })
