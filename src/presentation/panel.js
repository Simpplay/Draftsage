// easy-coachless/src/presentation/panel.js — panel flotante con las runas y hechizos recomendados
//
// Diseño: casi sin texto. La cabecera son los retratos (tú ⚔ rival) y el rol; cada bloque lo identifica el icono de su árbol
// de runas; los hechizos llevan la tecla (D/F) donde se colocarán; los avisos son iconos con tooltip; los estados
// (cargando, esperando, aplicado, error) se ven con esqueletos, giros y marcas, no con párrafos.
// Alternativas con un clic: bajo la runa clave hay las otras runas clave con su porcentaje de uso (la elegida lleva marco y la
// recomendada, un punto); junto a los hechizos, los sustitutos del hechizo intercambiable. El pie lleva un medidor de fiabilidad
// (3 barras + partidas) y las runas con muy pocas partidas se ven atenuadas con borde discontinuo.
// Muestra la recomendación y ofrece «Aplicar» (todo / runas / hechizos): SIEMPRE una acción explícita del usuario (clic o
// Ctrl+Shift+A) a través de application/configuration.js, desactivado hasta que el usuario lo acepta.
// «Fijar» recuerda tu elección (runa clave + hechizos) para ese campeón y rol; el icono de enlace abre la misma build en coachless.gg.
// Ítems: bajo las runas, la build de esa runa clave (inicio, botas, núcleo → siguientes) en filas de iconos con un icono por fila y la categoría
// S/A/B con el % de victorias. En partida (state.context.phase === 'game') el panel pasa a «modo partida»: más ancho, ítems grandes y completos
// (primera vuelta, alternativas, situacionales), runas de solo lectura y sin botones de aplicar; se queda así para consultarlo con Alt+Tab.
// Seguimiento en partida (application/live-game.js, Live Client Data API): ✓ en los ítems que ya llevas, barra de oro en el siguiente por comprar y tu oro en la cabecera.
// Picks sugeridos (application/pick-advisor.js, desactivado hasta que el usuario lo acepta; van ARRIBA, es lo primero que se decide): hasta 5 retratos con su puntuación RELATIVA bajo cada uno
// (nunca un % absoluto), una marca ✓/⚠ si iTero y LoLalytics coinciden o discrepan y, al elegir uno, los motivos como chips con icono (sinergia,
// counter, punto débil, escalado, daño). Funciona también antes de elegir campeón; el detalle sale de la respuesta ya recibida (sin red al hacer clic).
// No hace fetch: lee el estado del controlador (application/champ-select.js) y el catálogo de nombres/iconos.

import { h, whenReady, openExternal } from './ui.js'
import { icon } from './icons.js'
import { tiersLabel } from '../domain/lobby.js'
import { TREES } from '../domain/runes.js'
import { buildSpellPair } from '../domain/configuration.js'
import { hasItems, layoutItems, tierLetter } from '../domain/items.js'
import { trackBuild } from '../domain/live.js'
import { confidenceLevel, isLowData } from '../domain/confidence.js'
import { buildsUrl, lolalyticsUrl, championSlug } from '../domain/web.js'
import { laneOfRole } from '../domain/lolalytics.js'
import { getPanelPrefs, setPanelPrefs } from '../application/preferences.js'
import { getLang, t } from '../shared/i18n.js'
import { log } from '../shared/logger.js'

