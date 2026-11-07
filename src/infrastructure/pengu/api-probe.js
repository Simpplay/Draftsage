// draftsage/src/infrastructure/pengu/api-probe.js
// Sonda de acceso a api.coachless.gg (requiere DisableWebSecurity=1 en la config de Pengu).

import { log } from '../../shared/logger.js'

const PROBE_URL = 'https://api.coachless.gg/api/ChampionWinprob/GetPatches'

// Sonda inocua, sin credenciales. Con CORS activo lanza TypeError (preflight bloqueado);
// con DisableWebSecurity llega una respuesta (esperable 401/403) y no lanza.
// No usar Auth/login para sondear: generaría intentos de login falsos.
export async function isApiReachable() {
  try {
    const r = await fetch(PROBE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    log.debug('sonda respondió con HTTP', r.status)
    return true
  } catch (e) {
    log.debug('sonda falló:', String(e))
    return false
  }
}
