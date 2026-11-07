// draftsage/src/presentation/native.js — la interfaz del plugin integrada en el propio Champion Select del cliente
//
// En vez de una ventana flotante, se insertan tres piezas dentro de contenedores NATIVOS del cliente (DOM de la 16.22, ver docs/champ-select-dom.md):
//   1. BARRA DE RUNAS Y HECHIZOS (`.loadouts-edit-component`, justo antes de `.loadoutsSpacer`): un botón con la runa clave recomendada y el árbol
//      secundario + un botón ⚡ para aplicar (giro → ✓). El clic en la runa abre la vista «build» (runas, hechizos, ítems, rivales) como popover
//      que SUBE desde la barra. Estados: esperando campeón · consultando · lista · aplicada · sin sesión · error.
//   2. CABECERA DE LA CUADRÍCULA (`.champion-grid-header`, antes de `.spacer`): tira con los mejores picks (contra tu rival, o los del draft de
//      iTero si aún no hay rival) y un botón de filtros con su contador. El clic en un retrato LOCALIZA la ficha en la cuadrícula (la desplaza a
//      la vista y la hace parpadear; nunca la elige por ti). El botón abre la vista «picks» (filtros, listas completas, rivales) que BAJA desde ahí.
//   3. BOTÓN «DS» (menú de ajustes) FIJO ABAJO A LA DERECHA de la ventana, colgado de <body>: el contenedor nativo `.bottom-right-buttons`
//      no dejaba hacer clic (el cliente lo cubre/ignora los eventos), así que ya no se usa como ancla. Aparece mientras haya selección.
// Todo cuelga de panel.js (modo anclado: popover pegado al elemento, sin arrastre). Si el DOM no se reconoce (otra versión del cliente), si es una
// simulación o si ya hay partida, no se inserta nada y sigue el panel flotante de siempre. Las piezas se reponen solas si el cliente las borra.
// No hace fetch: lee el estado de los controladores. Sin innerHTML: todo con h().

import { h, whenReady } from './ui.js'
import { icon } from './icons.js'
import { pickTip } from './panel.js'
import { buildSpellPair } from '../domain/configuration.js'
import { getPanelPrefs } from '../application/preferences.js'
import { t } from '../shared/i18n.js'
import { log } from '../shared/logger.js'

