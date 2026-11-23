// draftsage/src/infrastructure/lcu/clash-provider.js — datos de scouting de Clash desde el LCU (solo lectura)
//
// Interfaz: getScoutingContext({ tag?, rosterId? }) → { ok:true, data } | { ok:false, reason }. Nunca lanza.
// Endpoints (no oficiales; verificados en el cliente 16.23, docs/CLASH-BANS.md §2): tournament-summary → bracket/{id} → roster/{id} → summoners →
// en paralelo ranked/v2/tiers, scouting/champions, champion-mastery/{puuid} ×5 y roster/{id}/stats (opcional).
// Degrada por partes: sin maestría, solo temporada; sin stats, sin picks de Clash. Caché por roster (en memoria) con petición compartida.
// Privacidad: no se registran puuids, ids ni nombres (solo contadores y duraciones). Nada se guarda en disco.
//
// reason: 'no-tournament' | 'no-bracket' | 'no-opponent' | 'own-roster' | 'no-roster' | 'no-players'

import { findMyEntry, findOpponent, rosterByTag, normalizeScouting, normalizeMastery, normalizeTiers, clashPicks } from '../../domain/clash.js'

const C = '/lol-clash/v1'
const q = (v) => encodeURIComponent(JSON.stringify(v))
const arr = (x) => (Array.isArray(x) ? x : [])

/** @param {{lcuGet:(path:string, o?:{timeoutMs?:number})=>Promise<any>, now?:()=>number, ttlMs?:number, log?:object}} deps */
export function createClashProvider({ lcuGet, now = () => Date.now(), ttlMs = 10 * 60 * 1000, log = null }) {
  const cache = new Map() // rosterId → { at, value }
  const inflight = new Map()

  async function build({ entry, bracket, target }) {
    const t0 = now()
    const roster = await lcuGet(`${C}/roster/${encodeURIComponent(target.rosterId)}`)
    const members = arr(roster?.members).filter((m) => m?.summonerId != null)
    if (!members.length) return { ok: false, reason: 'no-roster' }
    const ids = members.map((m) => m.summonerId)
    const summoners = arr(await lcuGet(`/lol-summoner/v2/summoners?ids=${q(ids)}`))
    const bySid = new Map(summoners.filter((s) => s?.summonerId != null && s.puuid).map((s) => [String(s.summonerId), s]))
    const withPuuid = ids.filter((id) => bySid.has(String(id)))
    if (!withPuuid.length) return { ok: false, reason: 'no-players' }
    const puuids = withPuuid.map((id) => bySid.get(String(id)).puuid)

    const [tiersRaw, scoutRaw, stats, ...masteries] = await Promise.all([
      lcuGet(`/lol-ranked/v2/tiers?summonerIds=${q(withPuuid)}&queueTypes=${q(['RANKED_SOLO_5x5', 'RANKED_FLEX_SR'])}`),
      lcuGet(`${C}/scouting/champions?puuids=${q(puuids)}`),
      lcuGet(`${C}/roster/${encodeURIComponent(target.rosterId)}/stats`),
      ...puuids.map((pu) => lcuGet(`/lol-champion-mastery/v1/${encodeURIComponent(pu)}/champion-mastery`, { timeoutMs: 8000 })),
    ])
    const tiers = normalizeTiers(tiersRaw)
    const scout = normalizeScouting(scoutRaw)
    const picks = clashPicks(stats, withPuuid, { ownRoster: true })
    const partial = []
    if (!tiersRaw) partial.push('ranks')
    if (!scoutRaw) partial.push('scouting')
    if (masteries.every((m) => m == null)) partial.push('mastery')
    if (!stats) partial.push('stats')

    const players = withPuuid.map((sid, i) => {
      const s = scout.get(String(sid))
      const tr = tiers.get(String(sid))
      return {
        summonerId: sid, gameName: String(bySid.get(String(sid)).gameName ?? ''), // solo en memoria; nunca se registra
        rank: { solo: tr?.solo ?? null, flex: tr?.flex ?? null },
        topMasteries: s?.topMasteries ?? [], seasonChamps: s?.seasonChamps ?? [], totalMasteryScore: s?.totalMasteryScore ?? null,
        pool: normalizeMastery(masteries[i]),
        clashPicks: picks.filter((p) => p.summonerId === String(sid)).map(({ cid, win }) => ({ cid, win })),
      }
    })
    const ms = now() - t0
    log?.info('clash: roster cargado', JSON.stringify({ jugadores: players.length, parcial: partial, ms }))
    return { ok: true, data: { rosterId: target.rosterId, shortName: target.shortName, name: target.name, myRosterId: entry.rosterId, players, partial, fetchedAt: now() } }
  }

  async function resolve(opts) {
    const entry = findMyEntry(await lcuGet(`${C}/tournament-summary`))
    if (!entry) return { ok: false, reason: 'no-tournament' }
    const bracket = await lcuGet(`${C}/bracket/${encodeURIComponent(entry.bracketId)}`)
    if (!bracket) return { ok: false, reason: 'no-bracket' }
    let target = null
    if (opts.tag) target = rosterByTag(bracket, opts.tag)
    else if (opts.rosterId != null) target = arr(bracket.rosters).find((r) => String(r.rosterId) === String(opts.rosterId)) ?? null
    else target = findOpponent(bracket, entry.rosterId)
    if (!target) return { ok: false, reason: opts.tag || opts.rosterId != null ? 'no-roster' : 'no-opponent' }
    if (String(target.rosterId) === String(entry.rosterId)) return { ok: false, reason: 'own-roster' }
    const key = String(target.rosterId)
    const hit = cache.get(key)
    if (hit && now() - hit.at < ttlMs) return hit.value
    if (inflight.has(key)) return inflight.get(key)
    const p = build({ entry, bracket, target }).then((v) => { if (v.ok) cache.set(key, { at: now(), value: v }); return v }).finally(() => inflight.delete(key))
    inflight.set(key, p)
    return p
  }

  return {
    async getScoutingContext(opts = {}) {
      try { return await resolve(opts) } catch (e) { log?.warn('clash: error leyendo el scouting', String(e)); return { ok: false, reason: 'error' } }
    },
    clear: () => cache.clear(),
  }
}
