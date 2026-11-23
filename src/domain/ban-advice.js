// draftsage/src/domain/ban-advice.js — qué banear en Clash (reglas puras, explicables). Diseño: docs/CLASH-BANS.md §4.
//
// Para cada jugador rival p y campeón c de su pool reciente:
//   f(p,c)    fuerza = win rate encogido hacia el meta + bonus por familiaridad (puntos de maestría relativos al jugador).
//   drop(p,c) = max(0, f(p,c) − mejor f de p entre los demás campeones disponibles, y nunca por debajo del win rate medio) → lo que PIERDE si se lo banean.
//   u(p,c)    probabilidad de uso entre los disponibles: media de su cuota de maestría reciente y su cuota de partidas de temporada.
//   V(c)      = Σ_p u(p,c) · drop(p,c)  → ranking. (Σ y no máximo: decisión del 2026-11-23; ver MODEL.)
// Sin pesos mágicos escondidos: todas las constantes están en MODEL. Cada resultado trae su evidencia con el origen (dato / modelo).
// NO modela todavía las líneas de cada rival (en Clash llegan como FILL): ver docs/CLASH-BANS.md Fase 4.

export const MODEL = {
  k: 10,              // partidas «virtuales» al win rate del meta para encoger muestras pequeñas (1 partida al 100 % no vale 100 %)
  recencyDays: 45,    // solo cuentan campeones jugados en los últimos N días
  minPoints: 3000,    // y con al menos estos puntos de maestría
  famBonus: 3,        // puntos de win rate que puede aportar la familiaridad (el campeón con más puntos del jugador)
  poolSize: 8,        // campeones considerados por jugador (los de más puntos recientes)
  defaultWr: 50,      // win rate medio supuesto cuando no hay meta
  minSeasonGames: 5,  // partidas de temporada para fiarse del dato
  oneTrickShare: 0.5, // u ≥ esto → «one-trick»…
  oneTrickMinPool: 3, // …pero solo si hay al menos estos campeones disponibles (con 1–2 es «datos escasos», no un one-trick)
  overlapShare: 0.15, // u ≥ esto en ≥ 2 jugadores → «solapamiento»
  highBanRate: 10,    // % de ban del meta para la etiqueta «muy baneado»
  limit: 10,
}

const DAY = 864e5
const r3 = (x) => Math.round(x * 1000) / 1000
const sum = (a) => a.reduce((s, x) => s + x, 0)

/**
 * @param {{players:object[], unavailable?:Iterable<number>, meta?:(cid:number)=>({wr?:number|null, br?:number|null}|null), now?:number, model?:object}} ctx
 *   player = { pool:[{cid,level,points,lastPlay|null}], topMasteries:[{cid,level,points}], seasonChamps:[{cid,games,wins}], clashPicks:[{cid,win}] }
 */
function analyze(ctx) {
  const M = { ...MODEL, ...(ctx.model ?? {}) }
  const now = Number.isFinite(ctx.now) ? ctx.now : Date.now()
  const gone = new Set(ctx.unavailable ?? [])
  const meta = ctx.meta ?? (() => null)
  const base = (cid) => { const w = meta(cid)?.wr; return Number.isFinite(w) ? w : M.defaultWr }

  return (ctx.players ?? []).map((p, playerIdx) => {
    // 1) campeones con puntos: pool reciente; si no hay pool (o nada reciente), los 5 mejores de maestría marcados como «sin recencia».
    let stale = false
    let pts = (p.pool ?? []).filter((m) => m.lastPlay != null && m.lastPlay >= now - M.recencyDays * DAY && m.points >= M.minPoints)
    if (!pts.length) { pts = (p.topMasteries ?? []).map((m) => ({ ...m, lastPlay: null })); stale = true }
    pts = [...pts].sort((a, b) => b.points - a.points).slice(0, M.poolSize)
    const points = new Map(pts.map((m) => [m.cid, m]))
    // 2) muestra de temporada + picks de este Clash (cuentan como partidas)
    const season = new Map()
    const add = (cid, games, wins, from) => { const e = season.get(cid) ?? { games: 0, wins: 0, clash: 0, clashWins: 0 }; e.games += games; e.wins += wins; if (from === 'clash') { e.clash += games; e.clashWins += wins } season.set(cid, e) }
    for (const s of p.seasonChamps ?? []) add(s.cid, s.games, s.wins, 'season')
    for (const c of p.clashPicks ?? []) add(c.cid, 1, c.win ? 1 : 0, 'clash')
    // 3) candidatos disponibles
    const cids = [...new Set([...points.keys(), ...season.keys()])].filter((c) => !gone.has(c))
    const maxPts = Math.max(0, ...[...points.values()].map((m) => m.points))
    const sumPts = sum(cids.map((c) => points.get(c)?.points ?? 0))
    const sumGames = sum(cids.map((c) => season.get(c)?.games ?? 0))
    const raw = cids.map((c) => {
      const parts = []
      if (sumPts > 0) parts.push((points.get(c)?.points ?? 0) / sumPts)
      if (sumGames > 0) parts.push((season.get(c)?.games ?? 0) / sumGames)
      return parts.length ? sum(parts) / parts.length : 0
    })
    const total = sum(raw)
    const rows = cids.map((cid, i) => {
      const s = season.get(cid)
      const b = base(cid)
      const shrunk = s ? ((s.wins + (M.k * b) / 100) / (s.games + M.k)) * 100 : b
      const fam = maxPts > 0 ? M.famBonus * Math.min(1, (points.get(cid)?.points ?? 0) / maxPts) : 0
      return { cid, usage: total > 0 ? raw[i] / total : 0, strength: shrunk + fam, shrunk, fam, season: s ?? null, mastery: points.get(cid) ?? null }
    })
    for (const r of rows) {
      const alt = Math.max(M.defaultWr, ...rows.filter((o) => o.cid !== r.cid).map((o) => o.strength))
      r.drop = Math.max(0, r.strength - alt)
    }
    return { playerIdx, rows, stale, hasPool: (p.pool ?? []).length > 0 }
  })
}

