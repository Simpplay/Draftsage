// draftsage/src/application/pick-filters.js — filtros de la selección de campeones: junta los datos y decide qué campeones se ven
//
// Reúne, para cada campeón, lo que cada fuente sabe de él (clase del cliente, maestría de iTero, nota/matchup/counter de LoLalytics y
// escalado/daño del consejero de iTero) y aplica las reglas de domain/pick-filters.js. Con ello ofrece:
//   · matches(cid)       — ¿cumple los filtros activos? (lo usa la cuadrícula para atenuar al resto);
//   · matchupPicks()     — lista de MATCHUP (LoLalytics): los campeones con mejor win rate contra el rival de tu línea que cumplen los filtros;
//   · draftPicks()       — lista de DRAFT (iTero): los mejores del consejero que cumplen los filtros;
//   · availability()     — qué filtros se pueden evaluar ahora (la interfaz deshabilita el resto).
// No hace peticiones: lee el estado de los demás controladores y re-emite sus cambios para que la interfaz se repinte una sola vez.

import { activeCount, isActive, matches as matchesFilters, normalizePickFilters, toggleClass, unavailableIds } from '../domain/pick-filters.js'

const TOP = 5

/**
 * @param {{catalog:{champion:(id:number)=>{classes?:string[]}}, overlay:{getState:Function, subscribe:Function}, advisor:{getState:Function, subscribe:Function},
 *          mastery:{getState:Function, subscribe:Function, pointsOf:(id:number)=>number|null},
 *          prefs:{get:()=>object, set:(patch:object)=>object}, top?:number, getContext?:()=>object|null}} deps
 *   getContext: contexto actual de Champion Select (bans, aliados y rivales): los campeones no disponibles salen de las dos listas.
 */
export function createPickFilters({ catalog, overlay, advisor, mastery, prefs, top = TOP, getContext = () => null }) {
  const listeners = new Set()
  const offs = []
  let advRef = null
  let advMap = new Map()

  const notify = () => { for (const cb of [...listeners]) { try { cb() } catch { /* una pantalla rota no debe tumbar a las demás */ } } }
  const current = () => normalizePickFilters(prefs.get())

  // Filas del consejero por campeón (se reconstruye solo cuando cambia la respuesta).
  const advRows = () => {
    const rows = advisor.getState().data?.rows
    if (rows !== advRef) { advRef = rows; advMap = new Map((rows ?? []).map((r) => [r.championId, r])) }
    return advMap
  }
  const overlayData = () => overlay.getState().data

  function availability() {
    const ov = overlayData()
    return {
      mastery: mastery.getState().status === 'ready',
      matchup: !!ov?.rival && Object.values(ov.champions).some((c) => c.vs),
      itero: advRows().size > 0,
      meta: !!ov,
    }
  }

  function factsOf(cid) {
    const c = overlayData()?.champions?.[cid]
    const row = advRows().get(cid)
    return {
      classes: catalog.champion(cid).classes ?? [],
      mastery: mastery.pointsOf(cid),
      grade: c?.grade ?? null, vs: c?.vs ?? null, counter: c?.counter ?? null,
      scale: row?.scale ?? null, dmg: row?.dmg ?? null,
    }
  }

  const matches = (cid, f = current(), avail = availability()) => matchesFilters(f, factsOf(cid), avail)
  const set = (patch) => { const next = prefs.set({ ...current(), ...patch }); notify(); return normalizePickFilters(next) }

  return {
    get: current,
    availability,
    isActive: () => isActive(current()),
    activeCount: () => activeCount(current()),
    matches,
    set,
    toggleClass: (cls) => set(toggleClass(current(), cls)),
    reset: () => set({ classes: [], mastery: 'any', matchup: 'any', meta: 'any', phase: 'any', damage: 'any' }),

    /** Lista de MATCHUP (LoLalytics): mejor win rate contra el rival, con muestra suficiente, disponible y que cumple los filtros. [] sin rival o sin datos.
     *  Orden: win rate DEL MATCHUP (no el general); `edge` (ventaja sobre su media en la línea) viaja con cada pick para que la interfaz lo muestre. */
    matchupPicks() {
      const ov = overlayData()
      if (!ov?.rival) return []
      const f = current(), avail = availability(), taken = unavailableIds(getContext())
      return Object.entries(ov.champions)
        .filter(([cid, c]) => c.vs && !c.vs.low && !taken.has(Number(cid)))
        .map(([cid, c]) => ({ cid: Number(cid), wr: c.vs.wr, edge: c.vs.edge, n: c.vs.n, counter: c.counter }))
        .sort((a, b) => b.wr - a.wr)
        .filter((p) => matches(p.cid, f, avail))
        .slice(0, top)
    },

    /** Lista de DRAFT (iTero): los mejores del consejero (ya ordenados), disponibles y que cumplen los filtros. [] si el consejero no tiene datos. */
    draftPicks() {
      const rows = advisor.getState().data?.rows ?? []
      const f = current(), avail = availability(), taken = unavailableIds(getContext())
      return rows.filter((r) => !taken.has(r.championId) && matches(r.championId, f, avail)).slice(0, top)
    },

    subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb) },
    /** Re-emite los cambios de los datos de los que dependen los filtros (maestría, estadísticas de LoLalytics, consejero). */
    start() { if (!offs.length) offs.push(overlay.subscribe(notify), advisor.subscribe(notify), mastery.subscribe(notify)) },
    stop() { while (offs.length) offs.pop()?.() },
  }
}
