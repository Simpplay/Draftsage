// easy-coachless/src/domain/itero.js — consulta y lectura de la API de iTero (reglas puras, sin red ni DOM)
//
// iTero (itero.gg) recomienda picks evaluando la composición completa. Su simulador usa `POST https://www.itero.gg/api/draft-picks`
// (JSON, sin autenticación): devuelve TODOS los campeones candidatos para tu línea ordenados por probabilidad de victoria prevista,
// con ~150 cifras por candidato. Detalle y comportamientos verificados en docs/ITERO-INTEGRATION.md.
//
// Trampas (todas verificadas con peticiones reales):
//  · un nombre de campeón no reconocido NO da error: se trata en silencio como «hueco vacío». Hay que enviar el nombre inglés exacto
//    (`Wukong`, `Nunu & Willump`, `Renata Glasc`…) → `findUnrecognized` lo comprueba tras la respuesta;
//  · las predicciones absolutas están infladas y dependen del lado, el rango y el peso de maestría → solo se usan las RELATIVAS
//    dentro de una misma respuesta (nunca se enseña `result_pred` como «% de victoria»);
//  · la respuesta pesa ~1,7 MB → `normalizeResponse` se queda con lo mínimo (~400 B por candidato).

export const ENDPOINT = 'https://www.itero.gg/api/draft-picks'
/** Líneas de iTero; el índice coincide con el `role` de Coachless (0 Top … 4 Support). */
export const LANES = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY']
export const PHASES = ['early', 'mid', 'late']
/** Franjas de Elo que acepta (cualquier otro valor da HTTP 500). Índice = escala cruda de domain/lobby.js (Iron 0 … Master+ 7). */
export const RANK_CLASSES = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER+']
export const DEFAULT_RANK_CLASS = 'EMERALD'
/** Modos en los que el modelo (5 líneas) no aplica. */
const UNSUPPORTED_MODES = new Set(['ARAM', 'KIWI', 'CHERRY'])

export const laneOfRole = (role) => (Number.isInteger(role) && role >= 0 && role <= 4 ? LANES[role] : null)
export const laneOfPosition = (position) => {
  const p = String(position ?? '').toUpperCase()
  return LANES.includes(p) ? p : null // el LCU usa top/jungle/middle/bottom/utility
}
export const supportsMode = (mode) => !UNSUPPORTED_MODES.has(String(mode ?? '').toUpperCase())

/** Lado del LCU (`myTeam[].team`: 1 azul, 2 rojo) → 'Blue' | 'Red' | null. */
export const sideOfTeam = (team) => (team === 1 ? 'Blue' : team === 2 ? 'Red' : null)

/** Rango (3 Gold … 7 Master+ de domain/lobby.js, que coincide con la escala cruda) → franja de iTero. Sin dato → DEFAULT_RANK_CLASS. */
export function rankClassOf(tier) {
  return Number.isInteger(tier) && tier >= 0 && tier < RANK_CLASSES.length ? RANK_CLASSES[tier] : DEFAULT_RANK_CLASS
}
/** Rangos resueltos (contiguos, ver filters.resolveTiers) → UNA franja: la central (a igual distancia, la alta). */
export function rankClassOfTiers(tiers) {
  const t = (tiers ?? []).filter(Number.isInteger)
  return t.length ? rankClassOf(t[Math.floor(t.length / 2)]) : DEFAULT_RANK_CLASS
}
/**
 * Franja que se consulta: el rango elegido a mano (su central) o, en automático, el de la lobby tal cual
 * (el ±1 de Coachless es para ganar muestra; iTero solo admite una franja). Sin dato → Esmeralda.
 * @param {{tiers:number[], manual:boolean}} resolved  resultado de filters.resolveTiers
 */
export const rankClassFor = (resolved, lobbyTier) => (resolved?.manual ? rankClassOfTiers(resolved.tiers) : rankClassOf(lobbyTier))

/**
 * Cuerpo de la petición. `allies`/`enemies`: { LANE: nombreInglés } con los campeones ya revelados (parciales o vacíos valen).
 * El hueco de TU línea va vacío: así el ranking no está sesgado por lo que tengas ahora. Maestría desactivada (formato sin entender).
 * @param {{lane:string, rankClass:string, side?:string, allies?:Record<string,string>, enemies?:Record<string,string>, bans?:string[], region?:string}} o
 */
