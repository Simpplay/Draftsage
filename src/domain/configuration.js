// draftsage/src/domain/configuration.js — de una recomendación a lo que se escribe en el cliente (reglas puras)
//
// Páginas de runas del LCU: selectedPerkIds = 9 ids en este orden:
//   [keystone, fila1, fila2, fila3, secundaria1, secundaria2, fragmento1, fragmento2, fragmento3]
// Los fragmentos de la build de Coachless (selectedShards) ya vienen en orden de fila (ofensa, flexible, defensa).

export const OWN_PREFIX = '[DS] ' // marca de las páginas que crea el plugin: solo se sobrescriben las que la llevan
export const NAME_MAX = 25        // el cliente recorta/rechaza nombres de página más largos
export const FLASH = 4            // id del hechizo Destello

/** Nombre de la página propia: «[DS] Kai'Sa vs Jinx» (recortado al máximo del cliente). */
export function runePageName(champion, opponent) {
  const base = opponent ? `${champion} vs ${opponent}` : String(champion)
  return (OWN_PREFIX + base).slice(0, NAME_MAX)
}

/**
 * Página de runas lista para enviar al LCU.
 * @returns {{ok:true, page:object}|{ok:false, reason:'incomplete'|'invalid'}}
 *   'incomplete': falta alguna runa o fragmento (nunca se envía una página a medias)
 *   'invalid': ids repetidos o árboles incoherentes
 */
export function buildRunePage(rec, name) {
  const primary = [rec?.keystone?.rune, ...(rec?.primaryPicks ?? []).map((p) => p?.rune)]
  const secondary = (rec?.secondaryPicks ?? []).map((p) => p?.rune)
  const shards = rec?.shards ?? []
  const ids = [...primary, ...secondary, ...shards]
  if (primary.length !== 4 || secondary.length !== 2 || shards.length !== 3 || ids.some((x) => !Number.isInteger(x) || x <= 0)) {
    return { ok: false, reason: 'incomplete' }
  }
  if (!rec.primaryTree || !rec.secondaryTree || rec.primaryTree === rec.secondaryTree) return { ok: false, reason: 'incomplete' }
  if (new Set(ids.slice(0, 6)).size !== 6) return { ok: false, reason: 'invalid' }
  return {
    ok: true,
    page: { name, primaryStyleId: rec.primaryTree, subStyleId: rec.secondaryTree, selectedPerkIds: ids, current: true },
  }
}

/**
 * Pareja de hechizos. Destello va en la tecla elegida (flashKey 'd' → hechizo 1, 'f' → hechizo 2).
 * @returns {{ok:true, spell1Id:number, spell2Id:number}|{ok:false, reason:'incomplete'}}
 */
export function buildSpellPair(rec, flashKey = 'f') {
  const ids = (rec?.spells ?? []).map((s) => s?.spell)
  if (ids.length !== 2 || ids.some((x) => !Number.isInteger(x) || x <= 0) || ids[0] === ids[1]) return { ok: false, reason: 'incomplete' }
  let [a, b] = ids
  if (a === FLASH && flashKey === 'f') [a, b] = [b, a]
  else if (b === FLASH && flashKey === 'd') [a, b] = [b, a]
  return { ok: true, spell1Id: a, spell2Id: b }
}

export const samePerks = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i])
