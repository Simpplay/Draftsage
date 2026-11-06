// easy-coachless/src/application/champ-select.js — controlador: contexto de la partida → recomendación → estado para la UI
//
// Estados (state.status):
//   idle          sin Champion Select, partida ni simulación
//   waiting       en Champion Select pero aún sin campeón elegido
//   needs-login   hay campeón pero la fuente elegida necesita una sesión de Coachless que no existe (`isLoggedIn()` ya lo decide)
//   loading       consultando Coachless (state.stale = la recomendación anterior del mismo campeón, para no parpadear)
//   ready         state.data = Recommendation (ver recommendation.js)
//   error         state.reason: 'network' | 'forbidden' | 'no-data' | 'auth' | 'blocked' | …  (state.source: la fuente que falló, si se sabe)
// state.context.phase === 'game': la partida ya empezó; se conserva la última recomendación (los ítems se consultan con Alt+Tab).
//   Termina (idle) cuando el cliente sale de la partida. Si el plugin arranca ya en partida no hay contexto y no se muestra nada.
// state.pinned: el usuario tiene fijada una elección para este campeón y rol.
// La UI solo se suscribe (subscribe) y llama a refresh()/simulate()/setOpponent()/setKeystone()/setSpells()/togglePin();
// no conoce ni el LCU ni la API.
//
// Elecciones del usuario (runa clave, hechizos): las de esta selección (`choice`) mandan sobre las fijadas (`pins`).
// Se olvidan al cambiar de campeón o rol y al terminar el Champion Select; las fijadas persisten.

import { ROLE_FILL } from '../domain/lobby.js'
import { log } from '../shared/logger.js'

const enemiesKey = (c) => (c.enemies ?? []).map((e) => e.championId).join(',')
const sameCtx = (a, b) =>
  a === b || (!!a && !!b && a.championId === b.championId && a.opponentChampionId === b.opponentChampionId &&
    a.role === b.role && a.lobbyTier === b.lobbyTier && a.mode === b.mode && a.phase === b.phase && enemiesKey(a) === enemiesKey(b) &&
    a.keystoneOverride === b.keystoneOverride && (a.spellOverride ?? []).join() === (b.spellOverride ?? []).join())

// Lo que solo mira el consejero de picks (aliados con su posición, bans y lado): si es lo único que cambia se avisa a los suscriptores
// SIN volver a consultar la recomendación (Coachless/LoLalytics no dependen de ello).
const extrasKey = (c) => [c.side ?? '', (c.bans ?? []).join(','), (c.allies ?? []).map((a) => a.championId + ':' + a.position).join(',')].join('|')

const loadoutKey = (c) => `${c.championId}|${c.role ?? ROLE_FILL}`
const spellIds = (d) => (d.spells.length === 2 ? d.spells.map((s) => s.spell) : null)
// «Fijado» = hay una elección guardada y es justo lo que se está viendo (si cambias algo, el botón vuelve a ofrecer fijar).
const matchesPin = (pin, d) => !!pin && (pin.keystone == null || pin.keystone === d.keystone.rune) &&
  (pin.spells == null || (spellIds(d) ?? []).join() === pin.spells.join())

/**
 * @param {{provider: import('../domain/match-context.js').MatchContextProvider,
 *          recommend: (ctx:object, o:{premium:boolean,signal:AbortSignal})=>Promise<object>,
 *          isLoggedIn: ()=>boolean, hasPremium: ()=>boolean, debounceMs?: number,
 *          pins?: {get:(champ:number, role:number)=>({keystone:number|null,spells:number[]|null}|null),
 *                  set:(champ:number, role:number, p:object)=>void, remove:(champ:number, role:number)=>void}}} deps
 * debounceMs: espera antes de consultar, para no lanzar una consulta por cada campeón por el que pasa el cursor.
 */
