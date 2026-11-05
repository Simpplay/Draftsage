// easy-coachless/src/infrastructure/lcu/champ-select-provider.js — MatchContextProvider basado en sondeo del LCU
//
// Implementa la interfaz de domain/match-context.js (getCurrentContext / subscribeToChanges). Se sondea porque en
// Pengu 1.1.6 no hay un socket documentado para plugins; si más adelante se verifica uno, basta con sustituir este
// archivo (nadie más conoce el LCU).
//
// Endpoints (no oficiales, ❓ sin verificar en el cliente real; ver docs/HANDOFF.md):
//   /lol-gameflow/v1/gameflow-phase        → "ChampSelect" | "Lobby" | …
//   /lol-champ-select/v1/session           → myTeam[], theirTeam[], localPlayerCellId, actions[]
//   /lol-ranked/v1/ranked-stats/{puuid}    → queueMap.RANKED_SOLO_5x5.tier
// Rival = jugador del equipo contrario con la misma assignedPosition y campeón ya elegido. Si el cliente no informa
// posiciones, `enemies` lista los rivales revelados y application/recommendation.js deduce el de tu rol.
// Rango de la lobby = media de los rangos conocidos de tu equipo (solo se ven los de tu equipo).

import { log } from '../../shared/logger.js'
import { lobbyTierFromRaw, rawTierFromLcu, roleFromPosition } from '../../domain/lobby.js'

const key = (c) => (c ? [c.championId, c.opponentChampionId ?? 0, c.role, c.lobbyTier ?? 0, c.mode ?? '', (c.enemies ?? []).map((e) => e.championId).join(',')].join('|') : 'null')
const revealed = (list) => (list ?? []).filter((p) => p.championId > 0).map((p) => ({ championId: p.championId, position: p.assignedPosition || '' }))

export function createChampSelectProvider({ lcuGet, activeMs = 1000, idleMs = 2500, rankTimeoutMs = 3000 } = {}) {
  const subs = new Set()
  const rankCache = new Map() // puuid -> número crudo | null (sin rango)
  let timer = null
  let lastKey = 'none'
  let busy = false
  let queue = null // { mode, queueId } de la partida en curso (se pide una vez por Champion Select)

  // Modo de juego (CLASSIC, ARAM, CHERRY…): decide qué hechizos tienen sentido (domain/spells.js). Opcional: si falla, no se filtra por modo.
  async function queueOf() {
    if (queue) return queue
    const q = (await lcuGet('/lol-gameflow/v1/session'))?.gameData?.queue
    if (q && typeof q.gameMode === 'string') queue = { mode: q.gameMode.toUpperCase(), ...(Number.isInteger(q.id) && { queueId: q.id }) }
    return queue
  }

  async function rawTierOf(puuid) {
    if (rankCache.has(puuid)) return rankCache.get(puuid)
    const d = await lcuGet(`/lol-ranked/v1/ranked-stats/${encodeURIComponent(puuid)}`)
    if (!d) return undefined // fallo puntual: no cachear
    const q = d.queueMap ?? {}
    const tier = q.RANKED_SOLO_5x5?.tier || q.RANKED_FLEX_SR?.tier || d.highestRankedEntry?.tier
    const raw = rawTierFromLcu(tier)
    rankCache.set(puuid, raw)
    return raw
  }

  async function lobbyTierOf(session) {
    const puuids = (session.myTeam ?? []).map((p) => p.puuid).filter(Boolean)
    if (!puuids.length) return undefined
    const all = Promise.all(puuids.map(rawTierOf))
    const raws = await Promise.race([all, new Promise((r) => setTimeout(() => r([]), rankTimeoutMs))])
    return lobbyTierFromRaw(raws.filter((x) => x != null))
  }

  async function buildContext(session) {
    const me = (session.myTeam ?? []).find((p) => p.cellId === session.localPlayerCellId)
    if (!me) return null
    // Campeón: el ya elegido; si aún pasa el cursor por uno, la acción en curso; por último la intención declarada.
    const hover = (session.actions ?? []).flat().find((a) => a.actorCellId === session.localPlayerCellId && a.type === 'pick' && a.championId)?.championId
    const championId = me.championId || hover || me.championPickIntent || 0
    const position = me.assignedPosition || ''
    const opponent = position
      ? (session.theirTeam ?? []).find((p) => p.assignedPosition === position && p.championId > 0)?.championId
      : undefined
    const [lobbyTier, q] = championId ? await Promise.all([lobbyTierOf(session), queueOf()]) : [undefined, null]
    // enemies = todos los rivales ya revelados (aunque el cliente no informe su posición); allies = tus compañeros.
    return {
      championId, ...(opponent && { opponentChampionId: opponent }), role: roleFromPosition(position), ...(lobbyTier && { lobbyTier }), ...(q && { mode: q.mode }),
      enemies: revealed(session.theirTeam), allies: revealed((session.myTeam ?? []).filter((p) => p.cellId !== me.cellId)), source: 'lcu',
    }
  }

  async function getCurrentContext() {
    const phase = await lcuGet('/lol-gameflow/v1/gameflow-phase')
    if (phase !== 'ChampSelect') { queue = null; return null }
    const session = await lcuGet('/lol-champ-select/v1/session')
    return session ? buildContext(session) : null
  }

  async function tick() {
    if (busy) return
    busy = true
    let ctx = null
    try { ctx = await getCurrentContext() } catch (e) { log.warn('Champion Select: error leyendo el contexto', String(e)) }
    busy = false
    const k = key(ctx)
    if (k !== lastKey) {
      lastKey = k
      log.info('contexto:', ctx ? JSON.stringify(ctx) : 'sin Champion Select')
      for (const cb of [...subs]) { try { cb(ctx) } catch (e) { log.error('suscriptor:', e) } }
    }
    if (subs.size) timer = setTimeout(tick, ctx ? activeMs : idleMs)
  }

  return {
    getCurrentContext,
    subscribeToChanges(cb) {
      subs.add(cb)
      if (subs.size === 1) { lastKey = 'none'; timer = setTimeout(tick, 0) }
      return () => {
        subs.delete(cb)
        if (!subs.size) { clearTimeout(timer); timer = null }
      }
    },
  }
}
