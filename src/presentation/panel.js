// easy-coachless/src/presentation/panel.js — panel flotante con las runas y hechizos recomendados
//
// Diseño: casi sin texto. La cabecera son los retratos (tú ⚔ rival) y el rol; cada bloque lo identifica el icono de su árbol
// de runas; los hechizos llevan la tecla (D/F) donde se colocarán; los avisos son iconos con tooltip; los estados
// (cargando, esperando, aplicado, error) se ven con esqueletos, giros y marcas, no con párrafos.
// Muestra la recomendación y ofrece «Aplicar» (todo / runas / hechizos): SIEMPRE una acción explícita del usuario (clic o
// Ctrl+Shift+A) a través de application/configuration.js, desactivado hasta que el usuario lo acepta.
// No hace fetch: lee el estado del controlador (application/champ-select.js) y el catálogo de nombres/iconos.

import { h, whenReady } from './ui.js'
import { icon } from './icons.js'
import { ROLE_NAMES, tiersLabel } from '../domain/lobby.js'
import { TREES } from '../domain/runes.js'
import { buildSpellPair } from '../domain/configuration.js'
import { getPanelPrefs, setPanelPrefs } from '../application/preferences.js'
import { log } from '../shared/logger.js'

const STYLE_ID = 'easy-coachless-panel-style'
const CSS = `
.ecp{position:fixed;z-index:2147483000;width:292px;box-sizing:border-box;background:linear-gradient(#0a1428,#010a13 60px);color:#cdbe91;border:1px solid #785a28;box-shadow:0 0 18px #000;font:13px/1.4 sans-serif;user-select:none;animation:ecp-in .2s ease-out}
.ecp-head{display:flex;align-items:center;gap:6px;padding:6px 8px;cursor:move;border-bottom:1px solid #3c3c41}
.ecp-title{flex:1;display:flex;align-items:center;gap:7px;min-width:0}
.ecp-por{width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #c8aa6e;background:#1e2328;flex:none;box-sizing:border-box}
.ecp-por.ecp-foe{border-color:#a8404f;width:26px;height:26px}
.ecp-vs{color:#a8404f;display:flex}
.ecp-role{margin-left:2px;padding:1px 7px;border:1px solid #3c3c41;border-radius:9px;font-size:10px;letter-spacing:.08em;color:#a09b8c;background:#010a13}
.ecp-x{display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:none;border:0;color:#7b7a76;cursor:pointer;padding:0}
.ecp-x:hover{color:#f0e6d2}
.ecp-up{transform:rotate(180deg)}
.ecp-body{padding:10px 10px 8px;display:flex;flex-direction:column;gap:9px}
.ecp-line{display:flex;align-items:center;gap:7px}
.ecp-grow{flex:1}
.ecp-tree{width:22px;height:22px;flex:none;border-radius:50%;opacity:.85;object-fit:cover}
.ecp-it{position:relative;display:flex;flex-direction:column;align-items:center;width:40px;text-align:center}
.ecp-ico{width:34px;height:34px;border-radius:50%;background:#1e2328;border:1px solid #3c3c41;object-fit:cover;box-sizing:border-box;transition:transform .12s}
.ecp-it:hover .ecp-ico{transform:scale(1.12);border-color:#c8aa6e}
.ecp-ico.ecp-big{width:44px;height:44px;border:2px solid #c8aa6e;box-shadow:0 0 12px rgba(200,170,110,.45)}
.ecp-ico.ecp-sq{border-radius:4px}
.ecp-ico.ecp-sm{width:24px;height:24px}
.ecp-ph{display:flex;align-items:center;justify-content:center;font-size:10px;color:#a09b8c}
.ecp-w{font-size:10px;line-height:12px;color:#a09b8c;margin-top:1px}
.ecp-w.ecp-pos{color:#0ac8b9}.ecp-w.ecp-neg{color:#e84057}
.ecp-keycap{position:absolute;right:0;top:-3px;min-width:14px;padding:0 3px;box-sizing:border-box;text-align:center;font:bold 10px/14px sans-serif;color:#f0e6d2;background:#3b3119;border:1px solid #c8aa6e;border-bottom-width:2px;border-radius:3px}
.ecp-chip{padding:0;margin:0;background:none;border:2px solid transparent;border-radius:50%;cursor:pointer;line-height:0;transition:.12s}
.ecp-chip:hover{border-color:#785a28}
.ecp-chip.ecp-on{border-color:#c8aa6e;box-shadow:0 0 8px rgba(200,170,110,.5)}
.ecp-chip .ecp-ico{width:28px;height:28px}
.ecp-lead{color:#a8404f;display:flex}
.ecp-tags{display:flex;flex-wrap:wrap;gap:5px}
.ecp-tag{display:flex;align-items:center;gap:4px;padding:1px 7px;border:1px solid #2a2a30;border-radius:9px;font-size:10px;color:#7b7a76;background:#0a1428}
.ecp-tag.ecp-gold{border-color:#785a28;color:#c8aa6e}
.ecp-tag.ecp-warn{border-color:#8a6a1f;color:#e0a93a;cursor:help}
.ecp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#1e2328;color:#cdbe91;border:1px solid #785a28;padding:5px 12px;cursor:pointer;font:inherit;transition:.12s}
.ecp-btn:hover:not(:disabled){border-color:#c8aa6e;color:#f0e6d2}
.ecp-btn:disabled{opacity:.4;cursor:default}
.ecp-apply{display:flex;gap:6px}
.ecp-apply .ecp-btn{height:32px}
.ecp-apply .ecp-main{flex:1;border-color:#c8aa6e;color:#f0e6d2;background:linear-gradient(#2a2314,#17130a);font-weight:bold;letter-spacing:.08em;text-transform:uppercase;font-size:12px}
.ecp-apply .ecp-sec{width:36px;padding:0}
.ecp-btn.ecp-done{border-color:#0ac8b9;color:#0ac8b9;background:#06201f}
.ecp-btn.ecp-done .ec-ico{animation:ecp-pop .3s ease-out}
.ecp-spin{width:14px;height:14px;border:2px solid #785a28;border-top-color:#f0e6d2;border-radius:50%;animation:ecp-rot .7s linear infinite;display:inline-block}
.ecp-msg{display:flex;align-items:center;gap:6px;font-size:11px;color:#e84057;line-height:1.3}
.ecp-center{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0;color:#a09b8c;text-align:center;font-size:12px}
.ecp-pulse{color:#c8aa6e;animation:ecp-pulse 1.4s ease-in-out infinite}
.ecp-sk{width:34px;height:34px;border-radius:50%;background:linear-gradient(90deg,#1e2328,#2b3036,#1e2328);background-size:200% 100%;animation:ecp-shimmer 1.2s linear infinite}
.ecp-sk.ecp-still{animation:none;opacity:.5}
.ecp-fab{position:fixed;z-index:2147483000;left:10px;bottom:10px;width:30px;height:30px;border-radius:50%;border:1px solid #785a28;background:#010a13;color:#c8aa6e;font:bold 11px sans-serif;cursor:pointer;opacity:.55;transition:.15s}
.ecp-fab:hover{opacity:1;box-shadow:0 0 10px rgba(200,170,110,.5)}
@keyframes ecp-in{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
@keyframes ecp-rot{to{transform:rotate(360deg)}}
@keyframes ecp-pop{0%{transform:scale(.4)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes ecp-pulse{0%,100%{opacity:.45;transform:scale(.94)}50%{opacity:1;transform:scale(1.06)}}
@keyframes ecp-shimmer{to{background-position:-200% 0}}
`