const STYLE_ID = 'easy-coachless-panel-style'
const CSS = `
.ecp{position:fixed;z-index:2147483000;width:292px;box-sizing:border-box;background:linear-gradient(#0a1428,#010a13 60px);color:#cdbe91;border:1px solid #785a28;box-shadow:0 0 18px #000;font:13px/1.4 sans-serif;user-select:none;animation:ecp-in .2s ease-out}
.ecp-head{display:flex;align-items:center;gap:4px;padding:6px 8px;cursor:move;border-bottom:1px solid #3c3c41}
.ecp-title{flex:1;display:flex;align-items:center;gap:7px;min-width:0}
.ecp-por{width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #c8aa6e;background:#1e2328;flex:none;box-sizing:border-box}
.ecp-por.ecp-foe{border-color:#a8404f;width:26px;height:26px}
.ecp-vs{color:#a8404f;display:flex}
.ecp-role{margin-left:2px;padding:1px 7px;border:1px solid #3c3c41;border-radius:9px;font-size:10px;letter-spacing:.08em;color:#a09b8c;background:#010a13}
.ecp-x{display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:none;border:0;color:#7b7a76;cursor:pointer;padding:0}
.ecp-x:hover:not(:disabled){color:#f0e6d2}
.ecp-x:disabled{opacity:.3;cursor:default}
.ecp-up{transform:rotate(180deg)}
.ecp-body{padding:10px 10px 8px;display:flex;flex-direction:column;gap:9px;max-height:calc(100vh - 150px);overflow-y:auto;scrollbar-width:thin}
.ecp-stale{display:flex;flex-direction:column;gap:9px;opacity:.4;pointer-events:none;transition:opacity .15s}
.ecp-line{display:flex;align-items:center;gap:7px}
.ecp-grow{flex:1}
.ecp-tree{width:22px;height:22px;flex:none;border-radius:50%;opacity:.85;object-fit:cover}
.ecp-it{position:relative;display:flex;flex-direction:column;align-items:center;width:40px;text-align:center}
.ecp-ico{width:34px;height:34px;border-radius:50%;background:#1e2328;border:1px solid #3c3c41;object-fit:cover;box-sizing:border-box;transition:transform .12s}
.ecp-it:hover .ecp-ico{transform:scale(1.12);border-color:#c8aa6e}
.ecp-ico.ecp-big{width:44px;height:44px;border:2px solid #c8aa6e;box-shadow:0 0 12px rgba(200,170,110,.45)}
.ecp-ico.ecp-sq{border-radius:4px}
.ecp-ico.ecp-sm{width:24px;height:24px}
.ecp-ico.ecp-xs{width:24px;height:24px}
.ecp-ico.ecp-low{opacity:.55;border-style:dashed}
.ecp.ecp-game{width:340px}
.ecp-icons{display:flex;flex-wrap:wrap;align-items:flex-start;gap:4px;flex:1;min-width:0}
.ecp-irow{align-items:flex-start}
.ecp-cell{display:flex;flex-direction:column;align-items:center;min-width:32px}
.ecp-ico.ecp-itm{width:32px;height:32px;border-radius:4px}
.ecp-cell:hover .ecp-ico.ecp-itm{transform:scale(1.12);border-color:#c8aa6e}
.ecp-ico.ecp-itm.ecp-core{border:2px solid #c8aa6e;box-shadow:0 0 8px rgba(200,170,110,.35)}
.ecp-game .ecp-ico.ecp-itm{width:40px;height:40px}
.ecp-game .ecp-cell{min-width:40px}
@keyframes ecp-glow{0%,100%{box-shadow:0 0 4px rgba(10,200,185,.4)}50%{box-shadow:0 0 12px rgba(10,200,185,.9)}}
.ecp-cell{position:relative}
.ecp-cell.ecp-own .ecp-ico.ecp-itm{border-color:#0ac8b9;box-shadow:0 0 6px rgba(10,200,185,.45)}
.ecp-badge{position:absolute;top:-4px;right:-3px;width:14px;height:14px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#06201f;border:1px solid #0ac8b9;color:#0ac8b9}
.ecp-prog{width:100%;height:3px;margin-top:2px;background:#1e2328;border-radius:2px;overflow:hidden}
.ecp-prog i{display:block;height:100%;background:#e0a93a}
.ecp-cell.ecp-afford .ecp-prog i{background:#0ac8b9}
.ecp-cell.ecp-afford .ecp-ico.ecp-itm{border-color:#0ac8b9;animation:ecp-glow 1.4s ease-in-out infinite}
.ecp-miss{font-size:10px;line-height:12px;color:#e0a93a}
.ecp-ready{display:flex;color:#0ac8b9}
.ecp-coin{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:bold;color:#e0a93a}
.ecp-arrow{display:flex;align-items:center;height:32px;color:#5b5a56}
.ecp-game .ecp-arrow{height:40px}
.ecp-items{display:flex;flex-direction:column;gap:7px}
.ecp-ihead{gap:6px}
.ecp-tier{display:flex;align-items:center;justify-content:center;width:22px;height:22px;box-sizing:border-box;border-radius:50%;border:2px solid;font:bold 11px/1 sans-serif;flex:none}
.ecp-tier-S{color:#f0c870;border-color:#f0c870;background:#2a2314}
.ecp-tier-A{color:#0ac8b9;border-color:#0ac8b9;background:#06201f}
.ecp-tier-B{color:#a09b8c;border-color:#5b5a56;background:#1e2328}
.ecp-wr{font-size:12px;font-weight:bold;color:#f0e6d2}
.ecp-ph{display:flex;align-items:center;justify-content:center;font-size:10px;color:#a09b8c}
.ecp-w{font-size:10px;line-height:12px;color:#a09b8c;margin-top:1px}
.ecp-w.ecp-pos{color:#0ac8b9}.ecp-w.ecp-neg{color:#e84057}
.ecp-keycap{position:absolute;right:0;top:-3px;min-width:14px;padding:0 3px;box-sizing:border-box;text-align:center;font:bold 10px/14px sans-serif;color:#f0e6d2;background:#3b3119;border:1px solid #c8aa6e;border-bottom-width:2px;border-radius:3px}
.ecp-chip{padding:0;margin:0;background:none;border:2px solid transparent;border-radius:50%;cursor:pointer;line-height:0;transition:.12s}
.ecp-chip:hover{border-color:#785a28}
.ecp-chip.ecp-on{border-color:#c8aa6e;box-shadow:0 0 8px rgba(200,170,110,.5)}
.ecp-chip .ecp-ico{width:28px;height:28px}
.ecp-lead{color:#a8404f;display:flex}
.ecp-lead.ecp-mute{color:#5b5a56}
.ecp-alts{gap:4px;margin:-2px 0}
.ecp-alt{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:36px;padding:3px 0 1px;background:none;border:1px solid transparent;border-radius:6px;cursor:pointer;line-height:0;color:#7b7a76;transition:.12s}
.ecp-alt:hover{border-color:#785a28;color:#cdbe91}
.ecp-alt.ecp-on{border-color:#c8aa6e;background:rgba(200,170,110,.08);cursor:default}
.ecp-alt[data-auto]::after{content:'';position:absolute;top:1px;right:4px;width:5px;height:5px;border-radius:50%;background:#c8aa6e}
.ecp-alt .ecp-w{line-height:11px;margin-top:2px}
.ecp-spalts{gap:2px}
.ecp-spalts .ecp-alt{min-width:30px;padding:3px 0}
.ecp-wr{color:#a09b8c}
.ecp-tags{display:flex;flex-wrap:wrap;gap:5px}
.ecp-tag{display:flex;align-items:center;gap:4px;padding:1px 7px;border:1px solid #2a2a30;border-radius:9px;font-size:10px;color:#7b7a76;background:#0a1428}
.ecp-tag.ecp-gold{border-color:#785a28;color:#c8aa6e}
.ecp-tag.ecp-warn{border-color:#8a6a1f;color:#e0a93a;cursor:help}
.ecp-bars{display:inline-flex;align-items:flex-end;gap:1px;height:10px}
.ecp-bars i{width:3px;background:#3c3c41;border-radius:1px}
.ecp-bars i:nth-child(1){height:4px}.ecp-bars i:nth-child(2){height:7px}.ecp-bars i:nth-child(3){height:10px}
.ecp-lv1 .ecp-bars i.on{background:#e84057}.ecp-lv2 .ecp-bars i.on{background:#e0a93a}.ecp-lv3 .ecp-bars i.on{background:#0ac8b9}
.ecp-lv1{border-color:#6b2a35}.ecp-lv2{border-color:#6b5420}
.ecp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#1e2328;color:#cdbe91;border:1px solid #785a28;padding:5px 12px;cursor:pointer;font:inherit;transition:.12s}
.ecp-btn:hover:not(:disabled){border-color:#c8aa6e;color:#f0e6d2}
.ecp-btn:disabled{opacity:.4;cursor:default}
.ecp-apply{display:flex;gap:6px}
.ecp-apply .ecp-btn{height:32px}
.ecp-apply .ecp-main{flex:1;border-color:#c8aa6e;color:#f0e6d2;background:linear-gradient(#2a2314,#17130a);font-weight:bold;letter-spacing:.08em;text-transform:uppercase;font-size:12px}
.ecp-apply .ecp-sec{width:36px;padding:0}
.ecp-btn.ecp-done{border-color:#0ac8b9;color:#0ac8b9;background:#06201f}
.ecp-btn.ecp-done .ec-ico{animation:ecp-pop .3s ease-out}
.ecp-btn.ecp-pinned{border-color:#c8aa6e;color:#f0c870;background:#2a2314}
.ecp-btn.ecp-pinned .ec-ico{fill:currentColor;animation:ecp-pop .3s ease-out}
.ecp-spin{width:14px;height:14px;border:2px solid #785a28;border-top-color:#f0e6d2;border-radius:50%;animation:ecp-rot .7s linear infinite;display:inline-block}
.ecp-msg{display:flex;align-items:center;gap:6px;font-size:11px;color:#e84057;line-height:1.3}
.ecp-center{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0;color:#a09b8c;text-align:center;font-size:12px}
.ecp-pulse{color:#c8aa6e;animation:ecp-pulse 1.4s ease-in-out infinite}
.ecp-sk{width:34px;height:34px;border-radius:50%;background:linear-gradient(90deg,#1e2328,#2b3036,#1e2328);background-size:200% 100%;animation:ecp-shimmer 1.2s linear infinite}
.ecp-sk.ecp-still{animation:none;opacity:.5}
.ecp-fab{position:fixed;z-index:2147483000;left:10px;bottom:10px;width:30px;height:30px;border-radius:50%;border:1px solid #785a28;background:#010a13;color:#c8aa6e;font:bold 11px sans-serif;cursor:pointer;opacity:.55;transition:.15s}
.ecp-fab:hover{opacity:1;box-shadow:0 0 10px rgba(200,170,110,.5)}
.ecp-adv{display:flex;flex-direction:column;gap:6px;padding-bottom:9px;border-bottom:1px solid #2a2a30}
.ecp-dim{opacity:.4;pointer-events:none;transition:opacity .15s}
.ecp-pk{position:relative;display:flex;flex-direction:column;align-items:center;width:40px;padding:0;background:none;border:0;cursor:pointer;color:inherit;font:inherit}
.ecp-pk .ecp-ico{width:36px;height:36px}
.ecp-pk:hover .ecp-ico{transform:scale(1.08);border-color:#c8aa6e}
.ecp-pk.ecp-on .ecp-ico{border:2px solid #c8aa6e;box-shadow:0 0 8px rgba(200,170,110,.45)}
.ecp-badge.ecp-bad{background:#2a2108;border-color:#e0a93a;color:#e0a93a}
.ecp-reasons{display:flex;flex-wrap:wrap;gap:4px;min-height:22px}
.ecp-ch{display:inline-flex;align-items:center;gap:3px;padding:1px 6px 1px 4px;border:1px solid #2a2a30;border-radius:9px;font-size:11px;color:#a09b8c;background:#0a1428;cursor:help}
.ecp-ch img{width:16px;height:16px;border-radius:50%;object-fit:cover}
.ecp-ch.ecp-pos{color:#0ac8b9;border-color:#0b4a46}
.ecp-ch.ecp-neg{color:#e84057;border-color:#6b2a35}
@keyframes ecp-in{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
@keyframes ecp-rot{to{transform:rotate(360deg)}}
@keyframes ecp-pop{0%{transform:scale(.4)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes ecp-pulse{0%,100%{opacity:.45;transform:scale(.94)}50%{opacity:1;transform:scale(1.06)}}
@keyframes ecp-shimmer{to{background-position:-200% 0}}
`

