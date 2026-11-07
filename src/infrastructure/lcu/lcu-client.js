// draftsage/src/infrastructure/lcu/lcu-client.js — lectura del LCU desde el propio cliente (solo GET)
//
// Dentro del cliente de League, `fetch('/lol-...')` con ruta relativa llega al LCU sin credenciales (así lo hacen los
// plugins de Pengu). La API del LCU no es oficial y puede cambiar: cualquier fallo devuelve null, nunca lanza.
// Este módulo SOLO lee; no modifica páginas de runas ni hechizos (ver CLAUDE.md, políticas de Riot/Pengu).

import { log } from '../../shared/logger.js'

export async function lcuGet(path, { timeoutMs = 4000 } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(path, { signal: ctrl.signal })
    if (!r.ok) { log.debug('LCU', path, '→ HTTP', r.status); return null }
    return await r.json()
  } catch (e) {
    log.debug('LCU', path, 'falló:', String(e))
    return null
  } finally {
    clearTimeout(timer)
  }
}