// Tooltips largos de los avisos (el panel solo muestra un icono).
const NOTICES = {
  'matchup-requires-premium': ['crown', 'El matchup requiere cuenta premium: se muestran los datos del campeón.'],
  'matchup-low-sample': ['warn', 'Hay pocas partidas de este matchup: se muestran los datos del campeón.'],
  'filters-downgraded': ['warn', 'Tu cuenta no admite algún filtro (rango de parches o matchup): se usó uno más simple.'],
  'patch-low-sample': ['warn', 'El último parche tiene pocos datos: se usa el anterior.'],
}
const ERRORS = {
  network: 'Sin conexión con Coachless',
  forbidden: 'Coachless rechazó la consulta',
  'no-data': 'Aún no hay datos suficientes',
  'no-patch': 'Parche actual desconocido',
  auth: 'Sesión caducada',
}
const APPLY_ERRORS = {
  disabled: 'Aplicar está desactivado',
  incomplete: 'Faltan runas en la recomendación',
  invalid: 'Página no válida',
  lcu: 'Sin conexión con el cliente',
  'not-editable': 'La página activa no es editable',
  'no-slot': 'Sin hueco: borra una página o usa «Activa» en ajustes',
  rejected: 'Rechazado por el cliente',
  'not-in-champ-select': 'Solo en la selección de campeón',
}

