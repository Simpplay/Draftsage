// draftsage/src/presentation/components/draft.js — recomendación principal + alternativas (Fase 3 del rediseño, docs/UX-SPEC.md §4)
//
// Nivel 1 de la spec (decisión en 1–2 s): arriba de la vista «picks», una tarjeta con la recomendación principal (retrato, nombre, confianza,
// hasta 3 motivos y la principal desventaja) y 2–3 alternativas, cada una con su PORQUÉ («mejor matchup», «mejor encaje con el equipo»,
// «tu campeón»…). Cada motivo lleva su signo (+ / − / ·, no solo color) y de dónde sale: «dato» (estadística observada), «modelo»
// (predicción de iTero) o «regla» (heurística de Draftsage). «Localizar» desplaza la cuadrícula hasta la ficha y la resalta; nunca la elige.
// Las listas completas (MATCHUP y DRAFT) siguen debajo como nivel 2. Los datos llegan preparados por domain/draft-summary.js.

import { h } from '../ui.js'
import { icon } from '../icons.js'
import { fmtN, pic, signed } from './common.js'
import { PERSPECTIVES } from '../../domain/draft-summary.js'
import { teamSlots } from '../../domain/team-context.js'
import { getLang, t } from '../../shared/i18n.js'

const STYLE_ID = 'draftsage-draft-style'
const CSS = `
.ecd{display:flex;flex-direction:column;gap:7px;padding-bottom:9px;border-bottom:1px solid var(--ds-border-soft)}
.ecd-top{display:flex;align-items:center;gap:6px}
.ecd-cap{font-size:var(--ds-fs-section);font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-gold)}
.ecd-seg{display:flex;border:1px solid var(--ds-border);border-radius:10px;overflow:hidden}
.ecd-seg button{flex:1}
.ecd-seg button{padding:1px 8px;white-space:nowrap;background:var(--ds-surface-2);border:0;border-left:1px solid var(--ds-border);color:var(--ds-meta);font:inherit;font-size:var(--ds-fs-meta);cursor:pointer}
.ecd-seg button:first-child{border-left:0}
.ecd-seg button[aria-pressed=true]{background:var(--ds-gold-bg);color:var(--ds-gold-hi)}
.ecd-seg button:disabled{opacity:.4;cursor:not-allowed}
.ecd-main{display:flex;flex-direction:column;gap:5px;padding:7px;border:1px solid var(--ds-gold-dim);border-radius:6px;background:linear-gradient(var(--ds-gold-bg),var(--ds-bg))}
.ecd-who{display:flex;align-items:center;gap:8px}
.ecd-who .ecp-ico{width:42px;height:42px;border:2px solid var(--ds-gold)}
.ecd-name{display:flex;flex-direction:column;min-width:0;flex:1}
.ecd-name b{font-size:var(--ds-fs-name);color:var(--ds-text-hi);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ecd-sub{font-size:var(--ds-fs-meta);color:var(--ds-meta)}
.ecd-rs{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.ecd-r{display:flex;align-items:baseline;gap:5px;font-size:12px;line-height:1.35;color:var(--ds-text)}
.ecd-r i{font-style:normal;font-weight:bold;width:10px;flex:none;text-align:center}
.ecd-r.ecd-pos i{color:var(--ds-teal)}.ecd-r.ecd-neg i{color:var(--ds-red)}.ecd-r.ecd-neu i{color:var(--ds-meta)}
.ecd-r .ecd-rt{flex:1;min-width:0}
.ecd-ev{flex:none;padding:0 5px;border:1px solid var(--ds-border-soft);border-radius:7px;font-size:var(--ds-fs-meta);line-height:13px;color:var(--ds-mute)}
.ecd-ev[data-ev=model]{border-style:dashed}
.ecd-ev[data-ev=heuristic]{border-style:dotted}
.ecd-conf{display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border:1px solid var(--ds-border-soft);border-radius:8px;font-size:var(--ds-fs-meta);color:var(--ds-meta);white-space:nowrap}
.ecd-conf[data-level=low]{border-color:var(--ds-amber);color:var(--ds-amber)}
.ecd-conf[data-level=model]{border-style:dashed}
.ecd-loc{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:3px 10px;background:var(--ds-surface-2);border:1px solid var(--ds-gold-dim);border-radius:4px;color:var(--ds-text);font:inherit;font-size:12px;cursor:pointer}
.ecd-loc:hover{border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ecd-loc.ecd-miss{border-color:var(--ds-amber);color:var(--ds-amber)}
.ecd-loc.ecd-sq{padding:3px 6px}
.ecd-alts{display:flex;flex-direction:column;gap:4px}
.ecd-alt{display:flex;align-items:center;gap:7px}
.ecd-alt .ecp-ico{width:30px;height:30px}
.ecd-alt .ecd-name b{font-size:12px}
.ecd-why{font-size:var(--ds-fs-meta);color:var(--ds-gold);letter-spacing:.02em}
.ect{display:flex;flex-direction:column;gap:3px}
.ect-row{display:flex;align-items:center;gap:6px}
.ect-lab{width:64px;flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:var(--ds-fs-meta);letter-spacing:.06em;text-transform:uppercase;color:var(--ds-mute)}
.ect-row.ect-foe .ect-lab{color:var(--ds-rival)}
.ect-slot{display:flex;flex-direction:column;align-items:center;width:30px}
.ect-slot .ecp-ico,.ect-slot .ect-void{width:24px;height:24px;border-radius:50%;box-sizing:border-box}
.ect-void{border:1px dashed var(--ds-border);background:var(--ds-bg)}
.ect-slot b{font:bold 10px/12px sans-serif;color:var(--ds-mute-2)}
.ect-slot[data-status=self] .ecp-ico{border:2px solid var(--ds-gold)}
.ect-slot[data-status=manual] .ecp-ico{border:2px solid var(--ds-gold-dim)}
.ect-slot[data-status=inferred] .ecp-ico{border:1px dashed var(--ds-meta);opacity:.85}
.ect-slot[data-status=inferred] b::after{content:'?'}
.ect-row.ect-foe .ect-slot[data-status=confirmed] .ecp-ico{border-color:var(--ds-rival)}
.ect-more{font-size:var(--ds-fs-meta);color:var(--ds-meta)}
`

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