export function createChampSelectController({ provider, recommend, isLoggedIn, hasPremium, debounceMs = 0, pins = null }) {
  const listeners = new Set()
  let state = { status: 'idle', context: null, pinned: false }
  let lcuCtx = null
  let manualCtx = null
  let opponentOverride = null // rival elegido a mano en el panel (manda sobre el detectado)
  let choice = null           // { key, keystone?: number|null, spells?: number[]|null }  null = automático
  let generation = 0
  let abort = null
  let unsubscribe = null

  const setState = (s) => { state = s; for (const cb of [...listeners]) { try { cb(state) } catch (e) { log.error('panel:', e) } } }
  const pinOf = (ctx) => (pins && ctx?.championId ? pins.get(ctx.championId, ctx.role ?? ROLE_FILL) : null)

  // Añade al contexto la runa clave y los hechizos elegidos (a mano o fijados).
  function withLoadout(ctx) {
    if (choice && choice.key !== loadoutKey(ctx)) choice = null
    const pin = pinOf(ctx)
    const keystone = choice && 'keystone' in choice ? choice.keystone : pin?.keystone
    const spells = choice && 'spells' in choice ? choice.spells : pin?.spells
    return { ...ctx, ...(keystone && { keystoneOverride: keystone }), ...(spells && { spellOverride: spells }) }
  }

  async function evaluate({ force = false } = {}) {
    const base = manualCtx ?? lcuCtx
    if (!base) { opponentOverride = null; choice = null } // terminó la selección: la próxima empieza en automático
    let ctx = base && opponentOverride ? { ...base, opponentChampionId: opponentOverride, opponentSource: 'manual' } : base
    if (ctx?.championId) ctx = withLoadout(ctx)
    const prev = state.context
    if (!force && sameCtx(ctx, prev) && state.status !== 'idle') {
      if (ctx && prev && extrasKey(ctx) !== extrasKey(prev)) setState({ ...state, context: ctx })
      return
    }
    // Empieza la partida: se conserva la recomendación que ya había (sin consultar de nuevo: la partida dura y la red puede fallar).
    if (ctx?.phase === 'game' && state.status === 'ready' && prev?.championId === ctx.championId) {
      abort?.abort(); generation++
      return setState({ ...state, context: ctx })
    }
    abort?.abort()
    const gen = ++generation
    const pin = pinOf(ctx)
    const pinned = !!pin

    if (!ctx) return setState({ status: 'idle', context: null, pinned: false })
    if (!ctx.championId) return setState({ status: 'waiting', context: ctx, pinned: false })
    if (!isLoggedIn()) return setState({ status: 'needs-login', context: ctx, pinned })

    // Mientras llega la nueva recomendación del mismo campeón, el panel puede seguir mostrando la anterior (atenuada).
    const last = state.status === 'ready' ? state.data : state.status === 'loading' ? state.stale : undefined
    const stale = last && prev?.championId === ctx.championId ? last : undefined
    setState({ status: 'loading', context: ctx, pinned, ...(stale && { stale }) })
    if (debounceMs > 0) {
      await new Promise((r) => setTimeout(r, debounceMs))
      if (gen !== generation) return
    }
    abort = new AbortController()
    let r
    try { r = await recommend(ctx, { premium: hasPremium(), signal: abort.signal }) }
    catch (e) { log.error('recomendación falló:', String(e)); r = { ok: false, reason: 'network' } }
    if (gen !== generation) return // llegó tarde: el usuario ya cambió de campeón
    // Mientras se consultaba pudo cambiar algo que no reconsulta (un aliado, un ban): el contexto publicado lleva lo último.
    const b = manualCtx ?? lcuCtx
    const fresh = b ? { ...ctx, ...(b.side && { side: b.side }), ...(b.bans && { bans: b.bans }), ...(b.allies && { allies: b.allies }) } : ctx
    if (r.ok) setState({ status: 'ready', context: fresh, data: r.data, pinned: matchesPin(pin, r.data) })
    else if (r.reason === 'aborted') return
    else setState({ status: 'error', context: fresh, reason: r.reason, ...(r.source && { source: r.source }), pinned })
  }

  // Guarda una elección de esta selección (runa clave y/o hechizos) y relanza la consulta.
  function choose(patch) {
    const ctx = state.context
    if (!ctx?.championId) return
    const key = loadoutKey(ctx)
    choice = { ...(choice?.key === key ? choice : {}), key, ...patch }
    return evaluate({ force: true })
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
    /** Elige la runa clave (id) o vuelve a la recomendada (null). */
    setKeystone: (rune) => choose({ keystone: rune || null }),
    /** Elige la pareja de hechizos ([a, b]) o vuelve a la recomendada (null). */
    setSpells: (pair) => choose({ spells: Array.isArray(pair) && pair.length === 2 ? pair : null }),
    /**
     * Fija lo que se está viendo para este campeón y rol (runa clave + hechizos); si ya estaba fijado tal cual, lo suelta.
     * Al soltar, la vista no cambia hasta la próxima selección. Devuelve true si queda fijado.
     */
    togglePin() {
      const ctx = state.context
      if (!pins || state.status !== 'ready' || !ctx?.championId) return false
      const role = ctx.role ?? ROLE_FILL
      const d = state.data
      const ids = spellIds(d)
      if (matchesPin(pins.get(ctx.championId, role), d)) {
        pins.remove(ctx.championId, role)
        choice = { key: loadoutKey(ctx), keystone: d.custom.keystone ? d.keystone.rune : null, spells: d.custom.spells ? ids : null }
        setState({ ...state, pinned: false })
        return false
      }
      pins.set(ctx.championId, role, { keystone: d.keystone.rune, spells: ids })
      setState({ ...state, pinned: true })
      return true
    },
    /** Simula un contexto desde DevTools o el menú (null lo quita y vuelve al Champion Select real). */
    simulate(ctx) { manualCtx = ctx ? { ...ctx, source: 'manual' } : null; return evaluate({ force: true }) },
  }
}