const fmtWpa = (w) => (w >= 0 ? '+' : '') + w.toFixed(1)
const fmtN = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(n))

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

const pic = (info, cls, title) => info.icon
  ? h('img', { class: cls, src: info.icon, alt: info.name, title: title ?? info.name, draggable: 'false' })
  : h('div', { class: cls + ' ecp-ph', title: title ?? info.name }, String(info.name).slice(0, 2))

// Un elemento con icono + WPA (número pequeño). `stat` = { wpa, occurrence } opcional; `key` = tecla del hechizo.
function item(info, stat, cls = '', key = null) {
  const tip = info.name + (stat ? ` · WPA ${fmtWpa(stat.wpa)} · ${stat.occurrence.toLocaleString('es')} partidas` : '')
  return h('div', { class: 'ecp-it' }, pic(info, 'ecp-ico ' + cls, tip),
    key && h('span', { class: 'ecp-keycap' }, key),
    stat && h('div', { class: 'ecp-w ' + (stat.wpa >= 0 ? 'ecp-pos' : 'ecp-neg') }, fmtWpa(stat.wpa)))
}

const line = (...children) => h('div', { class: 'ecp-line' }, children)

function treeIcon(id, cat) {
  const info = cat.rune(id)
  const name = info.name !== '#' + id ? info.name : TREES[id]?.name ?? ''
  return info.icon ? h('img', { class: 'ecp-tree', src: info.icon, alt: name, title: name, draggable: 'false' }) : h('div', { class: 'ecp-tree ecp-ph', title: name }, '')
}

function runesBlock(d, cat, flashKey) {
  const r = (id) => cat.rune(id)
  const pair = buildSpellPair(d, flashKey)
  const keys = pair.ok ? ['D', 'F'] : [null, null]
  const spells = pair.ok ? [pair.spell1Id, pair.spell2Id].map((id) => d.spells.find((s) => s.spell === id)) : d.spells
  return [
    line(treeIcon(d.primaryTree, cat), item(r(d.keystone.rune), d.keystone, 'ecp-big'), ...d.primaryPicks.filter(Boolean).map((p) => item(r(p.rune), p))),
    line(
      d.secondaryTree ? treeIcon(d.secondaryTree, cat) : null,
      ...d.secondaryPicks.map((p) => item(r(p.rune), p)),
      h('div', { class: 'ecp-grow' }),
      ...d.shards.map((id) => h('div', { class: 'ecp-it', style: 'width:28px' }, pic(r(id), 'ecp-ico ecp-sm', r(id).name)))),
    d.spells.length ? line(...spells.map((s, i) => item(cat.spell(s.spell), s, 'ecp-sq', keys[i]))) : null,
  ]
}

function titleOf(state, cat) {
  const c = state.context
  if (!c?.championId) return 'Easy Coachless'
  const me = cat.champion(c.championId).name
  const rival = state.status === 'ready' ? state.data.meta.opponent : c.opponentChampionId
  const vs = rival ? ` vs ${cat.champion(rival).name}` : ''
  return `${me}${vs} · ${ROLE_NAMES[c.role] ?? ''}`
}

// Cabecera: tu retrato ⚔ retrato del rival + rol (el texto completo queda en el tooltip).
function titleNode(state, cat) {
  const c = state.context
  if (!c?.championId) return h('div', { class: 'ecp-title', title: 'Easy Coachless' }, h('div', { class: 'ecp-por ecp-ph' }, '?'))
  const rival = state.status === 'ready' ? state.data.meta.opponent : c.opponentChampionId
  return h('div', { class: 'ecp-title', title: titleOf(state, cat) },
    pic(cat.champion(c.championId), 'ecp-por'),
    rival && h('span', { class: 'ecp-vs' }, icon('swords', 14)),
    rival && pic(cat.champion(rival), 'ecp-por ecp-foe'),
    ROLE_NAMES[c.role] && h('span', { class: 'ecp-role' }, ROLE_NAMES[c.role]))
}

