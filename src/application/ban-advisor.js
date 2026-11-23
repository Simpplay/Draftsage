// draftsage/src/application/ban-advisor.js — consejero de bans de Clash (scouting del rival + meta de LoLalytics)
//
// Dos piezas, como overlay.js:
//  · createBanAdvisor: { tag? } → datos. Pide el scouting al proveedor del LCU (infrastructure/lcu/clash-provider.js), el meta (win rate y ban rate
//    de cada campeón, de las listas de tier de LoLalytics en el rango medio del roster rival) y aplica domain/ban-advice.js. El meta es opcional:
//    si LoLalytics falla, el ranking sale igual (con fiabilidad máxima «media»).
//  · createBanAdvisorController: estado { status, data, tag, reason } que pinta presentation/components/scouting.js. La interfaz indica QUÉ roster se
//    está viendo (`target(tag)`) y el controlador cancela lo obsoleto (generación) y no repite la misma consulta.
// Solo MUESTRA: nunca banea ni elige nada.

import { rankBans, playerProfiles } from '../domain/ban-advice.js'
import { averageTier } from '../domain/clash.js'
import { LANES, tierParam } from '../domain/lolalytics.js'
import { resolveTiers } from '../domain/filters.js'
import { statsOfTierRow } from '../domain/overlay-stats.js'

/**
 * @param {{clash:{getScoutingContext:Function}, lola?:{tierlist:Function}, getFilters?:()=>object, now?:()=>number, log?:object}} deps
 */
export function createBanAdvisor({ clash, lola = null, getFilters = () => undefined, now = () => Date.now(), log = null }) {
  // Meta por campeón: de las 5 listas de tier, la línea donde más se juega (más partidas). Cacheado por el cliente de LoLalytics (2 h).
  async function loadMeta(lobbyTier) {
    if (!lola) return null
    try {
      const { tiers } = resolveTiers(getFilters(), lobbyTier)
      const tp = tierParam(tiers)
      const lists = await Promise.all(LANES.map((lane) => lola.tierlist({ lane, tier: tp.param })))
      const best = new Map()
      for (const l of lists) {
        if (!l?.ok) continue
        for (const [cid, row] of l.data.rows) {
          const s = statsOfTierRow(row)
          if (s && (!best.has(cid) || s.games > best.get(cid).games)) best.set(cid, s)
        }
      }
      return best.size ? best : null
    } catch (e) { log?.warn('bans: no se pudo leer el meta', String(e)); return null }
  }

  /** @returns {Promise<{ok:true, data:object}|{ok:false, reason:string}>} */
  async function advise({ tag = null, rosterId = null, unavailable = [] } = {}) {
    const sc = await clash.getScoutingContext({ tag, rosterId })
    if (!sc.ok) return sc
    const players = sc.data.players
    const metaMap = await loadMeta(averageTier(players.map((p) => p.rank)))
    const ctx = { players, unavailable, now: now(), meta: metaMap ? (cid) => metaOf(metaMap, cid) : null }
    const bans = rankBans(ctx)
    const profiles = playerProfiles(ctx)
    log?.info('bans: recomendación', JSON.stringify({ jugadores: players.length, bans: bans.length, meta: !!metaMap, parcial: sc.data.partial }))
    return {
      ok: true,
      data: {
        team: { shortName: sc.data.shortName, name: sc.data.name }, partial: sc.data.partial, hasMeta: !!metaMap, fetchedAt: sc.data.fetchedAt,
        players: players.map((p, i) => ({ name: p.gameName, rank: p.rank, ...profiles[i] })), bans,
      },
    }
  }
  return { advise }
}
const metaOf = (m, cid) => { const s = m.get(cid); return s ? { wr: s.wr, br: s.br } : null }

/**
 * @param {{advisor:{advise:Function}, prefs:{get:()=>{enabled:boolean}, set:(p:object)=>object}, debounceMs?:number, log?:object}} deps
 */
export function createBanAdvisorController({ advisor, prefs, debounceMs = 150, log = null }) {
  const listeners = new Set()
  let state = { status: 'idle', data: null, tag: null }
  let generation = 0
  let wanted = null // el roster que la interfaz está viendo (se recuerda aunque el ajuste esté apagado)

  const setState = (s) => { state = s; for (const cb of [...listeners]) { try { cb(state) } catch (e) { log?.error('bans:', e) } } }

  async function run(tag, { force = false } = {}) {
    if (!force && tag === state.tag && state.status !== 'idle') return
    const gen = ++generation
    if (!tag || !prefs.get().enabled) { if (state.status !== 'idle') setState({ status: 'idle', data: null, tag: null }); return }
    setState({ status: 'loading', data: tag === state.tag ? state.data : null, tag })
    if (debounceMs > 0) { await new Promise((r) => setTimeout(r, debounceMs)); if (gen !== generation) return }
    let r
    try { r = await advisor.advise({ tag }) } catch (e) { log?.error('bans fallaron:', String(e)); r = { ok: false, reason: 'error' } }
    if (gen !== generation) return
    if (r.ok) setState({ status: 'ready', data: r.data, tag })
    else setState({ status: 'error', data: null, tag, reason: r.reason }) // se reintenta al volver a abrir el modal (target(null) y de nuevo target(tag))
  }

  return {
    getState: () => state,
    subscribe(cb) { listeners.add(cb); cb(state); return () => listeners.delete(cb) },
    /** La interfaz indica qué roster se está viendo (tag) o null si no hay modal de scouting. */
    target(tag) { wanted = tag ? String(tag).trim() : null; return run(wanted) },
    refresh: () => run(wanted, { force: true }),
    isEnabled: () => prefs.get().enabled,
    setEnabled(on) { prefs.set({ enabled: !!on }); return run(wanted, { force: true }) },
  }
}
