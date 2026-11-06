// easy-coachless/src/application/bootstrap.js — arranque del plugin (lo invoca index.js)
import { initLanguage, getSourcePrefs, getOverlayPrefs, setOverlayPrefs } from './preferences.js'
import { needsLogin } from '../domain/sources.js'
import { ensureApiAccess } from './ensure-api-access.js'
import { restoreSession } from './session.js'
import { app } from './app.js'
import { enableApplyFlow, loginMenu, mainMenu, simulateMenu } from '../presentation/menus.js'
import { mountPanel } from '../presentation/panel.js'
import { mountOverlay, probeGrid } from '../presentation/overlay.js'
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
  // Fuente de las recomendaciones: easyCoachless.source() la muestra; easyCoachless.source('lolalytics' | 'coachless' | 'auto') la cambia.
  source: (mode) => (mode ? app.source.set(mode) : app.source.get()),
  // Estadísticas sobre los campeones de Champion Select: estado, diagnóstico de la detección de la cuadrícula y selector manual.
  overlayState: () => app.overlay.getState(),
  overlayProbe: () => probeGrid(),
  overlaySelector: (css = '') => { setOverlayPrefs({ selector: css }); return getOverlayPrefs() },
  // Consejero de picks (iTero + LoLalytics): estado y diagnóstico de iTero (para activarlo está el interruptor de Ajustes → Más).
  advisorState: () => ({ ...app.advisor.getState(), itero: app.advisor.iteroStatus() }),
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
  mountPanel({ controller: app.controller, catalog: app.catalog, applier: app.applier, live: app.live, overlay: app.overlay, advisor: app.advisor, onEnableApply: enableApplyFlow, onLogin: openLogin, onMenu: () => mainMenu() })
    .catch((e) => log.error('no se pudo montar el panel:', e))
  mountOverlay({ overlay: app.overlay, catalog: app.catalog, getPrefs: getOverlayPrefs })
    .catch((e) => log.error('no se pudo montar las estadísticas de la selección:', e))

  if (await restoreSession()) {
    log.info('sesión recuperada')
  } else if (needsLogin(getSourcePrefs().mode)) {
    log.info('sin sesión válida; se pide inicio de sesión')
    await whenReady()
    loginMenu()
  } else {
    log.info('sin sesión de Coachless: la fuente elegida («' + getSourcePrefs().mode + '») no la necesita')
  }

  app.controller.start() // empieza a vigilar el Champion Select
  app.overlay.start()    // estadísticas de cada campeón (win rate y counters)
  app.advisor.start()    // consejero de picks (no hace nada mientras esté desactivado)
  log.info('listo: se mostrará la recomendación al entrar en Champion Select')
}