// Icono de cada aviso; el texto largo está en el tooltip (clave notice.<aviso>).
const NOTICE_ICONS = {
  'matchup-requires-premium': 'crown',
  'matchup-low-sample': 'warn',
  'filters-downgraded': 'warn',
  'patch-low-sample': 'warn',
  'patch-range-requires-premium': 'crown',
  'spells-adjusted': 'spark',
  'lola-tier-fallback': 'warn',
  'source-fallback': 'warn',
}

// Texto de una clave con prefijo (err.network, applyErr.rejected…); si no existe, el genérico.
const known = (prefix, id) => { const k = prefix + id; const s = t(k); return s === k ? t('err.other') : s }

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

// Tooltip de una estadística: «Nombre · WPA +1.1 · 146 000 partidas · 62 % de uso — pocas partidas…»
function statTip(name, stat) {
  if (stat && stat.wpa == null && Number.isFinite(stat.wr)) return t('stat.tipWr', name, stat.wr.toFixed(1), (stat.occurrence ?? 0).toLocaleString(getLang()))
  if (!stat || stat.wpa == null) return name
  return t('stat.tip', name, fmtWpa(stat.wpa), stat.occurrence.toLocaleString(getLang())) +
    (stat.share != null ? t('stat.share', Math.round(stat.share * 100)) : '') +
    (isLowData(stat) ? ' — ' + t('lowdata') : '')
}

// Un elemento con icono + WPA (número pequeño). `stat` = { wpa, occurrence } opcional; `key` = tecla del hechizo.
function item(info, stat, cls = '', key = null) {
  const hasWpa = stat && stat.wpa != null
  return h('div', { class: 'ecp-it' }, pic(info, 'ecp-ico ' + cls + (isLowData(stat) ? ' ecp-low' : ''), statTip(info.name, stat)),
    key && h('span', { class: 'ecp-keycap' }, key),
    hasWpa && h('div', { class: 'ecp-w ' + (stat.wpa >= 0 ? 'ecp-pos' : 'ecp-neg') }, fmtWpa(stat.wpa)),
    !hasWpa && stat && Number.isFinite(stat.wr) && h('div', { class: 'ecp-w ecp-wr' }, Math.round(stat.wr) + '%')) // fuentes sin WPA (LoLalytics): win rate
}

