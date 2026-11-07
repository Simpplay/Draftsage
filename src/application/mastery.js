// draftsage/src/application/mastery.js — maestría del jugador (por campeón) para iTero y para los filtros de la selección
//
// Fuente: iTero `POST /api/basic-info` con el Riot ID del jugador (domain/itero.js). Ese ID es lo único personal que sale hacia un tercero,
// así que la función está APAGADA por defecto y solo se enciende tras aceptar un aviso (preferencia `useMastery` del consejero, application/preferences.js).
// Estados (state.status): 'off' (apagada) · 'idle' (sin selección) · 'loading' · 'ready' (state.points = { championId: puntos }, state.avg) · 'error' (state.reason).
// Se carga al empezar un Champion Select (los filtros de «Dominio» lo necesitan antes de que el consejero pida nada) y se vuelve a pedir
// solo si ha caducado (el cliente de iTero cachea la respuesta 10 min). Si falla, el plugin sigue igual: sin maestría.

/**
 * @param {{identity:{get:()=>Promise<object|null>}, itero:{basicInfo:Function}, source:{getState:Function, subscribe:Function},
 *          prefs:{get:()=>{useMastery:boolean}}, log?:object}} deps  source = controlador de Champion Select
 */
export function createMastery({ identity, itero, source, prefs, log = null }) {
  const listeners = new Set()
  let state = { status: 'off', points: null, avg: null, reason: null }
  let loading = null
  let unsubscribe = null

  const setState = (s) => { state = s; for (const cb of [...listeners]) { try { cb(state) } catch (e) { log?.error('maestría:', e) } } }
  const enabled = () => prefs.get().useMastery === true

  async function fetchNow() {
    setState({ ...state, status: 'loading', reason: null })
    let r
    try {
      const id = await identity.get()
      r = id ? await itero.basicInfo(id) : { ok: false, reason: 'identity' }
    } catch (e) { log?.error('maestría falló:', String(e)); r = { ok: false, reason: 'network' } }
    if (!enabled()) { setState({ status: 'off', points: null, avg: null, reason: null }); return state } // se apagó mientras cargaba
    if (r.ok) {
      setState({ status: 'ready', points: r.data.points, avg: r.data.avg, reason: null })
      log?.info('maestría cargada', JSON.stringify({ campeones: r.data.count, media: r.data.avg }))
    } else {
      log?.warn('maestría no disponible:', r.reason)
      setState({ status: 'error', points: null, avg: null, reason: r.reason })
    }
    return state
  }

  /** Carga (o reutiliza) la maestría. `force` repite aunque ya haya datos. Devuelve el estado final. Nunca lanza. */
  function load({ force = false } = {}) {
    if (!enabled()) { if (state.status !== 'off') setState({ status: 'off', points: null, avg: null, reason: null }); return Promise.resolve(state) }
    if (loading) return loading
    if (!force && state.status === 'ready') return Promise.resolve(state)
    loading = fetchNow().finally(() => { loading = null })
    return loading
  }

  const inSelection = (st) => !!st.context && st.status !== 'idle' && st.context.phase !== 'game'

  return {
    getState: () => state,
    subscribe(cb) { listeners.add(cb); cb(state); return () => listeners.delete(cb) },
    start() {
      if (unsubscribe) return
      unsubscribe = source.subscribe((st) => {
        if (inSelection(st)) { if (enabled() && state.status !== 'ready' && state.status !== 'loading') load() }
        else if (state.status === 'error') setState({ ...state, status: enabled() ? 'idle' : 'off' }) // el error se reintenta en la próxima selección
      })
    },
    stop() { unsubscribe?.(); unsubscribe = null },
    load,
    /** Tras activar/desactivar la función (o cambiar el peso). */
    refresh() { return load({ force: true }) },
    isEnabled: enabled,
    /** Puntos de maestría de un campeón (0 si no lo ha jugado) o null si no hay datos. */
    pointsOf: (championId) => (state.status === 'ready' ? (state.points[String(championId)] ?? 0) : null),
  }
}
