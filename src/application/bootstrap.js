// easy-coachless/src/application/bootstrap.js — arranque del plugin (lo invoca index.js)
import { initLanguage } from './preferences.js'
import { ensureApiAccess } from './ensure-api-access.js'
import { restoreSession } from './session.js'
import { app } from './app.js'
import { enableApplyFlow, loginMenu, mainMenu, simulateMenu } from '../presentation/menus.js'
import { mountPanel } from '../presentation/panel.js'
import { whenReady } from '../presentation/ui.js'
import { log } from '../shared/logger.js'

// Desde DevTools:  easyCoachless.menu()  abre el menú principal
//   easyCoachless.simulate({ championId: 145, opponentChampionId: 222, role: 3, lobbyTier: 5 })  /  .simulate(null)
window.easyCoachless = Object.assign(window.easyCoachless ?? {}, {
  menu: () => mainMenu(),
  loginMenu: () => loginMenu(),
  simulateMenu: () => simulateMenu(),
  simulate: (ctx) => app.controller.simulate(ctx),
  state: () => app.controller.getState(),
})

export async function start() {
  initLanguage() // antes de abrir ninguna pantalla: los textos salen en el idioma elegido (o el del cliente)
  log.info('plugin cargado | menú: easyCoachless.menu() o Ctrl+Shift+E')

  if (!(await ensureApiAccess())) {
    log.warn('sin acceso a la API; a la espera de que el usuario configure Pengu')
    return
  }

  // El panel y el botón EC se montan siempre: sin sesión, el panel ofrece iniciar sesión.
  const openLogin = () => loginMenu()
  mountPanel({ controller: app.controller, catalog: app.catalog, applier: app.applier, onEnableApply: enableApplyFlow, onLogin: openLogin, onMenu: () => mainMenu() })
    .catch((e) => log.error('no se pudo montar el panel:', e))

  if (await restoreSession()) {
    log.info('sesión recuperada')
  } else {
    log.info('sin sesión válida; se pide inicio de sesión')
    await whenReady()
    loginMenu()
  }

  app.controller.start() // empieza a vigilar el Champion Select
  log.info('listo: se mostrará la recomendación al entrar en Champion Select')
}