export function buildRequest({ lane, rankClass, side = 'Blue', allies = {}, enemies = {}, bans = [], region = 'euw1' }) {
  const teamComp = {}
  for (const l of LANES) {
    if (l !== lane && allies[l]) teamComp[`t1_${l}_champion`] = allies[l]
    if (enemies[l]) teamComp[`t2_${l}_champion`] = enemies[l]
  }
  return {
    region, rankClass, side: side === 'Red' ? 'Red' : 'Blue', lane, masteryData: {}, teamComp,
    bans: [...new Set(bans)].filter(Boolean).sort(), userModelWeightings: { [`t1_${lane}_mastery`]: 0 },
  }
}

/** Clave de caché: todo lo que cambia la respuesta (la composición se ordena por línea). */
export function requestKey(req) {
  const comp = Object.keys(req.teamComp).sort().map((k) => `${k}=${req.teamComp[k]}`).join(',')
  return ['itero', req.rankClass, req.side, req.lane, req.bans.join('/'), comp].join('|')
}

/** Nombres de campeón enviados en la petición (para validarlos tras la respuesta). */
export const sentNames = (req) => Object.values(req.teamComp)

const KEY = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * «1.08x» → 1.08 · «+365 G» → 365 · «60.1%» → 60.1 · «2k» → 2000. Los números normales también valen;
 * todo lo demás (null, {}, texto, otras unidades) da null. Nunca lanza.
 */
export function parseNum(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v !== 'string') return null
  const m = /^\s*([+-]?\d+(?:\.\d+)?)\s*(x|%|G|k)?\s*$/i.exec(v)
  if (!m) return null
  const n = Number(m[1])
  return (m[2]?.toLowerCase() === 'k' ? n * 1000 : n) + 0 // «+ 0»: «-0.00x» sale 0, no -0
}

const num = (x) => parseNum(x)
const round = (x, d = 2) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d)

/** Fila de la respuesta → lo mínimo que usa el consejero. null si no trae lo imprescindible. */
export function normalizeCandidate(raw, lane) {
  if (!raw || typeof raw.champion !== 'string' || !raw.champion) return null
  const pred = num(raw.result_pred)
  if (pred == null) return null
  const player = raw.stats?.player ?? {}
  const t1d = raw.stats?.t1?.damage ?? {}
  const t1s = raw.stats?.t1?.scaling ?? {}
  const syn = {}, ctr = {}
  for (const l of LANES) {
    if (l !== lane) { const v = num(player[`t1_syn_LANE_${l}_wr`]); if (v != null) syn[l] = v }
    const c = num(player[`t1_counter_LANE_${l}_wr`]); if (c != null) ctr[l] = c
  }
  const scale = {}
  for (const p of PHASES) { const v = num(t1s[`t1_${p}_wr_adj_diff`]); if (v != null) scale[p] = round(v, 3) }
  return {
    name: raw.champion, pred, rating: num(raw.result_pred_rating), laning: num(raw.laning_pred_rating),
    count: num(raw.champ_count) ?? 0, pick: num(raw.pick_perc) ?? 0,
    champWr: num(player.t1_LANE_champ_wr), predGold: num(player.t1_LANE_pred_gold),
    synAvg: num(player.t1_LANE_syn_avg), ctrAvg: num(player.t1_LANE_counter_avg), syn, ctr, scale,
    adRatio: num(t1d.t1_ad_ratio), adRatioVar: num(t1d.t1_ad_ratio_without_player_var),
  }
}

/**
 * Valida la forma y recorta. { ok:true, candidates } | { ok:false, reason:'shape' }.
 * Exige un array con al menos `min` filas válidas (una respuesta casi vacía = el esquema cambió o la petición fue inválida).
 */
export function normalizeResponse(raw, lane, { min = 20 } = {}) {
  if (!Array.isArray(raw) || !raw.length) return { ok: false, reason: 'shape' }
  const candidates = []
  for (const r of raw) { const c = normalizeCandidate(r, lane); if (c) candidates.push(c) }
  return candidates.length >= min && candidates.length >= raw.length * 0.9 ? { ok: true, candidates } : { ok: false, reason: 'shape' }
}

/**
 * Nombres enviados que iTero NO reconoció. Un campeón ya elegido desaparece de los candidatos; si su nombre aparece (aunque sea con
 * otra grafía, p. ej. `malzahar` → `Malzahar`) es que el servidor lo trató como hueco vacío. Los de TU línea no se comprueban.
 * (No detecta un nombre que no se parece a ningún candidato: eso lo evita `names` enviando solo nombres de Data Dragon.)
 */
export function findUnrecognized(req, candidates) {
  const present = new Set(candidates.map((c) => KEY(c.name)))
  return Object.entries(req.teamComp).filter(([, name]) => present.has(KEY(name))).map(([, name]) => name)
}

/** Nombre inglés → clave comparable (sin signos ni mayúsculas) para casar con `names`. */
export const nameKey = KEY