// Mejores counters contra el rival de tu línea (application/overlay.js): icono + win rate contra él. null si no hay datos.
function countersBlock(ov, cat) {
  const d = ov?.data
  if (!d || !d.rival || !d.counters.length) return null
  return h('div', { class: 'ecp-line ecp-counters', 'data-counters': String(d.rival), title: t('ov.countersTip', cat.champion(d.rival).name) },
    h('span', { class: 'ecp-lead' }, icon('swords', 16)),
    d.counters.map((c) => h('div', { class: 'ecp-it' },
      pic(cat.champion(c.cid), 'ecp-ico', cat.champion(c.cid).name + ' · ' + t('ov.vsShort', c.wr.toFixed(1), c.edge != null ? (c.edge >= 0 ? '+' : '') + c.edge.toFixed(1) : '–', c.n)),
      h('div', { class: 'ecp-w ecp-pos' }, c.wr.toFixed(0) + '%'))))
}

const line = (...children) => h('div', { class: 'ecp-line' }, children)

function treeIcon(id, cat) {
  const info = cat.rune(id)
  const name = info.name !== '#' + id ? info.name : TREES[id]?.name ?? ''
  return info.icon ? h('img', { class: 'ecp-tree', src: info.icon, alt: name, title: name, draggable: 'false' }) : h('div', { class: 'ecp-tree ecp-ph', title: name }, '')
}

// Otras runas clave: chips con su porcentaje de uso. La elegida lleva marco; la recomendada, un punto.
function keystoneAlts(d, cat, actions) {
  const list = d.alternatives?.keystones ?? []
  if (list.length < 2) return null
  return h('div', { class: 'ecp-line ecp-alts', 'data-alts': 'keystone', title: t('alt.keystones') },
    h('span', { class: 'ecp-lead ecp-mute' }, icon('swap', 14)),
    list.map((k) => {
      const on = k.rune === d.keystone.rune
      const auto = k.rune === d.alternatives.autoKeystone
      const info = cat.rune(k.rune)
      return h('button', {
        type: 'button', class: 'ecp-alt' + (on ? ' ecp-on' : ''), 'data-rune': k.rune, 'data-auto': auto ? '' : null,
        title: statTip(info.name, k) + (auto ? t('alt.auto') : ''), onclick: () => { if (!on) actions.keystone(auto ? null : k.rune) },
      }, pic(info, 'ecp-ico ecp-xs' + (isLowData(k) ? ' ecp-low' : '')), h('span', { class: 'ecp-w' }, Math.round(k.share * 100) + '%'))
    }))
}

// Sustitutos del hechizo intercambiable (ni Destello ni Aplastar en jungla) y, si ya cambiaste algo, volver a la recomendación.
function spellAlts(d, cat, actions) {
  const opts = d.alternatives?.spells ?? []
  if (!opts.length && !d.custom?.spells) return null
  return h('div', { class: 'ecp-line ecp-spalts', 'data-alts': 'spells', title: t('alt.spells') },
    d.custom?.spells && h('button', { type: 'button', class: 'ecp-alt', 'data-act': 'spells-reset', title: t('alt.reset'), onclick: () => actions.spells(null) }, icon('refresh', 14)),
    opts.map((s) => h('button', {
      type: 'button', class: 'ecp-alt', 'data-spell': s.spell, title: statTip(cat.spell(s.spell).name, s), onclick: () => actions.spells(s.pair),
    }, pic(cat.spell(s.spell), 'ecp-ico ecp-xs ecp-sq' + (isLowData(s) ? ' ecp-low' : '')))))
}

function runesBlock(d, cat, flashKey, actions) {
  const r = (id) => cat.rune(id)
  const pair = buildSpellPair(d, flashKey)
  const keys = pair.ok ? ['D', 'F'] : [null, null]
  const spells = pair.ok ? [pair.spell1Id, pair.spell2Id].map((id) => d.spells.find((s) => s.spell === id)) : d.spells
  return [
    line(treeIcon(d.primaryTree, cat), item(r(d.keystone.rune), d.keystone, 'ecp-big'), ...d.primaryPicks.filter(Boolean).map((p) => item(r(p.rune), p))),
    actions ? keystoneAlts(d, cat, actions) : null,
    line(
      d.secondaryTree ? treeIcon(d.secondaryTree, cat) : null,
      ...d.secondaryPicks.map((p) => item(r(p.rune), p)),
      h('div', { class: 'ecp-grow' }),
      ...d.shards.map((id) => h('div', { class: 'ecp-it', style: 'width:28px' }, pic(r(id), 'ecp-ico ecp-sm', r(id).name)))),
    d.spells.length ? line(...spells.map((s, i) => item(cat.spell(s.spell), s, 'ecp-sq', keys[i])), h('div', { class: 'ecp-grow' }), actions ? spellAlts(d, cat, actions) : null) : null,
  ]
}

// ---- Ítems de la build ----
const arrow = () => h('span', { class: 'ecp-arrow' }, icon('next', 12))

// Un ítem: icono cuadrado (con su WPA debajo si es una estadística con datos); el nombre y los números van en el tooltip.
// `track` (solo en partida, de domain/live.js): marca con ✓ lo que ya llevas y, en el siguiente por comprar, una barra con el oro que
// tienes frente a lo que cuesta y lo que falta (o ✓ brillante si ya puedes comprarlo).
function itemCell(id, cat, { stat = null, cls = '', track = null } = {}) {
  const info = cat.item(id)
  const hasWpa = !!stat && stat.wpa != null
  const own = !!track?.owned.has(id)
  const nx = track?.next?.item === id ? track.next : null
  const tip = own ? t('live.own', info.name) : nx ? t(nx.ready ? 'live.ready' : 'live.next', info.name, nx.missing) : hasWpa ? statTip(info.name, stat) : info.name
  return h('div', { class: 'ecp-cell' + (own ? ' ecp-own' : '') + (nx ? ' ecp-next' + (nx.ready ? ' ecp-afford' : '') : ''), 'data-item': id, ...(own && { 'data-own': '' }) },
    pic(info, 'ecp-ico ecp-itm ' + cls + (isLowData(stat) ? ' ecp-low' : ''), tip),
    own && h('span', { class: 'ecp-badge' }, icon('check', 9)),
    nx && h('div', { class: 'ecp-prog' }, h('i', { style: `width:${Math.round(nx.progress * 100)}%` })),
    nx && (nx.ready ? h('div', { class: 'ecp-ready', 'data-ready': '' }, icon('check', 12)) : h('div', { class: 'ecp-miss', 'data-missing': nx.missing }, '−' + nx.missing)),
    !nx && hasWpa && h('div', { class: 'ecp-w ' + (stat.wpa >= 0 ? 'ecp-pos' : 'ecp-neg') }, fmtWpa(stat.wpa)),
    !nx && !hasWpa && stat && Number.isFinite(stat.wr) && h('div', { class: 'ecp-w ecp-wr' }, Math.round(stat.wr) + '%'))
}

