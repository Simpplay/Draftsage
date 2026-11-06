// easy-coachless/src/presentation/overlay.js — marcadores de win rate y counters sobre los campeones de la selección
//
// Pinta una capa fija (sin eventos de ratón) con una etiqueta encima de cada campeón de la cuadrícula de Champion Select:
//   · win rate del campeón en tu línea (lista de tier); si hay rival, su win rate CONTRA ese rival;
//   · los mejores counters llevan borde verde y su posición (#1…#5).
// La cuadrícula del cliente no tiene documentación para Pengu 1.1.6, así que se detecta con una heurística:
//   las <img> cuyo src contiene «champion-icons/<id>.png» y, entre sus ancestros, el contenedor más bajo con ≥ MIN_GRID de ellas
//   (así se ignoran los iconos de baneos y de tu equipo). Si no acierta: easyCoachless.overlayProbe() diagnostica y
//   easyCoachless.overlaySelector('css') fija el selector a mano (cada elemento debe ser, o contener, la <img> del campeón).
// No hace peticiones: solo lee el estado de application/overlay.js. Sin innerHTML: todo con h().

import { h, whenReady } from './ui.js'
import { t } from '../shared/i18n.js'
import { log } from '../shared/logger.js'

const STYLE_ID = 'easy-coachless-overlay-style'
const ICON_RE = /champion-icons\/(\d+)\.(?:png|jpg|webp)/i
const MIN_GRID = 20
const CSS = `
.ecb-layer{position:fixed;inset:0;z-index:2147483000;pointer-events:none}
.ecb{position:fixed;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:2px;padding:0 3px;height:14px;min-width:30px;border-radius:2px;background:rgba(1,10,19,.88);border:1px solid #3c3c41;color:#cdbe91;font:bold 10px/12px sans-serif;white-space:nowrap}
.ecb-up{color:#0ac8b9}.ecb-down{color:#e84057}
.ecb-low{opacity:.6;font-style:italic}
.ecb-top{border-color:#0ac8b9;box-shadow:0 0 6px rgba(10,200,185,.6);color:#f0e6d2}
.ecb-top b{color:#0ac8b9}
.ecb-rival{border-color:#e84057;box-shadow:0 0 6px rgba(232,64,87,.6)}
`

const fmt = (x) => (typeof x === 'number' ? x.toFixed(1) : '–')
const sign = (x) => (x >= 0 ? '+' : '') + x.toFixed(1)

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

const championIdOf = (el) => {
  const img = el.tagName === 'IMG' ? el : el.querySelector?.('img')
  const m = ICON_RE.exec(img?.getAttribute('src') ?? img?.src ?? '')
  return m ? Number(m[1]) : null
}

/** Contenedor más bajo que reúne ≥ minCount imágenes de campeón (la cuadrícula de selección). null si no hay. */
export function findGrid(root = document, minCount = MIN_GRID) {
  const imgs = [...root.querySelectorAll('img')].filter((i) => ICON_RE.test(i.getAttribute('src') ?? ''))
  const count = new Map()
  for (const img of imgs) for (let a = img.parentElement; a; a = a.parentElement) count.set(a, (count.get(a) ?? 0) + 1)
  let best = null
  for (const [el, n] of count) if (n >= minCount && (!best || best.contains(el))) best = el // el descendiente más bajo que aún cumple
  return best ? { grid: best, imgs: imgs.filter((i) => best.contains(i)) } : null
}

/** Elementos de la cuadrícula con su id de campeón: [{ el, id }]. */
export function findTiles(selector = '', root = document) {
  if (selector) {
    try {
      return [...root.querySelectorAll(selector)].map((el) => ({ el, id: championIdOf(el) })).filter((x) => x.id)
    } catch { return [] } // selector inválido
  }
  const g = findGrid(root)
  return g ? g.imgs.map((el) => ({ el, id: championIdOf(el) })).filter((x) => x.id) : []
}

/** Diagnóstico para pegarlo en un informe: cuántas imágenes y cuadrícula encontró (sin contenido de la página). */
export function probeGrid(root = document) {
  const all = [...root.querySelectorAll('img')].filter((i) => ICON_RE.test(i.getAttribute('src') ?? ''))
  const g = findGrid(root)
  const path = (el) => { const p = []; for (let a = el; a && p.length < 6; a = a.parentElement) p.push(a.tagName.toLowerCase() + (a.classList?.[0] ? '.' + a.classList[0] : '')); return p.join(' < ') }
  const r = { imagenesDeCampeon: all.length, cuadricula: g ? { casillas: g.imgs.length, ruta: path(g.grid) } : null, ejemplo: all[0] ? { src: (all[0].getAttribute('src') ?? '').slice(-60), ruta: path(all[0]) } : null }
  log.info('overlayProbe', JSON.stringify(r))
  return r
}

