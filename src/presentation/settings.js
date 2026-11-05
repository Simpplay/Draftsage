// easy-coachless/src/presentation/settings.js — pantalla principal de ajustes (reemplaza al menú de texto)
//
// Orden pensado para el jugador: lo que toca a diario arriba y a la vista (interruptor de Aplicar, destino de las runas,
// tecla de Destello) y lo que casi nunca se usa (simular, panel, conexión) plegado en «Más».
// Todo son controles gráficos con una palabra de apoyo; las explicaciones largas van en el tooltip (title).
// No conoce la API ni el LCU: recibe todo lo que necesita por parámetro (ver mainMenu en menus.js).

import { openDialog, h } from './ui.js'
import { icon } from './icons.js'
import { log } from '../shared/logger.js'

const STYLE_ID = 'easy-coachless-settings-style'
const CSS = `
.ecs{display:flex;flex-direction:column;gap:16px;user-select:none}
.ecs-top{display:flex;align-items:center;gap:8px}
.ecs-brand{flex:1;display:flex;align-items:center;gap:8px;font:bold 13px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#f0e6d2}
.ecs-brand .ec-ico{color:#c8aa6e}
.ecs-plan{display:flex;align-items:center;gap:6px;padding:3px 11px 3px 8px;border:1px solid #3c3c41;border-radius:12px;font-size:12px;background:#0a1428;color:#a09b8c}
.ecs-plan[data-plan=premium]{border-color:#c8aa6e;color:#f0c870;box-shadow:0 0 10px rgba(200,170,110,.35)}
.ecs-plan[data-plan=none]{cursor:pointer}
.ecs-ib{width:28px;height:28px;display:flex;align-items:center;justify-content:center;padding:0;background:#1e2328;border:1px solid #3c3c41;color:#a09b8c;cursor:pointer}
.ecs-ib:hover{border-color:#c8aa6e;color:#f0e6d2}
.ecs-power{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;padding:12px 16px;background:linear-gradient(90deg,#0a1428,#010a13);border:1px solid #3c3c41;color:#a09b8c;font:inherit;text-align:left;cursor:pointer;transition:.2s}
.ecs-power:hover{border-color:#785a28}
.ecs-power[aria-pressed=true]{border-color:#c8aa6e;color:#f0e6d2;box-shadow:inset 0 0 18px rgba(200,170,110,.18)}
.ecs-bolt{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#1e2328;color:#5b5a56;border:1px solid #3c3c41;transition:.25s}
.ecs-power[aria-pressed=true] .ecs-bolt{color:#1a1408;background:radial-gradient(circle,#f0e6d2,#c8aa6e);border-color:#f0e6d2;box-shadow:0 0 16px #c8aa6e}
.ecs-power-t{flex:1;font:bold 14px sans-serif;letter-spacing:.06em;text-transform:uppercase}
.ecs-switch{width:46px;height:22px;border-radius:11px;background:#1e2328;border:1px solid #3c3c41;position:relative;transition:.25s}
.ecs-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#5b5a56;transition:.25s}
.ecs-power[aria-pressed=true] .ecs-switch{border-color:#c8aa6e;background:#2a2112}
.ecs-power[aria-pressed=true] .ecs-switch::after{left:26px;background:#f0c870;box-shadow:0 0 8px #c8aa6e}
.ecs-cap{display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#a09b8c}
.ecs-seg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ecs-tile{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 6px 9px;background:#0a1428;border:1px solid #3c3c41;color:#7b7a76;font:inherit;cursor:pointer;transition:.15s}
.ecs-tile:hover{border-color:#785a28;color:#cdbe91}
.ecs-tile small{font-size:11px;letter-spacing:.06em;text-transform:uppercase}
.ecs-tile[aria-checked=true]{border-color:#c8aa6e;color:#f0e6d2;background:#17130a;box-shadow:inset 0 0 14px rgba(200,170,110,.22),0 0 10px rgba(200,170,110,.18)}
.ecs-keys{display:flex;gap:14px;justify-content:center}
.ecs-key{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:72px;height:66px;padding:0;background:linear-gradient(#2b2f36,#1a1d22);border:1px solid #3c3c41;border-bottom-width:5px;border-radius:7px;color:#7b7a76;font:bold 22px sans-serif;cursor:pointer;transition:.08s}
.ecs-key img{width:26px;height:26px;border-radius:5px;opacity:.5;pointer-events:none}
.ecs-key:hover{border-color:#785a28;color:#cdbe91}
.ecs-key[aria-checked=true]{color:#f0e6d2;border-color:#c8aa6e;background:linear-gradient(#3b3119,#1f1a0c);box-shadow:0 0 16px rgba(200,170,110,.45)}
.ecs-key[aria-checked=true] img{opacity:1}
.ecs-key:active{border-bottom-width:2px;transform:translateY(3px)}
.ecs-off .ecs-seg,.ecs-off .ecs-keys{opacity:.5}
.ecs-more{display:flex;align-items:center;gap:6px;align-self:center;padding:4px 10px;background:none;border:0;color:#6b6b73;font:inherit;font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
.ecs-more:hover{color:#cdbe91}
.ecs-more .ec-ico{transition:transform .2s}
.ecs-more[aria-expanded=true] .ec-ico{transform:rotate(180deg)}
.ecs-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.ecs-mini{display:flex;flex-direction:column;align-items:center;gap:4px;padding:9px 2px 6px;background:#0a1428;border:1px solid #2a2a30;color:#7b7a76;font:inherit;cursor:pointer}
.ecs-mini small{font-size:10px;letter-spacing:.05em;text-transform:uppercase}
.ecs-mini:hover{border-color:#785a28;color:#cdbe91}
.ecs-mini[aria-pressed=false]{opacity:.6}
.ecs-pop{animation:ecs-in .18s ease-out}
@keyframes ecs-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
`

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

