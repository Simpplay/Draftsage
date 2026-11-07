// draftsage/src/domain/itero.js
// Consulta y lectura de la API de iTero.
// Funciones puras: sin red ni acceso al DOM.

/*
 * iTero (itero.gg) recomienda picks evaluando la composición completa.
 *
 * Endpoint:
 * POST https://www.itero.gg/api/draft-picks
 *
 * La API devuelve todos los campeones candidatos para una línea,
 * ordenados por probabilidad de victoria prevista.
 *
 * Detalles de integración:
 * docs/ITERO-INTEGRATION.md
 *
 * Consideraciones importantes:
 *
 * 1. Nombres de campeones:
 *    - Un nombre desconocido no produce un error.
 *    - El servidor lo interpreta como un espacio vacío.
 *    - Se deben enviar los nombres exactos en inglés.
 *    - findUnrecognized permite detectar este comportamiento.
 *
 * 2. Predicciones:
 *    - Las predicciones absolutas están infladas.
 *    - Dependen del lado, rango y peso de maestría.
 *    - Solo deben utilizarse comparaciones relativas
 *      entre candidatos de una misma respuesta.
 *    - Nunca mostrar result_pred como porcentaje de victoria.
 *
 * 3. Maestría (docs/ITERO-INTEGRATION.md §4.4):
 *    - POST https://www.itero.gg/api/basic-info con { gameName, tagLine, region } devuelve la maestría del jugador:
 *      mastery = { "<id de campeón>": puntos, …, "avg": media } (¡por ID numérico, no por nombre!).
 *    - Ese mismo objeto viaja tal cual como `masteryData` en draft-picks y `userModelWeightings["t1_<LINEA>_mastery"]` (0..1) pesa
 *      cuánto cuenta. Con maestría real el peso ya no descoloca las predicciones; aun así solo se usan comparaciones relativas.
 *    - Enviar el Riot ID a un tercero exige consentimiento explícito: la función está APAGADA por defecto (application/mastery.js).
 *
 * 4. Tamaño de respuesta:
 *    - La respuesta original pesa aproximadamente 1,7 MB.
 *    - normalizeResponse conserva únicamente los datos necesarios.
 *    - Cada candidato normalizado ocupa aproximadamente 400 B.
 */

// ============================================================
// Configuración
// ============================================================

export const ENDPOINT = 'https://www.itero.gg/api/draft-picks'
export const INFO_ENDPOINT = 'https://www.itero.gg/api/basic-info'

/** Peso de la maestría que se ofrece al jugador (la web usa 0,3 por defecto; el deslizador va de 0 a 1). */
export const MASTERY_WEIGHTS = Object.freeze({ low: 0.15, normal: 0.3, high: 0.6 })
export const DEFAULT_MASTERY_WEIGHT = MASTERY_WEIGHTS.normal

/**
 * Líneas de iTero.
 * El índice coincide con el role de Coachless:
 * 0 Top, 1 Jungle, 2 Middle, 3 Bottom, 4 Support.
 */
export const LANES = [
  'TOP',
  'JUNGLE',
  'MIDDLE',
  'BOTTOM',
  'UTILITY',
]

/** Fases de escalado de los campeones. */
export const PHASES = ['early', 'mid', 'late']

/**
 * Franjas de Elo aceptadas por iTero.
 *
 * Cualquier otro valor produce HTTP 500.
 * El índice coincide con la escala cruda de domain/lobby.js:
 * Iron 0 ... Master+ 7.
 */
export const RANK_CLASSES = [
  'IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'EMERALD',
  'DIAMOND',
  'MASTER+',
]

export const DEFAULT_RANK_CLASS = 'EMERALD'

/** Modos de juego incompatibles con el modelo de cinco líneas. */
const UNSUPPORTED_MODES = new Set([
  'ARAM',
  'KIWI',
  'CHERRY',
])

// ============================================================
// Conversión y validación de datos del juego
// ============================================================

/**
 * Convierte el índice de un rol de Coachless en una línea de iTero.
 *
 * @param {number} role
 * @returns {string|null}
 */
export const laneOfRole = (role) => {
  const isValidRole = Number.isInteger(role) && role >= 0 && role <= 4

  return isValidRole ? LANES[role] : null
}

