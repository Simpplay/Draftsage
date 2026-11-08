// draftsage/src/presentation/panel.js — panel flotante con las runas y hechizos recomendados
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
// Picks sugeridos (ARRIBA, es lo primero que se decide), en DOS listas independientes de hasta 5 retratos:
//   · MATCHUP (LoLalytics, sin cuenta): los campeones con mejor win rate contra el rival de tu línea, con ese % debajo;
//   · DRAFT (iTero, application/pick-advisor.js, desactivado hasta que el usuario lo acepta): los que mejor encajan en la composición, con su puntuación
//     RELATIVA (nunca un % absoluto), una marca ✓/⚠ si el matchup de LoLalytics coincide o discrepa y, al elegir uno, los motivos como chips con icono
//     (sinergia, counter, punto débil, escalado, daño). Con la maestría activada (opcional) iTero pesa tus campeones. Funciona también antes de elegir campeón.
// Encima va la barra de FILTROS (clase, dominio, matchup, meta, fase, daño; application/pick-filters.js): recortan las dos listas y atenúan la cuadrícula.
// Rivales: junto al retrato de cada rival, un botón con su línea (la que eligió el jugador, la del cliente o la deducida por el plugin) y un selector de línea.
// El detalle sale de las respuestas ya recibidas (sin red al hacer clic).
// MODO ANCLADO (presentation/native.js): dentro de un Champion Select cuyo DOM se reconoce, el panel deja de ser una ventana flotante y se
// convierte en un popover pegado al elemento nativo que lo abre (sin arrastre ni plegado): vista «build» (runas, aplicar, ítems; sube desde el
// botón de la barra de runas/hechizos) o vista «picks» (filtros, picks de matchup y de draft, rivales; baja desde la cabecera de la cuadrícula).
// Sin anclas reconocibles (otra versión del cliente, simulación, partida) sigue siendo el panel flotante de siempre.
// No hace fetch: lee el estado del controlador (application/champ-select.js) y el catálogo de nombres/iconos.

import { ensureTheme } from './theme.js'
import { h, whenReady, openExternal } from './ui.js'
import { fmtN, fmtWpa, known, line, pic, signed, statTip } from './components/common.js'
import { runePage, runeSummary } from './components/build.js'
import { draftSummaryBlock, teamContextBlock } from './components/draft.js'
import { buildDraftSummary } from '../domain/draft-summary.js'
import { icon } from './icons.js'
import { tiersLabel } from '../domain/lobby.js'
import { regionCode } from '../domain/filters.js'
import { hasItems, layoutItems, tierLetter } from '../domain/items.js'
import { trackBuild } from '../domain/live.js'
import { confidenceLevel, isLowData } from '../domain/confidence.js'
import { buildsUrl, lolalyticsUrl, championSlug } from '../domain/web.js'
import { laneOfRole } from '../domain/lolalytics.js'
import { LANES } from '../domain/itero.js'
import { CLASSES, DAMAGE_STEPS, MASTERY_POINTS, MASTERY_STEPS, MATCHUP_STEPS, META_STEPS, PHASE_STEPS, evaluable } from '../domain/pick-filters.js'
import { getPanelPrefs, setPanelPrefs } from '../application/preferences.js'
import { getLang, t } from '../shared/i18n.js'
import { log } from '../shared/logger.js'