function tipOf(name, c) {
  const lines = [name]
  if (c) {
    lines.push(t('ov.wr', fmt(c.wr), c.grade ?? '–'))
    if (c.pr != null) lines.push(t('ov.pr', fmt(c.pr)))
    if (c.vs) lines.push(t(c.vs.low ? 'ov.vsLow' : 'ov.vs', fmt(c.vs.wr), c.vs.edge != null ? sign(c.vs.edge) : '–', c.vs.n))
    if (c.counter) lines.push(t('ov.counter', c.counter))
  }
  return lines.join('\n')
}

/** Contenido y clases de la etiqueta de un campeón; null si no hay nada que enseñar. */
export function badgeOf(c, rival) {
  if (!c) return null
  const vs = c.vs && !c.vs.low ? c.vs : null
  const value = vs ? vs.wr : c.wr
  if (typeof value !== 'number') return null
  const cls = ['ecb']
  if (vs && vs.edge != null) cls.push(vs.edge >= 0 ? 'ecb-up' : 'ecb-down')
  if (c.counter) cls.push('ecb-top')
  if (c.vs?.low) cls.push('ecb-low')
  if (rival === c.cid) cls.push('ecb-rival')
  return { value, rank: c.counter, cls: cls.join(' ') }
}

/**
 * @param {{overlay:{getState:Function, subscribe:Function}, catalog:{champion:(id:number)=>{name:string}, load:Function}, getPrefs:()=>{enabled:boolean, selector:string}}} deps
 */
export async function mountOverlay({ overlay, catalog, getPrefs }) {
  await whenReady()
  ensureStyle()
  const layer = h('div', { class: 'ecb-layer', style: 'display:none' })
  let scheduled = false
  let observer = null

  const attach = () => { if (document.body && !layer.isConnected) document.body.append(layer) }

  const paint = () => {
    scheduled = false
    attach()
    const st = overlay.getState()
    const prefs = getPrefs()
    if (!prefs.enabled || !st.data) { layer.style.display = 'none'; layer.replaceChildren(); return }
    const tiles = findTiles(prefs.selector)
    const nodes = []
    for (const { el, id } of tiles) {
      const b = badgeOf(st.data.champions[id] && { ...st.data.champions[id], cid: id }, st.data.rival)
      if (!b) continue
      const r = el.getBoundingClientRect()
      if (r.width < 16 || r.height < 16 || r.bottom < 0 || r.top > window.innerHeight) continue
      const c = st.data.champions[id]
      const node = h('div', { class: b.cls, 'data-cid': String(id), title: tipOf(catalog.champion(id).name, c), style: `left:${Math.round(r.left + r.width / 2 - 15)}px;top:${Math.round(r.top - 7)}px` },
        h('span', null, b.value.toFixed(1)), b.rank && h('b', null, '#' + b.rank))
      nodes.push(node)
    }
    layer.style.display = nodes.length ? 'block' : 'none'
    layer.replaceChildren(...nodes)
  }
  // Repinta como mucho una vez por fotograma (el cliente anima y desplaza la cuadrícula).
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(paint) } }

  catalog.load().then(schedule).catch(() => {})
  overlay.subscribe(schedule)
  addEventListener('resize', schedule)
  addEventListener('scroll', schedule, true) // true: también los desplazamientos de la cuadrícula interna
  addEventListener('easy-coachless:prefs', schedule)
  // El cliente monta y desmonta la cuadrícula según la fase: solo se vigila el DOM mientras hay datos que enseñar.
  if (typeof MutationObserver !== 'undefined') {
    // Se ignoran los cambios de la propia capa (si no, pintar provocaría otro pintado sin fin).
    observer = new MutationObserver((recs) => { if (overlay.getState().data && recs.some((r) => !layer.contains(r.target))) schedule() })
    observer.observe(document.body, { childList: true, subtree: true })
  }
  const guard = setInterval(() => { attach(); if (overlay.getState().data) schedule() }, 1500)
  log.info('estadísticas de selección listas')
  return { destroy() { clearInterval(guard); observer?.disconnect(); layer.remove() }, repaint: schedule }
}