/**
 * Normaliza una posición recibida desde el LCU.
 *
 * El LCU utiliza nombres como:
 * top, jungle, middle, bottom, utility.
 *
 * @param {string} position
 * @returns {string|null}
 */
export const laneOfPosition = (position) => {
  const normalizedPosition = String(position ?? '').toUpperCase()

  return LANES.includes(normalizedPosition)
    ? normalizedPosition
    : null
}

/**
 * Comprueba si un modo de juego es compatible con iTero.
 *
 * @param {string} mode
 * @returns {boolean}
 */
export const supportsMode = (mode) => {
  const normalizedMode = String(mode ?? '').toUpperCase()

  return !UNSUPPORTED_MODES.has(normalizedMode)
}

/**
 * Convierte el identificador de equipo del LCU en el lado de iTero.
 *
 * LCU:
 * - 1: equipo azul.
 * - 2: equipo rojo.
 *
 * @param {number} team
 * @returns {'Blue'|'Red'|null}
 */
export const sideOfTeam = (team) => {
  if (team === 1) return 'Blue'
  if (team === 2) return 'Red'

  return null
}

// ============================================================
// Resolución de rango
// ============================================================

/**
 * Convierte un tier en su franja de rango de iTero.
 *
 * Si el valor no es válido, utiliza DEFAULT_RANK_CLASS.
 *
 * @param {number} tier
 * @returns {string}
 */
export function rankClassOf(tier) {
  const isValidTier =
    Number.isInteger(tier) &&
    tier >= 0 &&
    tier < RANK_CLASSES.length

  return isValidTier
    ? RANK_CLASSES[tier]
    : DEFAULT_RANK_CLASS
}

/**
 * Resuelve una lista de tiers en una única franja de iTero.
 *
 * Selecciona el elemento central de la lista.
 * Si la cantidad es par, selecciona el central superior.
 *
 * @param {number[]} tiers
 * @returns {string}
 */
export function rankClassOfTiers(tiers) {
  const validTiers = (tiers ?? []).filter(Number.isInteger)

  if (validTiers.length === 0) {
    return DEFAULT_RANK_CLASS
  }

  const middleIndex = Math.floor(validTiers.length / 2)
  const middleTier = validTiers[middleIndex]

  return rankClassOf(middleTier)
}

/**
 * Determina la franja de rango que se consultará en iTero.
 *
 * - Selección manual: utiliza la franja central de los tiers elegidos.
 * - Selección automática: utiliza el rango de la lobby.
 * - Sin información: utiliza Esmeralda.
 *
 * Coachless utiliza ±1 tier en automático para aumentar la muestra.
 * iTero, en cambio, solo admite una franja.
 *
 * @param {{tiers: number[], manual: boolean}} resolved
 * @param {number} lobbyTier
 * @returns {string}
 */
export const rankClassFor = (resolved, lobbyTier) => {
  if (resolved?.manual) {
    return rankClassOfTiers(resolved.tiers)
  }

  return rankClassOf(lobbyTier)
}

// ============================================================
// Construcción de peticiones
// ============================================================

/**
 * Construye el cuerpo de la petición a iTero.
 *
 * allies y enemies tienen la siguiente estructura:
 *
 * {
 *   TOP: 'Aatrox',
 *   JUNGLE: 'Lee Sin',
 *   ...
 * }
 *
 * El espacio de nuestra propia línea se deja vacío para evitar
 * que el ranking esté sesgado por el campeón actualmente elegido.
 *
 * Maestría: sin `mastery` (apagada, sin datos o peso 0) se envía `masteryData: {}` y peso 0, como siempre. Con ella viaja la maestría del
 * jugador tal cual la devolvió basic-info y el peso (0..1) de nuestra línea.
 *
 * @param {Object} options
 * @param {string} options.lane
 * @param {string} options.rankClass
 * @param {string} [options.side='Blue']
 * @param {Record<string, string>} [options.allies={}]
 * @param {Record<string, string>} [options.enemies={}]
 * @param {string[]} [options.bans=[]]
 * @param {string} [options.region='euw1']
 * @param {{data:Record<string,number>, weight:number}|null} [options.mastery=null]
 * @returns {Object}
 */