const LANE_ROLE = { TOP: 0, JUNGLE: 1, MIDDLE: 2, BOTTOM: 3, UTILITY: 4 }
const pct = (v) => (v >= 0 ? '+' : '') + v

// Quién está en una línea (aliado o rival revelado, según iTero) o, si no se sabe, el nombre de la línea.
function whoAt(lane, side, ctx) {
  const cid = ctx.meta?.[side]?.[lane]
  return cid ? ctx.cat.champion(cid).name : t('role.' + LANE_ROLE[lane])
}

/** Texto de un motivo (el dominio no tiene idioma). */
export function reasonText(r, ctx) {
  switch (r.type) {
    case 'lane-matchup': return r.edge == null ? t('ds.r.laneNoBase', r.wr.toFixed(1), ctx.rival) : t('ds.r.lane', r.wr.toFixed(1), ctx.rival, signed(r.edge))
    case 'general-strength': return t('ds.r.general')
    case 'team-fit': return t(r.polarity === 'negative' ? 'ds.r.teamBad' : 'ds.r.team', signed(r.score))
    case 'ally-synergy': return t('ds.r.syn', whoAt(r.lane, 'allies', ctx), pct(r.value))
    case 'enemy-counter': return t('ds.r.ctr', whoAt(r.lane, 'enemies', ctx), pct(r.value))
    case 'enemy-weakness': return t('ds.r.weak', whoAt(r.lane, 'enemies', ctx), pct(r.value))
    case 'scaling': return t('ds.r.scale', t('adv.phase.' + r.phase))
    case 'damage': return t('adv.dmg.' + r.value)
    case 'sources-disagree': return t('ds.r.disagree')
    case 'both-sources': return t('ds.r.agree')
    case 'comfort': return t('ds.r.comfort', r.points.toLocaleString(getLang()))
    default: return r.type
  }
}

