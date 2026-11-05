// easy-coachless/src/domain/match-context.js — tipos del dominio (solo JSDoc, sin código en tiempo de ejecución)
// Todo proveedor de contexto (LCU, eventos de Pengu, entrada manual) debe producir un MatchContext.

/**
 * @typedef {Object} MatchContext
 * @property {number} championId
 * @property {number} [opponentChampionId]
 * @property {string} [role]
 * @property {number} [lobbyTier]   Mínimo 3 (Gold): leagueTiers 0–2 devuelven vacío en Coachless.
 * @property {number|string} [patch]
 */

/**
 * Identidad de una recomendación (clave de caché).
 * @typedef {Object} RecommendationKey
 * @property {number} championId
 * @property {number} opponentChampionId
 * @property {string} role
 * @property {number} lobbyTier
 * @property {number|string} patch
 */

/**
 * @typedef {{status:'unauthenticated'}|{status:'authenticating'}|{status:'authenticated',premium:boolean}|{status:'expired'}|{status:'error',message:string}} AuthState
 */

export {}
