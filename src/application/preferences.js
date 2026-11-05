// easy-coachless/src/application/preferences.js — preferencias del usuario (DataStore de Pengu; compartido y sin cifrar:
// aquí solo hay ajustes de interfaz, nunca credenciales)
import { setLang } from '../shared/i18n.js'
import { normalizeFilters } from '../domain/filters.js'

const KEY = 'easy-coachless/panel'
const DEFAULTS = { enabled: true, collapsed: false, x: null, y: null, lang: 'auto' }

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
const PINS_KEY = 'easy-coachless/pins'
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
//   target: 'own' = página propia «[EC] …» (recomendado) · 'current' = reemplaza la página activa
//   flashKey: tecla donde se coloca Destello ('d' | 'f')
const APPLY_KEY = 'easy-coachless/apply'
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
const FILTERS_KEY = 'easy-coachless/filters'

export function getFilterPrefs() {
  try { return normalizeFilters(DataStore.get(FILTERS_KEY, {})) } catch { return normalizeFilters(null) }
}
/** patch = { tiers?: {...}, patches?: {...} }: reemplaza cada grupo indicado y guarda el resultado saneado. */
export function setFilterPrefs(patch) {
  const next = normalizeFilters({ ...getFilterPrefs(), ...patch })
  try { DataStore.set(FILTERS_KEY, next) } catch {}
  return next
}