const SIGN = { positive: '+', negative: '−', neutral: '·' }
const CLS = { positive: 'ecd-pos', negative: 'ecd-neg', neutral: 'ecd-neu' }

const reasonItem = (r, ctx) => h('li', { class: 'ecd-r ' + CLS[r.polarity], 'data-reason': r.type, 'data-polarity': r.polarity },
  h('i', { 'aria-hidden': 'true' }, SIGN[r.polarity]),
  h('span', { class: 'ecd-rt' }, reasonText(r, ctx)),
  h('span', { class: 'ecd-ev', 'data-ev': r.evidence, title: t('ds.ev.' + r.evidence + 'Tip') }, t('ds.ev.' + r.evidence)))

function confTag(c) {
  const n = c.n != null ? fmtN(c.n) : null
  return h('span', { class: 'ecd-conf', 'data-level': c.level, title: t('ds.conf.' + c.level + 'Tip') + (c.n != null ? ' · ' + t('ds.games', c.n.toLocaleString(getLang())) : '') },
    t('ds.conf.' + c.level), n && c.level !== 'model' ? ' · ' + n : null)
}

// Botón «Localizar»: desplaza y resalta la ficha; si no está pintada en la cuadrícula, lo dice.
function locateButton(cid, name, actions, compact = false) {
  if (!actions.locate) return null
  const btn = h('button', {
    type: 'button', class: 'ecd-loc' + (compact ? ' ecd-sq' : ''), 'data-locate': cid, 'aria-label': t('ds.locateFor', name), title: t('ds.locateTip'),
    onclick: () => { if (!actions.locate(cid)) { btn.classList.add('ecd-miss'); btn.title = t('nat.notInGrid') } },
  }, icon('target', 13), compact ? null : t('ds.locate'))
  return btn
}

function primaryCard(c, ctx, actions) {
  const info = ctx.cat.champion(c.cid)
  const sources = [c.lane && 'LoLalytics', c.team && 'iTero'].filter(Boolean).join(' + ')
  return h('div', { class: 'ecd-main', 'data-primary': c.cid },
    h('div', { class: 'ecd-who' }, pic(info, 'ecp-ico'),
      h('div', { class: 'ecd-name' }, h('b', null, info.name), h('span', { class: 'ecd-sub', 'data-sources': sources }, sources)),
      confTag(c.confidence)),
    h('ul', { class: 'ecd-rs', 'aria-label': t('ds.whyFor', info.name) },
      c.reasons.slice(0, 3).map((r) => reasonItem(r, ctx)),
      c.tradeoffs.slice(0, 1).map((r) => reasonItem(r, ctx))),
    h('div', { class: 'ecp-line' }, locateButton(c.cid, info.name, actions)))
}

function altRow(c, ctx, actions) {
  const info = ctx.cat.champion(c.cid)
  const lead = c.reasons[0] ?? c.tradeoffs[0] ?? null
  return h('div', { class: 'ecd-alt', 'data-alt': c.cid, 'data-why': c.why },
    pic(info, 'ecp-ico'),
    h('div', { class: 'ecd-name' },
      h('b', null, info.name, ' ', h('span', { class: 'ecd-why' }, '— ' + t('ds.why.' + c.why))),
      lead ? h('span', { class: 'ecd-sub', 'data-reason': lead.type }, SIGN[lead.polarity] + ' ' + reasonText(lead, ctx)) : null),
    locateButton(c.cid, info.name, actions, true))
}

/**
 * Bloque de decisión. `summary` = domain/draft-summary.js · `ctx` = { cat, rival: nombre del rival|null, meta: {allies, enemies} de iTero }
 * `actions` = { locate?: (cid) => boolean, perspective: (p) => void }. null si no hay ninguna recomendación que enseñar.
 */