function itemsHeader(L, live) {
  const letter = tierLetter(L.tier)
  const wr = Number.isFinite(L.winrate) ? L.winrate : null
  const gold = live ? Math.floor(live.gold) : null
  if (!letter && wr == null && !L.games && L.keystoneMatch && gold == null) return null
  const tip = wr == null ? '' : t(letter ? 'items.tip' : 'items.tipNoTier', letter ?? '', wr.toFixed(1), L.games.toLocaleString(getLang()))
  return h('div', { class: 'ecp-line ecp-ihead', 'data-row': 'head', title: tip },
    letter && h('span', { class: 'ecp-tier ecp-tier-' + letter }, letter),
    wr != null && h('span', { class: 'ecp-wr' }, wr.toFixed(1) + '%'),
    L.games > 0 && h('span', { class: 'ecp-w' }, fmtN(L.games)),
    h('div', { class: 'ecp-grow' }),
    gold != null && h('span', { class: 'ecp-coin', 'data-gold': gold, title: t('live.gold', gold.toLocaleString(getLang())) }, icon('coin', 13), gold.toLocaleString(getLang())),
    !L.keystoneMatch && h('span', { class: 'ecp-tag ecp-warn ecp-ifb', title: t('items.fallback') }, icon('warn', 11)))
}

// Una fila: icono de la fila (el nombre solo en el tooltip) + ítems. null si no hay ítems.
const itemRow = (key, ico, cells) => {
  const list = cells.flat().filter(Boolean)
  return list.length
    ? h('div', { class: 'ecp-line ecp-irow', 'data-row': key, title: t('items.' + key) },
        h('span', { class: 'ecp-lead ecp-mute' }, icon(ico, 16)), h('div', { class: 'ecp-icons' }, list))
    : null
}

/** Bloque de ítems. `game` = modo partida (completo y grande); si no, compacto (inicio, botas, núcleo y siguientes). */
function itemsBlock(d, cat, { game = false, live = null } = {}) {
  const L = layoutItems(d.items, { isBoots: (id) => cat.isBoots(id), compact: !game })
  if (!hasItems(L)) return null
  // Con la Live Client Data API conectada: lo que ya llevas y lo siguiente por comprar.
  const track = game && live && (live.status === 'live' || (live.status === 'offline' && live.level != null)) ? trackBuild(L, live.items, live.gold, (id) => cat.recipe(id)) : null
  const core = []
  L.core.forEach((id, i) => { if (i) core.push(arrow()); core.push(itemCell(id, cat, { cls: 'ecp-core', track })) })
  if (L.next.length) { if (core.length) core.push(arrow()); L.next.forEach((s) => core.push(itemCell(s.item, cat, { stat: s, track }))) }
  const stats = (list) => list.map((s) => itemCell(s.item, cat, { stat: s, track }))
  return h('div', { class: 'ecp-sect ecp-items', 'data-items': game ? 'game' : 'compact' },
    itemsHeader(L, track ? live : null),
    itemRow('starters', 'cart', L.starters.map((id) => itemCell(id, cat, { track }))),
    itemRow('early', 'recall', stats(L.early)),
    itemRow('boots', 'boots', stats(L.boots)),
    itemRow('core', 'sword', core),
    itemRow('options', 'swap', stats(L.options)),
    itemRow('situational', 'target', stats(L.situational)))
}

function titleOf(state, cat) {
  const c = state.context
  if (!c?.championId) return 'Easy Coachless'
  const me = cat.champion(c.championId).name
  const rival = state.status === 'ready' ? state.data.meta.opponent : c.opponentChampionId
  const vs = rival ? ` vs ${cat.champion(rival).name}` : ''
  return `${me}${vs} · ${t('role.' + c.role)}`
}

// Cabecera: tu retrato ⚔ retrato del rival + rol (el texto completo queda en el tooltip).
function titleNode(state, cat) {
  const c = state.context
  if (!c?.championId) return h('div', { class: 'ecp-title', title: 'Easy Coachless' }, h('div', { class: 'ecp-por ecp-ph' }, '?'))
  const rival = state.status === 'ready' ? state.data.meta.opponent : c.opponentChampionId
  const roleName = t('role.' + c.role)
  return h('div', { class: 'ecp-title', title: titleOf(state, cat) },
    pic(cat.champion(c.championId), 'ecp-por'),
    rival && h('span', { class: 'ecp-vs' }, icon('swords', 14)),
    rival && pic(cat.champion(rival), 'ecp-por ecp-foe'),
    roleName !== 'role.' + c.role && h('span', { class: 'ecp-role' }, roleName))
}

// Rivales ya revelados: clic para elegir con cuál se calcula el matchup; clic en el elegido a mano vuelve al automático.
function rivalsBlock(state, cat, actions) {
  const c = state.context
  const enemies = c?.enemies ?? []
  if (!enemies.length) return null
  const used = c.opponentChampionId ?? null // el pedido (aunque el matchup no tenga datos y se muestre la build general)
  return h('div', { class: 'ecp-line ecp-rivals', title: t('panel.rival') }, h('span', { class: 'ecp-lead' }, icon('swords', 16)),
    enemies.map((e) => {
      const info = cat.champion(e.championId)
      const on = e.championId === used
      return h('button', {
        type: 'button', class: 'ecp-chip' + (on ? ' ecp-on' : ''), title: info.name + (on ? ' ' + t('panel.inUse') : ''),
        onclick: () => actions.pick(on && c.opponentSource === 'manual' ? null : e.championId),
      }, pic(info, 'ecp-ico'))
    }))
}

