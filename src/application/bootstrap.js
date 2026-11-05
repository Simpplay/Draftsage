// easy-coachless/src/application/bootstrap.js — arranque del plugin (lo invoca index.js)
import { ensureApiAccess } from './ensure-api-access.js'
import { restoreSession } from './session.js'
import { loginMenu, mainMenu } from '../presentation/menus.js'
import { whenReady } from '../presentation/ui.js'
import { log } from '../shared/logger.js'

// Desde DevTools:  easyCoachless.menu()  abre el menú principal
window.easyCoachless = Object.assign(window.easyCoachless ?? {}, {
  menu: () => mainMenu(),
  loginMenu: () => loginMenu(),
})

export async function start() {
  log.info('plugin cargado | menú: easyCoachless.menu()')

  if (!(await ensureApiAccess())) {
    log.warn('sin acceso a la API; a la espera de que el usuario configure Pengu')
    return
  }

  if (await restoreSession()) {
    log.info('sesión recuperada')
  } else {
    log.info('sin sesión válida; se pide inicio de sesión')
    await whenReady()
    loginMenu()
  }

  log.info('listo para consultar Coachless')
  // ...siguiente paso: detectar la selección de campeón y consultar runas/hechizos
}