export function draftSummaryBlock(summary, ctx, actions) {
  if (!summary?.primary) return null
  ensureStyle()
  const ctxT = { ...ctx, rival: ctx.rival ?? t('ds.yourRival') }
  const seg = h('div', { class: 'ecd-seg', role: 'group', 'aria-label': t('ds.perspective') },
    PERSPECTIVES.map((p) => {
      const off = p !== 'auto' && !summary.available[p]
      return h('button', {
        type: 'button', 'data-perspective': p, 'aria-pressed': String(summary.requested === p), disabled: off ? 'disabled' : null,
        title: off ? t('ds.p.offTip') : t('ds.p.' + p + 'Tip'), onclick: () => actions.perspective(p),
      }, t('ds.p.' + p))
    }))
  return h('div', { class: 'ecd', 'data-draft-summary': summary.perspective },
    h('div', { class: 'ecd-top' }, h('span', { class: 'ecd-cap' }, t('ds.title')),
      h('span', { class: 'ecd-sub', 'data-resolved': summary.perspective, title: t('ds.p.' + summary.perspective + 'Tip') }, '· ' + t('ds.p.' + summary.perspective))),
    seg,
    primaryCard(summary.primary, ctxT, actions),
    summary.alternatives.length
      ? h('div', { class: 'ecd-alts', 'data-alts': 'draft' }, h('span', { class: 'ecd-cap' }, t('ds.alts')), summary.alternatives.map((c) => altRow(c, ctxT, actions)))
      : null)
}

const ROLE_OF_LANE = { TOP: 0, JUNGLE: 1, MIDDLE: 2, BOTTOM: 3, UTILITY: 4 }

/**
 * Contexto del draft (spec §4.2): tus 5 huecos y los 5 rivales por línea. El borde dice cómo se sabe la línea:
 * dorado = tú / elegida por ti · continuo = la informa el cliente · discontinuo con «?» = deducida por el plugin · círculo vacío = sin campeón.
 * `p` = { cat, context (MatchContext), roles (application/enemy-roles.js) }. null si aún no hay nadie revelado.
 */
export function teamContextBlock({ cat, context, roles }) {
  if (!context) return null
  const s = teamSlots({ me: context.championId, myRole: context.role, allies: context.allies ?? [], enemies: context.enemies ?? [], enemyRoles: roles })
  // Solo si hay alguien revelado además de ti (con tu campeón solo, el bloque no dice nada nuevo).
  if (![...s.allies, ...s.enemies].some((x) => x.cid && x.status !== 'self') && !s.unplacedEnemies.length && !s.unplacedAllies.length) return null
  ensureStyle()
  const slot = (x) => {
    const lane = t('role.' + ROLE_OF_LANE[x.lane])
    const label = x.cid ? t('tc.slot', lane, cat.champion(x.cid).name, t('tc.st.' + x.status)) : t('tc.empty', lane)
    return h('div', { class: 'ect-slot', 'data-lane': x.lane, 'data-status': x.status, 'data-cid': x.cid ?? '', role: 'img', 'aria-label': label, title: label },
      x.cid ? pic(cat.champion(x.cid), 'ecp-ico', label) : h('div', { class: 'ect-void' }),
      h('b', null, t('role.s.' + ROLE_OF_LANE[x.lane])))
  }
  const row = (cls, lab, list, extra) => h('div', { class: 'ect-row ' + cls }, h('span', { class: 'ect-lab' }, lab), list.map(slot),
    extra.length ? h('span', { class: 'ect-more', 'data-unplaced': extra.length, title: extra.map((c) => cat.champion(c).name).join(', ') }, t('tc.unplaced', extra.length)) : null)
  return h('div', { class: 'ect', 'data-team-context': '', title: t('tc.legend') },
    row('ect-ally', t('tc.allies'), s.allies, s.unplacedAllies),
    row('ect-foe', t('tc.enemies'), s.enemies, s.unplacedEnemies))
}
