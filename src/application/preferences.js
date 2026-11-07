// draftsage/src/application/preferences.js — preferencias del usuario (DataStore de Pengu; compartido y sin cifrar:
// aquí solo hay ajustes de interfaz, nunca credenciales)
import { setLang } from '../shared/i18n.js'
import { normalizeFilters } from '../domain/filters.js'
import { normalizeSource } from '../domain/sources.js'
import { DEFAULT_MASTERY_WEIGHT } from '../domain/itero.js'
import { normalizePickFilters } from '../domain/pick-filters.js'

const KEY = 'draftsage/panel'
const DEFAULTS = { enabled: true, collapsed: false, x: null, y: null, lang: 'auto', filtersOpen: false }

export function getPanelPrefs() {
  try { return { ...DEFAULTS, ...(DataStore.get(KEY, {}) ?? {}) } } catch { return { ...DEFAULTS } }
}
export function setPanelPrefs(patch) {
  const next = { ...getPanelPrefs(), ...patch }
  try { DataStore.set(KEY, next) } catch {}
  return next
}

// Idioma de la interfaz: 'auto' (el del cliente/navegador), 'es' o 'en'. Se aplica con shared/i18n.js.
export function initLanguage() {
  setLang(getPanelPrefs().lang)
}
export function setLanguagePref(lang) {
  const next = setPanelPrefs({ lang: lang === 'es' || lang === 'en' ? lang : 'auto' })
  setLang(next.lang)
  return next.lang
}

// Elecciones fijadas por el usuario («pin»): por campeón y rol, la runa clave y la pareja de hechizos que prefiere.
// El resto de la página (filas de runas, secundario, fragmentos) sigue los datos del parche. Solo ids, nada sensible.
//   { "<campeón>|<rol>": { keystone: number|null, spells: [a, b]|null, at: ms } }
const PINS_KEY = 'draftsage/pins'
const PINS_MAX = 200
const readPins = () => { try { return DataStore.get(PINS_KEY, {}) ?? {} } catch { return {} } }
const pinKey = (championId, role) => `${championId}|${role}`
const intOrNull = (x) => (Number.isInteger(x) && x > 0 ? x : null)

export const pins = {
  get(championId, role) {
    const p = readPins()[pinKey(championId, role)]
    if (!p) return null
    const spells = Array.isArray(p.spells) && p.spells.length === 2 && p.spells.every((x) => intOrNull(x)) ? p.spells : null
    return { keystone: intOrNull(p.keystone), spells }
  },
  set(championId, role, { keystone = null, spells = null } = {}) {
    const all = readPins()
    all[pinKey(championId, role)] = { keystone: intOrNull(keystone), spells: Array.isArray(spells) ? spells.map(intOrNull) : null, at: Date.now() }
    const keys = Object.keys(all)
    if (keys.length > PINS_MAX) for (const k of keys.sort((a, b) => (all[a].at ?? 0) - (all[b].at ?? 0)).slice(0, keys.length - PINS_MAX)) delete all[k]
    try { DataStore.set(PINS_KEY, all) } catch {}
  },
  remove(championId, role) {
    const all = readPins()
    delete all[pinKey(championId, role)]
    try { DataStore.set(PINS_KEY, all) } catch {}
  },
}

// Aplicar en el cliente (application/configuration.js): desactivado hasta que el usuario lo acepte.
//   target: 'own' = página propia «[DS] …» (recomendado) · 'current' = reemplaza la página activa
//   flashKey: tecla donde se coloca Destello ('d' | 'f')
const APPLY_KEY = 'draftsage/apply'
const APPLY_DEFAULTS = { enabled: false, target: 'own', flashKey: 'f' }

export function getApplyPrefs() {
  try { return { ...APPLY_DEFAULTS, ...(DataStore.get(APPLY_KEY, {}) ?? {}) } } catch { return { ...APPLY_DEFAULTS } }
}
export function setApplyPrefs(patch) {
  const next = { ...getApplyPrefs(), ...patch }
  try { DataStore.set(APPLY_KEY, next) } catch {}
  return next
}

// Filtros de datos elegidos por el usuario: rango de parches y rango de Elo (domain/filters.js). Solo números y modos.
const FILTERS_KEY = 'draftsage/filters'

