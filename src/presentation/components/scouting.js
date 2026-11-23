// draftsage/src/presentation/components/scouting.js — bans recomendados dentro de la pantalla de scouting de Clash
//
// El cliente muestra el scouting de un rival en un modal (`lol-uikit-full-page-modal` > `.tournament-scouting`, DOM de la 16.23, docs/CLASH-BANS.md §2.5).
// El modal NO expone ids: el roster se identifica por su tag (`.clash-roster-details-team-tag`) y application/ban-advisor.js lo resuelve contra el bracket.
// El bloque propio va en <body> con `position:fixed` pegado al borde derecho del modal (el CSS interno del modal es de Ember y se reconstruye: así no
// depende de él ni se pierde al cambiar de pestaña Ranked/Mastery/History). Se pliega con un clic. Solo MUESTRA; nunca banea ni elige nada.
// No hace fetch: lee el estado de application/ban-advisor.js. Sin innerHTML: todo con h().

import { ensureTheme } from '../theme.js'
import { h, whenReady } from '../ui.js'
import { icon } from '../icons.js'
import { isShown } from '../native.js'
import { t } from '../../shared/i18n.js'
import { log } from '../../shared/logger.js'

const STYLE_ID = 'draftsage-scouting-style'
const MODAL = '.tournament-scouting'
const TAG = '.clash-roster-details-team-tag'
const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }
const ERR_KEY = { 'no-tournament': 'clash.err.no-tournament', 'no-bracket': 'clash.err.no-bracket', 'no-opponent': 'clash.err.no-opponent', 'no-roster': 'clash.err.no-roster', 'no-players': 'clash.err.no-players', error: 'clash.err.error' }
const PART_KEY = { ranks: 'clash.part.ranks', scouting: 'clash.part.scouting', mastery: 'clash.part.mastery', stats: 'clash.part.stats' }
const TAG_KEY = { 'one-trick': 'clash.tag.one-trick', overlap: 'clash.tag.overlap', 'high-ban-rate': 'clash.tag.high-ban-rate', 'low-sample': 'clash.tag.low-sample' }
const REL_KEY = { high: 'clash.rel.high', medium: 'clash.rel.medium', low: 'clash.rel.low' }

const CSS = `
.ecc{position:fixed;z-index:2147483000;box-sizing:border-box;width:300px;max-height:calc(100vh - 24px);overflow:auto;background:var(--ds-bg);color:var(--ds-text);border:1px solid var(--ds-gold-dim);box-shadow:0 0 18px #000;font:12px/1.35 sans-serif;user-select:none;-webkit-app-region:no-drag;pointer-events:auto}
.ecc *{box-sizing:border-box;-webkit-app-region:no-drag}
.ecc-head{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--ds-border-soft);background:var(--ds-surface)}
.ecc-head b{flex:1;min-width:0;color:var(--ds-text-hi);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ecc-head button{background:none;border:0;color:var(--ds-gold);cursor:pointer;padding:2px;display:flex}
.ecc-head button:hover{color:var(--ds-text-hi)}
.ecc.ecc-fold .ecc-body{display:none}
.ecc-body{padding:8px 10px}
.ecc-note{margin:0 0 6px;color:var(--ds-amber);font-size:11px}
.ecc-msg{margin:0;color:var(--ds-meta)}
.ecc-sec{margin:8px 0 4px;color:var(--ds-meta);font-size:10px;text-transform:uppercase;letter-spacing:.05em}
.ecc-pl{display:flex;align-items:center;gap:6px;padding:2px 0}
.ecc-pl .ecc-nm{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--ds-text-hi)}
.ecc-pl .ecc-rk{color:var(--ds-meta);font-size:11px;white-space:nowrap}
.ecc-ic{width:22px;height:22px;border-radius:50%;object-fit:cover;border:1px solid var(--ds-border);background:var(--ds-surface-2);flex:none}
.ecc-ic.ecc-ot{border-color:var(--ds-red)}
.ecc-bn{padding:5px 0;border-top:1px solid var(--ds-border-soft)}
.ecc-row{display:flex;align-items:center;gap:6px}
.ecc-row .ecc-ic{width:28px;height:28px}
.ecc-row .ecc-nm{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--ds-text-hi);font-size:13px}
.ecc-bar{height:4px;margin:3px 0;background:var(--ds-surface-2)}
.ecc-bar>i{display:block;height:100%;background:var(--ds-gold)}
.ecc-bn[data-rel=low] .ecc-bar>i{background:var(--ds-mute)}
.ecc-bn[data-rel=low] .ecc-row .ecc-nm{opacity:.75}
.ecc-ch{display:flex;flex-wrap:wrap;gap:3px;margin-top:2px}
.ecc-ch span{padding:0 5px;border:1px solid var(--ds-border);border-radius:8px;font-size:10px;color:var(--ds-meta)}
.ecc-ch span.ecc-hot{border-color:var(--ds-red);color:var(--ds-red)}
.ecc-who{margin-top:2px;color:var(--ds-meta);font-size:11px}
.ecc-foot{margin:8px 0 0;color:var(--ds-mute);font-size:10px}
.ecc-spin{width:14px;height:14px;border:2px solid var(--ds-gold-dim);border-top-color:var(--ds-text-hi);border-radius:50%;animation:ecc-rot .7s linear infinite;display:inline-block;vertical-align:middle;margin-right:6px}
@keyframes ecc-rot{to{transform:rotate(360deg)}}
`

