// draftsage/src/domain/match-context.js — tipos del dominio (solo JSDoc, sin código en tiempo de ejecución)
// Todo proveedor de contexto (LCU, entrada manual) debe producir un MatchContext.

/**
 * @typedef {Object} MatchContext
 * @property {number} championId           0 = aún no hay campeón elegido ni en selección
 * @property {number} [opponentChampionId] rival directo (mismo rol) si ya se conoce
 * @property {number} [role]               0 Top · 1 Jungla · 2 Mid · 3 ADC · 4 Support · 5 cualquiera (ver domain/lobby.js)
 * @property {number} [lobbyTier]          3 (Gold) … 7 (Master+); undefined si no se conoce. Nunca < 3.
 * @property {string} [mode]               modo de juego del LCU en mayúsculas: 'CLASSIC' | 'ARAM' | 'CHERRY' (Arena)… (ver domain/spells.js)
 * @property {number} [keystoneOverride]   runa clave elegida por el usuario (a mano o fijada)
 * @property {number[]} [spellOverride]    pareja de hechizos elegida por el usuario
 * @property {'lcu'|'manual'} [source]
 */

/**
 * Proveedor de contexto: el único punto por el que la aplicación se entera de la partida. La API del LCU no es
 * oficial y puede cambiar, así que todo acceso al cliente (sondeo, socket…) debe vivir detrás de esta interfaz.
 * @typedef {Object} MatchContextProvider
 * @property {() => Promise<MatchContext|null>} getCurrentContext       null = no hay Champion Select
 * @property {(cb: (ctx: MatchContext|null) => void) => (() => void)} subscribeToChanges   devuelve la función para cancelar
 */

/**
 * Identidad de una recomendación (clave de caché): ver application/recommendation.js.
 * @typedef {Object} RecommendationKey
 * @property {number} championId
 * @property {number} opponentChampionId
 * @property {number} role
 * @property {number[]} tiers
 * @property {string} patch
 */

/**
 * @typedef {{status:'unauthenticated'}|{status:'authenticating'}|{status:'authenticated',premium:boolean}|{status:'expired'}|{status:'error',message:string}} AuthState
 */

export {}
