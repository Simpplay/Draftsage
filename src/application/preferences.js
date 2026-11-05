// easy-coachless/src/application/preferences.js — preferencias del usuario (DataStore de Pengu; compartido y sin cifrar:
// aquí solo hay ajustes de interfaz, nunca credenciales)
const KEY = 'easy-coachless/panel'
const DEFAULTS = { enabled: true, collapsed: false, x: null, y: null }

export function getPanelPrefs() {
  try { return { ...DEFAULTS, ...(DataStore.get(KEY, {}) ?? {}) } } catch { return { ...DEFAULTS } }
}
export function setPanelPrefs(patch) {
  const next = { ...getPanelPrefs(), ...patch }
  try { DataStore.set(KEY, next) } catch {}
  return next
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