export function buildRequest({
  lane,
  rankClass,
  side = 'Blue',
  allies = {},
  enemies = {},
  bans = [],
  region = 'euw1',
  mastery = null,
}) {
  const teamComp = {}

  // Añadir campeones aliados y enemigos revelados.
  for (const currentLane of LANES) {
    // Nuestra propia línea debe permanecer vacía.
    if (currentLane !== lane && allies[currentLane]) {
      teamComp[`t1_${currentLane}_champion`] = allies[currentLane]
    }

    if (enemies[currentLane]) {
      teamComp[`t2_${currentLane}_champion`] = enemies[currentLane]
    }
  }

  // Normalizar los bans: eliminar duplicados, valores vacíos
  // y ordenar para obtener una representación determinista.
  const normalizedBans = [...new Set(bans)]
    .filter(Boolean)
    .sort()

  const weight = clamp01(mastery?.weight)
  const useMastery = weight > 0 && !!mastery?.data && Object.keys(mastery.data).length > 0

  return {
    region,
    rankClass,
    side: side === 'Red' ? 'Red' : 'Blue',
    lane,

    masteryData: useMastery ? { ...mastery.data } : {},

    teamComp,

    bans: normalizedBans,

    userModelWeightings: {
      [`t1_${lane}_mastery`]: useMastery ? weight : 0,
    },
  }
}

const clamp01 = (x) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0)

/**
 * Genera una clave de caché determinista para una petición.
 *
 * Incluye todos los parámetros que pueden modificar la respuesta.
 * La composición se ordena por clave para evitar diferencias
 * causadas únicamente por el orden de inserción de propiedades.
 *
 * @param {Object} req
 * @returns {string}
 */
export function requestKey(req) {
  const normalizedComposition = Object.keys(req.teamComp)
    .sort()
    .map((key) => `${key}=${req.teamComp[key]}`)
    .join(',')

  return [
    'itero',
    req.rankClass,
    req.side,
    req.lane,
    req.bans.join('/'),
    normalizedComposition,
    masteryTag(req),
  ].join('|')
}

/**
 * Huella corta de la maestría de una petición (peso + nº de campeones + suma de puntos): dos peticiones con distinta maestría o peso no
 * comparten caché, sin meter en la clave un objeto de ~200 entradas. Sin maestría: 'm0'.
 */
export function masteryTag(req) {
  const weight = req?.userModelWeightings?.[`t1_${req.lane}_mastery`] ?? 0
  const values = Object.values(req?.masteryData ?? {}).filter((v) => typeof v === 'number')
  if (!(weight > 0) || !values.length) return 'm0'
  return `m${weight}:${values.length}:${values.reduce((a, b) => a + b, 0)}`
}

/**
 * Obtiene los nombres de campeones enviados a iTero.
 *
 * Se utilizan posteriormente para validar si el servidor
 * reconoció correctamente los nombres.
 *
 * @param {Object} req
 * @returns {string[]}
 */
export const sentNames = (req) => Object.values(req.teamComp)

// ============================================================
// Normalización de nombres
// ============================================================

/**
 * Normaliza un nombre para realizar comparaciones.
 *
 * Elimina:
 * - Mayúsculas.
 * - Espacios.
 * - Signos de puntuación.
 *
 * @param {string} value
 * @returns {string}
 */
