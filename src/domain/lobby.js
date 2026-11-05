// easy-coachless/src/domain/lobby.js — roles y rangos de la lobby (reglas puras, sin DOM ni red)
//
// Verificado contra la API de Coachless (2026-11-05): role 0 Top · 1 Jungla · 2 Mid · 3 ADC · 4 Support · 5 «cualquiera»
// (el servidor resuelve 5 al rol principal del campeón). leagueTiers: 3 Gold … 7 Master+; 0–2 devuelven vacío.

export const ROLE_FILL = 5
export const ROLE_NAMES = ['Top', 'Jungla', 'Mid', 'ADC', 'Support', 'Cualquiera']
const POSITION_TO_ROLE = { top: 0, jungle: 1, middle: 2, bottom: 3, utility: 4 }

/** assignedPosition del LCU ('top','jungle','middle','bottom','utility','') → role de Coachless. */
export const roleFromPosition = (position) => POSITION_TO_ROLE[String(position ?? '').toLowerCase()] ?? ROLE_FILL

export const MIN_TIER = 3
export const MAX_TIER = 7
export const DEFAULT_TIERS = [5, 6, 7] // Emerald+ (el valor por defecto de la web)
export const TIER_NAMES = { 3: 'Gold', 4: 'Platino', 5: 'Esmeralda', 6: 'Diamante', 7: 'Master+' }

// Escala "cruda" para promediar: Iron 0 … Diamond 6, Master/Grandmaster/Challenger 7 (= Master+ de Coachless).
const RAW_TIER = { IRON: 0, BRONZE: 1, SILVER: 2, GOLD: 3, PLATINUM: 4, EMERALD: 5, DIAMOND: 6, MASTER: 7, GRANDMASTER: 7, CHALLENGER: 7 }

/** Nombre de liga del LCU ('GOLD') → número crudo, o null si no tiene rango. */
export const rawTierFromLcu = (tier) => RAW_TIER[String(tier ?? '').toUpperCase()] ?? null

export const clampTier = (t) => Math.min(MAX_TIER, Math.max(MIN_TIER, Math.round(t)))

/** Rango de la lobby = media de los rangos conocidos, acotada a 3..7. undefined si no se conoce ninguno. */
export function lobbyTierFromRaw(rawTiers) {
  const v = (rawTiers ?? []).filter((x) => Number.isFinite(x))
  if (!v.length) return undefined
  return clampTier(v.reduce((a, b) => a + b, 0) / v.length)
}

/**
 * Rangos de Coachless a consultar para una lobby: el suyo y los contiguos (más muestra, mismo nivel).
 * Nunca por debajo de 3. Sin dato → los rangos por defecto de la web.
 */
export function tiersForLobby(lobbyTier) {
  if (!Number.isFinite(lobbyTier)) return [...DEFAULT_TIERS]
  const t = clampTier(lobbyTier)
  return [t - 1, t, t + 1].filter((x) => x >= MIN_TIER && x <= MAX_TIER)
}

/** «Platino – Diamante». `names` permite traducir los nombres (la interfaz pasa los de shared/strings.js). */
export function tiersLabel(tiers, names = TIER_NAMES) {
  const ts = [...(tiers ?? [])].sort((a, b) => a - b)
  if (!ts.length) return ''
  const name = (t) => names[t] ?? '?'
  return ts.length === 1 ? name(ts[0]) : `${name(ts[0])} – ${name(ts[ts.length - 1])}`
}

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9+]/g, '')
const ROLE_ALIASES = {
  top: 0, jungla: 1, jungle: 1, jg: 1, jng: 1, mid: 2, middle: 2, medio: 2, adc: 3, bot: 3, bottom: 3, tirador: 3,
  support: 4, supp: 4, sup: 4, soporte: 4, utility: 4, cualquiera: 5, fill: 5, todos: 5, auto: 5,
}
const TIER_ALIASES = { gold: 3, oro: 3, platino: 4, platinum: 4, plat: 4, esmeralda: 5, emerald: 5, diamante: 6, diamond: 6, master: 7, 'master+': 7, maestro: 7 }

/** Texto libre («adc», «Soporte», «3») → role de Coachless, o undefined si no se entiende. */
export function parseRole(text) {
  const t = norm(text)
  if (/^[0-5]$/.test(t)) return Number(t)
  return ROLE_ALIASES[t]
}

/** Texto libre («oro», «Esmeralda», «5») → 3..7, o undefined. Los rangos bajo Gold se acotan a Gold. */
export function parseTier(text) {
  const t = norm(text)
  if (/^[0-9]$/.test(t)) return clampTier(Number(t))
  return TIER_ALIASES[t]
}
