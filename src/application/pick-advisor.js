// draftsage/src/application/pick-advisor.js — consejero de picks de DRAFT: iTero (composición completa) → top de campeones
//
// Dos piezas (misma forma que application/overlay.js):
//  · createPickAdvisor: contexto → picks. Coloca a los campeones revelados en su línea (domain/pick-advice.js assignLanes; los rivales casi
//    nunca traen posición y se deducen con la cuota de línea de las listas de tier de LoLalytics, o llevan la línea que eligió el jugador),
//    pide UNA respuesta a iTero (con tu maestría si la activaste, application/mastery.js) y devuelve los mejores. La lista de MATCHUP contra el
//    rival (LoLalytics) es otra y va aparte (application/pick-filters.js); aquí LoLalytics solo marca acuerdo/discrepancia (✓/⚠), no cambia el orden.
//  · createPickAdvisorController: vigila el controlador de Champion Select y mantiene { status, data } para la interfaz.
//
// Reglas: solo MUESTRA (nada se aplica ni se elige solo); si iTero falla o se bloquea, el panel y el resto del plugin siguen igual (estado
// 'error' con la razón); LoLalytics es opcional (sin él, solo iTero); ningún nombre sin mapear llega a iTero (se omite y se avisa); una
// consulta solo cuando cambia la composición, con tope por Champion Select.

import { rankClassFor, buildRequest, laneOfRole, supportsMode, nameKey, iteroRegion } from '../domain/itero.js'
import { assignLanes, rankPicks } from '../domain/pick-advice.js'
import { needsShares } from '../domain/enemy-roles.js'
import { resolveRegions, resolveTiers } from '../domain/filters.js'
import { tierParam } from '../domain/lolalytics.js'
import { loadLaneShares } from './enemy-roles.js'

/**
 * @param {{itero:{draftPicks:Function}, names:{load:Function, name:(id:number)=>string|null, idOf:(n:string)=>number|null},
 *          catalog:{load:Function, champion:(id:number)=>{name:string}, findChampion:(q:string)=>({id:number,name:string}|null)},
 *          lola?:{tierlist:Function}|null, stats?:{load:Function}|null, mastery?:{load:Function, isEnabled:()=>boolean}|null,
 *          getFilters?:()=>object, getPrefs?:()=>{minPick:number, useMastery:boolean, masteryWeight:number}, log?:object}} deps
 *   mastery = application/mastery.js (opcional): si está activada se pide (o reutiliza) antes de consultar a iTero.
 */
