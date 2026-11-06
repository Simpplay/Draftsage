// easy-coachless/src/domain/sources.js — de dónde salen las recomendaciones: Coachless, LoLalytics o automático (reglas puras)
//
//   coachless   solo Coachless (requiere cuenta; es el comportamiento de siempre y el valor por defecto)
//   lolalytics  solo LoLalytics (sin cuenta, gratis, también para matchups)
//   auto        Coachless si hay sesión; LoLalytics si no la hay, si la cuenta es gratuita y se pide un matchup (en Coachless es premium)
//               o si la primera fuente falla.
// Con una fuente elegida a mano NO hay recurso a la otra: si falla, se ve el error (el usuario decidió).

export const SOURCES = ['coachless', 'lolalytics']
export const SOURCE_MODES = ['auto', ...SOURCES]
export const DEFAULT_SOURCE_MODE = 'coachless'

/** Sanea lo guardado (puede venir de otra versión o estar corrupto). */
export const normalizeSource = (raw) => ({ mode: SOURCE_MODES.includes(raw?.mode) ? raw.mode : DEFAULT_SOURCE_MODE })

/** ¿Este modo exige haber iniciado sesión en Coachless para dar recomendaciones? */
export const needsLogin = (mode) => mode === 'coachless'

/**
 * Fuentes a probar, en orden. Solo `auto` tiene más de una.
 * @param {{mode:string, loggedIn:boolean, premium?:boolean, wantsMatchup?:boolean}} o
 * @returns {('coachless'|'lolalytics')[]}
 */
export function sourceOrder({ mode, loggedIn, premium = false, wantsMatchup = false }) {
  if (mode === 'lolalytics') return ['lolalytics']
  if (mode === 'auto') {
    if (!loggedIn) return ['lolalytics']
    return wantsMatchup && !premium ? ['lolalytics', 'coachless'] : ['coachless', 'lolalytics']
  }
  return ['coachless']
}
