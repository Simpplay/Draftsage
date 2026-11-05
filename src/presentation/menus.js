// easy-coachless/src/presentation/menus.js — todas las pantallas del plugin, construidas con ui.js.
// Para añadir una pantalla nueva: crea aquí una función que use openDialog/openForm/openMenu
// y devuelve su handle (así quien la llame puede esperar `.result` o cerrarla).

import { openDialog, openForm, confirm, notify, copyText, h } from './ui.js'
import { openSettings } from './settings.js'
import { login, logout, sessionInfo } from '../application/session.js'
import { app } from '../application/app.js'
import { getPanelPrefs, setPanelPrefs } from '../application/preferences.js'
import { ROLE_FILL, parseRole, parseTier } from '../domain/lobby.js'
import { log } from '../shared/logger.js'

export const CONFIG_LINE = 'DisableWebSecurity=1'

// Pasos para activar DisableWebSecurity en Pengu. result.action: 'later' | 'never' | 'dismiss'
export function corsSetupMenu() {
  const steps = h(
    'div', { class: 'ec-box', style: 'display:none' },
    '1. Abre la carpeta de Pengu Loader (una carpeta por encima de «plugins»).', h('br'),
    '2. Abre el archivo «config» con el Bloc de notas (como administrador si está en Program Files).', h('br'),
    '3. Añade una línea nueva con ', h('code', null, CONFIG_LINE), ' y guarda.', h('br'),
    '4. Pulsa «Reiniciar cliente».',
  )
  return openDialog({
    id: 'cors-setup',
    title: 'Easy Coachless',
    body: [
      h('p', null,
        'Para consultar Coachless, Pengu necesita la opción ', h('b', null, 'DisableWebSecurity'),
        '. Desactiva la seguridad web de ', h('b', null, 'todo'),
        ' el cliente (para todos los plugins). ¿Quieres ver cómo activarla?'),
      steps,
    ],
    actions: [
      { id: 'steps', label: 'Ver pasos', keepOpen: true, onClick: () => { steps.style.display = steps.style.display === 'none' ? 'block' : 'none'; return false } },
      { id: 'copy', label: 'Copiar línea', keepOpen: true, onClick: async (d) => { d.setStatus((await copyText(CONFIG_LINE)) ? 'Copiado: ' + CONFIG_LINE : 'No se pudo copiar; escríbela a mano.'); return false } },
      { id: 'folder', label: 'Abrir carpeta de plugins', keepOpen: true, onClick: (d) => {
          try { window.openPluginsFolder() } catch (e) { log.error('openPluginsFolder falló:', e) }
          d.setStatus('Se abrió la carpeta de plugins; el archivo «config» está una carpeta más arriba.')
          return false
        } },
      { id: 'restart', label: 'Reiniciar cliente', keepOpen: true, onClick: (d) => {
          d.setStatus('Reiniciando el cliente…')
          setTimeout(() => { try { window.restartClient() } catch (e) { log.error('restartClient falló:', e); d.setStatus('No se pudo reiniciar; hazlo a mano.', 'error') } }, 400)
          return false
        } },
      { id: 'later', label: 'Ahora no' },
      { id: 'never', label: 'No volver a preguntar' },
    ],
  })
}