// Rivales ya revelados: clic para elegir con cuál se calcula el matchup; clic en el elegido a mano vuelve al automático.
function rivalsBlock(state, cat, actions) {
  const c = state.context
  const enemies = c?.enemies ?? []
  if (!enemies.length) return null
  const used = c.opponentChampionId ?? null // el pedido (aunque el matchup no tenga datos y se muestre la build general)
  return h('div', { class: 'ecp-line ecp-rivals', title: 'Rival para el matchup' }, h('span', { class: 'ecp-lead' }, icon('swords', 16)),
    enemies.map((e) => {
      const info = cat.champion(e.championId)
      const on = e.championId === used
      return h('button', {
        type: 'button', class: 'ecp-chip' + (on ? ' ecp-on' : ''), title: info.name + (on ? ' (en uso)' : ''),
        onclick: () => actions.pick(on && c.opponentSource === 'manual' ? null : e.championId),
      }, pic(info, 'ecp-ico'))
    }))
}

const runesKey = (d) => JSON.stringify([d.keystone.rune, d.primaryPicks.map((p) => p?.rune), d.secondaryPicks.map((p) => p.rune), d.shards])
const spellsKey = (d) => JSON.stringify(d.spells.map((s) => s.spell))

// Botones de aplicar: grande «Aplicar» (todo) + dos cuadrados (página de runas / hechizos). Estados: giro → ✓.
// `ui` = { busy, kind, msg:{text}|null, applied:{runes,spells} } (claves de lo ya aplicado).
function applyBlock(state, actions, ui) {
  const d = state.data
  const canRunes = d.primaryPicks.length === 3 && d.secondaryPicks.length === 2 && d.shards.length === 3 && d.primaryPicks.every(Boolean)
  const canSpells = d.spells.length === 2
  const inChampSelect = state.context?.source === 'lcu'
  const doneRunes = ui.applied.runes === runesKey(d)
  const doneSpells = canSpells && ui.applied.spells === spellsKey(d)
  const mk = (kind, ico, label, disabled, title, done, busy, cls) => h('button', {
    type: 'button', class: `ecp-btn ${cls}` + (done ? ' ecp-done' : ''), 'data-apply': kind,
    disabled: disabled || ui.busy ? 'disabled' : null, title, onclick: () => actions.apply(kind),
  }, busy ? h('span', { class: 'ecp-spin' }) : icon(done ? 'check' : ico, cls === 'ecp-main' ? 16 : 17), label && (done ? 'Hecho' : label))
  const all = doneRunes && (doneSpells || !canSpells || !inChampSelect)
  return h('div', { class: 'ecp-sect' },
    h('div', { class: 'ecp-apply' },
      mk('all', 'bolt', 'Aplicar', !canRunes && !(canSpells && inChampSelect), 'Aplica las runas y, en Champion Select, los hechizos (Ctrl+Shift+A)', all, ui.busy, 'ecp-main'),
      mk('runes', 'page', '', !canRunes, canRunes ? 'Solo las runas' : 'Faltan runas en la recomendación', doneRunes, ui.busy && ui.kind === 'runes', 'ecp-sec'),
      canSpells ? mk('spells', 'spark', '', !inChampSelect, inChampSelect ? 'Solo los hechizos' : 'Solo en Champion Select', doneSpells, ui.busy && ui.kind === 'spells', 'ecp-sec') : null),
    ui.msg ? h('div', { class: 'ecp-msg ecp-err' }, icon('warn', 13), ui.msg.text) : null)
}

// Etiquetas pequeñas: parche, rango, partidas, matchup, simulación y avisos (icono con tooltip).
function tagsBlock(state) {
  const m = state.data.meta
  return h('div', { class: 'ecp-tags' },
    h('span', { class: 'ecp-tag', title: 'Parche' }, m.patch),
    h('span', { class: 'ecp-tag', title: 'Rango de la lobby' }, tiersLabel(m.tiers)),
    h('span', { class: 'ecp-tag', title: 'Partidas analizadas' }, fmtN(m.sample)),
    m.matchup && h('span', { class: 'ecp-tag ecp-gold ecp-tag-matchup', title: 'Datos del matchup' }, icon('swords', 11)),
    state.context?.source === 'manual' && h('span', { class: 'ecp-tag ecp-gold ecp-tag-sim', title: 'Simulación manual' }, icon('target', 11)),
    m.notices.map((n) => (NOTICES[n] ? h('span', { class: 'ecp-tag ecp-warn', title: NOTICES[n][1] }, icon(NOTICES[n][0], 11)) : null)))
}