const KEY = (value) => {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Normaliza un nombre inglés de campeón para comparaciones.
 *
 * @param {string} name
 * @returns {string}
 */
export const nameKey = KEY

// ============================================================
// Conversión numérica
// ============================================================

/**
 * Convierte diferentes representaciones numéricas a number.
 *
 * Ejemplos:
 * - '1.08x'  -> 1.08
 * - '+365 G' -> 365
 * - '60.1%'  -> 60.1
 * - '2k'     -> 2000
 * - 10       -> 10
 *
 * Devuelve null para valores no reconocidos.
 * Nunca lanza excepciones.
 *
 * @param {unknown} value
 * @returns {number|null}
 */
export function parseNum(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const pattern = /^\s*([+-]?\d+(?:\.\d+)?)\s*(x|%|G|k)?\s*$/i
  const match = pattern.exec(value)

  if (!match) {
    return null
  }

  const numericValue = Number(match[1])
  const unit = match[2]?.toLowerCase()

  const multiplier = unit === 'k' ? 1000 : 1

  // Sumar cero normaliza -0 a 0.
  return numericValue * multiplier + 0
}

/** Alias interno para facilitar la lectura del código. */
const num = (value) => parseNum(value)

/**
 * Redondea un número a la cantidad de decimales indicada.
 *
 * @param {number|null} value
 * @param {number} [decimals=2]
 * @returns {number|null}
 */
const round = (value, decimals = 2) => {
  if (value == null) {
    return null
  }

  const factor = 10 ** decimals

  return Math.round(value * factor) / factor
}

// ============================================================
// Normalización de candidatos
// ============================================================

/**
 * Normaliza una fila de la respuesta de iTero.
 *
 * Conserva únicamente los datos utilizados por el consejero.
 *
 * Devuelve null cuando faltan los campos imprescindibles.
 *
 * @param {Object} raw
 * @param {string} lane
 * @returns {Object|null}
 */
export function normalizeCandidate(raw, lane) {
  // Validar información básica del campeón.
  if (
    !raw ||
    typeof raw.champion !== 'string' ||
    !raw.champion
  ) {
    return null
  }

  // La predicción es un dato imprescindible.
  const pred = num(raw.result_pred)

  if (pred == null) {
    return null
  }

  // Extraer estadísticas anidadas.
  const player = raw.stats?.player ?? {}
  const teamDamage = raw.stats?.t1?.damage ?? {}
  const teamScaling = raw.stats?.t1?.scaling ?? {}

  // Estadísticas de sinergia y counters por línea.
  const syn = {}
  const ctr = {}

  for (const currentLane of LANES) {
    // La sinergia de nuestra propia línea no se utiliza.
    if (currentLane !== lane) {
      const synergy = num(
        player[`t1_syn_LANE_${currentLane}_wr`]
      )

      if (synergy != null) {
        syn[currentLane] = synergy
      }
    }

    const counter = num(
      player[`t1_counter_LANE_${currentLane}_wr`]
    )

    if (counter != null) {
      ctr[currentLane] = counter
    }
  }

  // Diferencias de escalado por fase de la partida.
  const scale = {}

  for (const phase of PHASES) {
    const value = num(
      teamScaling[`t1_${phase}_wr_adj_diff`]
    )

    if (value != null) {
      scale[phase] = round(value, 3)
    }
  }

  // Construir el objeto normalizado.
  return {
    name: raw.champion,
    pred,

    rating: num(raw.result_pred_rating),
    laning: num(raw.laning_pred_rating),

    count: num(raw.champ_count) ?? 0,
    pick: num(raw.pick_perc) ?? 0,

    champWr: num(player.t1_LANE_champ_wr),
    predGold: num(player.t1_LANE_pred_gold),

    synAvg: num(player.t1_LANE_syn_avg),
    ctrAvg: num(player.t1_LANE_counter_avg),

    syn,
    ctr,
    scale,

    adRatio: num(teamDamage.t1_ad_ratio),
    adRatioVar: num(teamDamage.t1_ad_ratio_without_player_var),
  }
}

// ============================================================
// Normalización de respuestas
// ============================================================

/**
 * Valida la estructura de la respuesta y normaliza sus candidatos.
 *
 * Resultado:
 *
 * { ok: true, candidates }
 *
 * o
 *
 * { ok: false, reason: 'shape' }
 *
 * Se exige:
 * - Un array no vacío.
 * - Al menos `min` candidatos válidos.
 * - Al menos el 90 % de las filas originales válidas.
 *
 * Una respuesta casi vacía puede indicar un cambio de esquema
 * o una petición inválida.
 *
 * @param {Object[]} raw
 * @param {string} lane
 * @param {{min?: number}} [options]
 * @returns {{ok: boolean, candidates?: Object[], reason?: string}}
 */
export function normalizeResponse(raw, lane, { min = 20 } = {}) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return {
      ok: false,
      reason: 'shape',
    }
  }

  const candidates = []

  for (const row of raw) {
    const candidate = normalizeCandidate(row, lane)

    if (candidate) {
      candidates.push(candidate)
    }
  }

  const hasEnoughCandidates = candidates.length >= min

  const hasAcceptableValidityRate =
    candidates.length >= raw.length * 0.9

  if (hasEnoughCandidates && hasAcceptableValidityRate) {
    return {
      ok: true,
      candidates,
    }
  }

  return {
    ok: false,
    reason: 'shape',
  }
}

