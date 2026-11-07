// draftsage/src/application/update-prefs.js — ajustes de las actualizaciones (DataStore de Pengu: compartido y sin cifrar; solo hay un modo y una versión).
//   mode: 'auto' (descarga versiones firmadas y las usa en el siguiente arranque) | 'packaged' (solo el código incluido en el plugin)
//   lastNotified: última versión remota de la que ya se avisó al usuario («se actualizó a …»)
// Sin dependencias pesadas: lo usa el loader, que debe arrancar aunque todo lo demás falle.
import { parseVersion } from '../domain/update.js'

const KEY = 'draftsage/updates'

export function getUpdatePrefs() {
  let o = null
  try { o = DataStore.get(KEY, {}) } catch {}
  return {
    mode: o?.mode === 'packaged' ? 'packaged' : 'auto',
    lastNotified: parseVersion(o?.lastNotified) ? o.lastNotified : '',
  }
}

export function setUpdatePrefs(patch) {
  const next = { ...getUpdatePrefs(), ...patch }
  const clean = { mode: next.mode === 'packaged' ? 'packaged' : 'auto', lastNotified: parseVersion(next.lastNotified) ? next.lastNotified : '' }
  try { DataStore.set(KEY, clean) } catch {}
  return clean
}