const evidenceOf = (r, stale, now) => {
  const ev = []
  if (r.season?.games - r.season?.clash > 0) ev.push({ kind: 'dato', key: 'season', games: r.season.games - r.season.clash, wins: r.season.wins - r.season.clashWins })
  if (r.season?.clash > 0) ev.push({ kind: 'dato', key: 'clash', games: r.season.clash, wins: r.season.clashWins })
  if (r.mastery) ev.push({ kind: 'dato', key: 'mastery', points: r.mastery.points, level: r.mastery.level, days: r.mastery.lastPlay != null ? Math.max(0, Math.round((now - r.mastery.lastPlay) / DAY)) : null, stale })
  ev.push({ kind: 'modelo', key: 'strength', wr: r3(r.strength), shrunk: r3(r.shrunk), drop: r3(r.drop) })
  return ev
}

/**
 * Ranking de bans. Excluye `unavailable` (baneados y ya elegidos). Orden: valor desc, ban rate del meta desc, id asc (determinista).
 * @returns {{championId:number, value:number, perPlayer:{playerIdx:number, drop:number, usage:number, strength:number, evidence:object[]}[],
 *            reliability:'high'|'medium'|'low', tags:string[]}[]}
 */
export function rankBans(ctx) {
  const M = { ...MODEL, ...(ctx.model ?? {}) }
  const now = Number.isFinite(ctx.now) ? ctx.now : Date.now()
  const meta = ctx.meta ?? (() => null)
  const byChamp = new Map()
  for (const pl of analyze(ctx)) {
    for (const r of pl.rows) {
      if (r.usage <= 0) continue
      const e = byChamp.get(r.cid) ?? []
      e.push({ pl, r }); byChamp.set(r.cid, e)
    }
  }
  const out = []
  for (const [cid, list] of byChamp) {
    const value = sum(list.map(({ r }) => r.usage * r.drop))
    const tags = []
    if (list.some(({ r, pl }) => r.usage >= M.oneTrickShare && pl.rows.length >= M.oneTrickMinPool)) tags.push('one-trick')
    if (list.filter(({ r }) => r.usage >= M.overlapShare).length >= 2) tags.push('overlap')
    const m = meta(cid)
    if (Number.isFinite(m?.br) && m.br >= M.highBanRate) tags.push('high-ban-rate')
    const top = [...list].sort((a, b) => b.r.usage * b.r.drop - a.r.usage * a.r.drop)[0]
    const games = top.r.season?.games ?? 0
    let reliability = games >= M.minSeasonGames && !top.pl.stale ? 'high' : (games > 0 || (top.r.mastery && !top.pl.stale)) ? 'medium' : 'low'
    if (!m && reliability === 'high') reliability = 'medium'
    if (games > 0 && games < M.minSeasonGames) tags.push('low-sample')
    out.push({
      championId: cid, value: r3(value), reliability, tags,
      perPlayer: list.map(({ pl, r }) => ({ playerIdx: pl.playerIdx, drop: r3(r.drop), usage: r3(r.usage), strength: r3(r.strength), evidence: evidenceOf(r, pl.stale, now) }))
        .sort((a, b) => b.usage * b.drop - a.usage * a.drop),
      _br: Number.isFinite(m?.br) ? m.br : 0,
    })
  }
  out.sort((a, b) => b.value - a.value || b._br - a._br || a.championId - b.championId)
  return out.slice(0, M.limit).map(({ _br, ...x }) => x)
}

/**
 * Ficha por jugador: sus 3 campeones más probables, si es one-trick (un campeón con u ≥ oneTrickShare) y la fiabilidad de sus datos.
 * @returns {{playerIdx:number, top:{cid:number, usage:number, games:number, wins:number, points:number|null}[], oneTrick:number|null, reliability:'high'|'medium'|'low'}[]}
 */
export function playerProfiles(ctx) {
  const M = { ...MODEL, ...(ctx.model ?? {}) }
  return analyze({ ...ctx, unavailable: [] }).map((pl) => {
    const rows = [...pl.rows].sort((a, b) => b.usage - a.usage || a.cid - b.cid)
    const games = sum(rows.map((r) => r.season?.games ?? 0))
    const reliability = !rows.length ? 'low' : games >= M.minSeasonGames * 3 && !pl.stale ? 'high' : games > 0 || !pl.stale ? 'medium' : 'low'
    return {
      playerIdx: pl.playerIdx, reliability,
      oneTrick: rows[0] && rows[0].usage >= M.oneTrickShare && rows.length >= M.oneTrickMinPool ? rows[0].cid : null,
      top: rows.slice(0, 3).map((r) => ({ cid: r.cid, usage: r3(r.usage), games: r.season?.games ?? 0, wins: r.season?.wins ?? 0, points: r.mastery?.points ?? null })),
    }
  })
}
