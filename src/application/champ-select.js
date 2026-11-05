// easy-coachless/src/application/champ-select.js — controlador: contexto de la partida → recomendación → estado para la UI
//
// Estados (state.status):
//   idle          sin Champion Select ni simulación
//   waiting       en Champion Select pero aún sin campeón elegido
//   needs-login   hay campeón pero no hay sesión de Coachless
//   loading       consultando Coachless
//   ready         state.data = Recommendation (ver recommendation.js)
//   error         state.reason: 'network' | 'forbidden' | 'no-data' | 'auth' | …
// La UI solo se suscribe (subscribe) y llama a refresh()/simulate(); no conoce ni el LCU ni la API.

import { log } from '../shared/logger.js'

const enemiesKey = (c) => (c.enemies ?? []).map((e) => e.championId).join(',')
const sameCtx = (a, b) =>
  a === b || (!!a && !!b && a.championId === b.championId && a.opponentChampionId === b.opponentChampionId &&
    a.role === b.role && a.lobbyTier === b.lobbyTier && enemiesKey(a) === enemiesKey(b))

/**
 * @param {{provider: import('../domain/match-context.js').MatchContextProvider,
 *          recommend: (ctx:object, o:{premium:boolean,signal:AbortSignal})=>Promise<object>,
 *          isLoggedIn: ()=>boolean, hasPremium: ()=>boolean, debounceMs?: number}} deps
 * debounceMs: espera antes de consultar, para no lanzar una consulta por cada campeón por el que pasa el cursor.
 */
export function createChampSelectController({ provider, recommend, isLoggedIn, hasPremium, debounceMs = 0 }) {
  const listeners = new Set()
  let state = { status: 'idle', context: null }
  let lcuCtx = null
  let manualCtx = null
  let opponentOverride = null // rival elegido a mano en el panel (manda sobre el detectado)
  let generation = 0
  let abort = null
  let unsubscribe = null

  const setState = (s) => { state = s; for (const cb of [...listeners]) { try { cb(state) } catch (e) { log.error('panel:', e) } } }

  async function evaluate({ force = false } = {}) {
    const base = manualCtx ?? lcuCtx
    if (!base) opponentOverride = null // terminó la selección: la próxima empieza en automático
    const ctx = base && opponentOverride ? { ...base, opponentChampionId: opponentOverride, opponentSource: 'manual' } : base
    const prev = state.context
    if (!force && sameCtx(ctx, prev) && state.status !== 'idle') return
    abort?.abort()
    const gen = ++generation

    if (!ctx) return setState({ status: 'idle', context: null })
    if (!ctx.championId) return setState({ status: 'waiting', context: ctx })
    if (!isLoggedIn()) return setState({ status: 'needs-login', context: ctx })

    setState({ status: 'loading', context: ctx })
    if (debounceMs > 0) {
      await new Promise((r) => setTimeout(r, debounceMs))
      if (gen !== generation) return
    }
    abort = new AbortController()
    let r
    try { r = await recommend(ctx, { premium: hasPremium(), signal: abort.signal }) }
    catch (e) { log.error('recomendación falló:', String(e)); r = { ok: false, reason: 'network' } }
    if (gen !== generation) return // llegó tarde: el usuario ya cambió de campeón
    if (r.ok) setState({ status: 'ready', context: ctx, data: r.data })
    else if (r.reason === 'aborted') return
    else setState({ status: 'error', context: ctx, reason: r.reason })
  }

  return {
    getState: () => state,
    subscribe(cb) { listeners.add(cb); cb(state); return () => listeners.delete(cb) },
    start() {
      if (unsubscribe) return
      unsubscribe = provider.subscribeToChanges((ctx) => { lcuCtx = ctx; evaluate() })
    },
    stop() { unsubscribe?.(); unsubscribe = null; abort?.abort() },
    /** Reintenta con el contexto actual (p. ej. tras iniciar sesión o un error de red). */
    refresh: () => evaluate({ force: true }),
    /** Fija el rival a mano (id) o vuelve al automático (null). */
    setOpponent(id) { opponentOverride = id || null; return evaluate({ force: true }) },
    /** Simula un contexto desde DevTools o el menú (null lo quita y vuelve al Champion Select real). */
    simulate(ctx) { manualCtx = ctx ? { ...ctx, source: 'manual' } : null; return evaluate({ force: true }) },
  }
}