// ============================================================
// Validación de nombres de campeones
// ============================================================

/**
 * Detecta nombres de campeones que iTero no reconoció.
 *
 * Comportamiento de la API:
 * - Un campeón seleccionado correctamente desaparece
 *   de la lista de candidatos.
 * - Si vuelve a aparecer, el servidor probablemente
 *   interpretó su nombre como un espacio vacío.
 *
 * Los campeones de nuestra propia línea no se comprueban.
 *
 * Limitación:
 * No detecta nombres que no se parezcan a ningún candidato.
 * Esto se evita enviando únicamente nombres válidos
 * procedentes de Data Dragon.
 *
 * @param {Object} req
 * @param {Object[]} candidates
 * @returns {string[]}
 */
export function findUnrecognized(req, candidates) {
  const candidateNames = new Set(
    candidates.map((candidate) => KEY(candidate.name))
  )

  return Object.entries(req.teamComp)
    .filter(([, championName]) => {
      return candidateNames.has(KEY(championName))
    })
    .map(([, championName]) => championName)
}
// ============================================================
// Maestría del jugador (POST /api/basic-info)
// ============================================================

/**
 * Plataformas de Riot por región del cliente (`/riotclient/region-locale`), para cuando el LCU no da el id de plataforma.
 * Las plataformas se escriben en mayúsculas (así lo envió el jugador: «LA1»).
 */
const PLATFORM_OF_REGION = {
  NA: 'NA1', BR: 'BR1', LAN: 'LA1', LAS: 'LA2', EUW: 'EUW1', EUNE: 'EUN1', TR: 'TR1', RU: 'RU', JP: 'JP1', KR: 'KR', OCE: 'OC1', ME1: 'ME1', SG2: 'SG2', TW2: 'TW2', VN2: 'VN2', PH2: 'PH2', TH2: 'TH2',
}
const PLATFORMS = new Set(Object.values(PLATFORM_OF_REGION))

/** Plataforma de Riot en mayúsculas ('la1' → 'LA1'; 'LAN' → 'LA1') o null si no se reconoce. */
export function platformOf(value) {
  const v = String(value ?? '').trim().toUpperCase()
  if (PLATFORMS.has(v)) return v
  return PLATFORM_OF_REGION[v] ?? null
}

/**
 * Cuerpo de la petición a basic-info. Devuelve null si falta algo (nombre, etiqueta o región reconocible): nada se envía a medias.
 * @param {{gameName?:string, tagLine?:string, region?:string}} id
 * @returns {{gameName:string, tagLine:string, region:string}|null}
 */
export function basicInfoRequest(id) {
  const gameName = String(id?.gameName ?? '').trim()
  const tagLine = String(id?.tagLine ?? '').trim().replace(/^#/, '')
  const region = platformOf(id?.region)
  if (!gameName || !tagLine || !region || gameName.length > 32 || tagLine.length > 8) return null
  return { gameName, tagLine, region }
}

/**
 * Lee la respuesta de basic-info y conserva SOLO la maestría (el resto —puuid, nivel, icono— no se guarda).
 * Formato: mastery = { "<id>": puntos, …, "avg": media }. Devuelve null si no hay un objeto `mastery` utilizable.
 *
 * @param {unknown} raw
 * @returns {{points: Record<string, number>, avg: number, count: number}|null}
 */
export function normalizeBasicInfo(raw) {
  const mastery = raw?.mastery
  if (!mastery || typeof mastery !== 'object' || Array.isArray(mastery)) return null
  const points = {}
  let count = 0
  let sum = 0
  for (const [key, value] of Object.entries(mastery)) {
    if (!/^\d+$/.test(key)) continue // «avg» y cualquier clave rara
    const n = num(value)
    if (n == null || n < 0) continue
    points[key] = n
    sum += n
    count++
  }
  const avgRaw = num(mastery.avg)
  return { points, avg: avgRaw ?? (count ? Math.round(sum / count) : 0), count }
}

/** `masteryData` que se envía a draft-picks: los puntos por id más la media, como la devuelve basic-info. */
export const masteryDataOf = (info) => (info ? { ...info.points, avg: info.avg } : {})
