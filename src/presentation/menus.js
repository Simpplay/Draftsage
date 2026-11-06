// easy-coachless/src/presentation/menus.js — todas las pantallas del plugin, construidas con ui.js.
// Para añadir una pantalla nueva: crea aquí una función que use openDialog/openForm/openMenu
// y devuelve su handle (así quien la llame puede esperar `.result` o cerrarla).
// Los textos salen de shared/strings.js (español e inglés).

import { openDialog, openForm, confirm, notify, copyText, h, richText } from './ui.js'
import { openSettings } from './settings.js'
import { login, logout, sessionInfo } from '../application/session.js'
import { app } from '../application/app.js'
import { getPanelPrefs, setPanelPrefs, setLanguagePref } from '../application/preferences.js'
import { ROLE_FILL, parseRole, parseTier } from '../domain/lobby.js'
import { getLang, t } from '../shared/i18n.js'
import { log } from '../shared/logger.js'

export const CONFIG_LINE = 'DisableWebSecurity=1'

// Pasos para activar DisableWebSecurity en Pengu. result.action: 'later' | 'never' | 'dismiss'
export function corsSetupMenu() {
  const steps = h(
    'div', { class: 'ec-box', style: 'display:none' },
    ['cors.step1', 'cors.step2', 'cors.step3', 'cors.step4'].map((k) => h('div', null, richText(t(k)))),
  )
  return openDialog({
    id: 'cors-setup',
    title: 'Easy Coachless',
    body: [h('p', null, richText(t('cors.intro'))), steps],
    actions: [
      { id: 'steps', label: t('cors.btnSteps'), keepOpen: true, onClick: () => { steps.style.display = steps.style.display === 'none' ? 'block' : 'none'; return false } },
      { id: 'copy', label: t('cors.btnCopy'), keepOpen: true, onClick: async (d) => { d.setStatus((await copyText(CONFIG_LINE)) ? t('cors.copied', CONFIG_LINE) : t('cors.copyFail')); return false } },
      { id: 'folder', label: t('cors.btnFolder'), keepOpen: true, onClick: (d) => {
          try { window.openPluginsFolder() } catch (e) { log.error('openPluginsFolder falló:', e) }
          d.setStatus(t('cors.folderDone'))
          return false
        } },
      { id: 'restart', label: t('cors.btnRestart'), keepOpen: true, onClick: (d) => {
          d.setStatus(t('cors.restarting'))
          setTimeout(() => { try { window.restartClient() } catch (e) { log.error('restartClient falló:', e); d.setStatus(t('cors.restartFail'), 'error') } }, 400)
          return false
        } },
      { id: 'later', label: t('cors.later') },
      { id: 'never', label: t('cors.never') },
    ],
  })
}

// Inicio de sesión. result.value = { premium } si salió bien.
export function loginMenu() {
  return openForm({
    id: 'login',
    title: t('login.title'),
    description: t('login.desc'),
    fields: [
      { name: 'email', label: t('login.email'), type: 'email', placeholder: t('login.emailPh'), required: true, autocomplete: 'username' },
      { name: 'password', label: t('login.password'), type: 'password', required: true, autocomplete: 'current-password', focusOnError: true },
    ],
    submitLabel: t('login.submit'),
    onSubmit: async ({ email, password }) => {
      const r = await login(email.trim(), password)
      if (r.ok) {
        notify.success(t('login.ok'))
        app.resetData()              // la cuenta puede ser otra (otro plan): nada cacheado le sirve
        app.controller.refresh()
        return { premium: r.premium }
      }
      return r.reason === 'network' ? t('login.errNetwork') : t('login.errBad')
    },
  })
}

async function logoutFlow() {
  const ok = await confirm({
    id: 'logout-confirm', title: t('logout.title'),
    message: t('logout.msg'),
    confirmLabel: t('logout.btn'), danger: true,
  })
  if (ok) {
    logout()
    app.resetData()
    app.controller.refresh()
    notify.success(t('logout.ok'))
  }
}

