// easy-coachless/src/domain/confidence.js — cuánto fiarse de una cifra según las partidas que la respaldan (reglas puras)
//
// Con ~7 000 partidas el error típico del WPA ronda ±0,6 puntos (ver domain/selection.js): por debajo de unos pocos
// miles de partidas, una diferencia de WPA es ruido. Niveles: 1 baja · 2 media · 3 alta.

export const LOW_ITEM_SAMPLE = 500            // una runa/hechizo con menos partidas que esto se marca como poco fiable
export const CONFIDENCE_STEPS = [10000, 50000] // < 10 k baja · < 50 k media · resto alta

/** Nivel de confianza (1..3) de una muestra total (suma de partidas de los keystones). */
export function confidenceLevel(sample) {
  const n = Number(sample)
  if (!Number.isFinite(n) || n < CONFIDENCE_STEPS[0]) return 1
  return n < CONFIDENCE_STEPS[1] ? 2 : 3
}

/** ¿Esta estadística tiene muy pocas partidas? (0 = sin dato: no se marca) */
export const isLowData = (stat) => !!stat && Number.isFinite(stat.occurrence) && stat.occurrence > 0 && stat.occurrence < LOW_ITEM_SAMPLE
