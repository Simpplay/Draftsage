// draftsage/src/presentation/settings.js — pantalla principal de ajustes (reemplaza al menú de texto)
//
// Cinco categorías (docs/UX-SPEC.md §13): General (panel, estadísticas, idioma, posición) · Datos (fuente, Elo, parches, regiones) ·
// Consejero (iTero y maestría, con su aviso de privacidad) · Aplicación (Aplicar, destino, Destello, atajos) · Avanzado (plegado: simular,
// conexión, actualizaciones). Cada categoría y cada control lleva una descripción breve visible; el detalle sigue en el tooltip (title).
// No conoce la API ni el LCU: recibe todo lo que necesita por parámetro (ver mainMenu en menus.js).

import { ensureTheme } from './theme.js'
import { openDialog, h, notify } from './ui.js'
import { icon } from './icons.js'
import { getLang, t } from '../shared/i18n.js'
import { log } from '../shared/logger.js'
import { MAX_PATCH_RANGE, REGIONS, regionCode, toggleRegion, toggleTier } from '../domain/filters.js'
import { MASTERY_WEIGHTS } from '../domain/itero.js'

const STYLE_ID = 'draftsage-settings-style'
const CSS = `
.ecs{display:flex;flex-direction:column;gap:16px;user-select:none}
.ecs-top{display:flex;align-items:center;gap:8px}
.ecs-brand{flex:1;display:flex;align-items:center;gap:8px;font:bold 13px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--ds-text-hi)}
.ecs-brand .ec-ico{color:var(--ds-gold)}
.ecs-plan{display:flex;align-items:center;gap:6px;padding:3px 11px 3px 8px;border:1px solid var(--ds-border);border-radius:12px;font-size:12px;background:var(--ds-surface);color:var(--ds-meta)}
.ecs-plan[data-plan=premium]{border-color:var(--ds-gold);color:var(--ds-gold-hi);box-shadow:0 0 10px rgba(200,170,110,.35)}
.ecs-plan[data-plan=none]{cursor:pointer}
.ecs-ib{width:28px;height:28px;display:flex;align-items:center;justify-content:center;padding:0;background:var(--ds-surface-2);border:1px solid var(--ds-border);color:var(--ds-meta);cursor:pointer}
.ecs-ib:hover{border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ecs-power{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;padding:12px 16px;background:linear-gradient(90deg,var(--ds-surface),var(--ds-bg));border:1px solid var(--ds-border);color:var(--ds-meta);font:inherit;text-align:left;cursor:pointer;transition:.2s}
.ecs-power:hover{border-color:var(--ds-gold-dim)}
.ecs-power[aria-pressed=true]{border-color:var(--ds-gold);color:var(--ds-text-hi);box-shadow:inset 0 0 18px rgba(200,170,110,.18)}
.ecs-bolt{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--ds-surface-2);color:var(--ds-mute-2);border:1px solid var(--ds-border);transition:.25s}
.ecs-power[aria-pressed=true] .ecs-bolt{color:#1a1408;background:radial-gradient(circle,var(--ds-text-hi),var(--ds-gold));border-color:var(--ds-text-hi);box-shadow:0 0 16px var(--ds-gold)}
.ecs-power-t{flex:1;font:bold 14px sans-serif;letter-spacing:.06em;text-transform:uppercase}
.ecs-switch{width:46px;height:22px;border-radius:11px;background:var(--ds-surface-2);border:1px solid var(--ds-border);position:relative;transition:.25s}
.ecs-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--ds-mute-2);transition:.25s}
.ecs-power[aria-pressed=true] .ecs-switch{border-color:var(--ds-gold);background:#2a2112}
.ecs-power[aria-pressed=true] .ecs-switch::after{left:26px;background:var(--ds-gold-hi);box-shadow:0 0 8px var(--ds-gold)}
.ecs-cap{display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ds-meta)}
.ecs-seg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ecs-tile{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 6px 9px;background:var(--ds-surface);border:1px solid var(--ds-border);color:var(--ds-mute);font:inherit;cursor:pointer;transition:.15s}
.ecs-tile:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecs-tile small{font-size:11px;letter-spacing:.06em;text-transform:uppercase}
.ecs-tile[aria-checked=true]{border-color:var(--ds-gold);color:var(--ds-text-hi);background:#17130a;box-shadow:inset 0 0 14px rgba(200,170,110,.22),0 0 10px rgba(200,170,110,.18)}
.ecs-keys{display:flex;gap:14px;justify-content:center}
.ecs-key{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:72px;height:66px;padding:0;background:linear-gradient(#2b2f36,#1a1d22);border:1px solid var(--ds-border);border-bottom-width:5px;border-radius:7px;color:var(--ds-mute);font:bold 22px sans-serif;cursor:pointer;transition:.08s}
.ecs-key img{width:26px;height:26px;border-radius:5px;opacity:.5;pointer-events:none}
.ecs-key:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecs-key[aria-checked=true]{color:var(--ds-text-hi);border-color:var(--ds-gold);background:linear-gradient(#3b3119,#1f1a0c);box-shadow:0 0 16px rgba(200,170,110,.45)}
.ecs-key[aria-checked=true] img{opacity:1}
.ecs-key:active{border-bottom-width:2px;transform:translateY(3px)}
.ecs-off .ecs-seg,.ecs-off .ecs-keys{opacity:.5}
.ecs-chips{display:flex;gap:6px}
.ecs-chip{flex:1;min-width:0;padding:8px 2px;background:var(--ds-surface);border:1px solid var(--ds-border);color:var(--ds-mute);font:inherit;font-size:11px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;transition:.15s}
.ecs-chip:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecs-chip[aria-pressed=true]{border-color:var(--ds-gold);color:var(--ds-text-hi);background:#17130a;box-shadow:inset 0 0 12px rgba(200,170,110,.22)}
.ecs-chips-t .ecs-chip{padding:8px 0;font-size:10px;letter-spacing:0;text-transform:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ecs-chips-t .ecs-chip[data-tier=auto]{flex:0 0 46px;text-transform:uppercase}
.ecs-chips-r{flex-wrap:wrap;margin-top:6px}
.ecs-chips-r .ecs-chip{flex:0 0 calc(20% - 5px);padding:6px 0;font-size:10px}
.ecs-chip[aria-disabled=true]{opacity:.35;cursor:not-allowed}
.ecs-chip[aria-disabled=true]:hover{border-color:var(--ds-border);color:var(--ds-mute)}
.ecs-more{display:flex;align-items:center;gap:6px;align-self:center;padding:4px 10px;background:none;border:0;color:#6b6b73;font:inherit;font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
.ecs-more:hover{color:var(--ds-text)}
.ecs-more .ec-ico{transition:transform .2s}
.ecs-more[aria-expanded=true] .ec-ico{transform:rotate(180deg)}
.ecs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:8px}
.ecs-mini{display:flex;flex-direction:column;align-items:center;gap:4px;padding:9px 2px 6px;background:var(--ds-surface);border:1px solid var(--ds-border-soft);color:var(--ds-mute);font:inherit;cursor:pointer}
.ecs-mini small{font-size:10px;letter-spacing:.05em;text-transform:uppercase}
.ecs-mini:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecs-mini[aria-pressed=false]{opacity:.6}
.ecs-pop{animation:ecs-in .18s ease-out}
@keyframes ecs-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.ecs-sec{display:flex;flex-direction:column;gap:12px;padding-top:12px;border-top:1px solid var(--ds-border-soft)}
.ecs-sh{display:flex;flex-direction:column;gap:2px}
.ecs-sh h3{display:flex;align-items:center;gap:7px;margin:0;font:bold 12px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--ds-gold)}
.ecs-desc{margin:0;font-size:11px;line-height:1.4;color:var(--ds-meta);letter-spacing:0;text-transform:none}
.ecs-cap + .ecs-desc{margin:-5px 0 8px}
`