export function createPickAdvisor({ itero, names, catalog, lola = null, stats = null, mastery = null, getFilters = () => undefined, getPrefs = () => ({}), log = null }) {
  // Nombre inglés para iTero: Data Dragon; si no está, el del cliente (se valida tras la respuesta con findUnrecognized).
  const nameOf = (id) => names.name(id) ?? (catalog.champion(id)?.name?.startsWith('#') ? null : catalog.champion(id).name)
  const idOf = (name) => {
    const id = names.idOf(name)
    if (id != null) return id
    const c = catalog.findChampion(name)
    return c && nameKey(c.name) === nameKey(name) ? c.id : null
  }

  /**
   * @param {{role?:number, lobbyTier?:number, mode?:string, side?:string, bans?:number[], opponentChampionId?:number|null,
   *          allies?:{championId:number, position?:string}[], enemies?:{championId:number, position?:string}[]}} ctx
   * @returns {Promise<{ok:true, data:object}|{ok:false, reason:string}>}
   *   reason: 'no-lane' | 'mode' | 'network' | 'blocked' | 'http' | 'shape'
   */
  async function advise(ctx) {
    const lane = laneOfRole(ctx?.role)
    if (!lane) return { ok: false, reason: 'no-lane' }
    if (!supportsMode(ctx.mode)) return { ok: false, reason: 'mode' }
    await Promise.all([catalog.load().catch(() => {}), names.load()])

    const resolved = resolveTiers(getFilters(), ctx.lobbyTier)
    const rankClass = rankClassFor(resolved, ctx.lobbyTier)
    const tp = tierParam(resolved.tiers)

    // Líneas de los revelados: solo se piden las listas de tier si algún campeón revelado no trae posición.
    const allies = ctx.allies ?? [], enemies = ctx.enemies ?? []
    const lacksLane = needsShares(allies, {}) || needsShares(enemies, {}) // los rivales con línea elegida a mano ya traen `position`
    const shares = lacksLane ? await loadLaneShares(lola, tp.param) : () => null
    const allyLanes = assignLanes(allies, shares)
    const enemyLanes = assignLanes(enemies, shares)
    delete allyLanes[lane] // tu línea la ocupas tú (o nadie): iTero la deja vacía
    // Rival de tu línea: el colocado en ella o el que ya detectó el controlador (posición del cliente / elegido a mano / simulación).
    const rival = enemyLanes[lane] ?? ctx.opponentChampionId ?? null
    if (rival && !enemyLanes[lane]) enemyLanes[lane] = rival

    const toNames = (byLane) => {
      const out = {}
      for (const [l, cid] of Object.entries(byLane)) {
        const n = nameOf(cid)
        if (n) out[l] = n
        else log?.warn('consejero: sin nombre inglés para el campeón ' + cid + '; se deja como hueco')
      }
      return out
    }
    const bans = (ctx.bans ?? []).map(nameOf).filter(Boolean)
    // Maestría (solo si el jugador la activó): se espera a que cargue; si no hay datos se sigue sin ella, sin molestar.
    const prefs = getPrefs()
    let masteryInfo = null
    if (mastery?.isEnabled()) {
      const m = await mastery.load().catch(() => null)
      if (m?.status === 'ready') masteryInfo = { data: { ...m.points, avg: m.avg }, weight: prefs.masteryWeight }
    }
    // Región: la elegida en Ajustes si es UNA sola (iTero no admite varias); si no, la de siempre (por defecto de buildRequest).
    const region = iteroRegion(resolveRegions(getFilters()).regions)
    const req = buildRequest({ lane, rankClass, side: ctx.side ?? 'Blue', allies: toNames(allyLanes), enemies: toNames(enemyLanes), bans, mastery: masteryInfo, ...(region && { region }) })

    const [it, st] = await Promise.all([
      itero.draftPicks(req),
      stats ? stats.load({ role: ctx.role, lobbyTier: ctx.lobbyTier, enemies, opponentChampionId: rival, opponentSource: 'position' }).catch(() => null) : null,
    ])
    if (!it.ok) return { ok: false, reason: it.reason }

    const reveal = { allyLanes: Object.keys(allyLanes), enemyLanes: Object.keys(enemyLanes) }
    const lanes = { allies: { ...allyLanes }, enemies: { ...enemyLanes } } // { LINEA: campeón }: la interfaz explica con sus retratos
    const r = rankPicks({
      candidates: it.data.candidates, idOf, stats: st?.ok ? st.data : null, reveal, banned: bans,
      options: { ...(prefs.minPick != null && { minPick: prefs.minPick }) },
    })
    const withMastery = req.userModelWeightings[`t1_${lane}_mastery`] > 0
    log?.info('consejero', JSON.stringify({ linea: lane, rango: rankClass, region: req.region, lado: req.side, aliados: reveal.allyLanes, rivales: reveal.enemyLanes, bans: bans.length, pool: r.pool, contraste: r.contrasted, maestria: withMastery, top: r.picks.map((p) => p.name) }))
    return {
      ok: true,
      data: { picks: r.picks, rows: r.rows, meta: { lane, rankClass, region: req.region, regionManual: !!region, side: req.side, sideKnown: !!ctx.side, blended: r.blended, contrasted: r.contrasted, mastery: withMastery, pool: r.pool, rival, unrecognized: it.data.unrecognized, ...lanes } },
    }
  }
  return { advise }
}

/**
 * @param {{advisor:{advise:Function}, source:{getState:Function, subscribe:Function}, prefs:{get:()=>{enabled:boolean}, set:(p:object)=>object},
 *          getFilters?:()=>object, debounceMs?:number, banDebounceMs?:number, maxQueries?:number, log?:object}} deps   source = el controlador de Champion Select
 * Estados: 'idle' (apagado o sin selección) · 'loading' (data = lo anterior, para no parpadear) · 'ready' · 'error' (reason: ver advise).
 */
