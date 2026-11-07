// draftsage/src/presentation/overlay.js — marcadores de win rate y counters sobre los campeones de la selección
//
// Pinta una capa fija (sin eventos de ratón) con una etiqueta encima de cada campeón de la cuadrícula de Champion Select:
//   · win rate del campeón en tu línea (lista de tier); si hay rival, su win rate CONTRA ese rival;
//   · los mejores counters llevan borde verde y su posición (#1…#5).
// Fichas: primero las nativas (`.grid-champion[data-id]`, verificado con el DOM de la 16.22; ver docs/champ-select-dom.md) y, si no las hay, una heurística:
//   las <img> cuyo src contiene «champion-icons/<id>.png» y, entre sus ancestros, el contenedor más bajo con ≥ MIN_GRID de ellas
//   (así se ignoran los iconos de baneos y de tu equipo). Si no acierta: draftsage.overlayProbe() diagnostica y
//   draftsage.overlaySelector('css') fija el selector a mano (cada elemento debe ser, o contener, la <img> del campeón).
// Filtros de la selección (application/pick-filters.js): mientras haya alguno activo, los campeones que NO lo cumplen se ven atenuados con un velo
// (la capa no recibe eventos de ratón: se pueden elegir igualmente). El velo solo se pinta durante un Champion Select (`inSelection`), porque la
// misma cuadrícula de iconos existe en otras pantallas del cliente (colección de campeones).
// No hace peticiones: solo lee el estado de application/overlay.js. Sin innerHTML: todo con h().

import { h, whenReady } from './ui.js'
import { t } from '../shared/i18n.js'
import { log } from '../shared/logger.js'

const STYLE_ID = 'draftsage-overlay-style'
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
.ecb-veil{position:fixed;box-sizing:border-box;background:rgba(1,10,19,.72);-webkit-backdrop-filter:grayscale(1);backdrop-filter:grayscale(1)}
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

/**
 * Fichas del DOM real del Champion Select (16.22, verificado con una captura): `.grid-champion[data-id]`, con el id del campeón en `data-id`
 * (-2 = la ficha «ninguno»/aleatorio) y `.grid-champion-banned` en los baneados (ya atenuados por el cliente: sin marcador ni velo).
 */
export function nativeTiles(root = document) {
  return [...root.querySelectorAll('.grid-champion[data-id]')]
    .map((el) => ({ el, id: Number(el.getAttribute('data-id')) }))
    .filter((x) => x.id > 0 && !x.el.classList.contains('grid-champion-banned'))
}

/** Elementos de la cuadrícula con su id de campeón: [{ el, id }]. Orden: selector manual → fichas nativas → heurística de imágenes. */
export function findTiles(selector = '', root = document) {
  if (selector) {
    try {
      return [...root.querySelectorAll(selector)].map((el) => ({ el, id: championIdOf(el) })).filter((x) => x.id)
    } catch { return [] } // selector inválido
  }
  const native = nativeTiles(root)
  if (native.length) return native
  const g = findGrid(root)
  return g ? g.imgs.map((el) => ({ el, id: championIdOf(el) })).filter((x) => x.id) : []
}

/** Diagnóstico para pegarlo en un informe: cuántas imágenes y cuadrícula encontró (sin contenido de la página). */
export function probeGrid(root = document) {
  const all = [...root.querySelectorAll('img')].filter((i) => ICON_RE.test(i.getAttribute('src') ?? ''))
  const g = findGrid(root)
  const nativas = root.querySelectorAll('.grid-champion[data-id]').length
  const path = (el) => { const p = []; for (let a = el; a && p.length < 6; a = a.parentElement) p.push(a.tagName.toLowerCase() + (a.classList?.[0] ? '.' + a.classList[0] : '')); return p.join(' < ') }
  const r = { fichasNativas: nativas, imagenesDeCampeon: all.length, cuadricula: g ? { casillas: g.imgs.length, ruta: path(g.grid) } : null, ejemplo: all[0] ? { src: (all[0].getAttribute('src') ?? '').slice(-60), ruta: path(all[0]) } : null }
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
 * @param {{overlay:{getState:Function, subscribe:Function}, catalog:{champion:(id:number)=>{name:string}, load:Function}, getPrefs:()=>{enabled:boolean, selector:string},
 *          filters?:{isActive:()=>boolean, get:Function, availability:Function, matches:Function, subscribe:Function}, inSelection?:()=>boolean}} deps
 */
export async function mountOverlay({ overlay, catalog, getPrefs, filters = null, inSelection = () => false }) {
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
    const badges = prefs.enabled && !!st.data
    const veils = !!filters && inSelection() && filters.isActive()
    if (!badges && !veils) { layer.style.display = 'none'; layer.replaceChildren(); return }
    const tiles = findTiles(prefs.selector)
    const f = veils ? filters.get() : null
    const avail = veils ? filters.availability() : null
    const nodes = []
    for (const { el, id } of tiles) {
      const r = el.getBoundingClientRect()
      if (r.width < 16 || r.height < 16 || r.bottom < 0 || r.top > window.innerHeight) continue
      if (veils && !filters.matches(id, f, avail)) {
        nodes.push(h('div', { class: 'ecb-veil', 'data-veil': String(id), style: `left:${Math.round(r.left)}px;top:${Math.round(r.top)}px;width:${Math.round(r.width)}px;height:${Math.round(r.height)}px` }))
      }
      if (!badges) continue
      const b = badgeOf(st.data.champions[id] && { ...st.data.champions[id], cid: id }, st.data.rival)
      if (!b) continue
      const c = st.data.champions[id]
      nodes.push(h('div', { class: b.cls, 'data-cid': String(id), title: tipOf(catalog.champion(id).name, c), style: `left:${Math.round(r.left + r.width / 2 - 15)}px;top:${Math.round(r.top - 7)}px` },
        h('span', null, b.value.toFixed(1)), b.rank && h('b', null, '#' + b.rank)))
    }
    layer.style.display = nodes.length ? 'block' : 'none'
    layer.replaceChildren(...nodes)
  }
  // Repinta como mucho una vez por fotograma (el cliente anima y desplaza la cuadrícula).
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(paint) } }

  catalog.load().then(schedule).catch(() => {})
  overlay.subscribe(schedule)
  filters?.subscribe(schedule)
  addEventListener('resize', schedule)
  addEventListener('scroll', schedule, true) // true: también los desplazamientos de la cuadrícula interna
  addEventListener('draftsage:prefs', schedule)
  // El cliente monta y desmonta la cuadrícula según la fase: solo se vigila el DOM mientras hay datos que enseñar.
  if (typeof MutationObserver !== 'undefined') {
    // Se ignoran los cambios de la propia capa (si no, pintar provocaría otro pintado sin fin).
    observer = new MutationObserver((recs) => { if ((overlay.getState().data || (filters?.isActive() && inSelection())) && recs.some((r) => !layer.contains(r.target))) schedule() })
    observer.observe(document.body, { childList: true, subtree: true })
  }
  const guard = setInterval(() => { attach(); if (overlay.getState().data || (filters?.isActive() && inSelection())) schedule() }, 1500)
  log.info('estadísticas de selección listas')
  return { destroy() { clearInterval(guard); observer?.disconnect(); layer.remove() }, repaint: schedule }
}