const runesKey = (d) => JSON.stringify([d.keystone.rune, d.primaryPicks.map((p) => p?.rune), d.secondaryPicks.map((p) => p.rune), d.shards])
const spellsKey = (d) => JSON.stringify(d.spells.map((s) => s.spell))

// Botones de aplicar: grande «Aplicar» (todo) + dos cuadrados (página de runas / hechizos) + fijar. Estados: giro → ✓.
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
  }, busy ? h('span', { class: 'ecp-spin' }) : icon(done ? 'check' : ico, cls === 'ecp-main' ? 16 : 17), label && (done ? t('apply.done') : label))
  const all = doneRunes && (doneSpells || !canSpells || !inChampSelect)
  return h('div', { class: 'ecp-sect' },
    h('div', { class: 'ecp-apply' },
      mk('all', 'bolt', t('apply.btn'), !canRunes && !(canSpells && inChampSelect), t('apply.all'), all, ui.busy, 'ecp-main'),
      mk('runes', 'page', '', !canRunes, canRunes ? t('apply.runes') : t('apply.noRunes'), doneRunes, ui.busy && ui.kind === 'runes', 'ecp-sec'),
      canSpells ? mk('spells', 'spark', '', !inChampSelect, inChampSelect ? t('apply.spells') : t('apply.champSelect'), doneSpells, ui.busy && ui.kind === 'spells', 'ecp-sec') : null,
      h('button', {
        type: 'button', class: 'ecp-btn ecp-sec' + (state.pinned ? ' ecp-pinned' : ''), 'data-act': 'pin', 'aria-pressed': String(!!state.pinned),
        title: state.pinned ? t('pin.on') : t('pin.off'), onclick: () => actions.pin(),
      }, icon('pin', 17))),
    ui.msg ? h('div', { class: 'ecp-msg ecp-err' }, icon('warn', 13), ui.msg.text) : null)
}

// Medidor de fiabilidad: 3 barras (rojo / ámbar / turquesa) y las partidas analizadas.
function confidenceTag(sample) {
  const lv = confidenceLevel(sample)
  return h('span', { class: 'ecp-tag ecp-conf ecp-lv' + lv, 'data-level': lv, title: t('conf.tip', sample.toLocaleString(getLang()), t('conf.' + lv)) },
    h('span', { class: 'ecp-bars' }, [1, 2, 3].map((i) => h('i', { class: i <= lv ? 'on' : null }))), fmtN(sample))
}

// Etiquetas pequeñas: parche, rango, fiabilidad, matchup, simulación y avisos (icono con tooltip).
function tagsBlock(state) {
  const m = state.data.meta
  const tierNames = Object.fromEntries([3, 4, 5, 6, 7].map((n) => [n, t('tier.' + n)]))
  return h('div', { class: 'ecp-tags' },
    h('span', { class: 'ecp-tag' + (m.patchSource === 'manual' ? ' ecp-gold' : ''), 'data-patch-range': m.patchRange ?? 0, title: t('tag.patch') }, m.patchSpan ?? m.patch),
    h('span', { class: 'ecp-tag' + (m.tierSource === 'manual' ? ' ecp-gold' : ''), 'data-tier-source': m.tierSource ?? 'lobby', title: t(m.tierSource === 'manual' ? 'tag.tierManual' : 'tag.tier') }, tiersLabel(m.tiers, tierNames)),
    m.source === 'lolalytics' && h('span', { class: 'ecp-tag ecp-gold', 'data-source': 'lolalytics', title: t('tag.lola') }, 'LoLalytics'),
    confidenceTag(m.sample),
    m.matchup && h('span', { class: 'ecp-tag ecp-gold ecp-tag-matchup', title: t('tag.matchup') }, icon('swords', 11)),
    state.context?.source === 'manual' && h('span', { class: 'ecp-tag ecp-gold ecp-tag-sim', title: t('tag.sim') }, icon('target', 11)),
    state.context?.phase === 'game' && h('span', { class: 'ecp-tag ecp-gold ecp-tag-game', title: t('items.game') }, icon('play', 11)),
    m.notices.map((n) => (NOTICE_ICONS[n] ? h('span', { class: 'ecp-tag ecp-warn', title: t('notice.' + n) }, icon(NOTICE_ICONS[n], 11)) : null)))
}

const skeleton = (still = false) => [
  line(...Array.from({ length: 5 }, () => h('div', { class: 'ecp-sk' + (still ? ' ecp-still' : '') }))),
  line(...Array.from({ length: 2 }, () => h('div', { class: 'ecp-sk' + (still ? ' ecp-still' : '') }))),
]

function readyBody(state, cat, actions, ui, flashKey) {
  // En partida: ítems completos arriba, runas de solo lectura (sin alternativas) y nada de aplicar ni rivales.
  if (state.context?.phase === 'game') return [itemsBlock(state.data, cat, { game: true, live: ui.live }), ...runesBlock(state.data, cat, flashKey, null), tagsBlock(state)]
  return [
    ...runesBlock(state.data, cat, flashKey, actions),
    applyBlock(state, actions, ui),
    itemsBlock(state.data, cat),
    rivalsBlock(state, cat, actions),
    tagsBlock(state),
  ]
}

function bodyOf(state, cat, actions, ui, flashKey) {
  switch (state.status) {
    case 'waiting': return [h('div', { class: 'ecp-center', title: t('panel.pick') }, h('span', { class: 'ecp-pulse' }, icon('target', 28))), ...skeleton(true)]
    // Mientras llega la nueva recomendación del mismo campeón se sigue viendo la anterior, atenuada y sin botones activos.
    case 'loading': return state.stale ? [h('div', { class: 'ecp-stale' }, readyBody({ ...state, status: 'ready', data: state.stale }, cat, actions, ui, flashKey))] : skeleton()
    case 'needs-login': return [h('div', { class: 'ecp-center' }, icon('user', 26), h('button', { class: 'ecp-btn', type: 'button', title: t('panel.login'), onclick: actions.login }, icon('user', 14), t('panel.enter')))]
    case 'error': {
      const auth = state.reason === 'auth'
      return [
        h('div', { class: 'ecp-center' }, h('span', { style: 'color:#e0a93a' }, icon('warn', 26)), known('err.', state.reason),
          h('button', { class: 'ecp-btn', type: 'button', title: auth ? t('panel.login') : t('panel.retry'), onclick: auth ? actions.login : actions.retry }, icon(auth ? 'user' : 'refresh', 15))),
        rivalsBlock(state, cat, actions),
      ]
    }
    case 'ready': return readyBody(state, cat, actions, ui, flashKey)
    default: return []
  }
}

