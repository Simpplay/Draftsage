// easy-coachless/src/domain/spells.js — qué hechizos tienen sentido según el modo de juego y el rol (reglas puras)
//
// Los datos de Coachless son de Grieta del Invocador (ranked). Estas reglas son una red de seguridad para que el panel
// nunca proponga un hechizo que el cliente va a rechazar o que no tiene sentido:
//  - Jungla: Aplastar es obligatorio.            - Otras líneas: nunca Aplastar.
//  - ARAM: sin Aplastar ni Teletransporte.        - Grieta clásica: sin Claridad ni Marca (son de ARAM).
//  - Arena (CHERRY): no hay hechizos de invocador.
// El modo viene de /lol-gameflow/v1/session → gameData.queue.gameMode (❓ sin verificar en el cliente real).

import { FLASH } from './configuration.js'

export { FLASH }
export const SPELL = { CLEANSE: 1, EXHAUST: 3, FLASH, GHOST: 6, HEAL: 7, SMITE: 11, TELEPORT: 12, CLARITY: 13, IGNITE: 14, BARRIER: 21, MARK: 32 }

const ARAM_MODES = new Set(['ARAM', 'KIWI']) // KIWI = ARAM Caos (❓)
const NO_SPELL_MODES = new Set(['CHERRY'])

/**
 * @param {{mode?: string, role?: number}} ctx
 * @returns {{id:string, none:boolean, exclude:number[], require:number|null}}
 */
export function spellRules({ mode, role } = {}) {
  const m = String(mode ?? '').toUpperCase()
  if (NO_SPELL_MODES.has(m)) return { id: 'none', none: true, exclude: [], require: null }
  if (ARAM_MODES.has(m)) return { id: 'aram', none: false, exclude: [SPELL.SMITE, SPELL.TELEPORT], require: null }
  const exclude = m === 'CLASSIC' ? [SPELL.CLARITY, SPELL.MARK] : []
  if (role === 1) return { id: 'jungle', none: false, exclude, require: SPELL.SMITE }
  if (Number.isInteger(role) && role >= 0 && role <= 4) return { id: 'lane', none: false, exclude: [...exclude, SPELL.SMITE], require: null }
  return { id: 'open', none: false, exclude, require: null }
}

/** Identidad de las reglas (para claves de caché). */
export const rulesKey = (r) => `${r.id}:${r.exclude.join('.')}:${r.require ?? ''}`

/** ¿Es una pareja de hechizos aceptable con estas reglas? */
export function isValidPair(pair, rules) {
  if (rules.none || !Array.isArray(pair) || pair.length !== 2) return false
  const [a, b] = pair
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0 || a === b) return false
  if (rules.exclude.includes(a) || rules.exclude.includes(b)) return false
  return rules.require == null || pair.includes(rules.require)
}

/** Posición (0/1) del hechizo que se puede cambiar por una alternativa: ni Destello ni el obligatorio. */
export function replaceableIndex(pair, rules) {
  const i = pair.findIndex((id) => id !== FLASH && id !== rules.require)
  if (i >= 0) return i
  // [Aplastar, Destello]: se puede cambiar Destello, nunca Aplastar
  return rules.require != null ? pair.findIndex((id) => id !== rules.require) : 1
}
