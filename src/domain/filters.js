// draftsage/src/domain/filters.js — filtros que elige el usuario: rango de parches y rango de Elo (reglas puras)
//
// Por defecto todo es automático (como hasta ahora): rango de Elo = el de la lobby ±1; parches = el último con muestra
// suficiente (+ el anterior con premium). El usuario puede fijar a mano cualquiera de los dos.
//   { tiers:   { mode: 'auto' | 'range', min: 3..7, max: 3..7 },
//     patches: { mode: 'auto' | 'manual', additions: 0..MAX_PATCH_RANGE } }

import { MIN_TIER, MAX_TIER, clampTier, tiersForLobby } from './lobby.js'

/** Parches anteriores que se pueden sumar al elegido. La web de Coachless envió 2 (✅); valores mayores no están verificados. */
export const MAX_PATCH_RANGE = 2
export const DEFAULT_FILTERS = Object.freeze({
  tiers: Object.freeze({ mode: 'auto', min: 5, max: 7 }),
  patches: Object.freeze({ mode: 'auto', additions: 1 }),
})

const int = (x, fallback) => (Number.isFinite(Number(x)) && x !== null && x !== '' ? Math.round(Number(x)) : fallback)

/** Sanea lo guardado (puede venir de otra versión o estar corrupto) y devuelve siempre un objeto completo y válido. */
export function normalizeFilters(raw) {
  const t = raw?.tiers ?? {}
  const a = clampTier(int(t.min, DEFAULT_FILTERS.tiers.min)), b = clampTier(int(t.max, DEFAULT_FILTERS.tiers.max))
  const p = raw?.patches ?? {}
  return {
    tiers: { mode: t.mode === 'range' ? 'range' : 'auto', min: Math.min(a, b), max: Math.max(a, b) },
    patches: {
      mode: p.mode === 'manual' ? 'manual' : 'auto',
      additions: Math.min(MAX_PATCH_RANGE, Math.max(0, int(p.additions, DEFAULT_FILTERS.patches.additions))),
    },
  }
}

/** Rangos de Coachless a consultar: los elegidos (contiguos, 3..7) o, en automático, los de la lobby. */
export function resolveTiers(filters, lobbyTier) {
  const f = normalizeFilters(filters).tiers
  if (f.mode !== 'range') return { tiers: tiersForLobby(lobbyTier), manual: false }
  const tiers = []
  for (let n = Math.max(MIN_TIER, f.min); n <= Math.min(MAX_TIER, f.max); n++) tiers.push(n)
  return { tiers, manual: true }
}

/**
 * `patchAdditions` a enviar. Los rangos (≥ 1) son solo premium: con cuenta gratuita siempre 0 y `limited` avisa
 * de que se pidió más de lo que la cuenta permite.
 */
export function resolveAdditions(filters, premium) {
  const f = normalizeFilters(filters).patches
  if (f.mode !== 'manual') return { additions: premium ? 1 : 0, manual: false, limited: false }
  return { additions: premium ? f.additions : 0, manual: true, limited: !premium && f.additions > 0 }
}

/**
 * Clic en un rango de la lista: auto → solo ese; fuera del rango → lo amplía; en un extremo → lo acorta
 * (si era el único vuelve a automático); en medio → mueve el extremo más cercano (a igual distancia, el alto).
 */
export function toggleTier(tiers, tier) {
  const f = normalizeFilters({ tiers }).tiers
  const t = clampTier(tier)
  if (f.mode !== 'range') return { mode: 'range', min: t, max: t }
  if (t < f.min) return { ...f, min: t }
  if (t > f.max) return { ...f, max: t }
  if (f.min === f.max) return { ...f, mode: 'auto' }
  if (t === f.min) return { ...f, min: t + 1 }
  if (t === f.max) return { ...f, max: t - 1 }
  return t - f.min < f.max - t ? { ...f, min: t } : { ...f, max: t }
}