// ---- Picks sugeridos (application/pick-advisor.js) ----
const LANE_ROLE = { TOP: 0, JUNGLE: 1, MIDDLE: 2, BOTTOM: 3, UTILITY: 4 }
const laneName = (l) => t('role.' + LANE_ROLE[l])
const signed = (n) => (n >= 0 ? '+' : '') + n.toFixed(1)
const DMG_ICON = { ad: 'sword', ap: 'spark', balanced: 'check' }
const CHIP_ICON = { syn: 'users', ctr: 'swords', weak: 'swords', scale: 'trend' }

// Un motivo: icono (o el retrato del aliado/rival implicado) + cifra; el texto completo, en el tooltip.
function reasonChip(chip, meta, cat) {
  const who = chip.lane ? meta[chip.kind === 'syn' ? 'allies' : 'enemies']?.[chip.lane] : null
  const name = who ? cat.champion(who).name : chip.lane ? laneName(chip.lane) : ''
  const v = typeof chip.value === 'number' ? (chip.value >= 0 ? '+' : '') + chip.value : ''
  const tip = chip.kind === 'syn' ? t('adv.syn', name, v) : chip.kind === 'ctr' ? t('adv.ctr', name, v) : chip.kind === 'weak' ? t('adv.weak', name, v)
    : chip.kind === 'scale' ? t('adv.scale', t('adv.phase.' + chip.phase), v) : t('adv.dmg.' + chip.value)
  const neg = chip.kind === 'weak'
  const pos = chip.kind === 'syn' || chip.kind === 'ctr' || chip.kind === 'scale' || chip.value === 'balanced'
  return h('span', { class: 'ecp-ch' + (neg ? ' ecp-neg' : pos ? ' ecp-pos' : ''), 'data-chip': chip.kind, title: tip },
    who && cat.champion(who).icon ? h('img', { src: cat.champion(who).icon, alt: name, draggable: 'false' }) : icon(CHIP_ICON[chip.kind] ?? DMG_ICON[chip.value] ?? 'spark', 12),
    v ? h('span', null, v) : null)
}

function pickTip(p, info, meta, cat) {
  const parts = [t('adv.pickTip', info.name, signed(p.score), p.games.toLocaleString(getLang()))]
  if (p.matchup && meta.rival) parts.push(t('adv.vs', cat.champion(meta.rival).name, p.matchup.wr.toFixed(1), p.matchup.edge != null ? signed(p.matchup.edge) : '–', p.matchup.n))
  if (p.agree) parts.push(t('adv.' + p.agree))
  return parts.join(' — ')
}

// null cuando no hay nada que enseñar (apagado, sin línea, ARAM…). Antes de la primera respuesta, esqueletos.
function advisorBlock(adv, cat, ui, actions) {
  if (!adv || adv.status === 'idle') return null
  if (adv.status === 'error') {
    if (adv.reason === 'no-lane' || adv.reason === 'mode') return null
    return h('div', { class: 'ecp-adv', 'data-advisor': 'error', 'data-reason': adv.reason },
      h('div', { class: 'ecp-msg' }, icon('warn', 13), known('adv.err.', adv.reason),
        adv.reason !== 'limit' && h('button', { class: 'ecp-x', type: 'button', 'data-act': 'adv-retry', title: t('panel.retry'), onclick: actions.advRetry }, icon('refresh', 14))))
  }
  const d = adv.data
  if (!d) return h('div', { class: 'ecp-adv', 'data-advisor': 'loading' }, line(h('span', { class: 'ecp-lead' }, icon('spark', 16)), ...Array.from({ length: 5 }, () => h('div', { class: 'ecp-sk' }))))
  const m = d.meta
  const sel = d.picks.find((p) => p.championId === ui.advSel) ?? d.picks[0]
  const tags = h('div', { class: 'ecp-tags' },
    h('span', { class: 'ecp-tag ecp-gold', 'data-source': 'itero', title: t('adv.tagTip') }, t('adv.tag')),
    m.blended && h('span', { class: 'ecp-tag', 'data-blended': '', title: t('adv.tagLola') }, 'LoLalytics'),
    m.unrecognized?.length ? h('span', { class: 'ecp-tag ecp-warn', 'data-warn': 'names', title: t('adv.unrecognized') }, icon('warn', 11)) : null,
    m.sideKnown ? null : h('span', { class: 'ecp-tag ecp-warn', 'data-warn': 'side', title: t('adv.sideAssumed') }, icon('warn', 11)))
  const cell = (p) => {
    const info = cat.champion(p.championId)
    return h('button', {
      type: 'button', class: 'ecp-pk' + (p.championId === sel?.championId ? ' ecp-on' : ''), 'data-pick': p.championId, 'data-agree': p.agree, title: pickTip(p, info, m, cat),
      onclick: () => actions.advSelect(p.championId),
    }, pic(info, 'ecp-ico'),
    p.agree ? h('span', { class: 'ecp-badge' + (p.agree === 'conflict' ? ' ecp-bad' : '') }, icon(p.agree === 'agree' ? 'check' : 'warn', 9)) : null,
    h('div', { class: 'ecp-w ' + (p.score >= 0 ? 'ecp-pos' : 'ecp-neg') }, signed(p.score)))
  }
  return h('div', { class: 'ecp-adv' + (adv.status === 'loading' ? ' ecp-dim' : ''), 'data-advisor': adv.status },
    d.picks.length
      ? [line(h('span', { class: 'ecp-lead', title: t('adv.tagTip') }, icon('spark', 16)), ...d.picks.map(cell)),
        h('div', { class: 'ecp-reasons', 'data-reasons': sel.championId }, sel.chips.map((c) => reasonChip(c, m, cat)))]
      : h('div', { class: 'ecp-msg', style: 'color:#a09b8c', 'data-advisor-empty': '' }, t('adv.none')),
    tags)
}