// Inicio de sesión. result.value = { premium } si salió bien.
export function loginMenu() {
  return openForm({
    id: 'login',
    title: 'Iniciar sesión en Coachless',
    description:
      'Usa tu cuenta de coachless.gg. La contraseña solo se envía a Coachless y no se guarda. ' +
      'El plugin conserva en tu equipo un token de sesión (caduca a los 30 días) que puedes borrar con «Cerrar sesión».',
    fields: [
      { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@correo.com', required: true, autocomplete: 'username' },
      { name: 'password', label: 'Contraseña', type: 'password', required: true, autocomplete: 'current-password', focusOnError: true },
    ],
    submitLabel: 'Iniciar sesión',
    onSubmit: async ({ email, password }) => {
      const r = await login(email.trim(), password)
      if (r.ok) {
        notify.success('Easy Coachless: sesión iniciada')
        app.resetData()              // la cuenta puede ser otra (otro plan): nada cacheado le sirve
        app.controller.refresh()
        return { premium: r.premium }
      }
      return r.reason === 'network'
        ? 'No se pudo conectar con Coachless. Revisa tu conexión.'
        : 'Email o contraseña incorrectos (o la cuenta no está confirmada).'
    },
  })
}

async function logoutFlow() {
  const ok = await confirm({
    id: 'logout-confirm', title: 'Cerrar sesión',
    message: 'Se borrará el token de sesión guardado en este equipo.',
    confirmLabel: 'Cerrar sesión', danger: true,
  })
  if (ok) {
    logout()
    app.resetData()
    app.controller.refresh()
    notify.success('Easy Coachless: sesión cerrada')
  }
}

// Simula un Champion Select para ver la recomendación sin estar en una partida. Campos de texto libres:
// campeón (nombre), rival (opcional), rol (top/jungla/mid/adc/support) y rango (oro/platino/esmeralda/diamante/master).
export function simulateMenu() {
  return openForm({
    id: 'simulate',
    title: 'Ver runas de un matchup',
    description: 'Prueba la recomendación sin estar en Champion Select. El rival, el rol y el rango son opcionales.',
    fields: [
      { name: 'champion', label: 'Tu campeón', placeholder: 'Kai\'Sa', required: true },
      { name: 'opponent', label: 'Rival (solo cuentas premium)', placeholder: 'Jinx' },
      { name: 'role', label: 'Rol', placeholder: 'top, jungla, mid, adc, support' },
      { name: 'tier', label: 'Rango de la lobby', placeholder: 'oro, platino, esmeralda, diamante, master' },
    ],
    submitLabel: 'Ver runas',
    onSubmit: async (v, hd) => {
      hd.setStatus('Buscando…')
      await app.catalog.load()
      const champ = app.catalog.findChampion(v.champion)
      if (!champ) return app.catalog.isLoaded() ? `No encuentro el campeón «${v.champion.trim()}».` : 'El cliente aún no ha cargado la lista de campeones; inténtalo en unos segundos.'
      let opp = null
      if (v.opponent.trim()) {
        opp = app.catalog.findChampion(v.opponent)
        if (!opp) return `No encuentro el rival «${v.opponent.trim()}».`
      }
      const role = v.role.trim() ? parseRole(v.role) : ROLE_FILL
      if (role === undefined) return 'Rol no válido (top, jungla, mid, adc, support).'
      const tier = v.tier.trim() ? parseTier(v.tier) : undefined
      if (v.tier.trim() && tier === undefined) return 'Rango no válido (oro, platino, esmeralda, diamante, master).'
      app.controller.simulate({ championId: champ.id, ...(opp && { opponentChampionId: opp.id }), role, ...(tier && { lobbyTier: tier }) })
      return { champion: champ.id }
    },
  })
}

// Aviso previo a activar «Aplicar». Devuelve Promise<boolean>: true si el usuario acepta (y queda activado).
export async function enableApplyFlow() {
  if (app.applier.canApply()) return true
  const ok = await confirm({
    id: 'apply-consent', title: 'Aplicar en el cliente',
    message:
      'Al pulsar «Aplicar», Easy Coachless escribirá en tu cliente de League la página de runas y los hechizos recomendados. ' +
      'Solo actúa cuando tú pulsas el botón (o Ctrl+Shift+A), nunca de forma automática. ' +
      'Usa la API interna del cliente, que no es oficial: revisa las políticas de Riot y de Pengu Loader antes de activarlo y úsalo bajo tu responsabilidad. ' +
      'Por defecto solo toca una página propia llamada «[EC] …». Puedes desactivarlo en el menú.',
    confirmLabel: 'Activar y aplicar',
  })
  if (ok) app.applier.setEnabled(true)
  return ok
}

// Menú principal del plugin: la pantalla gráfica de ajustes (presentation/settings.js).
function togglePanel(enabled) {
  setPanelPrefs({ enabled })
  window.dispatchEvent(new Event('easy-coachless:prefs'))
  if (enabled) window.dispatchEvent(new Event('easy-coachless:show-panel'))
}

export function mainMenu() {
  return openSettings({
    applier: app.applier,
    catalog: app.catalog,
    getSession: sessionInfo,
    isSimulating: () => app.controller.getState().context?.source === 'manual',
    panelEnabled: () => getPanelPrefs().enabled,
    actions: {
      login: loginMenu,
      logout: logoutFlow,
      simulate: simulateMenu,
      cors: corsSetupMenu,
      enableApply: enableApplyFlow,
      reopen: mainMenu,
      unsimulate: () => app.controller.simulate(null),
      togglePanel: () => togglePanel(!getPanelPrefs().enabled),
    },
  })
}
