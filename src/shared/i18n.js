// easy-coachless/src/shared/i18n.js — textos de la interfaz en español e inglés
//
// t('clave', ...args) devuelve el texto en el idioma activo; {0}, {1}… se sustituyen por los argumentos.
// Si falta una clave en el idioma activo se usa la del español, y si tampoco existe, la propia clave.
// Los logs y los comentarios del código siguen en español: no pasan por aquí.
// El idioma lo fija application/preferences.js (ajuste «auto» = el del cliente/navegador).

import { STRINGS } from './strings.js'

export const LANGS = ['es', 'en']
let current = 'es'

/** 'auto' | 'es' | 'en' → 'es' | 'en'. «auto» mira el idioma del navegador del cliente (es-* → español, el resto → inglés). */
export function resolveLang(pref, navLang = globalThis.navigator?.language) {
  if (LANGS.includes(pref)) return pref
  return String(navLang ?? 'es').toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function setLang(pref) { current = resolveLang(pref); return current }
export const getLang = () => current

export function t(key, ...args) {
  const s = STRINGS[current]?.[key] ?? STRINGS.es[key] ?? key
  return args.length ? s.replace(/\{(\d+)\}/g, (m, i) => (args[i] ?? m)) : s
}