const TARGETS = [
  { id: 'own', ico: 'page', label: 'Propia', tip: 'Página propia «[EC] …»: no toca tus páginas de runas' },
  { id: 'current', ico: 'swap', label: 'Activa', tip: 'Reemplaza el contenido de la página de runas activa' },
]

/**
 * @param {{applier, catalog, getSession:()=>{loggedIn:boolean,email?:string,premium?:boolean}, isSimulating:()=>boolean,
 *          panelEnabled:()=>boolean,
 *          actions:{login:Function, logout:Function, simulate:Function, cors:Function, enableApply:()=>Promise<boolean>,
 *                   reopen:Function, unsimulate:Function, togglePanel:Function}}} deps
 */
export function openSettings({ applier, catalog, getSession, isSimulating, panelEnabled, actions }) {
  ensureStyle()
  const box = h('div', { class: 'ecs' })
  let more = false
  let handle

  // Cierra los ajustes y ejecuta algo que abre otra ventana (solo hay una ventana a la vez).
  const go = (fn) => { handle.close(); Promise.resolve().then(fn).catch((e) => log.error('ajustes:', e)) }

  const build = () => {
    const cfg = applier.getSettings()
    const ses = getSession()

    const plan = ses.loggedIn
      ? h('div', { class: 'ecs-plan', 'data-plan': ses.premium ? 'premium' : 'free', title: ses.email ?? '' }, icon(ses.premium ? 'crown' : 'user', 14), ses.premium ? 'Premium' : 'Gratis')
      : h('button', { type: 'button', class: 'ecs-plan', 'data-plan': 'none', title: 'Iniciar sesión en Coachless', onclick: () => go(actions.login) }, icon('user', 14), 'Entrar')

    const top = h('div', { class: 'ecs-top' },
      h('div', { class: 'ecs-brand' }, icon('gear', 16), 'Easy Coachless'),
      plan,
      ses.loggedIn && h('button', { type: 'button', class: 'ecs-ib', title: 'Cerrar sesión', 'data-act': 'logout', onclick: () => go(actions.logout) }, icon('logout', 15)))

    const power = h('button', {
      type: 'button', class: 'ecs-power', 'aria-pressed': String(cfg.enabled), 'data-act': 'power',
      title: cfg.enabled ? 'Aplicar activado: los botones del panel escriben runas y hechizos en el cliente' : 'Aplicar desactivado: el panel solo muestra la recomendación',
      onclick: () => {
        if (cfg.enabled) { applier.setEnabled(false); render() } else go(async () => { await actions.enableApply(); actions.reopen() })
      },
    }, h('span', { class: 'ecs-bolt' }, icon('bolt', 20)), h('span', { class: 'ecs-power-t' }, 'Aplicar'), h('span', { class: 'ecs-switch' }))

    const target = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('page', 13), 'Runas'),
      h('div', { class: 'ecs-seg', role: 'radiogroup' }, TARGETS.map((t) => h('button', {
        type: 'button', class: 'ecs-tile', role: 'radio', 'aria-checked': String(cfg.target === t.id), 'data-target': t.id, title: t.tip,
        onclick: () => { applier.setSettings({ target: t.id }); render() },
      }, icon(t.ico, 24), h('small', null, t.label)))))

    const flashIcon = catalog.spell(4).icon
    const keys = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('spark', 13), 'Destello'),
      h('div', { class: 'ecs-keys', role: 'radiogroup' }, ['d', 'f'].map((k) => h('button', {
        type: 'button', class: 'ecs-key', role: 'radio', 'aria-checked': String(cfg.flashKey === k), 'data-key': k, title: 'Destello en la tecla ' + k.toUpperCase(),
        onclick: () => { applier.setSettings({ flashKey: k }); render() },
      }, flashIcon && h('img', { src: flashIcon, alt: '', draggable: 'false' }), k.toUpperCase()))))

    const sim = isSimulating()
    const mini = (act, ico, label, tip, onclick, pressed) => h('button', { type: 'button', class: 'ecs-mini', 'data-act': act, title: tip, 'aria-pressed': pressed == null ? null : String(pressed), onclick }, icon(ico, 20), h('small', null, label))
    const grid = more && h('div', { class: 'ecs-grid ecs-pop' },
      mini('simulate', 'target', 'Simular', 'Ver runas de un matchup sin estar en partida', () => go(actions.simulate)),
      sim && mini('unsimulate', 'close', 'Salir', 'Quitar la simulación y volver al Champion Select real', () => { actions.unsimulate(); render() }),
      mini('panel', panelEnabled() ? 'eye' : 'eyeOff', 'Panel', panelEnabled() ? 'Ocultar el panel en Champion Select' : 'Mostrar el panel en Champion Select', () => { actions.togglePanel(); render() }, panelEnabled()),
      mini('cors', 'plug', 'Conexión', 'Pasos para activar DisableWebSecurity en Pengu', () => go(actions.cors)))

    return [
      top, power,
      h('div', { class: cfg.enabled ? '' : 'ecs-off' }, h('div', { class: 'ecs', style: 'gap:16px' }, target, keys)),
      h('button', { type: 'button', class: 'ecs-more', 'aria-expanded': String(more), 'data-act': 'more', title: 'Más opciones', onclick: () => { more = !more; render() } }, icon('chevron', 14), 'Más'),
      grid,
    ]
  }

  const render = () => box.replaceChildren(...build().filter(Boolean))

  handle = openDialog({ id: 'main', width: 400, body: box, actions: [{ id: 'close', label: 'Listo', variant: 'primary' }] })
  render()
  catalog.load().then(render).catch(() => {}) // el icono de Destello llega cuando el cliente carga los datos
  return handle
}