function ensureStyle() {
  ensureTheme()
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

/** «DIAMOND» + 2 → «Diamond II»; null → «–». */
export function rankLabel(rank) {
  const r = rank?.solo ?? rank?.flex
  if (!r?.tier) return '–'
  const name = r.tier.charAt(0) + r.tier.slice(1).toLowerCase()
  return ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(r.tier) ? name : name + (ROMAN[r.division] ? ' ' + ROMAN[r.division] : typeof r.division === 'string' && r.division ? ' ' + r.division : '')
}

/** Evidencias de un jugador sobre un campeón → líneas de texto para el tooltip. */
export function evidenceLines(p) {
  const out = []
  for (const e of p.evidence ?? []) {
    if (e.key === 'season') out.push(t('clash.ev.season', e.games, e.wins))
    else if (e.key === 'clash') out.push(t('clash.ev.clash', e.games, e.wins))
    else if (e.key === 'mastery') out.push(t('clash.ev.mastery', Math.round(e.points / 1000) + 'k', e.level) + ' · ' + (e.days != null ? t('clash.ev.days', e.days) : t('clash.ev.stale')))
    else if (e.key === 'strength') out.push(t('clash.ev.model', e.wr.toFixed(1), e.drop.toFixed(1), Math.round(p.usage * 100)))
  }
  return out
}

/**
 * @param {{bans:{getState:Function, subscribe:Function, target:Function}, catalog:object, root?:Document}} deps
 * Devuelve { destroy, sync }.
 */
export async function mountScouting({ bans, catalog, root = document }) {
  await whenReady()
  ensureStyle()
  const el = h('div', { class: 'ecc', 'data-ecc': 'block' })
  let folded = false
  let timer = 0
  let sig = ''
  let visibleTag = null

  const icon26 = (cid, cls = '') => {
    const c = catalog.champion(cid)
    return c.icon ? h('img', { class: 'ecc-ic ' + cls, src: c.icon, alt: c.name, draggable: 'false' }) : h('div', { class: 'ecc-ic ' + cls })
  }

  function paint(st, modal) {
    const d = st.data
    const head = h('div', { class: 'ecc-head' },
      icon('shield', 16),
      h('b', { title: t('clash.title') }, t('clash.title') + (d?.team?.shortName ? ' · ' + t('clash.vs', d.team.shortName) : visibleTag ? ' · ' + t('clash.vs', visibleTag) : '')),
      h('button', { type: 'button', 'data-ecc': 'fold', 'aria-expanded': String(!folded), title: folded ? t('clash.unfold') : t('clash.fold'), onclick: () => { folded = !folded; sig = ''; sync() } }, icon(folded ? 'chevron' : 'close', 14)))
    const body = h('div', { class: 'ecc-body' })
    if (st.status === 'loading' && !d) body.append(h('p', { class: 'ecc-msg' }, h('span', { class: 'ecc-spin' }), t('clash.loading')))
    else if (st.status === 'error') body.append(h('p', { class: 'ecc-msg', 'data-ecc': 'error' }, t(ERR_KEY[st.reason] ?? 'clash.err.error')))
    else if (d) {
      const notes = []
      if (d.partial?.length) notes.push(t('clash.partial', d.partial.map((k) => t(PART_KEY[k] ?? 'clash.part.stats')).join(', ')))
      if (!d.hasMeta) notes.push(t('clash.nometa'))
      for (const n of notes) body.append(h('p', { class: 'ecc-note' }, n))
      body.append(h('div', { class: 'ecc-sec' }, t('clash.title')))
      const max = Math.max(0.0001, ...d.bans.map((b) => b.value))
      d.bans.forEach((b, i) => {
        const c = catalog.champion(b.championId)
        const tip = b.perPlayer.map((p) => (d.players[p.playerIdx]?.name || '#' + (p.playerIdx + 1)) + ': ' + evidenceLines(p).join(' · ')).join('\n')
        const who = b.perPlayer.slice(0, 2).map((p) => d.players[p.playerIdx]?.name || '#' + (p.playerIdx + 1)).join(', ')
        body.append(h('div', { class: 'ecc-bn', 'data-ban': b.championId, 'data-rel': b.reliability, title: tip + '\n' + t(REL_KEY[b.reliability]) },
          h('div', { class: 'ecc-row' }, h('span', { style: 'color:var(--ds-gold);width:14px;text-align:right' }, i + 1), icon26(b.championId), h('span', { class: 'ecc-nm' }, c.name), h('small', { class: 'ecc-rel' }, t(REL_KEY[b.reliability]))),
          h('div', { class: 'ecc-bar' }, h('i', { style: `width:${Math.max(4, Math.round((b.value / max) * 100))}%` })),
          b.tags.length ? h('div', { class: 'ecc-ch' }, b.tags.map((g) => h('span', { class: g === 'one-trick' || g === 'high-ban-rate' ? 'ecc-hot' : '' }, t(TAG_KEY[g])))) : null,
          h('div', { class: 'ecc-who' }, who)))
      })
      body.append(h('div', { class: 'ecc-sec' }, 'Scouting'))
      for (const p of d.players) {
        body.append(h('div', { class: 'ecc-pl', 'data-player': p.playerIdx, title: p.oneTrick ? t('clash.oneTrick', catalog.champion(p.oneTrick).name) : '' },
          h('span', { class: 'ecc-nm' }, p.name || '#' + (p.playerIdx + 1)), h('span', { class: 'ecc-rk' }, rankLabel(p.rank)),
          p.top.map((x) => { const i = icon26(x.cid, x.cid === p.oneTrick ? 'ecc-ot' : ''); i.title = t('clash.top.tip', catalog.champion(x.cid).name, (x.games ? x.games + 'p · ' : '') + (x.points ? Math.round(x.points / 1000) + 'k' : '')); return i })))
      }
      body.append(h('p', { class: 'ecc-foot' }, t('clash.footer')))
    }
    el.replaceChildren(head, body)
    el.classList.toggle('ecc-fold', folded)
    place(modal)
  }

  // A la derecha del modal si cabe; si no, pegado al borde derecho de la ventana. Siempre dentro de la ventana.
  function place(modal) {
    const r = modal.getBoundingClientRect()
    const w = 300
    const left = r.right + 8 + w <= innerWidth ? r.right + 8 : Math.max(8, innerWidth - w - 12)
    el.style.left = left + 'px'; el.style.top = Math.max(8, r.top) + 'px'
  }

  function sync() {
    clearTimeout(timer); timer = 0
    const modal = root.querySelector(MODAL)
    const shown = isShown(modal)
    const tag = shown ? (modal.querySelector(TAG)?.textContent ?? '').trim() : ''
    if (tag !== (visibleTag ?? '')) { visibleTag = tag || null; sig = ''; log.debug('scouting de Clash: roster visible', tag ? 'sí' : 'no') }
    bans.target(visibleTag)
    const st = bans.getState()
    // Equipo propio: no hay nada que recomendar (el modal también se abre con tu roster).
    if (!shown || !visibleTag || !bans.isEnabled() || st.status === 'idle' || (st.status === 'error' && st.reason === 'own-roster')) { if (el.isConnected) el.remove(); return }
    const s = JSON.stringify([st.status, st.tag, st.reason ?? '', st.data?.fetchedAt ?? 0, folded, visibleTag, catalog.isLoaded?.() ?? true])
    if (s !== sig) { sig = s; paint(st, modal) } else place(modal)
    if (el.parentElement !== root.body) root.body.append(el)
  }
  const schedule = () => { if (!timer) timer = setTimeout(sync, 100) }

  const off = bans.subscribe(schedule)
  addEventListener('draftsage:prefs', schedule)
  addEventListener('resize', schedule)
  catalog.load().then(schedule).catch(() => {})
  let observer = null
  if (typeof MutationObserver !== 'undefined' && root.body) {
    observer = new MutationObserver((recs) => { for (const r of recs) if (!(r.target.nodeType === 1 && r.target.closest?.('.ecc'))) { schedule(); return } })
    observer.observe(root.body, { childList: true, subtree: true })
  }
  const guard = setInterval(schedule, 1500)
  sync()
  log.info('scouting de Clash: bloque de bans listo')

  return {
    sync,
    destroy() { clearInterval(guard); clearTimeout(timer); observer?.disconnect(); off?.(); removeEventListener('draftsage:prefs', schedule); removeEventListener('resize', schedule); el.remove(); bans.target(null) },
  }
}