const STYLE_ID = 'draftsage-native-style'
const MAX_PICKS = 5
const CSS = `
.ecx{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;vertical-align:middle;font:12px/1.3 sans-serif;color:#cdbe91;user-select:none;-webkit-app-region:no-drag}
.ecx *{-webkit-app-region:no-drag;box-sizing:border-box}
.ecx button{font:inherit;color:inherit;cursor:pointer;padding:0;margin:0;outline:none}
.ecx svg{display:block}
.ecx-loadout{flex:none;margin:0 10px}
.ecx-key{position:relative;width:38px;height:38px;border-radius:50%;background:#010a13;border:2px solid #785a28;display:flex;align-items:center;justify-content:center;color:#a09b8c;transition:border-color .15s,box-shadow .15s,transform .15s}
.ecx-key:hover{border-color:#c8aa6e;box-shadow:0 0 10px rgba(200,170,110,.55);transform:scale(1.05)}
.ecx-key.ecx-open{border-color:#f0e6d2;box-shadow:0 0 12px rgba(240,230,210,.6)}
.ecx-key img.ecx-k{width:100%;height:100%;border-radius:50%;object-fit:cover}
.ecx-key .ecx-tree{position:absolute;right:-5px;bottom:-5px;width:18px;height:18px;border-radius:50%;background:#010a13;border:1px solid #785a28;object-fit:cover}
.ecx-key .ecx-dot{position:absolute;left:-3px;top:-3px;width:12px;height:12px;border-radius:50%;background:#1e2328;border:1px solid #785a28;display:flex;align-items:center;justify-content:center}
.ecx-key[data-state=loading]{border-color:#785a28;animation:ecx-pulse 1.2s ease-in-out infinite}
.ecx-key[data-state=waiting]{opacity:.7}
.ecx-key[data-state=error]{border-color:#8a6a1f;color:#e0a93a}
.ecx-key.ecx-pop{animation:ecx-pop .6s ease-out}
.ecx-ap{width:28px;height:28px;border-radius:50%;background:linear-gradient(#2a2314,#17130a);border:1px solid #c8aa6e;color:#f0e6d2;display:flex;align-items:center;justify-content:center;transition:.15s}
.ecx-ap:hover:not(:disabled){box-shadow:0 0 10px rgba(200,170,110,.6);transform:scale(1.08)}
.ecx-ap:disabled{opacity:.35;cursor:default;border-color:#5b5a56}
.ecx-ap.ecx-done{border-color:#0ac8b9;color:#0ac8b9;background:#06201f}
.ecx-ap.ecx-fail{border-color:#e0a93a;color:#e0a93a}
.ecx-ap.ecx-done svg{animation:ecx-pop .3s ease-out}
.ecx-spin{width:14px;height:14px;border:2px solid #785a28;border-top-color:#f0e6d2;border-radius:50%;animation:ecx-rot .7s linear infinite;display:inline-block}
.ecx-picks{flex:0 1 auto;min-width:0;max-width:100%;margin:0 8px;gap:4px;overflow:hidden}
.ecx-ib{flex:none;position:relative;width:26px;height:26px;border-radius:50%;background:#010a13;border:1px solid #785a28;color:#c8aa6e;display:flex;align-items:center;justify-content:center;transition:.15s}
.ecx-ib:hover{border-color:#c8aa6e;color:#f0e6d2;box-shadow:0 0 8px rgba(200,170,110,.5)}
.ecx-ib.ecx-open{border-color:#f0e6d2;color:#f0e6d2}
.ecx-ib .ecx-n{position:absolute;right:-5px;top:-5px;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:#c8aa6e;color:#1a1408;font:bold 10px/14px sans-serif;text-align:center}
.ecx-pk{flex:none;position:relative;display:flex;flex-direction:column;align-items:center;width:30px;background:none;border:0}
.ecx-pk img{width:26px;height:26px;border-radius:50%;object-fit:cover;border:1px solid #3c3c41;background:#1e2328;transition:.12s}
.ecx-pk:hover img{border-color:#c8aa6e;transform:scale(1.12)}
.ecx-pk b{display:block;margin-top:1px;font:bold 9px/10px sans-serif;color:#a09b8c}
.ecx-pk b.ecx-pos{color:#0ac8b9}.ecx-pk b.ecx-neg{color:#e84057}
.ecx-pk.ecx-shake{animation:ecx-shake .35s}
.ecx-hint{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:11px;color:#7b7a76}
.ecx-launch{position:fixed;right:14px;bottom:14px;z-index:2147483100;pointer-events:auto;cursor:pointer;justify-content:center;width:34px;height:34px;border-radius:50%;background:#010a13;border:1px solid #785a28;color:#c8aa6e;font:bold 11px/1 sans-serif;transition:.15s}
.ecx-launch:hover{border-color:#c8aa6e;color:#f0e6d2;box-shadow:0 0 10px rgba(200,170,110,.5)}
.grid-champion.ecx-flash .grid-champion-hitbox{animation:ecx-flash .5s ease-in-out 3;box-shadow:inset 0 0 0 2px #f0c870,0 0 14px #f0c870}
@keyframes ecx-pulse{0%,100%{box-shadow:0 0 0 rgba(200,170,110,0)}50%{box-shadow:0 0 12px rgba(200,170,110,.7)}}
@keyframes ecx-pop{0%{transform:scale(.7)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
@keyframes ecx-rot{to{transform:rotate(360deg)}}
@keyframes ecx-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@keyframes ecx-flash{0%,100%{filter:none}50%{filter:brightness(1.7)}}
`

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

// ---- Detección del DOM del cliente ----

/** ¿Se ve de verdad (en el DOM, con tamaño y no oculto)? El cliente deja pantallas montadas con opacity 0 / sin tamaño. */
export function isShown(el) {
  if (!el || !el.isConnected) return false
  const r = el.getBoundingClientRect()
  if (r.width < 1 || r.height < 1) return false
  const cs = getComputedStyle(el)
  return cs.visibility !== 'hidden' && cs.display !== 'none'
}

/**
 * Puntos de anclaje de Champion Select (null si no existen). Cada uno es { parent, before }: dónde insertar (antes de `before`, o al final).
 * Selectores del DOM de la 16.22; si el cliente cambia, basta con ajustar aquí (y docs/champ-select-dom.md).
 */
