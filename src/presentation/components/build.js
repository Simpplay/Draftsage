// draftsage/src/presentation/components/build.js — página de runas y hechizos LEGIBLE (Fase 2 del rediseño, docs/UX-SPEC.md §7)
//
// Antes la página eran iconos con el nombre solo en el tooltip. Ahora:
//   · cada árbol tiene su cabecera (icono + nombre del árbol);
//   · la runa clave lleva su nombre y su descripción breve (la del cliente) a la vista;
//   · las 3 + 2 runas menores, los 3 fragmentos y los 2 hechizos muestran su nombre bajo el icono (y la tecla D/F en los hechizos);
//   · una etiqueta dice de dónde sale la página: recomendada / elegida por ti (con botón para volver a la recomendada) / fijada,
//     y si es específica del matchup o general (§7.4, §7.6);
//   · las otras runas clave llevan su % de uso a la vista y un pie que explica qué significa cada cifra y cómo se ordenan (§7.5).
// El WPA de cada runa sigue debajo del nombre (sin unidad: su escala está sin aclarar, ver docs/HANDOFF.md). Los datos llegan preparados
// (Recommendation de application/recommendation.js y el catálogo); aquí no se calcula ni se pide nada.

import { h } from '../ui.js'
import { icon } from '../icons.js'
import { fmtN, fmtWpa, pic, statTip } from './common.js'
import { TREES } from '../../domain/runes.js'
import { buildSpellPair } from '../../domain/configuration.js'
import { isLowData } from '../../domain/confidence.js'
import { t } from '../../shared/i18n.js'

const STYLE_ID = 'draftsage-build-style'
const CSS = `
.ecr{display:flex;flex-direction:column;gap:6px}
.ecr-tree{display:flex;flex-direction:column;gap:5px}
.ecr-th{display:flex;align-items:center;gap:6px;min-height:22px}
.ecr-tn{font-size:var(--ds-fs-section);font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-gold)}
.ecr-th .ecp-tree{width:20px;height:20px}
.ecr-key{display:flex;align-items:center;gap:8px}
.ecr-key .ecp-it{width:48px;flex:none}
.ecr-kt{display:flex;flex-direction:column;min-width:0}
.ecr-kn{font-size:var(--ds-fs-name);font-weight:bold;color:var(--ds-text-hi);line-height:1.2}
.ecr-kd{font-size:11px;color:var(--ds-meta);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ecr-grid{display:flex;gap:4px}
.ecr-grid .ecp-it{flex:1 1 0;width:auto;min-width:0}
.ecr-n{display:block;max-width:100%;margin-top:2px;font-size:var(--ds-fs-meta);line-height:12px;color:var(--ds-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ecr-shards .ecp-ico{width:24px;height:24px}
.ecr-spells .ecp-it{flex:0 0 76px}
.ecr-cap{font-size:var(--ds-fs-meta);color:var(--ds-mute);line-height:1.3}
.ecr-st{display:inline-flex;align-items:center;gap:4px;margin-left:auto;padding:1px 7px;border:1px solid var(--ds-border-soft);border-radius:9px;font-size:var(--ds-fs-meta);color:var(--ds-meta);background:var(--ds-surface);white-space:nowrap}
.ecr-st.ecr-custom{border-color:var(--ds-gold-dim);color:var(--ds-gold)}
.ecr-st.ecr-pinned{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecr-st button{display:inline-flex;align-items:center;gap:3px;padding:0 0 0 4px;margin:0;background:none;border:0;border-left:1px solid var(--ds-gold-dim);color:inherit;font:inherit;cursor:pointer}
.ecr-st button:hover{color:var(--ds-text-hi)}
.ecr-scope{color:var(--ds-mute)}
.ecr-sum{display:flex;flex-direction:column;gap:3px;font-size:11px;line-height:1.35;color:var(--ds-text)}
.ecr-sum .ecp-line{gap:6px;align-items:flex-start}
.ecr-sum .ecp-ico{width:22px;height:22px;flex:none}
.ecr-sum b{color:var(--ds-text-hi)}
.ecr-sum .ecr-k{color:var(--ds-gold)}
`

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

// Nombre de un árbol: el del cliente si lo trae; si no, el de domain/runes.js.
const treeName = (id, cat) => { const info = cat.rune(id); return info.name !== '#' + id ? info.name : TREES[id]?.name ?? '' }

function treeIcon(id, cat) {
  const info = cat.rune(id)
  const name = treeName(id, cat)
  return info.icon ? h('img', { class: 'ecp-tree', src: info.icon, alt: name, title: name, draggable: 'false' }) : h('div', { class: 'ecp-tree ecp-ph', title: name }, '')
}

// Texto accesible de una opción: nombre, descripción breve y cifras.
const describe = (info, stat) => [statTip(info.name, stat), info.desc].filter(Boolean).join(' — ')