const skeleton = (still = false) => [
  line(...Array.from({ length: 5 }, () => h('div', { class: 'ecp-sk' + (still ? ' ecp-still' : '') }))),
  line(...Array.from({ length: 2 }, () => h('div', { class: 'ecp-sk' + (still ? ' ecp-still' : '') }))),
]

function bodyOf(state, cat, actions, ui, flashKey) {
  switch (state.status) {
    case 'waiting': return [h('div', { class: 'ecp-center', title: 'Elige un campeón para ver runas y hechizos' }, h('span', { class: 'ecp-pulse' }, icon('target', 28))), ...skeleton(true)]
    case 'loading': return skeleton()
    case 'needs-login': return [h('div', { class: 'ecp-center' }, icon('user', 26), h('button', { class: 'ecp-btn', type: 'button', title: 'Iniciar sesión en Coachless', onclick: actions.login }, icon('user', 14), 'Entrar'))]
    case 'error': {
      const auth = state.reason === 'auth'
      return [
        h('div', { class: 'ecp-center' }, h('span', { style: 'color:#e0a93a' }, icon('warn', 26)), ERRORS[state.reason] ?? 'Error inesperado',
          h('button', { class: 'ecp-btn', type: 'button', title: auth ? 'Iniciar sesión' : 'Reintentar', onclick: auth ? actions.login : actions.retry }, icon(auth ? 'user' : 'refresh', 15))),
        rivalsBlock(state, cat, actions),
      ]
    }
    case 'ready': return [
      ...runesBlock(state.data, cat, flashKey),
      applyBlock(state, actions, ui),
      rivalsBlock(state, cat, actions),
      tagsBlock(state),
    ]
    default: return []
  }
}

/**
 * Monta el panel (y el botón de acceso al menú). `deps`: { controller, catalog, applier, onEnableApply, onLogin, onMenu }.
 * onEnableApply(): pide al usuario aceptar el aviso de «Aplicar»; devuelve Promise<boolean>.
 * Devuelve { destroy }.
 */
