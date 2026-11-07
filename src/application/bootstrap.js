// draftsage/src/application/bootstrap.js — arranque del plugin (lo invoca index.js)
import { initLanguage, getSourcePrefs, getOverlayPrefs, setOverlayPrefs } from './preferences.js'
import { needsLogin } from '../domain/sources.js'
import { ensureApiAccess } from './ensure-api-access.js'
import { restoreSession } from './session.js'
import { app } from './app.js'
import { enableApplyFlow, loginMenu, mainMenu, resetPanelPosition, simulateMenu } from '../presentation/menus.js'
import { mountPanel } from '../presentation/panel.js'
import { mountOverlay, probeGrid } from '../presentation/overlay.js'
import { mountNative, probeNative } from '../presentation/native.js'
import { notify } from '../presentation/ui.js'
import { getUpdatePrefs, setUpdatePrefs } from './update-prefs.js'
import { t } from '../shared/i18n.js'
import { log } from '../shared/logger.js'

// Desde DevTools:  draftsage.menu()  abre el menú principal
//   draftsage.simulate({ championId: 145, opponentChampionId: 222, role: 3, lobbyTier: 5 })  /  .simulate(null)
window.draftsage = Object.assign(window.draftsage ?? {}, {
  menu: () => mainMenu(),
  loginMenu: () => loginMenu(),
  simulateMenu: () => simulateMenu(),
  // Si el panel quedó fuera de alcance: draftsage.resetPanel() lo devuelve arriba a la derecha.
  resetPanel: () => resetPanelPosition(),
  simulate: (ctx) => app.controller.simulate(ctx),
  state: () => app.controller.getState(),
  // Fuente de las recomendaciones: draftsage.source() la muestra; draftsage.source('lolalytics' | 'coachless' | 'auto') la cambia.
  source: (mode) => (mode ? app.source.set(mode) : app.source.get()),
  // Estadísticas sobre los campeones de Champion Select: estado, diagnóstico de la detección de la cuadrícula y selector manual.
  overlayState: () => app.overlay.getState(),
  overlayProbe: () => probeGrid(),
  overlaySelector: (css = '') => { setOverlayPrefs({ selector: css }); return getOverlayPrefs() },
  // Interfaz integrada en Champion Select: qué anclas del DOM del cliente encuentra y si se ven (para informar si no aparece).
  nativeProbe: () => probeNative(),
  // Consejero de picks (iTero + LoLalytics): estado y diagnóstico de iTero (para activarlo está el interruptor de Ajustes → Más).
  advisorState: () => ({ ...app.advisor.getState(), itero: app.advisor.iteroStatus() }),
  // Línea de cada rival (manual / cliente / deducida), maestría (sin los puntos) y filtros activos de la selección.
  enemyRoles: () => app.enemyRoles.getState(),
  masteryState: () => { const { points, ...rest } = app.mastery.getState(); return { ...rest, campeones: points ? Object.keys(points).length : 0 } },
  pickFilters: () => app.pickFilters.get(),
})

// Avisos de actualización. `window.draftsage.build()` y el evento `draftsage:update` los pone el loader (application/loader.js).
function watchUpdates() {
  const build = window.draftsage?.build?.()
  if (build?.source === 'remote' && build.version !== getUpdatePrefs().lastNotified) {
    setUpdatePrefs({ lastNotified: build.version })
    notify.success(t('upd.updated', build.version))
  }
  window.addEventListener('draftsage:update', (e) => {
    const d = e.detail ?? {}
    if (d.kind === 'downloaded') notify.success(t('upd.ready', d.version))
    else if (d.kind === 'reinstall') notify.error(t('upd.reinstall'))
  })
}

export async function start() {
  initLanguage() // antes de abrir ninguna pantalla: los textos salen en el idioma elegido (o el del cliente)
  log.info('plugin cargado | menú: draftsage.menu() o Ctrl+Shift+E')

  if (!(await ensureApiAccess())) {
    log.warn('sin acceso a la API; a la espera de que el usuario configure Pengu')
    return
  }

  // El panel y el botón DS se montan siempre: sin sesión, el panel ofrece iniciar sesión.
  const openLogin = () => loginMenu()
  mountPanel({ controller: app.controller, catalog: app.catalog, applier: app.applier, live: app.live, overlay: app.overlay, advisor: app.advisor, enemyRoles: app.enemyRoles, filters: app.pickFilters, mastery: app.mastery, onEnableApply: enableApplyFlow, onLogin: openLogin, onMenu: () => mainMenu() })
    // Interfaz integrada en el Champion Select del cliente: botones nativos que abren el panel como popover anclado. Si falla o el DOM no se
    // reconoce, el panel flotante sigue funcionando solo.
    .then((panel) => mountNative({ panel, controller: app.controller, catalog: app.catalog, overlay: app.overlay, advisor: app.advisor, filters: app.pickFilters, onMenu: () => mainMenu() })
      .catch((e) => log.error('no se pudo montar la interfaz integrada (sigue el panel flotante):', e)))
    .catch((e) => log.error('no se pudo montar el panel:', e))
  mountOverlay({ overlay: app.overlay, catalog: app.catalog, getPrefs: getOverlayPrefs, filters: app.pickFilters, inSelection: () => { const st = app.controller.getState(); return st.status !== 'idle' && !!st.context && st.context.phase !== 'game' } })
    .catch((e) => log.error('no se pudo montar las estadísticas de la selección:', e))

  if (await restoreSession()) {
    log.info('sesión recuperada')
  } else if (needsLogin(getSourcePrefs().mode)) {
    // Iniciar sesión es opcional: no se abre ningún diálogo. Quien eligió «solo Coachless» ve el botón «Entrar» en el panel.
    log.info('sin sesión válida; la fuente elegida («' + getSourcePrefs().mode + '») la necesita: el panel ofrece iniciar sesión')
  } else {
    log.info('sin sesión de Coachless (opcional): la fuente elegida («' + getSourcePrefs().mode + '») no la necesita')
  }

  app.controller.start() // empieza a vigilar el Champion Select
  app.overlay.start()    // estadísticas de cada campeón (win rate y counters)
  app.advisor.start()    // consejero de picks (no hace nada mientras esté desactivado)
  app.enemyRoles.start() // línea de cada rival (manual o deducida)
  app.mastery.start()    // maestría del jugador (no hace nada mientras esté apagada)
  app.pickFilters.start() // re-emite los cambios de datos a la interfaz de filtros
  watchUpdates()          // avisa de versiones nuevas (descargadas o que exigen reinstalar)
  log.info('listo: se mostrará la recomendación al entrar en Champion Select')
}