export function getFilterPrefs() {
  try { return normalizeFilters(DataStore.get(FILTERS_KEY, {})) } catch { return normalizeFilters(null) }
}
/** patch = { tiers?: {...}, patches?: {...} }: reemplaza cada grupo indicado y guarda el resultado saneado. */
export function setFilterPrefs(patch) {
  const next = normalizeFilters({ ...getFilterPrefs(), ...patch })
  try { DataStore.set(FILTERS_KEY, next) } catch {}
  return next
}

// Fuente de las recomendaciones (domain/sources.js): 'auto' (por defecto) | 'coachless' | 'lolalytics'. Solo un modo, nada sensible.
const SOURCE_KEY = 'draftsage/source'

export function getSourcePrefs() {
  try { return normalizeSource(DataStore.get(SOURCE_KEY, {})) } catch { return normalizeSource(null) }
}
export function setSourcePrefs(patch) {
  const next = normalizeSource({ ...getSourcePrefs(), ...patch })
  try { DataStore.set(SOURCE_KEY, next) } catch {}
  return next
}

// Consejero de picks (application/pick-advisor.js): DESACTIVADO hasta que el usuario acepte el aviso (la composición del draft se envía
// a iTero, un tercero). `minPick` = uso mínimo del candidato (fracción).
// Maestría (application/mastery.js): `useMastery` = enviar tu Riot ID a iTero (basic-info) para que pese tus campeones; APAGADA hasta que el
// usuario acepte su propio aviso. `masteryWeight` = cuánto pesa (0–1; domain/itero.js MASTERY_WEIGHTS). Solo números y booleanos.
// (Antes había un `weight` de mezcla con LoLalytics: las listas de iTero y de matchup ahora van separadas y ese valor guardado se ignora.)
const ADVISOR_KEY = 'draftsage/advisor'
const ADVISOR_DEFAULTS = { enabled: false, minPick: 0.0025, useMastery: false, masteryWeight: DEFAULT_MASTERY_WEIGHT }
const clampNum = (x, lo, hi, d) => (Number.isFinite(Number(x)) && x !== null && x !== '' ? Math.min(hi, Math.max(lo, Number(x))) : d)
const cleanAdvisor = (o) => ({
  enabled: o?.enabled === true,
  minPick: clampNum(o?.minPick, 0.0005, 0.02, ADVISOR_DEFAULTS.minPick),
  useMastery: o?.useMastery === true,
  masteryWeight: clampNum(o?.masteryWeight, 0.05, 1, ADVISOR_DEFAULTS.masteryWeight),
})

export function getAdvisorPrefs() {
  try { return cleanAdvisor(DataStore.get(ADVISOR_KEY, {})) } catch { return { ...ADVISOR_DEFAULTS } }
}
export function setAdvisorPrefs(patch) {
  const next = cleanAdvisor({ ...getAdvisorPrefs(), ...patch })
  try { DataStore.set(ADVISOR_KEY, next) } catch {}
  return next
}

// Filtros de la selección de campeones (domain/pick-filters.js): clase, dominio, matchup, meta, fase y daño. Solo enums y una lista de clases.
const PICK_FILTERS_KEY = 'draftsage/pick-filters'

export function getPickFilterPrefs() {
  try { return normalizePickFilters(DataStore.get(PICK_FILTERS_KEY, {})) } catch { return normalizePickFilters(null) }
}
export function setPickFilterPrefs(patch) {
  const next = normalizePickFilters({ ...getPickFilterPrefs(), ...patch })
  try { DataStore.set(PICK_FILTERS_KEY, next) } catch {}
  return next
}

// Estadísticas sobre la selección de campeones (application/overlay.js). `selector`: selector CSS de los campeones de la
// cuadrícula, solo si la detección automática no acierta con el cliente (draftsage.overlaySelector('…')).
const OVERLAY_KEY = 'draftsage/overlay'
const OVERLAY_DEFAULTS = { enabled: true, selector: '' }
const cleanOverlay = (o) => ({ enabled: o?.enabled !== false, selector: typeof o?.selector === 'string' ? o.selector.trim().slice(0, 200) : '' })

export function getOverlayPrefs() {
  try { return cleanOverlay({ ...OVERLAY_DEFAULTS, ...(DataStore.get(OVERLAY_KEY, {}) ?? {}) }) } catch { return { ...OVERLAY_DEFAULTS } }
}
export function setOverlayPrefs(patch) {
  const next = cleanOverlay({ ...getOverlayPrefs(), ...patch })
  try { DataStore.set(OVERLAY_KEY, next) } catch {}
  return next
}