export function findAnchors(root = document) {
  const loadout = root.querySelector('.loadouts-edit-component')
  const header = root.querySelector('.champion-grid-header')
  const buttons = root.querySelector('.bottom-right-buttons')
  const child = (p, sel) => p.querySelector(':scope > ' + sel)
  return {
    loadout: loadout ? { parent: loadout, before: child(loadout, '.loadoutsSpacer') ?? child(loadout, '.ward-skin-select-component') } : null,
    header: header ? { parent: header, before: child(header, '.spacer') } : null,
    buttons: buttons ? { parent: buttons, before: buttons.firstElementChild } : null,
  }
}

/** Diagnóstico para pegarlo en un informe (sin contenido de la página): qué anclas hay y si se ven. */
export function probeNative(root = document) {
  const a = findAnchors(root)
  const r = Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v ? { visible: isShown(v.parent), before: v.before ? v.before.className : null } : null]))
  r.fichas = root.querySelectorAll('.grid-champion[data-id]').length
  log.info('nativeProbe', JSON.stringify(r))
  return r
}

/** Localiza una ficha de la cuadrícula: la desplaza a la vista y la hace parpadear. false si no está pintada (la cuadrícula es virtual). */
export function flashTile(id, root = document) {
  const tile = root.querySelector(`.grid-champion[data-id="${Number(id)}"]`)
  if (!tile) return false
  tile.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  tile.classList.add('ecx-flash')
  setTimeout(() => tile.classList.remove('ecx-flash'), 1700)
  return true
}

// ---- Montaje ----

/**
 * @param {{panel:object, controller:object, catalog:object, overlay:object, advisor:object, filters:object,
 *          onMenu:()=>void, root?:Document}} deps — `panel` es lo que devuelve mountPanel().
 * Devuelve { destroy, sync }.
 */