// Simula un Champion Select para ver la recomendación sin estar en una partida. Campos de texto libres:
// campeón (nombre), rival (opcional), rol (top/jungla/mid/adc/support) y rango (oro/platino/esmeralda/diamante/master).
export function simulateMenu() {
  return openForm({
    id: 'simulate',
    title: t('sim.title'),
    description: t('sim.desc'),
    fields: [
      { name: 'champion', label: t('sim.champion'), placeholder: 'Kai\'Sa', required: true },
      { name: 'opponent', label: t('sim.opponent'), placeholder: 'Jinx' },
      { name: 'role', label: t('sim.role'), placeholder: t('sim.rolePh') },
      { name: 'tier', label: t('sim.tier'), placeholder: t('sim.tierPh') },
    ],
    submitLabel: t('sim.submit'),
    onSubmit: async (v, hd) => {
      hd.setStatus(t('sim.searching'))
      await app.catalog.load()
      const champ = app.catalog.findChampion(v.champion)
      if (!champ) return app.catalog.isLoaded() ? t('sim.notFound', v.champion.trim()) : t('sim.notLoaded')
      let opp = null
      if (v.opponent.trim()) {
        opp = app.catalog.findChampion(v.opponent)
        if (!opp) return t('sim.oppNotFound', v.opponent.trim())
      }
      const role = v.role.trim() ? parseRole(v.role) : ROLE_FILL
      if (role === undefined) return t('sim.badRole')
      const tier = v.tier.trim() ? parseTier(v.tier) : undefined
      if (v.tier.trim() && tier === undefined) return t('sim.badTier')
      app.controller.simulate({ championId: champ.id, ...(opp && { opponentChampionId: opp.id }), role, ...(tier && { lobbyTier: tier }) })
      return { champion: champ.id }
    },
  })
}

// Aviso previo a activar «Aplicar». Devuelve Promise<boolean>: true si el usuario acepta (y queda activado).
export async function enableApplyFlow() {
  if (app.applier.canApply()) return true
  const ok = await confirm({
    id: 'apply-consent', title: t('consent.title'),
    message: t('consent.msg'),
    confirmLabel: t('consent.btn'),
  })
  if (ok) app.applier.setEnabled(true)
  return ok
}

// Aviso previo a activar el consejero de picks (la composición del draft se envía a iTero). Devuelve Promise<boolean>.
export async function enableAdvisorFlow() {
  if (app.advisor.isEnabled()) return true
  const ok = await confirm({ id: 'advisor-consent', title: t('advisor.title'), message: t('advisor.msg'), confirmLabel: t('advisor.btn') })
  if (ok) await app.advisor.setEnabled(true)
  return ok
}

// Menú principal del plugin: la pantalla gráfica de ajustes (presentation/settings.js).
function togglePanel(enabled) {
  setPanelPrefs({ enabled })
  window.dispatchEvent(new Event('easy-coachless:prefs'))
  if (enabled) window.dispatchEvent(new Event('easy-coachless:show-panel'))
}

// Alterna el idioma (es ⇄ en) y avisa al panel para que se repinte.
function toggleLanguage() {
  setLanguagePref(getLang() === 'es' ? 'en' : 'es')
  window.dispatchEvent(new Event('easy-coachless:prefs'))
}

export function mainMenu() {
  return openSettings({
    applier: app.applier,
    catalog: app.catalog,
    filters: app.filters,
    source: app.source,
    overlay: app.overlay,
    advisor: app.advisor,
    getSession: sessionInfo,
    isSimulating: () => app.controller.getState().context?.source === 'manual',
    panelEnabled: () => getPanelPrefs().enabled,
    actions: {
      login: loginMenu,
      logout: logoutFlow,
      simulate: simulateMenu,
      cors: corsSetupMenu,
      enableApply: enableApplyFlow,
      enableAdvisor: enableAdvisorFlow,
      reopen: mainMenu,
      unsimulate: () => app.controller.simulate(null),
      togglePanel: () => togglePanel(!getPanelPrefs().enabled),
      toggleLanguage,
    },
  })
}