export async function mountPanel({ controller, catalog, applier, onEnableApply, onLogin, onMenu }) {
  await whenReady()
  ensureStyle()
  let lastHidden = null
  let dismissedKey = null // × pulsado: oculto mientras el campeón y el rival sean los mismos
  const keyOf = (st) => (st.context ? `${st.context.championId}|${st.context.opponentChampionId ?? 0}|${st.context.source ?? ''}` : null)
  let prefs = getPanelPrefs()
  const ui = { busy: false, kind: null, msg: null, applied: { runes: null, spells: null } }
  let uiKey = null // el aviso de error solo vale para la recomendación a la que se aplicó

  const root = h('div', { class: 'ecp', style: 'display:none' })
  const fab = h('button', { class: 'ecp-fab', type: 'button', title: 'Easy Coachless (Ctrl+Shift+E)', onclick: () => reopen() || onMenu() }, 'EC')
  // El botón EC reabre el panel si se cerró con ×; si ya está visible, abre el menú.
  const reopen = () => {
    if (dismissedKey === null) return false
    dismissedKey = null
    render(controller.getState())
    return true
  }
  const attach = () => {
    if (!document.body) return
    if (!root.isConnected) document.body.append(root)
    if (!fab.isConnected) document.body.append(fab)
  }

  const place = () => {
    root.style.right = prefs.x == null ? '16px' : 'auto'
    root.style.left = prefs.x == null ? 'auto' : prefs.x + 'px'
    root.style.top = (prefs.y ?? 96) + 'px'
  }

  const render = (state) => {
    attach()
    if (state.status === 'idle') dismissedKey = null
    const show = prefs.enabled && dismissedKey !== keyOf(state) && state.status !== 'idle'
    root.style.display = show ? 'block' : 'none'
    if (!show) {
      if (state.status !== 'idle' && state.status !== lastHidden) log.info('panel oculto', prefs.enabled ? '(cerrado con ×)' : '(desactivado: menú → «Panel»)')
      lastHidden = state.status
      return
    }
    lastHidden = null
    place()
    const toggle = () => { prefs = setPanelPrefs({ collapsed: !prefs.collapsed }); render(controller.getState()) }
    const head = h('div', { class: 'ecp-head' },
      titleNode(state, catalog),
      h('button', { class: 'ecp-x', type: 'button', title: prefs.collapsed ? 'Desplegar' : 'Plegar', onclick: toggle }, icon('chevron', 15, prefs.collapsed ? '' : 'ecp-up')),
      h('button', { class: 'ecp-x', type: 'button', title: 'Cerrar (reaparece si cambias de campeón o rival)', onclick: () => { dismissedKey = keyOf(controller.getState()); render(controller.getState()) } }, icon('close', 14)))
    enableDrag(head)
    if (state.status !== 'ready' || runesKey(state.data) !== uiKey) { ui.msg = null; uiKey = state.status === 'ready' ? runesKey(state.data) : null }
    const body = prefs.collapsed ? null : h('div', { class: 'ecp-body' }, bodyOf(state, catalog, {
      login: () => onLogin(),
      retry: () => controller.refresh(),
      pick: (id) => controller.setOpponent(id),
      apply: (kind) => apply(kind),
    }, ui, applier.getSettings().flashKey))
    root.replaceChildren(head, ...(body ? [body] : []))
  }

  // Aplica la recomendación mostrada. kind: 'all' | 'runes' | 'spells'. Si Aplicar está desactivado, primero se pide aceptar el aviso.
  async function apply(kind) {
    const st = controller.getState()
    if (st.status !== 'ready' || ui.busy) return
    if (!applier.canApply() && !(await onEnableApply())) return
    const d = st.data
    const names = { champion: catalog.champion(st.context.championId).name, opponent: d.meta.opponent ? catalog.champion(d.meta.opponent).name : null }
    ui.busy = true; ui.kind = kind; ui.msg = null; render(controller.getState())
    const problems = []
    if (kind !== 'spells') {
      const r = await applier.applyRunes(d, names)
      if (r.ok) { ui.applied.runes = runesKey(d); if (!r.verified) problems.push('Runas: el cliente no confirmó el cambio') }
      else problems.push('Runas: ' + (APPLY_ERRORS[r.reason] ?? 'error inesperado'))
    }
    if (kind !== 'runes' && d.spells.length === 2 && (kind === 'spells' || st.context.source === 'lcu')) {
      const r = await applier.applySpells(d)
      if (r.ok) ui.applied.spells = spellsKey(d)
      else problems.push('Hechizos: ' + (APPLY_ERRORS[r.reason] ?? 'error inesperado'))
    }
    ui.busy = false; ui.kind = null
    ui.msg = problems.length ? { text: problems.join(' · ') } : null
    render(controller.getState())
  }

  function enableDrag(head) {
    head.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return
      const r = root.getBoundingClientRect()
      const dx = e.clientX - r.left
      const dy = e.clientY - r.top
      const move = (ev) => {
        const x = Math.max(0, Math.min(window.innerWidth - 60, ev.clientX - dx))
        const y = Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy))
        prefs = { ...prefs, x, y }
        place()
      }
      const up = () => { removeEventListener('mousemove', move); removeEventListener('mouseup', up); setPanelPrefs({ x: prefs.x, y: prefs.y }) }
      addEventListener('mousemove', move)
      addEventListener('mouseup', up)
      e.preventDefault()
    })
  }

  // El cliente puede reconstruir su interfaz: si desaparecen el panel o el botón, se vuelven a poner.
  const guard = setInterval(attach, 5000)
  const onPrefs = () => { prefs = getPanelPrefs(); render(controller.getState()) }
  addEventListener('easy-coachless:prefs', onPrefs)
  const onShow = () => { dismissedKey = null; render(controller.getState()) }
  addEventListener('easy-coachless:show-panel', onShow)
  const onKey = (e) => {
    if (!e.ctrlKey || !e.shiftKey) return
    if (e.key === 'E' || e.key === 'e') { e.preventDefault(); onMenu() }
    else if (e.key === 'A' || e.key === 'a') { e.preventDefault(); apply('all') }
  }
  addEventListener('keydown', onKey)

  // Cuando el catálogo termina de cargar (nombres/iconos), se repinta una vez.
  catalog.load().then(() => render(controller.getState())).catch((e) => log.warn('catálogo:', String(e)))
  const off = controller.subscribe(render)
  attach()

  return {
    destroy() {
      off(); clearInterval(guard)
      removeEventListener('keydown', onKey); removeEventListener('easy-coachless:prefs', onPrefs); removeEventListener('easy-coachless:show-panel', onShow)
      root.remove(); fab.remove()
    },
  }
}
