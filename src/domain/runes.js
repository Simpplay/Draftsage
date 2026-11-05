// easy-coachless/src/domain/runes.js — constantes de runas (ids de Riot) y relación keystone → árbol
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
