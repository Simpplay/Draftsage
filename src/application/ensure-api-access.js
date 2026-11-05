// easy-coachless/src/application/ensure-api-access.js
// Comprueba si el cliente puede llamar a api.coachless.gg. Si no, abre la pantalla de pasos (menus.js).
// El plugin NO edita la config de Pengu.

import { log } from '../shared/logger.js'
import { whenReady } from '../presentation/ui.js'
import { corsSetupMenu } from '../presentation/menus.js'
import { isApiReachable } from '../infrastructure/pengu/api-probe.js'

const SKIP_KEY = 'easy-coachless/skip-cors-prompt'
const FORCE_KEY = 'easy-coachless/force-prompt'

// Utilidades desde la consola de DevTools:
//   easyCoachless.openSetup()      abre la pantalla de pasos a mano
//   easyCoachless.forcePrompt()    simula "bloqueado por CORS" (recarga el cliente para verlo)
//   easyCoachless.forcePrompt(false)
//   easyCoachless.resetPrompt()    borra el "No volver a preguntar"
window.easyCoachless = Object.assign(window.easyCoachless ?? {}, {
  openSetup: () => corsSetupMenu(),
  forcePrompt: (on = true) => DataStore.set(FORCE_KEY, !!on),
  resetPrompt: () => DataStore.remove(SKIP_KEY),
})

export async function ensureApiAccess() {
  const forced = DataStore.get(FORCE_KEY, false)
  const ok = !forced && (await isApiReachable())
  log.info('acceso a la API:', ok ? 'OK (sin bloqueo CORS)' : forced ? 'MODO PRUEBA (forzado)' : 'BLOQUEADO por CORS')
  if (ok) return true

  if (DataStore.get(SKIP_KEY, false)) {
    log.info('aviso omitido: el usuario eligió no volver a preguntar')
    return false
  }
  log.info('esperando a que el cliente monte su interfaz antes de avisar')
  await whenReady()
  corsSetupMenu().result.then((r) => {
    if (r.action === 'never') DataStore.set(SKIP_KEY, true)
  })
  return false
}