const STYLE_ID = 'draftsage-panel-style'
const CSS = `
.ecp{position:fixed;z-index:2147483000;width:292px;box-sizing:border-box;background:linear-gradient(var(--ds-surface),var(--ds-bg) 60px);color:var(--ds-text);border:1px solid var(--ds-gold-dim);box-shadow:0 0 18px #000;font:13px/1.4 sans-serif;user-select:none;animation:ecp-in .2s ease-out;-webkit-app-region:no-drag}
.ecp *{-webkit-app-region:no-drag}
.ecp-head{display:flex;align-items:center;gap:4px;padding:6px 8px;cursor:move;border-bottom:1px solid var(--ds-border)}
.ecp-title{flex:1;display:flex;align-items:center;gap:7px;min-width:0}
.ecp-por{width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--ds-gold);background:var(--ds-surface-2);flex:none;box-sizing:border-box}
.ecp-por.ecp-foe{border-color:var(--ds-rival);width:26px;height:26px}
.ecp-vs{color:var(--ds-rival);display:flex}
.ecp-role{margin-left:2px;padding:1px 7px;border:1px solid var(--ds-border);border-radius:9px;font-size:10px;letter-spacing:.08em;color:var(--ds-meta);background:var(--ds-bg)}
.ecp-x{display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:none;border:0;color:var(--ds-mute);cursor:pointer;padding:0}
.ecp-x:hover:not(:disabled){color:var(--ds-text-hi)}
.ecp-x:disabled{opacity:.3;cursor:default}
.ecp-up{transform:rotate(180deg)}
.ecp-body{padding:10px 10px 8px;display:flex;flex-direction:column;gap:9px;max-height:calc(100vh - 150px);overflow-y:auto;scrollbar-width:thin}
.ecp-stale{display:flex;flex-direction:column;gap:9px;opacity:.4;pointer-events:none;transition:opacity .15s}
.ecp-line{display:flex;align-items:center;gap:7px}
.ecp-grow{flex:1}
.ecp-tree{width:22px;height:22px;flex:none;border-radius:50%;opacity:.85;object-fit:cover}
.ecp-it{position:relative;display:flex;flex-direction:column;align-items:center;width:40px;text-align:center}
.ecp-ico{width:34px;height:34px;border-radius:50%;background:var(--ds-surface-2);border:1px solid var(--ds-border);object-fit:cover;box-sizing:border-box;transition:transform .12s}
.ecp-it:hover .ecp-ico{transform:scale(1.12);border-color:var(--ds-gold)}
.ecp-ico.ecp-big{width:44px;height:44px;border:2px solid var(--ds-gold);box-shadow:0 0 12px rgba(200,170,110,.45)}
.ecp-ico.ecp-sq{border-radius:4px}
.ecp-ico.ecp-sm{width:24px;height:24px}
.ecp-ico.ecp-xs{width:24px;height:24px}
.ecp-ico.ecp-low{opacity:.55;border-style:dashed}
.ecp.ecp-game{width:340px}
.ecp-icons{display:flex;flex-wrap:wrap;align-items:flex-start;gap:4px;flex:1;min-width:0}
.ecp-irow{align-items:flex-start}
.ecp-cell{display:flex;flex-direction:column;align-items:center;min-width:32px}
.ecp-ico.ecp-itm{width:32px;height:32px;border-radius:4px}
.ecp-cell:hover .ecp-ico.ecp-itm{transform:scale(1.12);border-color:var(--ds-gold)}
.ecp-ico.ecp-itm.ecp-core{border:2px solid var(--ds-gold);box-shadow:0 0 8px rgba(200,170,110,.35)}
.ecp-game .ecp-ico.ecp-itm{width:40px;height:40px}
.ecp-game .ecp-cell{min-width:40px}
@keyframes ecp-glow{0%,100%{box-shadow:0 0 4px rgba(10,200,185,.4)}50%{box-shadow:0 0 12px rgba(10,200,185,.9)}}
.ecp-cell{position:relative}
.ecp-cell.ecp-own .ecp-ico.ecp-itm{border-color:var(--ds-teal);box-shadow:0 0 6px rgba(10,200,185,.45)}
.ecp-badge{position:absolute;top:-4px;right:-3px;width:14px;height:14px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--ds-teal-bg);border:1px solid var(--ds-teal);color:var(--ds-teal)}
.ecp-prog{width:100%;height:3px;margin-top:2px;background:var(--ds-surface-2);border-radius:2px;overflow:hidden}
.ecp-prog i{display:block;height:100%;background:var(--ds-amber)}
.ecp-cell.ecp-afford .ecp-prog i{background:var(--ds-teal)}
.ecp-cell.ecp-afford .ecp-ico.ecp-itm{border-color:var(--ds-teal);animation:ecp-glow 1.4s ease-in-out infinite}
.ecp-miss{font-size:10px;line-height:12px;color:var(--ds-amber)}
.ecp-ready{display:flex;color:var(--ds-teal)}
.ecp-coin{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:bold;color:var(--ds-amber)}
.ecp-arrow{display:flex;align-items:center;height:32px;color:var(--ds-mute-2)}
.ecp-game .ecp-arrow{height:40px}
.ecp-items{display:flex;flex-direction:column;gap:7px}
.ecp-ihead{gap:6px}
.ecp-tier{display:flex;align-items:center;justify-content:center;width:22px;height:22px;box-sizing:border-box;border-radius:50%;border:2px solid;font:bold 11px/1 sans-serif;flex:none}
.ecp-tier-S{color:var(--ds-gold-hi);border-color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-tier-A{color:var(--ds-teal);border-color:var(--ds-teal);background:var(--ds-teal-bg)}
.ecp-tier-B{color:var(--ds-meta);border-color:var(--ds-mute-2);background:var(--ds-surface-2)}
.ecp-wr{font-size:12px;font-weight:bold;color:var(--ds-text-hi)}
.ecp-ph{display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--ds-meta)}
.ecp-w{font-size:10px;line-height:12px;color:var(--ds-meta);margin-top:1px}
.ecp-w.ecp-pos{color:var(--ds-teal)}.ecp-w.ecp-neg{color:var(--ds-red)}
.ecp-keycap{position:absolute;right:0;top:-3px;min-width:14px;padding:0 3px;box-sizing:border-box;text-align:center;font:bold 10px/14px sans-serif;color:var(--ds-text-hi);background:#3b3119;border:1px solid var(--ds-gold);border-bottom-width:2px;border-radius:3px}
.ecp-chip{padding:0;margin:0;background:none;border:2px solid transparent;border-radius:50%;cursor:pointer;line-height:0;transition:.12s}
.ecp-chip:hover{border-color:var(--ds-gold-dim)}
.ecp-chip.ecp-on{border-color:var(--ds-gold);box-shadow:0 0 8px rgba(200,170,110,.5)}
.ecp-chip .ecp-ico{width:28px;height:28px}
.ecp-lead{color:var(--ds-rival);display:flex}
.ecp-lead.ecp-mute{color:var(--ds-mute-2)}
.ecp-alts{gap:4px;margin:-2px 0}
.ecp-alt{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:36px;padding:3px 0 1px;background:none;border:1px solid transparent;border-radius:6px;cursor:pointer;line-height:0;color:var(--ds-mute);transition:.12s}
.ecp-alt:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecp-alt.ecp-on{border-color:var(--ds-gold);background:rgba(200,170,110,.08);cursor:default}
.ecp-alt[data-auto]::after{content:'';position:absolute;top:1px;right:4px;width:5px;height:5px;border-radius:50%;background:var(--ds-gold)}
.ecp-alt .ecp-w{line-height:11px;margin-top:2px}
.ecp-spalts{gap:2px}
.ecp-spalts .ecp-alt{min-width:30px;padding:3px 0}
.ecp-wr{color:var(--ds-meta)}
.ecp-tags{display:flex;flex-wrap:wrap;gap:5px}
.ecp-tag{display:flex;align-items:center;gap:4px;padding:1px 7px;border:1px solid var(--ds-border-soft);border-radius:9px;font-size:10px;color:var(--ds-mute);background:var(--ds-surface)}
.ecp-tag.ecp-gold{border-color:var(--ds-gold-dim);color:var(--ds-gold)}
.ecp-tag.ecp-warn{border-color:#8a6a1f;color:var(--ds-amber);cursor:help}
.ecp-bars{display:inline-flex;align-items:flex-end;gap:1px;height:10px}
.ecp-bars i{width:3px;background:var(--ds-border);border-radius:1px}
.ecp-bars i:nth-child(1){height:4px}.ecp-bars i:nth-child(2){height:7px}.ecp-bars i:nth-child(3){height:10px}
.ecp-lv1 .ecp-bars i.on{background:var(--ds-red)}.ecp-lv2 .ecp-bars i.on{background:var(--ds-amber)}.ecp-lv3 .ecp-bars i.on{background:var(--ds-teal)}
.ecp-lv1{border-color:#6b2a35}.ecp-lv2{border-color:#6b5420}
.ecp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--ds-surface-2);color:var(--ds-text);border:1px solid var(--ds-gold-dim);padding:5px 12px;cursor:pointer;font:inherit;transition:.12s}
.ecp-btn:hover:not(:disabled){border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ecp-btn:disabled{opacity:.4;cursor:default}
.ecp-apply{display:flex;gap:6px}
.ecp-apply .ecp-btn{height:32px}
.ecp-apply .ecp-main{flex:1;border-color:var(--ds-gold);color:var(--ds-text-hi);background:linear-gradient(var(--ds-gold-bg),#17130a);font-weight:bold;letter-spacing:.08em;text-transform:uppercase;font-size:12px}
.ecp-apply .ecp-sec{width:36px;padding:0}
.ecp-btn.ecp-done{border-color:var(--ds-teal);color:var(--ds-teal);background:var(--ds-teal-bg)}
.ecp-btn.ecp-done .ec-ico{animation:ecp-pop .3s ease-out}
.ecp-btn.ecp-pinned{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-btn.ecp-pinned .ec-ico{fill:currentColor;animation:ecp-pop .3s ease-out}
.ecp-spin{width:14px;height:14px;border:2px solid var(--ds-gold-dim);border-top-color:var(--ds-text-hi);border-radius:50%;animation:ecp-rot .7s linear infinite;display:inline-block}
.ecp-msg{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--ds-red);line-height:1.3}
.ecp-center{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0;color:var(--ds-meta);text-align:center;font-size:12px}
.ecp-pulse{color:var(--ds-gold);animation:ecp-pulse 1.4s ease-in-out infinite}
.ecp-sk{width:34px;height:34px;border-radius:50%;background:linear-gradient(90deg,var(--ds-surface-2),#2b3036,var(--ds-surface-2));background-size:200% 100%;animation:ecp-shimmer 1.2s linear infinite}
.ecp-sk.ecp-still{animation:none;opacity:.5}
.ecp-fab{position:fixed;z-index:2147483000;left:10px;bottom:10px;width:30px;height:30px;border-radius:50%;border:1px solid var(--ds-gold-dim);background:var(--ds-bg);color:var(--ds-gold);font:bold 11px sans-serif;cursor:pointer;opacity:.55;transition:.15s;-webkit-app-region:no-drag}
.ecp-fab:hover{opacity:1;box-shadow:0 0 10px rgba(200,170,110,.5)}
.ecp-adv{display:flex;flex-direction:column;gap:6px;padding-bottom:9px;border-bottom:1px solid var(--ds-border-soft)}
.ecp-dim{opacity:.4;pointer-events:none;transition:opacity .15s}
.ecp-pk{position:relative;display:flex;flex-direction:column;align-items:center;width:40px;padding:0;background:none;border:0;cursor:pointer;color:inherit;font:inherit}
.ecp-pk .ecp-ico{width:36px;height:36px}
.ecp-pk:hover .ecp-ico{transform:scale(1.08);border-color:var(--ds-gold)}
.ecp-pk.ecp-on .ecp-ico{border:2px solid var(--ds-gold);box-shadow:0 0 8px rgba(200,170,110,.45)}
.ecp-badge.ecp-bad{background:#2a2108;border-color:var(--ds-amber);color:var(--ds-amber)}
.ecp-reasons{display:flex;flex-wrap:wrap;gap:4px;min-height:22px}
.ecp-ch{display:inline-flex;align-items:center;gap:3px;padding:1px 6px 1px 4px;border:1px solid var(--ds-border-soft);border-radius:9px;font-size:11px;color:var(--ds-meta);background:var(--ds-surface);cursor:help}
.ecp-ch img{width:16px;height:16px;border-radius:50%;object-fit:cover}
.ecp-ch.ecp-pos{color:var(--ds-teal);border-color:#0b4a46}
.ecp-ch.ecp-neg{color:var(--ds-red);border-color:#6b2a35}
.ecp-foes{display:flex;flex-direction:column;gap:5px}
.ecp-foe{display:flex;flex-direction:column;align-items:center;gap:2px}
.ecp-rb{min-width:22px;height:15px;padding:0 3px;box-sizing:border-box;background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:8px;color:var(--ds-mute-2);font:bold 10px/13px sans-serif;cursor:pointer;transition:.12s}
.ecp-rb:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecp-rb.ecp-src-manual{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-rb.ecp-src-position{border-color:var(--ds-mute-2);color:var(--ds-text)}
.ecp-rb.ecp-src-auto{border-style:dashed;color:var(--ds-meta)}
.ecp-rolepick{gap:4px;padding:3px 4px;background:var(--ds-surface);border:1px solid var(--ds-border-soft);border-radius:6px}
.ecp-rp{min-width:26px;height:20px;padding:0 4px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;background:var(--ds-surface-2);border:1px solid var(--ds-border);border-radius:4px;color:var(--ds-meta);font:bold 10px/1 sans-serif;cursor:pointer}
.ecp-rp:hover{border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ecp-rp.ecp-on{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-flt{display:flex;flex-direction:column;gap:5px}
.ecp-fbtn{position:relative;display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:var(--ds-surface-2);border:1px solid var(--ds-border);border-radius:10px;color:var(--ds-meta);font:inherit;font-size:11px;cursor:pointer;transition:.12s}
.ecp-fbtn:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecp-fbtn[aria-pressed=true]{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-fbtn[aria-disabled=true]{opacity:.4;cursor:not-allowed}
.ecp-fbtn[data-inactive]{border-style:dashed}
.ecp-fgroup{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.ecp-fcap{width:54px;flex:none;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-mute)}
.ecp-fcount{display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;box-sizing:border-box;border-radius:7px;background:var(--ds-gold);color:#1a1408;font:bold 10px/14px sans-serif}
.ecp-sec-t{display:flex;align-items:center;gap:6px}
.ecp-sec-t .ecp-tag{margin-left:0}
.ecp.ecp-docked{z-index:2147483200;width:340px;animation:ecp-dock .16s ease-out;box-shadow:0 10px 30px rgba(0,0,0,.85),0 0 0 1px var(--ds-bg)}
.ecp.ecp-docked .ecp-head{cursor:default}
.ecp.ecp-docked .ecp-body{max-height:var(--ecp-maxh,70vh)}
.ecp.ecp-docked.ecp-v-picks{border-top-color:var(--ds-gold)}.ecp.ecp-docked.ecp-v-build{border-bottom-color:var(--ds-gold)}
@keyframes ecp-dock{from{opacity:0;transform:translateY(var(--ecp-dy,6px)) scale(.98)}to{opacity:1;transform:none}}
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

function ensureStyle() {
  ensureTheme()
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
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
  if (!c?.championId) return 'Draftsage'
  const me = cat.champion(c.championId).name
  const rival = state.status === 'ready' ? state.data.meta.opponent : c.opponentChampionId
  const vs = rival ? ` vs ${cat.champion(rival).name}` : ''
  return `${me}${vs} · ${t('role.' + c.role)}`
}

// Cabecera: tu retrato ⚔ retrato del rival + rol (el texto completo queda en el tooltip).
function titleNode(state, cat) {
  const c = state.context
  if (!c?.championId) return h('div', { class: 'ecp-title', title: 'Draftsage' }, h('div', { class: 'ecp-por ecp-ph' }, '?'))
  const rival = state.status === 'ready' ? state.data.meta.opponent : c.opponentChampionId
  const roleName = t('role.' + c.role)
  return h('div', { class: 'ecp-title', title: titleOf(state, cat) },
    pic(cat.champion(c.championId), 'ecp-por'),
    rival && h('span', { class: 'ecp-vs' }, icon('swords', 14)),
    rival && pic(cat.champion(rival), 'ecp-por ecp-foe'),
    roleName !== 'role.' + c.role && h('span', { class: 'ecp-role' }, roleName))
}

// Rivales ya revelados. Clic en el retrato: elige con cuál se calcula el matchup (clic en el elegido a mano vuelve al automático).
// Debajo de cada retrato, su LÍNEA: dorada si la eligió el jugador, gris si la informa el cliente, discontinua si la dedujo el plugin («·» = aún
// sin línea). Un clic abre el selector de línea (Top/Jungla/Mid/ADC/Support); poner a un rival en TU línea lo convierte en tu rival del matchup.
function rivalsBlock(state, cat, actions, ui, roles) {
  const c = state.context
  const enemies = c?.enemies ?? []
  if (!enemies.length) return null
  const used = c.opponentChampionId ?? null // el pedido (aunque el matchup no tenga datos y se muestre la build general)
  const manual = c.enemyRoles ?? {}
  const byChampion = roles?.byChampion ?? {}
  const laneIndex = (lane) => LANES.indexOf(lane)
  const open = ui.roleOpen != null && enemies.some((e) => e.championId === ui.roleOpen) ? ui.roleOpen : null
  const cells = enemies.map((e) => {
    const info = cat.champion(e.championId)
    const on = e.championId === used
    const r = byChampion[e.championId] ?? null
    const tip = r ? t('er.tip.' + r.source, info.name, t('role.' + laneIndex(r.lane))) : t('er.tip.none', info.name)
    return h('div', { class: 'ecp-foe', 'data-foe': e.championId },
      h('button', {
        type: 'button', class: 'ecp-chip' + (on ? ' ecp-on' : ''), title: info.name + (on ? ' ' + t('panel.inUse') : ''),
        onclick: () => actions.pick(on && c.opponentSource === 'manual' ? null : e.championId),
      }, pic(info, 'ecp-ico')),
      h('button', {
        type: 'button', class: 'ecp-rb ecp-src-' + (r?.source ?? 'none'), 'data-role-of': e.championId, 'data-lane': r?.lane ?? '', 'data-source': r?.source ?? '',
        title: tip, onclick: () => actions.roleMenu(e.championId),
      }, r ? t('role.s.' + laneIndex(r.lane)) : '·'))
  })
  const picker = open == null ? null : h('div', { class: 'ecp-line ecp-rolepick', 'data-rolepick': open, title: t('er.pickFor', cat.champion(open).name) },
    LANES.map((lane, i) => h('button', {
      type: 'button', class: 'ecp-rp' + (byChampion[open]?.lane === lane ? ' ecp-on' : ''), 'data-lane': lane, title: t('role.' + i), onclick: () => actions.setRole(open, lane),
    }, t('role.s.' + i))),
    manual[open] ? h('button', { type: 'button', class: 'ecp-rp', 'data-act': 'role-reset', title: t('er.reset'), onclick: () => actions.setRole(open, null) }, icon('refresh', 11)) : null)
  return h('div', { class: 'ecp-foes', 'data-foes': '' },
    h('div', { class: 'ecp-line ecp-rivals', title: t('panel.rival') + ' · ' + t('er.title') }, h('span', { class: 'ecp-lead' }, icon('swords', 16)), cells),
    picker)
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
    m.regionSource === 'manual' && m.regions?.length > 0 && h('span', { class: 'ecp-tag ecp-gold', 'data-regions': m.regions.join(','), title: t('tag.regions', m.regions.map(regionCode).join(', ')) },
      m.regions.length <= 2 ? m.regions.map(regionCode).join(' ') : regionCode(m.regions[0]) + ' +' + (m.regions.length - 1)),
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

function readyBody(state, cat, actions, ui, flashKey, roles) {
  // En partida: ítems completos arriba, runas de solo lectura (sin alternativas) y nada de aplicar ni rivales.
  if (state.context?.phase === 'game') return [itemsBlock(state.data, cat, { game: true, live: ui.live }), runeSummary(state.data, cat, flashKey), tagsBlock(state)]
  return [
    runePage(state.data, cat, flashKey, actions, state),
    applyBlock(state, actions, ui),
    itemsBlock(state.data, cat),
    rivalsBlock(state, cat, actions, ui, roles),
    tagsBlock(state),
  ]
}

function bodyOf(state, cat, actions, ui, flashKey, roles) {
  switch (state.status) {
    // Antes de elegir campeón ya se pueden asignar las líneas de los rivales (alimentan al consejero de draft).
    case 'waiting': return [h('div', { class: 'ecp-center', title: t('panel.pick') }, h('span', { class: 'ecp-pulse' }, icon('target', 28))), ...skeleton(true), rivalsBlock(state, cat, actions, ui, roles)]
    // Mientras llega la nueva recomendación del mismo campeón se sigue viendo la anterior, atenuada y sin botones activos.
    case 'loading': return state.stale ? [h('div', { class: 'ecp-stale' }, readyBody({ ...state, status: 'ready', data: state.stale }, cat, actions, ui, flashKey, roles))] : [...skeleton(), rivalsBlock(state, cat, actions, ui, roles)]
    case 'needs-login': return [h('div', { class: 'ecp-center' }, icon('user', 26), h('button', { class: 'ecp-btn', type: 'button', title: t('panel.login'), onclick: actions.login }, icon('user', 14), t('panel.enter')))]
    case 'error': {
      const auth = state.reason === 'auth'
      return [
        h('div', { class: 'ecp-center' }, h('span', { style: 'color:var(--ds-amber)' }, icon('warn', 26)), known('err.', state.reason),
          h('button', { class: 'ecp-btn', type: 'button', title: auth ? t('panel.login') : t('panel.retry'), onclick: auth ? actions.login : actions.retry }, icon(auth ? 'user' : 'refresh', 15))),
        rivalsBlock(state, cat, actions, ui, roles),
      ]
    }
    case 'ready': return readyBody(state, cat, actions, ui, flashKey, roles)
    default: return []
  }
}

// ---- Picks sugeridos: lista de MATCHUP (LoLalytics) + lista de DRAFT (iTero) + filtros ----
const LANE_ROLE = { TOP: 0, JUNGLE: 1, MIDDLE: 2, BOTTOM: 3, UTILITY: 4 }
const laneName = (l) => t('role.' + LANE_ROLE[l])
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

// Tu maestría con ese campeón (si la activaste), para el tooltip.
const masteryTip = (mastery, cid) => { const pts = mastery?.pointsOf(cid); return pts == null ? '' : ' — ' + t('adv.mastery', pts.toLocaleString(getLang())) }

export function pickTip(p, info, meta, cat, mastery) {
  const parts = [t('adv.pickTip', info.name, signed(p.score), p.games.toLocaleString(getLang()))]
  if (p.matchup && meta.rival) parts.push(t('adv.vs', cat.champion(meta.rival).name, p.matchup.wr.toFixed(1), p.matchup.edge != null ? signed(p.matchup.edge) : '–', p.matchup.n))
  if (p.agree) parts.push(t('adv.' + p.agree))
  return parts.join(' — ') + masteryTip(mastery, p.championId)
}

// Lista de DRAFT (iTero). null si no hay nada que enseñar (apagado, sin línea, ARAM…). Antes de la primera respuesta, esqueletos.
function advisorBlock(adv, cat, ui, actions, filters, mastery) {
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
  const picks = filters ? filters.draftPicks() : d.picks
  const sel = picks.find((p) => p.championId === ui.advSel) ?? picks[0]
  const mst = mastery?.getState()
  const tags = h('div', { class: 'ecp-tags' },
    h('span', { class: 'ecp-tag ecp-gold', 'data-source': 'itero', title: t('adv.tagTip') }, t('adv.tag')),
    m.contrasted && h('span', { class: 'ecp-tag', 'data-contrast': '', title: t('adv.tagLola') }, 'LoLalytics'),
    m.mastery && h('span', { class: 'ecp-tag ecp-gold', 'data-mastery': 'on', title: t('adv.masteryOn') }, icon('user', 11)),
    !m.mastery && mst?.status === 'error' && h('span', { class: 'ecp-tag ecp-warn', 'data-mastery': 'error', title: t('adv.masteryErr', known('mastery.err.', mst.reason)) }, icon('user', 11), icon('warn', 11)),
    m.unrecognized?.length ? h('span', { class: 'ecp-tag ecp-warn', 'data-warn': 'names', title: t('adv.unrecognized') }, icon('warn', 11)) : null,
    m.sideKnown ? null : h('span', { class: 'ecp-tag ecp-warn', 'data-warn': 'side', title: t('adv.sideAssumed') }, icon('warn', 11)))
  const cell = (p) => {
    const info = cat.champion(p.championId)
    return h('button', {
      type: 'button', class: 'ecp-pk' + (p.championId === sel?.championId ? ' ecp-on' : ''), 'data-pick': p.championId, 'data-agree': p.agree, title: pickTip(p, info, m, cat, mastery),
      onclick: () => actions.advSelect(p.championId),
    }, pic(info, 'ecp-ico'),
    p.agree ? h('span', { class: 'ecp-badge' + (p.agree === 'conflict' ? ' ecp-bad' : '') }, icon(p.agree === 'agree' ? 'check' : 'warn', 9)) : null,
    h('div', { class: 'ecp-w ' + (p.score >= 0 ? 'ecp-pos' : 'ecp-neg') }, signed(p.score)))
  }
  return h('div', { class: 'ecp-adv' + (adv.status === 'loading' ? ' ecp-dim' : ''), 'data-advisor': adv.status },
    picks.length
      ? [line(h('span', { class: 'ecp-lead', title: t('adv.tagTip') }, icon('spark', 16)), ...picks.map(cell)),
        h('div', { class: 'ecp-reasons', 'data-reasons': sel.championId }, sel.chips.map((c) => reasonChip(c, m, cat)))]
      : h('div', { class: 'ecp-msg', style: 'color:var(--ds-meta)', 'data-advisor-empty': '' }, t('adv.none')),
    tags)
}

// Lista de MATCHUP (LoLalytics, sin cuenta): los campeones con mejor win rate contra el rival de tu línea. Sin rival conocido: una pista con tooltip.
function matchupBlock(ov, cat, filters, mastery) {
  const d = ov?.data
  if (!d) return null
  if (!d.rival) {
    return h('div', { class: 'ecp-adv ecp-mu', 'data-matchup': 'norival' },
      line(h('span', { class: 'ecp-lead ecp-mute', title: t('mu.noRival') }, icon('swords', 16)), h('span', { class: 'ecp-msg', style: 'color:var(--ds-mute)' }, t('mu.noRivalShort'))))
  }
  const picks = filters ? filters.matchupPicks() : d.counters.map((c) => ({ cid: c.cid, wr: c.wr, edge: c.edge, n: c.n, counter: null }))
  const rivalName = cat.champion(d.rival).name
  const cell = (c) => {
    const info = cat.champion(c.cid)
    return h('div', { class: 'ecp-pk', 'data-mu-pick': c.cid, title: t('mu.pickTip', info.name, c.wr.toFixed(1), rivalName, c.edge != null ? signed(c.edge) : '–', c.n) + masteryTip(mastery, c.cid) },
      pic(info, 'ecp-ico'),
      h('div', { class: 'ecp-w ' + (c.edge == null || c.edge >= 0 ? 'ecp-pos' : 'ecp-neg') }, c.wr.toFixed(0) + '%'),
      // Ventaja sobre su media en la línea (spec §2.1): un % alto con ventaja ~0 es fuerza general, no un counter.
      c.edge != null && h('div', { class: 'ecp-w', 'data-edge': c.edge, style: 'color:var(--ds-meta)' }, signed(c.edge)))
  }
  return h('div', { class: 'ecp-adv ecp-mu' + (ov.status === 'loading' ? ' ecp-dim' : ''), 'data-matchup': String(d.rival), title: t('mu.tip', rivalName) },
    picks.length
      ? line(h('span', { class: 'ecp-lead', title: t('mu.tip', rivalName) }, icon('swords', 16)), ...picks.map(cell))
      : h('div', { class: 'ecp-msg', style: 'color:var(--ds-meta)', 'data-matchup-empty': '' }, icon('swords', 13), t('mu.none')),
    h('div', { class: 'ecp-tags' }, h('span', { class: 'ecp-tag ecp-gold', 'data-source': 'lolalytics-mu', title: t('mu.tagTip', rivalName) }, t('mu.tag')),
      d.vsReason ? h('span', { class: 'ecp-tag ecp-warn', title: t('mu.vsReason') }, icon('warn', 11)) : null))
}

// Barra de filtros: un botón con el nº de filtros activos y, desplegada, un grupo por filtro. Los filtros sin fuente de datos se ven deshabilitados.
const FILTER_GROUPS = [
  { key: 'mastery', steps: MASTERY_STEPS, off: 'flt.off.mastery', src: 'mastery' },
  { key: 'matchup', steps: MATCHUP_STEPS, off: 'flt.off.matchup', src: 'matchup' },
  { key: 'meta', steps: META_STEPS, off: 'flt.off.meta', src: 'meta' },
  { key: 'phase', steps: PHASE_STEPS, off: 'flt.off.itero', src: 'itero' },
  { key: 'damage', steps: DAMAGE_STEPS, off: 'flt.off.itero', src: 'itero' },
]

function filtersBlock(filters, ui, actions) {
  if (!filters) return null
  const f = filters.get()
  const avail = filters.availability()
  const n = filters.activeCount()
  const head = line(
    h('button', { type: 'button', class: 'ecp-fbtn', 'data-act': 'filters-toggle', 'aria-pressed': String(!!ui.filtersOpen), title: n ? t('flt.active', n) : t('flt.title'), onclick: actions.filtersToggle },
      icon('target', 12), t('flt.btn'), n > 0 && h('span', { class: 'ecp-fcount', 'data-count': n }, n)),
    n > 0 && h('button', { type: 'button', class: 'ecp-fbtn', 'data-act': 'filters-reset', title: t('flt.reset'), onclick: actions.filtersReset }, icon('close', 11)))
  if (!ui.filtersOpen) return h('div', { class: 'ecp-flt', 'data-filters': 'closed' }, head)
  const btn = (key, value, label, pressed, disabled, tip) => h('button', {
    type: 'button', class: 'ecp-fbtn', 'data-flt': key, 'data-value': value, 'aria-pressed': String(pressed), 'aria-disabled': disabled ? 'true' : null,
    'data-inactive': pressed && disabled ? '' : null, title: tip, onclick: () => actions.filterSet(key, value, disabled),
  }, label)
  const classes = h('div', { class: 'ecp-fgroup', 'data-group': 'classes' }, h('span', { class: 'ecp-fcap' }, t('flt.class')),
    CLASSES.map((c) => btn('classes', c, t('flt.class.' + c), f.classes.includes(c), false, t('flt.class.' + c))))
  const groups = FILTER_GROUPS.map((g) => {
    const ok = evaluable(g.key, avail)
    return h('div', { class: 'ecp-fgroup', 'data-group': g.key }, h('span', { class: 'ecp-fcap', title: ok ? '' : t(g.off) }, t('flt.' + g.key)),
      g.steps.map((v) => btn(g.key, v, v === 'any' ? t('flt.any') : t('flt.' + g.key + '.' + v), f[g.key] === v, !ok && v !== 'any',
        !ok && v !== 'any' ? t(g.off) : g.key === 'mastery' && v !== 'any' ? t('flt.mastery.tip', MASTERY_POINTS[v].toLocaleString(getLang())) : t('flt.tip.' + v))))
  })
  return h('div', { class: 'ecp-flt', 'data-filters': 'open' }, head, classes, ...groups)
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
export async function mountPanel({ controller, catalog, applier, live, overlay, advisor, enemyRoles, filters, mastery, onEnableApply, onLogin, onMenu }) {
  await whenReady()
  ensureStyle()
  let lastHidden = null
  let dismissedKey = null // × pulsado: oculto mientras el campeón y el rival sean los mismos
  const keyOf = (st) => (st.context ? `${st.context.championId}|${st.context.opponentChampionId ?? 0}|${st.context.source ?? ''}|${st.context.phase ?? ''}` : null)
  let prefs = getPanelPrefs()
  // live: estado de application/live-game.js · advSel: pick del consejero con motivos a la vista · roleOpen: rival cuyo selector de línea está abierto · filtersOpen: barra de filtros desplegada
  const ui = { busy: false, kind: null, msg: null, applied: { runes: null, spells: null }, live: null, advSel: null, roleOpen: null, filtersOpen: prefs.filtersOpen === true }
  let uiKey = null // el aviso de error solo vale para la recomendación a la que se aplicó
  let locator = null // (cid) => boolean: localizar la ficha en la cuadrícula (lo pone native.js; sin él no hay botón «Localizar»)

  // Modo anclado: `on` = hay un Champion Select reconocido (lo decide native.js) · `view` = 'build' | 'picks' | null (cerrado) · `anchor` = elemento del que cuelga.
  const dock = { on: false, view: null, anchor: null, raf: 0, placed: '' }
  const listeners = new Set() // native.js se entera de cada repintado (estado de «aplicando» / «aplicado» del botón de la barra)

  const root = h('div', { class: 'ecp', style: 'display:none' })
  const fab = h('button', { class: 'ecp-fab', type: 'button', title: 'Draftsage (Ctrl+Shift+E)', onclick: () => reopen() || onMenu() }, 'DS')
  // El botón DS reabre el panel si se cerró con ×; si ya está visible, abre el menú.
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
    if (!probe.isConnected) document.body.append(probe)
  }

  // Posición del panel. Se limita a la ventana (si el cliente se hace más pequeño no queda fuera de la vista) y, sin posición guardada,
  // va arriba a la derecha. El arrastre en la franja superior del cliente (que mueve la ventana) se evita con `-webkit-app-region: no-drag` en el CSS.
  const place = () => {
    const maxX = Math.max(0, window.innerWidth - 60)
    const maxY = Math.max(0, window.innerHeight - 40)
    root.style.right = prefs.x == null ? '16px' : 'auto'
    root.style.left = prefs.x == null ? 'auto' : Math.min(Math.max(0, prefs.x), maxX) + 'px'
    root.style.top = Math.min(Math.max(0, prefs.y ?? 96), maxY) + 'px'
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
    // Línea de un rival: abrir/cerrar su selector y elegirla (null = volver a la automática).
    roleMenu: (cid) => { ui.roleOpen = ui.roleOpen === cid ? null : cid; render(controller.getState()) },
    setRole: (cid, lane) => { ui.roleOpen = null; controller.setEnemyRole(cid, lane); render(controller.getState()) },
    // Filtros de la selección. Un filtro sin fuente de datos no se puede activar (sí quitar).
    filtersToggle: () => { ui.filtersOpen = !ui.filtersOpen; prefs = setPanelPrefs({ filtersOpen: ui.filtersOpen }); render(controller.getState()) },
    filtersReset: () => filters?.reset(),
    // Recomendación principal: cambiar de perspectiva (auto / línea / equipo) y localizar una ficha.
    perspective: (p) => { prefs = setPanelPrefs({ perspective: p }); render(controller.getState()) },
    filterSet: (key, value, disabled) => {
      if (!filters || disabled) return
      if (key === 'classes') filters.toggleClass(value)
      else filters.set({ [key]: filters.get()[key] === value ? 'any' : value })
    },
  }

  // Estado de los botones de aplicar para lo que se ve ahora (lo usa también el botón de la barra de runas: giro → ✓).
  const applyStatus = (state) => {
    const d = state.status === 'ready' ? state.data : null
    const doneRunes = !!d && ui.applied.runes === runesKey(d)
    const doneSpells = !!d && d.spells.length === 2 && ui.applied.spells === spellsKey(d)
    const inChampSelect = state.context?.source === 'lcu'
    return { busy: ui.busy, kind: ui.kind, done: !!d && doneRunes && (doneSpells || d.spells.length !== 2 || !inChampSelect), failed: !!ui.msg }
  }

  // ---- Popover anclado ----
  // Con zoom/transformaciones en un ancestro, getBoundingClientRect() da píxeles visuales y `left/top` de un elemento fijo son píxeles de
  // diseño: la relación entre ambos se mide con el propio panel y se compensa.
  // La escala se mide con una sonda fija de 100 px (no con el panel: su animación de entrada también escala).
  const probe = h('div', { style: 'position:fixed;left:0;top:0;width:100px;height:1px;visibility:hidden;pointer-events:none' })
  const scaleOf = () => { const w = probe.isConnected ? probe.getBoundingClientRect().width : 0; return w > 0 ? w / 100 : 1 }
  const placeDocked = () => {
    const a = dock.anchor
    if (!a?.isConnected) return false
    const r = a.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return false
    const s = scaleOf() || 1
    const vw = window.innerWidth / s, vh = window.innerHeight / s
    const below = dock.view === 'picks' // «picks» baja desde la cabecera de la cuadrícula; «build» sube desde la barra inferior
    const left = Math.round(Math.min(Math.max(8, r.left / s), Math.max(8, vw - 340 - 8)))
    const avail = Math.max(160, Math.floor(below ? vh - r.bottom / s - 16 : r.top / s - 16))
    const edge = below ? Math.round(r.bottom / s + 8) : Math.round(vh - r.top / s + 8)
    const key = `${left}|${below}|${edge}|${avail}`
    if (key === dock.placed) return true // nada que escribir: evita recalcular estilos en cada fotograma
    dock.placed = key
    root.style.left = left + 'px'
    root.style.right = 'auto'
    root.style.top = below ? edge + 'px' : 'auto'
    root.style.bottom = below ? 'auto' : edge + 'px'
    root.style.setProperty('--ecp-maxh', Math.max(120, avail - 52) + 'px')
    root.style.setProperty('--ecp-dy', below ? '-6px' : '6px')
    return true
  }
  const followAnchor = () => {
    cancelAnimationFrame(dock.raf)
    const loop = () => { if (!dock.view) return; if (!placeDocked()) closeDock(); else dock.raf = requestAnimationFrame(loop) }
    dock.raf = requestAnimationFrame(loop)
  }
  // Cerrar al hacer clic fuera (salvo en el ancla o en otros botones de la integración, que gestionan su propio clic), con Esc o si el ancla desaparece.
  const onDocDown = (e) => {
    if (!dock.view || root.contains(e.target) || dock.anchor?.contains(e.target) || e.target.closest?.('.ecx, .ec-overlay')) return
    closeDock()
  }
  const onDocKey = (e) => { if (e.key === 'Escape' && dock.view) { closeDock(); e.stopPropagation() } }
  function closeDock(redraw = true) {
    if (!dock.view && !dock.anchor) return
    dock.view = null; dock.anchor = null; dock.placed = ''
    cancelAnimationFrame(dock.raf)
    document.removeEventListener('mousedown', onDocDown, true)
    document.removeEventListener('keydown', onDocKey, true)
    if (redraw) render(controller.getState())
  }
  function openDock(view, anchor) {
    if (!dock.on || !anchor) return false
    const switching = dock.view !== view
    dock.view = view; dock.anchor = anchor; dock.placed = ''
    document.removeEventListener('mousedown', onDocDown, true); document.removeEventListener('keydown', onDocKey, true)
    document.addEventListener('mousedown', onDocDown, true); document.addEventListener('keydown', onDocKey, true)
    if (switching) root.style.animation = 'none' // reinicia la animación de entrada al cambiar de vista
    render(controller.getState())
    if (switching) { void root.offsetWidth; root.style.animation = '' }
    followAnchor()
    return true
  }

  const render = (state) => { renderPanel(state); for (const fn of listeners) { try { fn() } catch (e) { log.warn('suscriptor del panel:', String(e)) } } }

  const renderPanel = (state) => {
    attach()
    if (state.status === 'idle') { dismissedKey = null; ui.roleOpen = null; if (dock.view) closeDock(false) }
    fab.style.display = dock.on ? 'none' : '' // con la interfaz integrada, el acceso al menú es el botón de la esquina del cliente
    const docked = dock.on && state.context?.phase !== 'game'
    const show = docked
      ? prefs.enabled && !!dock.view && state.status !== 'idle'
      : prefs.enabled && dismissedKey !== keyOf(state) && state.status !== 'idle'
    root.style.display = show ? 'block' : 'none'
    if (!show) {
      if (!docked && state.status !== 'idle' && state.status !== lastHidden) log.info('panel oculto', prefs.enabled ? '(cerrado con ×)' : '(desactivado: menú → «Panel»)')
      lastHidden = state.status
      return
    }
    lastHidden = null
    const view = docked ? dock.view : 'all'
    root.classList.toggle('ecp-game', state.context?.phase === 'game')
    root.classList.toggle('ecp-docked', docked)
    root.classList.toggle('ecp-v-picks', docked && view === 'picks')
    root.classList.toggle('ecp-v-build', docked && view === 'build')
    if (docked) placeDocked(); else { root.style.removeProperty('bottom'); root.style.removeProperty('--ecp-maxh'); dock.placed = ''; place() }
    const toggle = () => { prefs = setPanelPrefs({ collapsed: !prefs.collapsed }); render(controller.getState()) }
    const url = webUrl(state, catalog)
    const head = h('div', { class: 'ecp-head' },
      titleNode(state, catalog),
      state.context?.championId ? h('button', { class: 'ecp-x', type: 'button', 'data-act': 'web', title: t('panel.web'), disabled: url ? null : 'disabled', onclick: actions.web }, icon('link', 14)) : null,
      docked ? null : h('button', { class: 'ecp-x', type: 'button', title: prefs.collapsed ? t('panel.unfold') : t('panel.fold'), onclick: toggle }, icon('chevron', 15, prefs.collapsed ? '' : 'ecp-up')),
      h('button', {
        class: 'ecp-x', type: 'button', 'data-act': 'close', title: docked ? t('nat.close') : t('panel.close'),
        onclick: () => { if (docked) closeDock(); else { dismissedKey = keyOf(controller.getState()); render(controller.getState()) } },
      }, icon('close', 14)))
    if (!docked) enableDrag(head)
    if (state.status !== 'ready' || runesKey(state.data) !== uiKey) { ui.msg = null; uiKey = state.status === 'ready' ? runesKey(state.data) : null }
    ui.live = live?.getState() ?? null
    // Arriba, lo primero que se decide: filtros, picks de matchup (LoLalytics) y picks de draft (iTero). En partida no hay nada que elegir.
    const inGame = state.context?.phase === 'game'
    const picksTop = inGame || view === 'build' ? [] : [decisionBlock(), teamContextBlock({ cat: catalog, context: state.context, roles: enemyRoles?.getState() }), filtersBlock(filters, ui, actions), matchupBlock(overlay?.getState(), catalog, filters, mastery), advisorBlock(advisor?.getState(), catalog, ui, actions, filters, mastery)]
    // Vista «picks»: solo lo que ayuda a elegir campeón (filtros, listas y rivales). Vista «build»: runas, aplicar, ítems y rivales (cambian el matchup).
    const main = view === 'picks' ? [rivalsBlock(state, catalog, actions, ui, enemyRoles?.getState())] : bodyOf(state, catalog, actions, ui, applier.getSettings().flashKey, enemyRoles?.getState())
    const body = !docked && prefs.collapsed ? null : h('div', { class: 'ecp-body', 'data-view': view }, [...picksTop, ...main])
    root.replaceChildren(head, ...(body ? [body] : []))
  }

  // Nivel 1 (spec §4.2): recomendación principal y alternativas a partir de las dos listas ya filtradas (sin red: solo lo ya recibido).
  function decisionBlock() {
    if (!filters) return null
    const ov = overlay?.getState(), adv = advisor?.getState()
    const summary = buildDraftSummary({ lanePicks: filters.matchupPicks(), teamPicks: filters.draftPicks(), perspective: prefs.perspective, masteryOf: (cid) => mastery?.pointsOf(cid) ?? null })
    return draftSummaryBlock(summary, { cat: catalog, rival: ov?.data?.rival ? catalog.champion(ov.data.rival).name : null, meta: adv?.data?.meta ?? null },
      { perspective: actions.perspective, locate: locator })
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
  addEventListener('draftsage:prefs', onPrefs)
  const onShow = () => { dismissedKey = null; render(controller.getState()) }
  addEventListener('draftsage:show-panel', onShow)
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
  const offRoles = enemyRoles?.subscribe(() => render(controller.getState()))
  const offFlt = filters?.subscribe(() => render(controller.getState()))
  const offMst = mastery?.subscribe(() => render(controller.getState()))
  attach()

  return {
    destroy() {
      closeDock(false)
      off(); offLive?.(); offOv?.(); offAdv?.(); offRoles?.(); offFlt?.(); offMst?.(); clearInterval(guard); listeners.clear()
      removeEventListener('keydown', onKey); removeEventListener('draftsage:prefs', onPrefs); removeEventListener('draftsage:show-panel', onShow)
      root.remove(); fab.remove(); probe.remove()
    },
    // ---- Interfaz integrada (la usa presentation/native.js) ----
    /** Activa/desactiva el modo anclado. Al desactivarlo se cierra el popover y vuelve el panel flotante. */
    setDocked(on) { on = !!on; if (dock.on === on) return; dock.on = on; if (!on) closeDock(false); render(controller.getState()) },
    isDocked: () => dock.on,
    /** Abre la vista ('build' | 'picks') colgada de `anchor`; false si el modo anclado no está activo. */
    open: (view, anchor) => openDock(view, anchor),
    close: () => closeDock(),
    /** Abre la vista o, si ya está abierta con ese ancla, la cierra. */
    toggle(view, anchor) { if (dock.view === view && dock.anchor === anchor) { closeDock(); return false } return openDock(view, anchor) },
    view: () => dock.view,
    /** 'all' | 'runes' | 'spells': igual que el botón «Aplicar» del panel (pide aceptar el aviso la primera vez). */
    apply: (kind = 'all') => apply(kind),
    /** { busy, kind, done, failed } del botón de aplicar para lo que se ve ahora. */
    status: () => applyStatus(controller.getState()),
    /** native.js da la forma de localizar una ficha de la cuadrícula: (cid) => boolean. */
    setLocator(fn) { locator = typeof fn === 'function' ? fn : null; render(controller.getState()) },
    /** Se llama tras cada repintado del panel (aunque esté oculto). Devuelve la función para cancelar. */
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  }
}