/**
 * Una opción (runa, fragmento o hechizo): icono + nombre visible + WPA (o win rate si la fuente no da WPA).
 * Conserva la clase `ecp-it` (la usan las pruebas y native.js). `key` = tecla del hechizo.
 */
function option(info, stat, { cls = '', key = null, name = true } = {}) {
  const hasWpa = stat && stat.wpa != null
  const label = describe(info, stat)
  return h('div', { class: 'ecp-it', role: 'group', 'aria-label': label },
    pic(info, 'ecp-ico ' + cls + (isLowData(stat) ? ' ecp-low' : ''), label),
    key && h('span', { class: 'ecp-keycap', 'aria-hidden': 'true' }, key),
    name && h('span', { class: 'ecr-n' }, info.name),
    hasWpa && h('div', { class: 'ecp-w ' + (stat.wpa >= 0 ? 'ecp-pos' : 'ecp-neg') }, fmtWpa(stat.wpa)),
    !hasWpa && stat && Number.isFinite(stat.wr) && h('div', { class: 'ecp-w ecp-wr' }, Math.round(stat.wr) + '%'))
}

// De dónde sale la página que se ve: fijada > elegida por ti > recomendada; y si es del matchup o general.
function originTag(d, state, cat, actions) {
  const custom = !!(d.custom?.keystone || d.custom?.spells)
  const kind = state?.pinned ? 'pinned' : custom ? 'custom' : 'auto'
  const rival = d.meta?.matchup && d.meta?.opponent ? cat.champion(d.meta.opponent).name : null
  const reset = kind === 'custom' && actions
    ? h('button', { type: 'button', 'data-act': 'build-reset', title: t('build.resetTip'), onclick: () => { actions.keystone(null); if (d.custom?.spells) actions.spells(null) } }, icon('refresh', 11), t('build.reset'))
    : null
  return h('span', { class: 'ecr-st' + (kind === 'auto' ? '' : ' ecr-' + kind), 'data-origin': kind, title: t('build.origin.' + kind + 'Tip') },
    t('build.origin.' + kind),
    h('span', { class: 'ecr-scope', 'data-scope': rival ? 'matchup' : 'general', title: rival ? t('build.scope.matchupTip', rival) : t('build.scope.generalTip') },
      '· ' + (rival ? t('build.scope.matchup', rival) : t('build.scope.general'))),
    reset)
}

// Otras runas clave: chips con su % de uso. La elegida lleva marco; la recomendada, un punto. Pie con la explicación de las cifras.
function keystoneAlts(d, cat, actions) {
  const list = d.alternatives?.keystones ?? []
  if (list.length < 2) return null
  const total = list.reduce((s, k) => s + (k.occurrence ?? 0), 0)
  return [
    h('div', { class: 'ecp-line ecp-alts', 'data-alts': 'keystone', role: 'group', 'aria-label': t('alt.keystones'), title: t('alt.keystones') },
      h('span', { class: 'ecp-lead ecp-mute' }, icon('swap', 14)),
      list.map((k) => {
        const on = k.rune === d.keystone.rune
        const auto = k.rune === d.alternatives.autoKeystone
        const info = cat.rune(k.rune)
        return h('button', {
          type: 'button', class: 'ecp-alt' + (on ? ' ecp-on' : ''), 'data-rune': k.rune, 'data-auto': auto ? '' : null, 'aria-pressed': String(on),
          'aria-label': statTip(info.name, k) + (auto ? t('alt.auto') : ''),
          title: statTip(info.name, k) + (auto ? t('alt.auto') : ''), onclick: () => { if (!on) actions.keystone(auto ? null : k.rune) },
        }, pic(info, 'ecp-ico ecp-xs' + (isLowData(k) ? ' ecp-low' : '')), h('span', { class: 'ecp-w' }, Math.round(k.share * 100) + '%'))
      })),
    h('div', { class: 'ecr-cap', 'data-legend': 'keystones' }, t('build.altLegend', fmtN(total))),
  ]
}

// Sustitutos del hechizo intercambiable y, si ya cambiaste algo, volver a la recomendación.
function spellAlts(d, cat, actions) {
  const opts = d.alternatives?.spells ?? []
  if (!opts.length && !d.custom?.spells) return null
  return h('div', { class: 'ecp-line ecp-spalts', 'data-alts': 'spells', role: 'group', 'aria-label': t('alt.spells'), title: t('alt.spells') },
    d.custom?.spells && h('button', { type: 'button', class: 'ecp-alt', 'data-act': 'spells-reset', 'aria-label': t('alt.reset'), title: t('alt.reset'), onclick: () => actions.spells(null) }, icon('refresh', 14)),
    opts.map((s) => h('button', {
      type: 'button', class: 'ecp-alt', 'data-spell': s.spell, 'aria-label': statTip(cat.spell(s.spell).name, s), title: statTip(cat.spell(s.spell).name, s), onclick: () => actions.spells(s.pair),
    }, pic(cat.spell(s.spell), 'ecp-ico ecp-xs ecp-sq' + (isLowData(s) ? ' ecp-low' : '')))))
}

