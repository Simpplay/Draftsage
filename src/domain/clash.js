// draftsage/src/domain/clash.js — Clash: torneo, bracket, rival y normalización de lo que devuelve el LCU (reglas puras, sin red ni DOM)
//
// Formas verificadas en el cliente 16.23 (docs/CLASH-BANS.md §2). Todo lo que viene del LCU se valida aquí: ante una forma rara se
// devuelve vacío / null, nunca se lanza. No se registran puuids ni nombres.

import { rawTierFromLcu, lobbyTierFromRaw } from './lobby.js'

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const isChamp = (v) => Number.isInteger(v) && v > 0
const same = (a, b) => a != null && b != null && String(a) === String(b)
const arr = (x) => (Array.isArray(x) ? x : [])

/** `tournament-summary` → mi entrada { bracketId, rosterId, state, tournamentId }. Prefiere los estados activos (SCOUTING / IN_GAME). null si no hay. */
export function findMyEntry(summary) {
  const list = arr(summary).filter((e) => e && e.bracketId != null && e.rosterId != null)
  return list.find((e) => e.state === 'SCOUTING' || e.state === 'IN_GAME') ?? list[0] ?? null
}

/**
 * Rival en curso: el otro roster de mi partida del bracket que aún no tiene ganador ni está COMPLETED (la de menor ronda).
 * null si no hay partida pendiente o el rival aún no está definido (id ≤ 0 / ausente).
 * @returns {{rosterId:any, shortName:string, name:string, round:number|null}|null}
 */
export function findOpponent(bracket, myRosterId) {
  const pending = arr(bracket?.matches)
    .filter((m) => m && (same(m.rosterId1, myRosterId) || same(m.rosterId2, myRosterId)) && !(m.winnerId > 0) && m.status !== 'COMPLETED')
    .sort((a, b) => (a.round ?? 0) - (b.round ?? 0) || (a.order ?? 0) - (b.order ?? 0))
  const m = pending[0]
  if (!m) return null
  const other = same(m.rosterId1, myRosterId) ? m.rosterId2 : m.rosterId1
  if (!(Number(other) > 0)) return null
  const r = arr(bracket.rosters).find((x) => same(x.rosterId, other))
  return { rosterId: other, shortName: String(r?.shortName ?? ''), name: String(r?.name ?? ''), round: Number.isFinite(m.round) ? m.round : null }
}

const norm = (s) => String(s ?? '').trim().toLowerCase()

/** Roster del bracket por su tag (`shortName`), sin distinguir mayúsculas (el modal de scouting no expone ids). null si no hay o está duplicado. */
export function rosterByTag(bracket, tag) {
  const t = norm(tag)
  if (!t) return null
  const hits = arr(bracket?.rosters).filter((r) => norm(r?.shortName) === t)
  if (hits.length !== 1) return null
  const r = hits[0]
  return { rosterId: r.rosterId, shortName: String(r.shortName), name: String(r.name ?? '') }
}

/** `scouting/champions` → Map<playerId(summonerId), { topMasteries, seasonChamps, totalMasteryScore }>. El LCU NO respeta el orden pedido: se casa por playerId. */
export function normalizeScouting(list) {
  const out = new Map()
  for (const p of arr(list)) {
    if (!p || p.playerId == null) continue
    out.set(String(p.playerId), {
      topMasteries: arr(p.topMasteries).filter((m) => isChamp(m?.championId)).map((m) => ({ cid: m.championId, level: isNum(m.championLevel) ? m.championLevel : 0, points: isNum(m.championPoints) ? m.championPoints : 0 })),
      seasonChamps: arr(p.topSeasonChampions).filter((m) => isChamp(m?.championId) && isNum(m.gameCount) && m.gameCount > 0)
        .map((m) => ({ cid: m.championId, games: m.gameCount, wins: Math.min(m.gameCount, isNum(m.winCount) ? m.winCount : 0) })),
      totalMasteryScore: isNum(p.totalMasteryScore) ? p.totalMasteryScore : null,
    })
  }
  return out
}

/** `champion-mastery/{puuid}/champion-mastery` → [{cid, level, points, lastPlay(ms)|null}] solo con puntos > 0. */
export function normalizeMastery(list) {
  return arr(list).filter((m) => isChamp(m?.championId) && isNum(m.championPoints) && m.championPoints > 0)
    .map((m) => ({ cid: m.championId, level: isNum(m.championLevel) ? m.championLevel : 0, points: m.championPoints, lastPlay: isNum(m.lastPlayTime) && m.lastPlayTime > 0 ? m.lastPlayTime : null }))
}

/** `ranked/v2/tiers` → Map<summonerId, {solo, flex}> con { tier:'DIAMOND', division } o null. */
export function normalizeTiers(list) {
  const out = new Map()
  for (const p of arr(list)) {
    if (!p || p.summonerId == null) continue
    const get = (q) => { const t = arr(p.achievedTiers).find((x) => x?.queueType === q); return t?.tier ? { tier: String(t.tier).toUpperCase(), division: t.division ?? null } : null }
    out.set(String(p.summonerId), { solo: get('RANKED_SOLO_5x5'), flex: get('RANKED_FLEX_SR') })
  }
  return out
}

/**
 * `roster/{id}/stats` → picks ya jugados en este Clash por los jugadores `summonerIds`: [{cid, win}] (win desde SU punto de vista).
 * `ownRoster` = true si las estadísticas son del roster de esos jugadores (`win` ya es suyo); si son del equipo contrario, se invierte.
 */
export function clashPicks(stats, summonerIds, { ownRoster = true } = {}) {
  const ids = new Set(arr(summonerIds).map(String))
  const out = []
  for (const per of arr(stats?.periodStats)) {
    for (const m of arr(per?.matchStats)) {
      for (const [sid, cid] of Object.entries(m?.playerChampionIds ?? {})) {
        if (ids.has(String(sid)) && isChamp(cid)) out.push({ summonerId: String(sid), cid, win: ownRoster ? !!m.win : !m.win })
      }
    }
  }
  return out
}

/** Rango medio de un grupo de jugadores (rangos de `normalizeTiers`) → rango de Coachless 3..7, o undefined si no hay ninguno. */
export function averageTier(ranks) {
  const raws = arr(ranks).map((r) => rawTierFromLcu((r?.solo ?? r?.flex)?.tier)).filter((x) => x != null)
  return lobbyTierFromRaw(raws)
}
