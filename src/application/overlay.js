// easy-coachless/src/application/overlay.js — estadísticas de cada campeón para mostrar en Champion Select (win rate y counters)
//
// Dos piezas:
//  · createChampionStats: contexto → datos. Pide la lista de tier de TU línea (win rate, uso, bans, nota de cada campeón) y, si se conoce el
//    rival de tu línea, la página de build del rival (su tabla `enemy` da cómo le va a cada campeón contra él → mejores counters).
//    Todo es de LoLalytics y no necesita cuenta. 2 peticiones como máximo por consulta (cacheadas por el cliente).
//  · createOverlayController: vigila el controlador de Champion Select y mantiene el estado { status, data } que pintan el panel y los
//    marcadores sobre los campeones (presentation/overlay.js). No depende de qué campeón hayas elegido: depende de tu línea, el rango,
//    el rival y los rivales revelados (por eso funciona también antes de elegir).
//
// Reglas: sin línea (ARAM, sin posición) no hay estadísticas; si falla la página del rival se siguen mostrando las de la línea; si falla
// Lolalytics, el overlay se queda en 'error' sin molestar (el panel y el cliente no dependen de él).

import { buildOverlayData, inferOpponent } from '../domain/overlay-stats.js'
import { laneOfRole, tierParam } from '../domain/lolalytics.js'
import { resolveTiers } from '../domain/filters.js'
import { championSlug } from '../domain/web.js'

/**
 * @param {{client:object, catalog:{load:()=>Promise<void>, champion:(id:number)=>object}, getFilters?:()=>object, log?:object}} deps
 */
export function createChampionStats({ client, catalog, getFilters = () => undefined, log = null }) {
  /**
   * @param {{role?:number, lobbyTier?:number, opponentChampionId?:number|null, opponentSource?:string, enemies?:{championId:number}[]}} ctx
   * @returns {Promise<{ok:true, data:object}|{ok:false, reason:string}>}  reason: 'no-lane' | 'network' | 'blocked' | 'http' | 'no-data' | 'shape'
   */
  async function load(ctx) {
    const lane = laneOfRole(ctx?.role)
    if (!lane) return { ok: false, reason: 'no-lane' }
    await catalog.load().catch(() => {})
    const { tiers } = resolveTiers(getFilters(), ctx.lobbyTier)
    const tp = tierParam(tiers)

    const tl = await client.tierlist({ lane, tier: tp.param })
    if (!tl.ok) return { ok: false, reason: tl.reason }
    const used = tl.tierUsed && tl.tierUsed !== tp.param ? tierParam([5, 6, 7]) : tp

    let rival = ctx.opponentChampionId ?? null
    let rivalSource = rival ? (ctx.opponentSource ?? 'position') : null
    if (!rival) { rival = inferOpponent(ctx.enemies, tl.data.rows); rivalSource = rival ? 'role' : null }

    let rivalRows = null
    let vsReason = null
    if (rival) {
      const slug = tl.data.slugs?.[rival] ?? championSlug(catalog.champion(rival))
      if (!slug) vsReason = 'no-slug'
      else {
        const rp = await client.build({ slug, lane, tier: tl.tierUsed ?? tp.param })
        if (rp.ok && rp.data.root.header.lane === lane && Array.isArray(rp.data.root.enemy?.[lane])) rivalRows = rp.data.root.enemy[lane]
        else vsReason = rp.ok ? 'other-lane' : rp.reason
      }
    }
    const data = buildOverlayData({ lane, tiers: used.tiers, tierRows: tl.data.rows, rival, rivalSource, rivalRows, vsReason })
    log?.info('estadísticas', JSON.stringify({ linea: lane, tier: used.param, rival, rivalOrigen: rivalSource, campeones: Object.keys(data.champions).length, counters: data.counters.map((c) => c.cid), vs: vsReason }))
    return { ok: true, data }
  }
  return { load }
}

/**
 * @param {{stats:{load:Function}, source:{getState:Function, subscribe:Function}, prefs:{get:()=>{enabled:boolean}, set:(p:object)=>object},
 *          getFilters?:()=>object, debounceMs?:number, log?:object}} deps   source = el controlador de Champion Select
 */
export function createOverlayController({ stats, source, prefs, getFilters = () => undefined, debounceMs = 300, log = null }) {
  const listeners = new Set()
  let state = { status: 'idle', data: null, key: null }
  let lastKey = null
  let generation = 0
  let unsubscribe = null

  const setState = (s) => { state = s; for (const cb of [...listeners]) { try { cb(state) } catch (e) { log?.error('overlay:', e) } } }

  // Qué influye en las estadísticas: la línea, el rango, el rival (el del cliente, el elegido a mano o el que dedujo Coachless) y los rivales revelados.
  function contextOf(st) {
    const c = st.context
    if (!prefs.get().enabled || !c || st.status === 'idle' || c.phase === 'game') return null
    const rival = c.opponentChampionId ?? st.data?.meta?.opponent ?? null
    return {
      role: c.role, lobbyTier: c.lobbyTier, enemies: c.enemies ?? [],
      opponentChampionId: rival, ...(rival && { opponentSource: c.opponentChampionId ? (c.opponentSource ?? 'position') : 'role' }),
    }
  }
  const keyOf = (c) => [c.role, c.lobbyTier ?? 0, c.opponentChampionId ?? 0, c.enemies.map((e) => e.championId).join(','), JSON.stringify(getFilters()?.tiers ?? null)].join('|')

  async function evaluate({ force = false } = {}) {
    const ctx = contextOf(source.getState())
    if (!ctx) { lastKey = null; generation++; if (state.status !== 'idle') setState({ status: 'idle', data: null, key: null }); return }
    const key = keyOf(ctx)
    if (!force && key === lastKey) return
    lastKey = key
    const gen = ++generation
    // Mientras llegan los datos nuevos se conservan los anteriores (la línea no cambia a menudo): sin parpadeo.
    setState({ status: 'loading', data: state.data, key })
    if (debounceMs > 0) { await new Promise((r) => setTimeout(r, debounceMs)); if (gen !== generation) return }
    let r
    try { r = await stats.load(ctx) } catch (e) { log?.error('estadísticas fallaron:', String(e)); r = { ok: false, reason: 'network' } }
    if (gen !== generation) return
    if (r.ok) setState({ status: 'ready', data: r.data, key })
    else { lastKey = null; setState({ status: 'error', data: null, reason: r.reason, key }) } // en error se reintenta en el siguiente cambio de contexto
  }

  return {
    getState: () => state,
    subscribe(cb) { listeners.add(cb); cb(state); return () => listeners.delete(cb) },
    start() { if (!unsubscribe) unsubscribe = source.subscribe(() => { evaluate() }) },
    stop() { unsubscribe?.(); unsubscribe = null; generation++ },
    refresh: () => evaluate({ force: true }),
    isEnabled: () => prefs.get().enabled,
    setEnabled(on) { prefs.set({ enabled: !!on }); return evaluate({ force: true }) },
  }
}