const section = (key, head, ...body) => h('div', { class: 'ecr-tree', 'data-section': key }, h('div', { class: 'ecr-th' }, head), ...body)

/**
 * Página completa: árbol principal (runa clave + 3), alternativas de runa clave, árbol secundario (2), fragmentos (3) y hechizos (2).
 * `actions` = null en partida (solo lectura). `state` = estado del controlador (para «fijada»).
 * @returns {HTMLElement}
 */
export function runePage(d, cat, flashKey, actions, state = null) {
  ensureStyle()
  const r = (id) => cat.rune(id)
  const pair = buildSpellPair(d, flashKey)
  const keys = pair.ok ? ['D', 'F'] : [null, null]
  const spells = pair.ok ? [pair.spell1Id, pair.spell2Id].map((id) => d.spells.find((s) => s.spell === id)) : d.spells
  const ks = r(d.keystone.rune)
  const minors = d.primaryPicks.filter(Boolean)
  return h('div', { class: 'ecr', 'data-runes': '' },
    section('primary', [treeIcon(d.primaryTree, cat), h('span', { class: 'ecr-tn' }, treeName(d.primaryTree, cat)), originTag(d, state, cat, actions)],
      h('div', { class: 'ecr-key' }, option(ks, d.keystone, { cls: 'ecp-big', name: false }),
        h('div', { class: 'ecr-kt' }, h('span', { class: 'ecr-kn', 'data-keystone-name': '' }, ks.name), ks.desc ? h('span', { class: 'ecr-kd' }, ks.desc) : null)),
      minors.length ? h('div', { class: 'ecr-grid', 'data-row': 'primary' }, minors.map((p) => option(r(p.rune), p))) : null,
      actions ? keystoneAlts(d, cat, actions) : null),
    d.secondaryTree
      ? section('secondary', [treeIcon(d.secondaryTree, cat), h('span', { class: 'ecr-tn' }, treeName(d.secondaryTree, cat))],
          h('div', { class: 'ecr-grid', 'data-row': 'secondary' }, d.secondaryPicks.map((p) => option(r(p.rune), p))))
      : null,
    d.shards.length
      ? section('shards', [h('span', { class: 'ecp-lead ecp-mute' }, icon('spark', 14)), h('span', { class: 'ecr-tn' }, t('build.shards'))],
          h('div', { class: 'ecr-grid ecr-shards', 'data-row': 'shards' }, d.shards.map((id) => option(r(id), null, { cls: 'ecp-sm' }))))
      : null,
    d.spells.length
      ? section('spells', [h('span', { class: 'ecp-lead ecp-mute' }, icon('bolt', 14)), h('span', { class: 'ecr-tn' }, t('build.spells'))],
          h('div', { class: 'ecp-line ecr-grid ecr-spells', 'data-row': 'spells' }, spells.map((s, i) => option(cat.spell(s.spell), s, { cls: 'ecp-sq', key: keys[i] })),
            h('div', { class: 'ecp-grow' }), actions ? spellAlts(d, cat, actions) : null))
      : null)
}

/**
 * Resumen de la página en tres líneas de texto (modo partida: las runas ya están puestas y lo que importa son los ítems).
 * Mantiene los nombres a la vista (spec §18.8) ocupando una fracción del alto de la página completa.
 */
export function runeSummary(d, cat, flashKey) {
  ensureStyle()
  const r = (id) => cat.rune(id)
  const names = (ids) => ids.map((id) => r(id).name).join(' · ')
  const pair = buildSpellPair(d, flashKey)
  const spells = pair.ok ? [pair.spell1Id, pair.spell2Id] : d.spells.map((s) => s.spell)
  const keys = pair.ok ? ['D', 'F'] : ['', '']
  const ks = r(d.keystone.rune)
  return h('div', { class: 'ecr ecr-sum', 'data-runes': 'summary' },
    h('div', { class: 'ecp-line' }, pic(ks, 'ecp-ico', describe(ks, d.keystone)),
      h('span', null, h('b', null, ks.name), ' · ', names(d.primaryPicks.filter(Boolean).map((p) => p.rune)))),
    d.secondaryTree ? h('div', { class: 'ecp-line' }, treeIcon(d.secondaryTree, cat),
      h('span', null, h('b', null, treeName(d.secondaryTree, cat)), ': ', names(d.secondaryPicks.map((p) => p.rune)))) : null,
    h('div', { class: 'ecp-line' }, h('span', { class: 'ecp-lead ecp-mute' }, icon('spark', 14)),
      h('span', null, names(d.shards), spells.length ? ' — ' : '', ...spells.flatMap((id, i) => [i ? ' · ' : '', keys[i] ? h('span', { class: 'ecr-k' }, keys[i] + ' ') : '', cat.spell(id).name]))))
}