function ensureStyle() {
  ensureTheme()
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

const TARGETS = [
  { id: 'own', ico: 'page', label: 'set.own', tip: 'set.ownTip' },
  { id: 'current', ico: 'swap', label: 'set.current', tip: 'set.currentTip' },
]

/**
 * @param {{applier, catalog, filters:{get:()=>object, set:(patch:object)=>object}, getSession:()=>{loggedIn:boolean,email?:string,premium?:boolean}, isSimulating:()=>boolean,
 *          source:{get:()=>string, set:(mode:string)=>string}, overlay:{isEnabled:()=>boolean, setEnabled:(on:boolean)=>void},
 *          advisor:{isEnabled:()=>boolean, setEnabled:(on:boolean)=>void},
 *          mastery:{isEnabled:()=>boolean, weight:()=>number, setWeight:(w:number)=>void, off:()=>void},
 *          panelEnabled:()=>boolean,
 *          updates:{mode:()=>('auto'|'packaged'), setMode:(m:string)=>void, build:()=>{version:string, source:string}},
 *          actions:{login:Function, logout:Function, simulate:Function, cors:Function, enableApply:()=>Promise<boolean>, enableAdvisor:()=>Promise<boolean>,
 *                   enableMastery:()=>Promise<boolean>, resetPanel:Function, reopen:Function, unsimulate:Function, togglePanel:Function}}} deps
 */
export function openSettings({ applier, catalog, filters, source, overlay, advisor, mastery, getSession, isSimulating, panelEnabled, updates, actions }) {
  ensureStyle()
  const box = h('div', { class: 'ecs' })
  let more = false
  let regionsOpen = false // la lista de regiones se despliega bajo demanda (son 15 y casi nunca se tocan)
  let regionsAnim = false // animar solo al desplegar, no en cada clic (cada clic repinta los ajustes)
  let handle

  // Cierra los ajustes y ejecuta algo que abre otra ventana (solo hay una ventana a la vez).
  const go = (fn) => { handle.close(); Promise.resolve().then(fn).catch((e) => log.error('ajustes:', e)) }

  const build = () => {
    const cfg = applier.getSettings()
    const ses = getSession()

    const plan = ses.loggedIn
      ? h('div', { class: 'ecs-plan', 'data-plan': ses.premium ? 'premium' : 'free', title: ses.email ?? '' }, icon(ses.premium ? 'crown' : 'user', 14), ses.premium ? t('set.premium') : t('set.free'))
      : h('button', { type: 'button', class: 'ecs-plan', 'data-plan': 'none', title: t('set.enterTip'), onclick: () => go(actions.login) }, icon('user', 14), t('set.enter'))

    const top = h('div', { class: 'ecs-top' },
      h('div', { class: 'ecs-brand' }, icon('gear', 16), 'Draftsage'),
      plan,
      ses.loggedIn && h('button', { type: 'button', class: 'ecs-ib', title: t('set.logout'), 'data-act': 'logout', onclick: () => go(actions.logout) }, icon('logout', 15)))

    const power = h('button', {
      type: 'button', class: 'ecs-power', 'aria-pressed': String(cfg.enabled), 'data-act': 'power',
      title: cfg.enabled ? t('set.applyOn') : t('set.applyOff'),
      onclick: () => {
        if (cfg.enabled) { applier.setEnabled(false); render() } else go(async () => { await actions.enableApply(); actions.reopen() })
      },
    }, h('span', { class: 'ecs-bolt' }, icon('bolt', 20)), h('span', { class: 'ecs-power-t' }, t('set.apply')), h('span', { class: 'ecs-switch' }))

    const target = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('page', 13), t('set.runes')),
      h('div', { class: 'ecs-seg', role: 'radiogroup' }, TARGETS.map((x) => h('button', {
        type: 'button', class: 'ecs-tile', role: 'radio', 'aria-checked': String(cfg.target === x.id), 'data-target': x.id, title: t(x.tip),
        onclick: () => { applier.setSettings({ target: x.id }); render() },
      }, icon(x.ico, 24), h('small', null, t(x.label))))))

    const flashIcon = catalog.spell(4).icon
    const keys = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('spark', 13), t('set.flash')),
      h('div', { class: 'ecs-keys', role: 'radiogroup' }, ['d', 'f'].map((k) => h('button', {
        type: 'button', class: 'ecs-key', role: 'radio', 'aria-checked': String(cfg.flashKey === k), 'data-key': k, title: t('set.flashKey', k.toUpperCase()),
        onclick: () => { applier.setSettings({ flashKey: k }); render() },
      }, flashIcon && h('img', { src: flashIcon, alt: '', draggable: 'false' }), k.toUpperCase()))))

    // Filtros de datos: rango de Elo (clic en los rangos que quieres incluir), rango de parches (solo premium) y regiones.
    const fl = filters.get()
    const eloChip = (id, label, tip, pressed, onclick) => h('button', { type: 'button', class: 'ecs-chip', 'data-tier': id, 'aria-pressed': String(pressed), title: tip, onclick }, label)
    const elo = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('target', 13), t('set.elo')),
      h('div', { class: 'ecs-chips ecs-chips-t', role: 'group' },
        eloChip('auto', t('set.auto'), t('set.eloAutoTip'), fl.tiers.mode === 'auto', () => { filters.set({ tiers: { ...fl.tiers, mode: 'auto' } }); render() }),
        [3, 4, 5, 6, 7].map((n) => eloChip(String(n), t('tier.' + n), t('set.eloTip', t('tier.' + n)),
          fl.tiers.mode === 'range' && n >= fl.tiers.min && n <= fl.tiers.max,
          () => { filters.set({ tiers: toggleTier(fl.tiers, n) }); render() }))))

    // Regiones: «Todas» (por defecto, `regions: null`) o una lista elegida a mano. El botón de la derecha despliega la lista y resume la elección.
    const picked = fl.regions
    const regionSummary = !picked.length ? t('set.regionsPick') : picked.length <= 2 ? picked.map(regionCode).join(' ') : regionCode(picked[0]) + ' +' + (picked.length - 1)
    const regionChip = (id, label, tip, pressed, onclick, extra = {}) => h('button', { type: 'button', class: 'ecs-chip', 'data-region': id, 'aria-pressed': String(pressed), title: tip, onclick, ...extra }, label)
    const regions = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('globe', 13), t('set.regions')),
      h('div', { class: 'ecs-chips', role: 'group' },
        regionChip('all', t('set.regionsAll'), t('set.regionsAllTip'), !picked.length, () => { filters.set({ regions: [] }); render() }),
        regionChip('pick', regionSummary, picked.length ? picked.map(regionCode).join(', ') : t('set.regionsPickTip'), picked.length > 0,
          () => { regionsOpen = !regionsOpen; regionsAnim = regionsOpen; render() }, { 'aria-expanded': String(regionsOpen) })),
      regionsOpen && h('div', { class: 'ecs-chips ecs-chips-r' + (regionsAnim ? ' ecs-pop' : ''), role: 'group' },
        REGIONS.map((r) => regionChip(String(r.id), r.code, t('set.regionTip', r.code), picked.includes(r.id),
          () => { regionsAnim = false; filters.set({ regions: toggleRegion(picked, r.id) }); render() }))))

    const premium = !!ses.premium
    const patchChip = (id, label, tip, pressed, locked, onclick) => h('button', {
      type: 'button', class: 'ecs-chip', 'data-patch': id, 'aria-pressed': String(pressed), 'aria-disabled': locked ? 'true' : null,
      title: locked ? t('set.premiumOnly') : tip, onclick: locked ? null : onclick,
    }, label)
    const auto = fl.patches.mode === 'auto'
    const patches = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('refresh', 13), t('set.patches')),
      h('div', { class: 'ecs-chips', role: 'group' },
        patchChip('auto', t('set.auto'), t('set.patchAutoTip'), auto, false, () => { filters.set({ patches: { ...fl.patches, mode: 'auto' } }); render() }),
        patchChip('0', t('set.patchCurrent'), t('set.patchCurrentTip'), !auto && fl.patches.additions === 0, false, () => { filters.set({ patches: { mode: 'manual', additions: 0 } }); render() }),
        Array.from({ length: MAX_PATCH_RANGE }, (_, i) => i + 1).map((n) => patchChip(String(n), '+' + n, t('set.patchPlusTip', n),
          !auto && fl.patches.additions === n, !premium, () => { filters.set({ patches: { mode: 'manual', additions: n } }); render() }))))

    // Fuente de las recomendaciones: Coachless (cuenta), LoLalytics (gratis) o Auto.
    const srcMode = source.get()
    const srcChip = (id, label, tip) => h('button', { type: 'button', class: 'ecs-chip', 'data-source': id, 'aria-pressed': String(srcMode === id), title: tip, onclick: () => { source.set(id); render() } }, label)
    const src = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('swap', 13), t('set.source')),
      h('div', { class: 'ecs-chips', role: 'group' },
        srcChip('coachless', t('set.srcCoachless'), t('set.srcCoachlessTip')),
        srcChip('lolalytics', t('set.srcLola'), t('set.srcLolaTip')),
        srcChip('auto', t('set.srcAuto'), t('set.srcAutoTip'))))

    const sim = isSimulating()
    const mini = (act, ico, label, tip, onclick, pressed) => h('button', { type: 'button', class: 'ecs-mini', 'data-act': act, title: tip, 'aria-pressed': pressed == null ? null : String(pressed), onclick }, icon(ico, 20), h('small', null, label))
    const grid = h('div', { class: 'ecs-grid ecs-pop' },
      mini('simulate', 'target', t('set.simulate'), t('set.simulateTip'), () => go(actions.simulate)),
      sim && mini('unsimulate', 'close', t('set.exit'), t('set.exitTip'), () => { actions.unsimulate(); render() }),
      mini('cors', 'plug', t('set.conn'), t('set.connTip'), () => go(actions.cors)))
    const generalMinis = [
      mini('panel', panelEnabled() ? 'eye' : 'eyeOff', t('set.panel'), panelEnabled() ? t('set.panelHide') : t('set.panelShow'), () => { actions.togglePanel(); render() }, panelEnabled()),
      mini('overlay', 'swords', t('set.overlay'), overlay.isEnabled() ? t('set.overlayOn') : t('set.overlayOff'), () => { overlay.setEnabled(!overlay.isEnabled()); window.dispatchEvent(new Event('draftsage:prefs')); render() }, overlay.isEnabled()),
      mini('lang', 'globe', getLang().toUpperCase(), t('set.langTip'), () => { actions.toggleLanguage(); relabel() }),
      mini('resetpos', 'refresh', t('set.resetPos'), t('set.resetPosTip'), () => actions.resetPanel()),
    ]
    // Consejero de picks: apagarlo es inmediato; encenderlo pasa por el aviso (los datos del draft viajan a iTero).
    const advisorMini = mini('advisor', 'spark', t('set.advisor'), advisor.isEnabled() ? t('set.advisorOn') : t('set.advisorOff'),
      () => { if (advisor.isEnabled()) { advisor.setEnabled(false); render() } else go(async () => { await actions.enableAdvisor(); actions.reopen() }) }, advisor.isEnabled())

    // Maestría de iTero (envía tu Riot ID a un tercero): apagada por defecto; encenderla pasa por el aviso. El peso es cuánto cuentan tus campeones.
    const mOn = mastery.isEnabled()
    const mW = mastery.weight()
    const mNearest = Object.keys(MASTERY_WEIGHTS).reduce((a, b) => (Math.abs(MASTERY_WEIGHTS[b] - mW) < Math.abs(MASTERY_WEIGHTS[a] - mW) ? b : a))
    const mChip = (id, label, tip, pressed, onclick) => h('button', { type: 'button', class: 'ecs-chip', 'data-mastery': id, 'aria-pressed': String(pressed), title: tip, onclick }, label)
    const masteryRow = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('user', 13), t('set.mastery')),
      h('div', { class: 'ecs-chips', role: 'group' },
        mChip('off', t('set.masteryOff'), t('set.masteryTip'), !mOn, () => { mastery.off(); render() }),
        [['low', 'set.masteryLow'], ['normal', 'set.masteryNormal'], ['high', 'set.masteryHigh']].map(([id, label]) => mChip(id, t(label), t('set.masteryWeightTip', MASTERY_WEIGHTS[id]), mOn && mNearest === id,
          () => { if (mOn) { mastery.setWeight(MASTERY_WEIGHTS[id]); render() } else go(async () => { if (await actions.enableMastery()) mastery.setWeight(MASTERY_WEIGHTS[id]); actions.reopen() }) }))))

    // Actualizaciones: «Auto» descarga versiones firmadas (se aplican al reiniciar el cliente); «Solo incluida» usa únicamente el código del plugin.
    const uMode = updates.mode()
    const uBuild = updates.build()
    const uChip = (id, label, tip) => h('button', { type: 'button', class: 'ecs-chip', 'data-updates': id, 'aria-pressed': String(uMode === id), title: tip,
      onclick: () => { updates.setMode(id); notify.success(t('set.updRestart')); render() } }, label)
    const updatesRow = h('div', null,
      h('div', { class: 'ecs-cap' }, icon('refresh', 13), t('set.updates')),
      h('div', { class: 'ecs-chips', role: 'group', title: t('set.updatesTip', uBuild.version, t(uBuild.source === 'remote' ? 'set.updSrcRemote' : 'set.updSrcPackaged')) },
        uChip('auto', t('set.updAuto'), t('set.updAutoTip')),
        uChip('packaged', t('set.updPackaged'), t('set.updPackagedTip'))))

    // Cinco categorías (docs/UX-SPEC.md §13), cada una con una descripción breve VISIBLE (el detalle sigue en el tooltip de cada control).
    // «Avanzado» va plegado: casi nunca se toca. Los consentimientos (Aplicar, consejero, maestría) siguen pasando por su aviso.
    const sect = (id, ico, children) => h('section', { class: 'ecs-sec', 'data-section': id, 'aria-label': t('set.sec.' + id) },
      h('div', { class: 'ecs-sh' }, h('h3', null, icon(ico, 14), t('set.sec.' + id)), h('p', { class: 'ecs-desc' }, t('set.sec.' + id + 'Desc'))),
      ...children.filter(Boolean))
    const desc = (key) => h('p', { class: 'ecs-desc' }, t(key))
    return [
      top,
      sect('general', 'eye', [h('div', { class: 'ecs-grid' }, generalMinis)]),
      sect('data', 'swap', [src, desc('set.d.source'), elo, desc('set.d.elo'), patches, regions]),
      sect('advisor', 'spark', [h('div', { class: 'ecs-grid' }, advisorMini), desc('set.d.advisor'), masteryRow, desc('set.d.mastery')]),
      sect('apply', 'bolt', [power, desc('set.d.apply'), h('div', { class: cfg.enabled ? '' : 'ecs-off' }, h('div', { class: 'ecs', style: 'gap:16px' }, target, keys)), desc('set.d.shortcuts')]),
      h('button', { type: 'button', class: 'ecs-more', 'aria-expanded': String(more), 'data-act': 'more', title: t('set.moreTip'), onclick: () => { more = !more; render() } }, icon('chevron', 14), t('set.sec.advanced')),
      more && sect('advanced', 'gear', [grid, updatesRow]),
    ]
  }

  const render = () => box.replaceChildren(...build().filter(Boolean))
  // Tras cambiar de idioma también hay que repintar el botón «Listo» (lo crea ui.js al abrir la ventana).
  const relabel = () => { render(); const b = handle.el?.querySelector('.ec-actions .ec-btn'); if (b) b.textContent = t('common.done') }

  handle = openDialog({ id: 'main', width: 400, body: box, actions: [{ id: 'close', label: t('common.done'), variant: 'primary' }] })
  render()
  catalog.load().then(render).catch(() => {}) // el icono de Destello llega cuando el cliente carga los datos
  return handle
}