// Enlace a la misma build en coachless.gg: campeón, rol y (si lo hay) rival. null si el catálogo aún no tiene el nombre.
function webUrl(state, cat) {
  const c = state.context
  if (!c?.championId) return null
  const rival = c.opponentChampionId ?? state.data?.meta?.opponent ?? null
  if (state.data?.meta?.source === 'lolalytics') return lolalyticsUrl({ champion: championSlug(cat.champion(c.championId)), lane: laneOfRole(c.role), opponent: rival ? championSlug(cat.champion(rival)) : null })
  return buildsUrl({ champion: championSlug(cat.champion(c.championId)), role: c.role, opponent: rival ? championSlug(cat.champion(rival)) : null })
}

/**
 * Monta el panel (y el botón de acceso al menú). `deps`: { controller, catalog, applier, onEnableApply, onLogin, onMenu }.
 * onEnableApply(): pide al usuario aceptar el aviso de «Aplicar»; devuelve Promise<boolean>.
 * Devuelve { destroy }.
 */
export async function mountPanel({ controller, catalog, applier, live, overlay, advisor, onEnableApply, onLogin, onMenu }) {
  await whenReady()
  ensureStyle()
  let lastHidden = null
  let dismissedKey = null // × pulsado: oculto mientras el campeón y el rival sean los mismos
  const keyOf = (st) => (st.context ? `${st.context.championId}|${st.context.opponentChampionId ?? 0}|${st.context.source ?? ''}|${st.context.phase ?? ''}` : null)
  let prefs = getPanelPrefs()
  const ui = { busy: false, kind: null, msg: null, applied: { runes: null, spells: null }, live: null, advSel: null } // live: estado de application/live-game.js; advSel: pick del consejero con motivos a la vista
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

  const actions = {
    login: () => onLogin(),
    retry: () => controller.refresh(),
    pick: (id) => controller.setOpponent(id),
    keystone: (rune) => controller.setKeystone(rune),
    spells: (pair) => controller.setSpells(pair),
    pin: () => controller.togglePin(),
    web: () => { const url = webUrl(controller.getState(), catalog); if (url) openExternal(url) },
    apply: (kind) => apply(kind),
    advSelect: (id) => { ui.advSel = id; render(controller.getState()) },
    advRetry: () => advisor?.refresh(),
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
    root.classList.toggle('ecp-game', state.context?.phase === 'game')
    place()
    const toggle = () => { prefs = setPanelPrefs({ collapsed: !prefs.collapsed }); render(controller.getState()) }
    const url = webUrl(state, catalog)
    const head = h('div', { class: 'ecp-head' },
      titleNode(state, catalog),
      state.context?.championId ? h('button', { class: 'ecp-x', type: 'button', 'data-act': 'web', title: t('panel.web'), disabled: url ? null : 'disabled', onclick: actions.web }, icon('link', 14)) : null,
      h('button', { class: 'ecp-x', type: 'button', title: prefs.collapsed ? t('panel.unfold') : t('panel.fold'), onclick: toggle }, icon('chevron', 15, prefs.collapsed ? '' : 'ecp-up')),
      h('button', { class: 'ecp-x', type: 'button', title: t('panel.close'), onclick: () => { dismissedKey = keyOf(controller.getState()); render(controller.getState()) } }, icon('close', 14)))
    enableDrag(head)
    if (state.status !== 'ready' || runesKey(state.data) !== uiKey) { ui.msg = null; uiKey = state.status === 'ready' ? runesKey(state.data) : null }
    ui.live = live?.getState() ?? null
    const counters = state.context?.phase === 'game' ? null : countersBlock(overlay?.getState(), catalog)
    const adv = state.context?.phase === 'game' ? null : advisorBlock(advisor?.getState(), catalog, ui, actions)
    const body = prefs.collapsed ? null : h('div', { class: 'ecp-body' }, [adv, ...bodyOf(state, catalog, actions, ui, applier.getSettings().flashKey), counters])
    root.replaceChildren(head, ...(body ? [body] : []))
  }

  // Aplica la recomendación mostrada. kind: 'all' | 'runes' | 'spells'. Si Aplicar está desactivado, primero se pide aceptar el aviso.
  async function apply(kind) {
    const st = controller.getState()
    if (st.status !== 'ready' || ui.busy || st.context?.phase === 'game') return // en partida ya no se aplica nada
    if (!applier.canApply() && !(await onEnableApply())) return
    const d = st.data
    const names = { champion: catalog.champion(st.context.championId).name, opponent: d.meta.opponent ? catalog.champion(d.meta.opponent).name : null }
    ui.busy = true; ui.kind = kind; ui.msg = null; render(controller.getState())
    const problems = []
    if (kind !== 'spells') {
      const r = await applier.applyRunes(d, names)
      if (r.ok) { ui.applied.runes = runesKey(d); if (!r.verified) problems.push(t('apply.probRunes', t('apply.unconfirmed'))) }
      else problems.push(t('apply.probRunes', known('applyErr.', r.reason)))
    }
    if (kind !== 'runes' && d.spells.length === 2 && (kind === 'spells' || st.context.source === 'lcu')) {
      const r = await applier.applySpells(d)
      if (r.ok) ui.applied.spells = spellsKey(d)
      else problems.push(t('apply.probSpells', known('applyErr.', r.reason)))
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
  const offLive = live?.subscribe(() => render(controller.getState()))
  const offOv = overlay?.subscribe(() => render(controller.getState()))
  const offAdv = advisor?.subscribe(() => render(controller.getState()))
  attach()

  return {
    destroy() {
      off(); offLive?.(); offOv?.(); offAdv?.(); clearInterval(guard)
      removeEventListener('keydown', onKey); removeEventListener('easy-coachless:prefs', onPrefs); removeEventListener('easy-coachless:show-panel', onShow)
      root.remove(); fab.remove()
    },
  }
}