export function createPickAdvisorController({ advisor, source, prefs, getFilters = () => undefined, debounceMs = 600, banDebounceMs = debounceMs * 5, maxQueries = 12, windowMs = 60000, log = null }) {
  const listeners = new Set()
  let state = { status: 'idle', data: null, key: null }
  let lastKey = null
  let generation = 0
  let stamps = [] // instantes de las consultas REALES a iTero (no cuentan los cambios descartados por el debounce): ventana deslizante
  let limitWarned = false
  let firedBase = null // composición (sin bans) de la última consulta lanzada
  let unsubscribe = null

  const setState = (s) => { state = s; for (const cb of [...listeners]) { try { cb(state) } catch (e) { log?.error('consejero:', e) } } }

  // Qué cambia la respuesta de iTero: línea, rango, lado, bans, quiénes están revelados y su posición, y los ajustes de mezcla.
  function contextOf(st) {
    const c = st.context
    if (!prefs.get().enabled || !c || st.status === 'idle' || c.phase === 'game') return null
    return c
  }
  const ids = (l) => (l ?? []).map((m) => m.championId + ':' + (m.position ?? '')).join(',')
  // Composición sin bans: los bans llegan de uno en uno (hasta 10) y cambian poco la respuesta; si solo cambian ellos, se espera más y se agrupan.
  const baseOf = (c) => [c.role, c.lobbyTier ?? 0, c.side ?? '', ids(c.allies), ids(c.enemies), c.opponentChampionId ?? 0,
    JSON.stringify(getFilters()?.tiers ?? null), JSON.stringify(getFilters()?.regions ?? null), prefs.get().minPick, prefs.get().useMastery ? prefs.get().masteryWeight : 0].join('|')
  const keyOf = (c) => baseOf(c) + '|' + (c.bans ?? []).join(',')

  async function evaluate({ force = false } = {}) {
    const ctx = contextOf(source.getState())
    if (!ctx) { lastKey = null; firedBase = null; limitWarned = false; generation++; stamps = []; if (state.status !== 'idle') setState({ status: 'idle', data: null, key: null }); return }
    const key = keyOf(ctx)
    if (!force && key === lastKey) return
    lastKey = key
    const gen = ++generation
    setState({ status: 'loading', data: state.data, key })
    const base = baseOf(ctx)
    const wait = !force && base === firedBase ? banDebounceMs : debounceMs
    if (wait > 0) { await new Promise((r) => setTimeout(r, wait)); if (gen !== generation) return }
    // Tope por ventana (maxQueries cada windowMs), no por selección entera: si se alcanza se ESPERA a que quede hueco en vez de rendirse,
    // así los últimos picks (los que más importan) siempre se consultan.
    const prune = () => { const t0 = Date.now() - windowMs; stamps = stamps.filter((x) => x > t0) }
    prune()
    if (stamps.length >= maxQueries) {
      if (!limitWarned) { limitWarned = true; log?.warn('consejero: ritmo de consultas alto (' + maxQueries + ' cada ' + Math.round(windowMs / 1000) + ' s); se espera un hueco') }
      await new Promise((r) => setTimeout(r, Math.max(0, stamps[0] + windowMs - Date.now()) + 5))
      if (gen !== generation) return
      prune()
    }
    stamps.push(Date.now())
    firedBase = base
    let r
    try { r = await advisor.advise(ctx) } catch (e) { log?.error('consejero falló:', String(e)); r = { ok: false, reason: 'network' } }
    if (gen !== generation) return
    if (r.ok) setState({ status: 'ready', data: r.data, key })
    else { if (r.reason !== 'no-lane' && r.reason !== 'mode') lastKey = null; setState({ status: 'error', data: null, reason: r.reason, key }) } // en error se reintenta en el siguiente cambio
  }

  return {
    getState: () => state,
    subscribe(cb) { listeners.add(cb); cb(state); return () => listeners.delete(cb) },
    start() { if (!unsubscribe) unsubscribe = source.subscribe(() => { evaluate() }) },
    stop() { unsubscribe?.(); unsubscribe = null; generation++ },
    refresh: () => { stamps = []; limitWarned = false; return evaluate({ force: true }) },
    isEnabled: () => prefs.get().enabled,
    setEnabled(on) { prefs.set({ enabled: !!on }); return evaluate({ force: true }) },
    /** Cambia los ajustes (minPick, useMastery, masteryWeight) y recalcula. */
    configure(patch) { prefs.set(patch); return evaluate({ force: true }) },
  }
}
