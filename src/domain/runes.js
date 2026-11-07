// draftsage/src/domain/runes.js — constantes de runas (ids de Riot) y relación keystone → árbol
// Los nombres e iconos se piden al cliente (application/catalog.js); aquí solo ids, para decidir sin red.
// Fuente: runesReforged.json de Data Dragon (temporada 2026). Si el cliente aporta su propia lista, tiene prioridad.

export const TREES = {
  8000: { name: 'Precisión', keystones: [8005, 8008, 8021, 8010] },
  8100: { name: 'Dominación', keystones: [8112, 8128, 9923] },
  8200: { name: 'Brujería', keystones: [8214, 8229, 8230, 8992] },
  8300: { name: 'Inspiración', keystones: [8351, 8360, 8369] },
  8400: { name: 'Valor', keystones: [8437, 8439, 8465] },
}
export const TREE_IDS = Object.keys(TREES).map(Number)

/** @param {Map<number,number>} [extra] keystone → árbol aportado por el cliente (tiene prioridad). */
export function treeOfKeystone(keystoneId, extra) {
  const fromClient = extra?.get?.(keystoneId)
  if (fromClient) return fromClient
  return TREE_IDS.find((t) => TREES[t].keystones.includes(keystoneId))
}

// Runas cuyo id no sigue la regla «centenas = árbol» (Precisión usa 91xx y 8299; Hail of Blades es 9923 y es de Dominación).
const RUNE_TREE_EXCEPTIONS = { 9101: 8000, 9103: 8000, 9104: 8000, 9105: 8000, 9111: 8000, 8299: 8000, 9923: 8100 }

/**
 * Árbol de CUALQUIER runa (no solo keystones). Prioridad: lo que aporte el cliente (`extra`: runa → árbol), la tabla de keystones,
 * las excepciones conocidas y por último «centenas». undefined si no se puede deducir.
 * @param {Map<number,number>} [extra]
 */
export function treeOfRune(runeId, extra) {
  const fromClient = extra?.get?.(runeId)
  if (fromClient) return fromClient
  const ks = treeOfKeystone(runeId)
  if (ks) return ks
  if (RUNE_TREE_EXCEPTIONS[runeId]) return RUNE_TREE_EXCEPTIONS[runeId]
  const g = Math.floor(runeId / 100) * 100
  return TREE_IDS.includes(g) ? g : undefined
}
