// draftsage/src/domain/pick-filters.js — filtros de la selección de campeones (reglas puras, sin red ni DOM)
//
// El jugador elige QUÉ busca y el plugin deja a la vista solo los campeones que lo cumplen: en las dos listas de picks (matchup de
// LoLalytics y draft de iTero) y, atenuando al resto, en la cuadrícula de Champion Select. Seis filtros, todos opcionales:
//   · clase      — Luchador, Tanque, Mago, Tirador, Asesino, Soporte (varias a la vez: vale cualquiera de las marcadas);
//   · dominio    — maestría del jugador: lo ha jugado / en su pool / main (necesita la maestría de iTero, application/mastery.js);
//   · matchup    — favorable contra el rival de tu línea / de los mejores counters (necesita el rival, datos de LoLalytics);
//   · meta       — fuerte en tu línea ahora mismo (nota S+ … A- de la lista de tier de LoLalytics);
//   · fase       — mejora al equipo al inicio / a mitad / al final de la partida (necesita el consejero de iTero);
//   · daño       — deja el daño del equipo físico (AD), mágico (AP) o equilibrado (necesita el consejero de iTero).
// Un filtro cuya fuente no está disponible (p. ej. «dominio» sin maestría) NO se aplica y la interfaz lo muestra deshabilitado; si la fuente
// está pero no tiene dato de ese campeón, el campeón no cumple el filtro.

import { SCALE_MIN } from './pick-advice.js'

/** Clases como las informa el cliente (`roles` de champion-summary.json, en minúsculas). */
export const CLASSES = Object.freeze(['fighter', 'tank', 'mage', 'marksman', 'assassin', 'support'])
export const MASTERY_STEPS = Object.freeze(['any', 'played', 'pool', 'main'])
export const MATCHUP_STEPS = Object.freeze(['any', 'favorable', 'counter'])
export const META_STEPS = Object.freeze(['any', 'strong'])
export const PHASE_STEPS = Object.freeze(['any', 'early', 'mid', 'late'])
export const DAMAGE_STEPS = Object.freeze(['any', 'ad', 'ap', 'balanced'])

/** Puntos de maestría mínimos de cada nivel de «dominio». */
export const MASTERY_POINTS = Object.freeze({ played: 1, pool: 10_000, main: 40_000 })
/** Notas de la lista de tier que cuentan como «fuerte». */
export const STRONG_GRADES = Object.freeze(['S+', 'S', 'S-', 'A+', 'A', 'A-'])

export const DEFAULT_PICK_FILTERS = Object.freeze({ classes: [], mastery: 'any', matchup: 'any', meta: 'any', phase: 'any', damage: 'any' })

const pick = (value, allowed) => (allowed.includes(value) ? value : 'any')

/** Datos guardados (o escritos a mano) → filtros válidos. Nunca lanza. */
export function normalizePickFilters(raw) {
  const o = raw && typeof raw === 'object' ? raw : {}
  const classes = [...new Set((Array.isArray(o.classes) ? o.classes : []).map((c) => String(c).toLowerCase()).filter((c) => CLASSES.includes(c)))]
  return {
    classes,
    mastery: pick(o.mastery, MASTERY_STEPS),
    matchup: pick(o.matchup, MATCHUP_STEPS),
    meta: pick(o.meta, META_STEPS),
    phase: pick(o.phase, PHASE_STEPS),
    damage: pick(o.damage, DAMAGE_STEPS),
  }
}

/** Cuántos filtros hay activos (cada clase marcada cuenta como parte del mismo filtro «clase»). */
export function activeCount(f) {
  return (f.classes.length ? 1 : 0) + ['mastery', 'matchup', 'meta', 'phase', 'damage'].filter((k) => f[k] !== 'any').length
}
export const isActive = (f) => activeCount(f) > 0

/** Alterna una clase en la lista (marcar/desmarcar). */
export const toggleClass = (f, cls) => ({ ...f, classes: f.classes.includes(cls) ? f.classes.filter((c) => c !== cls) : [...f.classes, cls] })

/** Qué filtros se pueden evaluar con lo que hay ahora mismo. `avail` = { mastery, matchup, itero } (booleanos). Clase y meta dependen de datos que siempre hay o de la lista de tier. */
export const evaluable = (key, avail = {}) => {
  if (key === 'mastery') return !!avail.mastery
  if (key === 'matchup') return !!avail.matchup
  if (key === 'phase' || key === 'damage') return !!avail.itero
  if (key === 'meta') return avail.meta !== false
  return true
}

/**
 * ¿Cumple este campeón los filtros activos?
 * @param {ReturnType<typeof normalizePickFilters>} f
 * @param {{classes?:string[], mastery?:number|null, grade?:string|null, vs?:{wr:number, edge:number|null, low:boolean}|null, counter?:number|null,
 *          scale?:Record<string,number>|null, dmg?:'ad'|'ap'|'balanced'|null}} facts
 * @param {{mastery?:boolean, matchup?:boolean, itero?:boolean, meta?:boolean}} avail  fuentes disponibles; un filtro sin fuente no se aplica
 */
export function matches(f, facts, avail = { mastery: true, matchup: true, itero: true, meta: true }) {
  if (f.classes.length && !(facts.classes ?? []).some((c) => f.classes.includes(c))) return false
  if (f.mastery !== 'any' && evaluable('mastery', avail)) {
    const pts = facts.mastery
    if (!(typeof pts === 'number' && pts >= MASTERY_POINTS[f.mastery])) return false
  }
  if (f.matchup !== 'any' && evaluable('matchup', avail)) {
    const vs = facts.vs
    if (f.matchup === 'favorable' && !(vs && !vs.low && vs.wr > 50)) return false
    if (f.matchup === 'counter' && facts.counter == null) return false
  }
  if (f.meta !== 'any' && evaluable('meta', avail) && !STRONG_GRADES.includes(facts.grade)) return false
  if (f.phase !== 'any' && evaluable('phase', avail) && !(typeof facts.scale?.[f.phase] === 'number' && facts.scale[f.phase] >= SCALE_MIN)) return false
  if (f.damage !== 'any' && evaluable('damage', avail) && facts.dmg !== f.damage) return false
  return true
}