export async function mountNative({ panel, controller, catalog, overlay, advisor, filters, onMenu, root = document }) {
  await whenReady()
  ensureStyle()

  const el = {
    loadout: h('div', { class: 'ecx ecx-loadout', 'data-ecx': 'loadout' }),
    picks: h('div', { class: 'ecx ecx-picks', 'data-ecx': 'picks' }),
    launch: h('button', { class: 'ecx ecx-launch', type: 'button', 'data-ecx': 'launcher', title: t('nat.launch'), onclick: () => onMenu() }, 'DS'),
  }
  const sig = { loadout: '', picks: '' }
  let docked = false
  let warned = false
  let timer = 0
  let popTimer = 0
  let lastKey = ''

  // ---- Barra de runas y hechizos ----
  function paintLoadout(st) {
    const d = st.status === 'ready' ? st.data : st.status === 'loading' ? st.stale : null
    const ps = panel.status()
    const state = st.status === 'ready' ? 'ready' : st.status === 'loading' ? (d ? 'ready' : 'loading') : st.status // waiting | needs-login | error
    const open = panel.view() === 'build'
    const key = d ? `${d.keystone.rune}|${d.secondaryTree ?? ''}` : ''
    const s = JSON.stringify([state, key, st.status === 'loading' && !!d, open, ps.busy, ps.done, ps.failed, st.context?.championId, st.context?.opponentChampionId ?? 0, catalog.isLoaded?.() ?? true])
    if (s === sig.loadout) return
    sig.loadout = s

    const champ = st.context?.championId ? catalog.champion(st.context.championId).name : ''
    const rival = st.status === 'ready' ? st.data.meta.opponent : st.context?.opponentChampionId
    const head = champ + (rival ? ' vs ' + catalog.champion(rival).name : '')
    let tip = t('nat.buildOpen')
    let face
    if (d) {
      const ks = catalog.rune(d.keystone.rune)
      const tree = d.secondaryTree ? catalog.rune(d.secondaryTree) : null
      tip = `${head}\n${ks.name}${tree ? ' + ' + tree.name : ''}\n${tip}`
      face = [
        ks.icon ? h('img', { class: 'ecx-k', src: ks.icon, alt: ks.name, draggable: 'false' }) : icon('target', 20),
        tree?.icon ? h('img', { class: 'ecx-tree', src: tree.icon, alt: tree.name, draggable: 'false' }) : null,
      ]
    } else if (state === 'loading') { face = [h('span', { class: 'ecx-spin' })]; tip = `${head}\n…` }
    else if (state === 'needs-login') { face = [icon('user', 20)]; tip = t('panel.login') }
    else if (state === 'error') { face = [icon('warn', 20)]; tip = `${head}\n${t('panel.retry')}` }
    else { face = [icon('target', 20)]; tip = t('panel.pick') }

    const keyBtn = h('button', {
      type: 'button', class: 'ecx-key' + (open ? ' ecx-open' : ''), 'data-state': state, 'data-ecx': 'build', 'aria-pressed': String(open), title: tip,
      onclick: () => panel.toggle('build', el.loadout), // el ancla es el contenedor (estable); los botones se regeneran al repintar
    }, face)
    const canApply = !!d && st.status === 'ready'
    const apBtn = h('button', {
      type: 'button', class: 'ecx-ap' + (ps.done ? ' ecx-done' : ps.failed ? ' ecx-fail' : ''), 'data-ecx': 'apply', disabled: canApply && !ps.busy ? null : 'disabled',
      title: ps.done ? t('apply.done') : t('apply.all'), onclick: () => panel.apply('all'),
    }, ps.busy ? h('span', { class: 'ecx-spin' }) : icon(ps.done ? 'check' : ps.failed ? 'warn' : 'bolt', 15))
    el.loadout.replaceChildren(keyBtn, apBtn)

    // Pequeño «pop» cuando llega una recomendación distinta (dinámico: se nota que se ha actualizado sin abrir nada).
    if (key && key !== lastKey) {
      if (lastKey) { keyBtn.classList.add('ecx-pop'); clearTimeout(popTimer); popTimer = setTimeout(() => keyBtn.classList.remove('ecx-pop'), 700) }
      lastKey = key
    } else if (!key) lastKey = ''
  }

  // ---- Tira de picks en la cabecera de la cuadrícula ----
  const signed = (n) => (n >= 0 ? '+' : '') + n.toFixed(1)

  function picksModel() {
    const ov = overlay?.getState()
    if (ov?.data?.rival) {
      const list = (filters ? filters.matchupPicks() : ov.data.counters.map((c) => ({ cid: c.cid, wr: c.wr, edge: c.edge, n: c.n }))).slice(0, MAX_PICKS)
      const rival = catalog.champion(ov.data.rival).name
      return {
        mode: 'matchup', tip: t('nat.picksRival', rival),
        items: list.map((c) => ({ cid: c.cid, label: Math.round(c.wr) + '%', good: c.edge == null || c.edge >= 0, tip: t('mu.pickTip', catalog.champion(c.cid).name, c.wr.toFixed(1), rival, c.edge != null ? signed(c.edge) : '–', c.n) })),
      }
    }
    const adv = advisor?.getState()
    if (adv?.data) {
      const list = (filters ? filters.draftPicks() : adv.data.picks).slice(0, MAX_PICKS)
      return {
        mode: 'draft', tip: t('nat.picksDraft'),
        items: list.map((p) => ({ cid: p.championId, label: signed(p.score), good: p.score >= 0, tip: pickTip(p, catalog.champion(p.championId), adv.data.meta, catalog, null) })),
      }
    }
    return { mode: 'none', tip: t('nat.picksNone'), items: [] }
  }

  function paintPicks() {
    const m = picksModel()
    const n = filters?.activeCount?.() ?? 0
    const open = panel.view() === 'picks'
    const s = JSON.stringify([m.mode, m.items.map((i) => [i.cid, i.label]), n, open, catalog.isLoaded?.() ?? true])
    if (s === sig.picks) return
    sig.picks = s

    const toggle = () => panel.toggle('picks', el.picks)
    const head = h('button', { type: 'button', class: 'ecx-ib' + (open ? ' ecx-open' : ''), 'data-ecx': 'picks-open', 'aria-pressed': String(open), title: m.mode === 'none' ? m.tip : t('nat.picksOpen') + '\n' + m.tip, onclick: toggle },
      icon(m.mode === 'matchup' ? 'target' : 'spark', 15), n > 0 && h('span', { class: 'ecx-n', 'data-count': n }, n))
    const cells = m.items.map((i) => {
      const info = catalog.champion(i.cid)
      const btn = h('button', {
        type: 'button', class: 'ecx-pk', 'data-pick': i.cid, title: i.tip + '\n' + t('nat.find'),
        onclick: () => {
          if (!flashTile(i.cid, root)) { btn.classList.add('ecx-shake'); btn.title = t('nat.notInGrid'); setTimeout(() => btn.classList.remove('ecx-shake'), 400) }
        },
      }, info.icon ? h('img', { src: info.icon, alt: info.name, draggable: 'false' }) : h('div', { style: 'width:26px;height:26px;border-radius:50%;background:#1e2328' }),
      h('b', { class: i.good ? 'ecx-pos' : 'ecx-neg' }, i.label))
      return btn
    })
    el.picks.replaceChildren(head, ...cells)
  }

  // ---- Reconciliación con el DOM del cliente ----
  // Idempotente: (re)inserta cada pieza en su ancla solo si no está ya en su sitio; la quita si el ancla ya no existe o no se ve.
  function put(node, anchor) {
    const ok = !!anchor && isShown(anchor.parent)
    if (!ok) { if (node.isConnected) node.remove(); return false }
    const inPlace = node.parentElement === anchor.parent && (anchor.before ? node.nextElementSibling === anchor.before : true)
    if (!inPlace) anchor.parent.insertBefore(node, anchor.before ?? null)
    return true
  }

  function sync() {
    clearTimeout(timer); timer = 0
    const st = controller.getState()
    const live = st.status !== 'idle' && !!st.context && st.context.phase !== 'game' && st.context.source !== 'manual'
    const enabled = getPanelPrefs().enabled !== false
    const a = live && enabled ? findAnchors(root) : { loadout: null, header: null, buttons: null }
    const hasLoadout = put(el.loadout, a.loadout)
    const hasHeader = put(el.picks, a.header)
    const on = hasLoadout || hasHeader
    // El botón DS no depende de un ancla propia del cliente: va fijo en <body>, abajo a la derecha, mientras la integración esté activa
    // (si no, el botón DS flotante del panel hace de acceso).
    const hasButtons = on
    if (hasButtons) { if (el.launch.parentElement !== root.body) root.body.append(el.launch) } else if (el.launch.isConnected) el.launch.remove()
    if (on !== docked) {
      docked = on
      panel.setDocked(on)
      if (on) { warned = false; log.info('interfaz integrada en Champion Select:', [hasLoadout && 'barra de runas', hasHeader && 'cabecera de la cuadrícula', hasButtons && 'botón DS'].filter(Boolean).join(', ')) }
      else log.info('interfaz integrada desactivada (panel flotante)')
    }
    if (live && enabled && !on && !warned) { warned = true; log.warn('Champion Select sin puntos de anclaje reconocidos: se usa el panel flotante (draftsage.nativeProbe() muestra qué falta)') }
    if (hasLoadout) paintLoadout(st)
    if (hasHeader) paintPicks()
    if (!on) { sig.loadout = ''; sig.picks = ''; lastKey = '' }
  }
  const schedule = () => { if (!timer) timer = setTimeout(sync, 80) }

  // Suscripciones: cada cambio de estado, del panel (aplicando/aplicado), de preferencias o del catálogo repinta como mucho una vez cada 80 ms.
  const offs = [controller.subscribe(schedule), panel.subscribe(schedule), overlay?.subscribe(schedule), advisor?.subscribe(schedule), filters?.subscribe(schedule)].filter(Boolean)
  addEventListener('draftsage:prefs', schedule)
  addEventListener('resize', schedule)
  catalog.load().then(schedule).catch(() => {})
  // El cliente monta y desmonta Champion Select y reconstruye partes con Ember: se vigila el DOM solo mientras hay una selección en curso.
  let observer = null
  if (typeof MutationObserver !== 'undefined' && root.body) {
    observer = new MutationObserver((recs) => {
      if (controller.getState().status === 'idle' && !docked) return
      for (const r of recs) if (!(r.target.nodeType === 1 && r.target.closest?.('.ecx, .ecp'))) { schedule(); return }
    })
    observer.observe(root.body, { childList: true, subtree: true })
  }
  const guard = setInterval(schedule, 1500)
  sync()
  log.info('integración con Champion Select lista')

  return {
    sync,
    destroy() {
      clearInterval(guard); clearTimeout(timer); clearTimeout(popTimer); observer?.disconnect(); offs.forEach((f) => f?.())
      removeEventListener('draftsage:prefs', schedule); removeEventListener('resize', schedule)
      panel.setDocked(false)
      Object.values(el).forEach((n) => n.remove())
    },
  }
}
