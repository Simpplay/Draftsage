// draftsage/src/application/enemy-roles.js — línea de cada rival revelado: la que elige el jugador o la que deduce el plugin
//
// Dos piezas:
//  · loadLaneShares: cuota de línea (% de partidas de cada campeón en cada línea) de las listas de tier de LoLalytics (5 peticiones, cacheadas
//    2 h, sin cuenta). La usan este módulo y el consejero de picks para colocar a los rivales sin posición.
//  · createEnemyRoles: vigila el controlador de Champion Select y mantiene { status, byLane, byChampion } para la interfaz. Lo que el jugador
//    elige a mano (ctx.enemyRoles, ver application/champ-select.js) manda; luego lo que informa el cliente; el resto lo reparte el plugin con
//    las cuotas de línea. Se pinta primero lo que no necesita red (manual + cliente) y, si faltan líneas, se completa con las listas de tier.
// Solo MUESTRA y alimenta al consejero/matchup: si LoLalytics falla, quedan las líneas manuales y las del cliente sin molestar a nadie.

import { resolveEnemyRoles, needsShares } from '../domain/enemy-roles.js'
import { LANES } from '../domain/itero.js'
import { resolveTiers } from '../domain/filters.js'
import { LANES as LOLA_LANES, tierParam } from '../domain/lolalytics.js'

/**
 * @param {{tierlist:Function}|null} lola
 * @param {string} tierP  parámetro `tier` de LoLalytics (domain/lolalytics.js tierParam)
 * @returns {Promise<(cid:number, lane:string)=>number|null>}
 */
export async function loadLaneShares(lola, tierP) {
  const rows = {}
  if (!lola) return () => null
  await Promise.all(LANES.map(async (lane) => {
    const r = await lola.tierlist({ lane: LOLA_LANES[LANES.indexOf(lane)], tier: tierP }).catch(() => null)
    if (r?.ok) rows[lane] = r.data.rows
  }))
  return (cid, lane) => rows[lane]?.get(cid)?.pctLane ?? null
}

const EMPTY = Object.freeze({ status: 'idle', byLane: {}, byChampion: {}, key: null })

/**
 * @param {{source:{getState:Function, subscribe:Function}, lola?:{tierlist:Function}|null, getFilters?:()=>object, log?:object}} deps  source = controlador de Champion Select
 */
export function createEnemyRoles({ source, lola = null, getFilters = () => undefined, log = null }) {
  const listeners = new Set()
  let state = EMPTY
  let lastKey = null
  let generation = 0
  let unsubscribe = null

  const setState = (s) => { state = s; for (const cb of [...listeners]) { try { cb(state) } catch (e) { log?.error('roles de rivales:', e) } } }

  const contextOf = (st) => {
    const c = st.context
    return c && st.status !== 'idle' && c.phase !== 'game' && (c.enemies ?? []).length ? c : null
  }

  async function evaluate() {
    const ctx = contextOf(source.getState())
    if (!ctx) { lastKey = null; generation++; if (state.status !== 'idle') setState(EMPTY); return }
    const { tiers } = resolveTiers(getFilters(), ctx.lobbyTier)
    const tp = tierParam(tiers)
    const manual = ctx.enemyRoles ?? {}
    const key = [(ctx.enemies ?? []).map((e) => e.championId + ':' + (e.position ?? '')).join(','), JSON.stringify(manual), tp.param].join('|')
    if (key === lastKey) return
    lastKey = key
    const gen = ++generation

    // 1) Sin red: lo manual y lo que informó el cliente (las líneas deducidas ya vistas se conservan hasta tener las nuevas).
    const first = resolveEnemyRoles(ctx.enemies, manual, () => null)
    const present = new Set((ctx.enemies ?? []).map((e) => e.championId))
    for (const [cid, v] of Object.entries(state.byChampion)) { // sin parpadeo: las deducidas antes siguen a la vista mientras llegan las nuevas
      if (v.source === 'auto' && present.has(Number(cid)) && !first.byChampion[cid] && first.byLane[v.lane] == null) { first.byChampion[cid] = v; first.byLane[v.lane] = Number(cid) }
    }
    setState({ status: 'ready', ...first, key })
    if (!needsShares(ctx.enemies, manual)) return

    // 2) Con las listas de tier: el reparto del plugin para los que siguen sin línea.
    let shares
    try { shares = await loadLaneShares(lola, tp.param) } catch (e) { log?.warn('roles de rivales: sin cuotas de línea', String(e)); return }
    if (gen !== generation) return
    const full = resolveEnemyRoles(ctx.enemies, manual, shares)
    setState({ status: 'ready', ...full, key })
    log?.info('roles de rivales', JSON.stringify({ porLinea: full.byLane, origen: Object.fromEntries(Object.entries(full.byChampion).map(([c, v]) => [c, v.source])) }))
  }

  return {
    getState: () => state,
    subscribe(cb) { listeners.add(cb); cb(state); return () => listeners.delete(cb) },
    start() { if (!unsubscribe) unsubscribe = source.subscribe(() => { evaluate() }) },
    stop() { unsubscribe?.(); unsubscribe = null; generation++ },
  }
}
