// draftsage/src/domain/filters.js — filtros que elige el usuario: rango de parches, rango de Elo y regiones (reglas puras)
//
// Por defecto todo es automático (como hasta ahora): rango de Elo = el de la lobby ±1; parches = el último con muestra
// suficiente (+ el anterior con premium); regiones = todas. El usuario puede fijar a mano cualquiera de los tres.
//   { tiers:   { mode: 'auto' | 'range', min: 3..7, max: 3..7 },
//     patches: { mode: 'auto' | 'manual', additions: 0..MAX_PATCH_RANGE },
//     regions: number[] }   ids de región de Coachless; [] = todas (se envía `regions: null`)

import { MIN_TIER, MAX_TIER, clampTier, tiersForLobby } from './lobby.js'

/** Parches anteriores que se pueden sumar al elegido. La web de Coachless envió 2 (✅); valores mayores no están verificados. */
export const MAX_PATCH_RANGE = 2
export const DEFAULT_FILTERS = Object.freeze({
  tiers: Object.freeze({ mode: 'auto', min: 5, max: 7 }),
  patches: Object.freeze({ mode: 'auto', additions: 1 }),
  regions: Object.freeze([]),
})

/**
 * Regiones de Coachless (`commonFilters.regions`). Ids leídos del código de coachless.gg el 2026-11-08 (enum de regiones:
 * Br 0 · Eune 1 · Euw 2 · Jp 3 · Kr 4 · Lan 5 · Las 6 · Me 7 · Na 8 · Oce 9 · Ph 10 · Ru 11 · Sg 12 · Th 13 · Tr 14 · Tw 15 · Vn 16).
 * Solo se ofrecen las 15 que muestra la web (PH y TH existen en el enum pero la web no las lista; 17–21 son macrorregiones
 * que la web tampoco usa). Orden = el de la web.
 */
export const REGIONS = Object.freeze([
  { id: 0, code: 'BR' }, { id: 1, code: 'EUNE' }, { id: 2, code: 'EUW' }, { id: 3, code: 'JP' }, { id: 4, code: 'KR' },
  { id: 5, code: 'LAN' }, { id: 6, code: 'LAS' }, { id: 7, code: 'ME' }, { id: 8, code: 'NA' }, { id: 9, code: 'OCE' },
  { id: 12, code: 'SG' }, { id: 11, code: 'RU' }, { id: 14, code: 'TR' }, { id: 15, code: 'TW' }, { id: 16, code: 'VN' },
])
const REGION_IDS = new Set(REGIONS.map((r) => r.id))
export const regionCode = (id) => REGIONS.find((r) => r.id === id)?.code ?? '?'

/** Lista de regiones saneada: solo ids conocidos, sin repetidos, ordenada. Si están todas, equivale a «todas» ([]). */
function normalizeRegions(raw) {
  const ids = [...new Set((Array.isArray(raw) ? raw : []).map(Number).filter((x) => REGION_IDS.has(x)))].sort((a, b) => a - b)
  return ids.length === REGION_IDS.size ? [] : ids
}

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
    regions: normalizeRegions(raw?.regions),
  }
}

/** Regiones a enviar a Coachless: `null` = todas (como la web cuando no se marca ninguna). */
export function resolveRegions(filters) {
  const ids = normalizeFilters(filters).regions
  return ids.length ? { regions: ids, manual: true } : { regions: null, manual: false }
}

/** Clic en una región: la añade o la quita. Quitar la última (o marcar todas) vuelve a «todas». */
export function toggleRegion(regions, id) {
  const cur = normalizeRegions(regions)
  if (!REGION_IDS.has(Number(id))) return cur
  return normalizeRegions(cur.includes(Number(id)) ? cur.filter((x) => x !== Number(id)) : [...cur, Number(id)])
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
