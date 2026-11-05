// easy-coachless/src/domain/web.js — enlaces a coachless.gg (reglas puras)
//
// Forma de la URL: https://coachless.gg/builds/{campeón}?role={rol}&matchup={rival}
//   p. ej. https://coachless.gg/builds/caitlyn?role=adc&matchup=jinx
// Verificado: `/builds/{slug}` (kaisa, thresh) y `role=support`. ❓ Sin verificar: los slugs de campeones con nombres raros
// (Wukong, Nunu y Willump, Renata…) y que `matchup` acepte el mismo slug; si algo no cuadra, solo hay que ampliar SLUG_EXCEPTIONS.

export const SITE = 'https://coachless.gg'
const ROLE_SLUGS = ['top', 'jungle', 'mid', 'adc', 'support'] // 0..4; el 5 (rol principal) no lleva parámetro
const SLUG_EXCEPTIONS = { monkeyking: 'wukong' }              // alias interno del cliente → slug de la web

const strip = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

/** Slug del campeón a partir de la ficha del catálogo ({ alias?, name }). '' si no se puede deducir. */
export function championSlug(info) {
  const base = strip(info?.alias) || (String(info?.name ?? '').startsWith('#') ? '' : strip(info?.name))
  return SLUG_EXCEPTIONS[base] ?? base
}

/** URL de la build en la web, o null si falta el campeón. `champion`/`opponent` son slugs. */
export function buildsUrl({ champion, role, opponent } = {}) {
  if (!champion) return null
  const params = []
  if (Number.isInteger(role) && ROLE_SLUGS[role]) params.push('role=' + ROLE_SLUGS[role])
  if (opponent) params.push('matchup=' + encodeURIComponent(opponent))
  return `${SITE}/builds/${encodeURIComponent(champion)}` + (params.length ? '?' + params.join('&') : '')
}
