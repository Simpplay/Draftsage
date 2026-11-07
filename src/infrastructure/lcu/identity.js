// draftsage/src/infrastructure/lcu/identity.js — Riot ID del jugador (nombre, etiqueta y plataforma) leído del propio cliente
//
// Solo lo usa application/mastery.js, y solo si el jugador activó la maestría de iTero (el Riot ID viaja a un tercero: consentimiento explícito).
// Solo LEE y solo guarda en memoria: nunca se persiste ni se registra.
// Endpoints del LCU (no oficiales, ❓ sin verificar en el cliente real):
//   /lol-summoner/v1/current-summoner  → { gameName, tagLine, puuid, … }
//   /lol-chat/v1/me                    → { gameName, gameTag, platformId: 'LA1', … }   (plataforma exacta)
//   /riotclient/region-locale          → { region: 'LAN', … }                            (respaldo: se traduce a plataforma)
// Devuelve { gameName, tagLine, region } o null si no se pudo determinar todo (entonces no se envía nada).

import { platformOf } from '../../domain/itero.js'

export function createIdentity({ lcuGet }) {
  let cached = null

  async function read() {
    const [me, chat] = await Promise.all([lcuGet('/lol-summoner/v1/current-summoner'), lcuGet('/lol-chat/v1/me')])
    const gameName = me?.gameName || chat?.gameName || ''
    const tagLine = me?.tagLine || chat?.gameTag || ''
    let region = platformOf(chat?.platformId)
    if (!region) region = platformOf((await lcuGet('/riotclient/region-locale'))?.region)
    return gameName && tagLine && region ? { gameName: String(gameName), tagLine: String(tagLine), region } : null
  }

  return {
    /** El Riot ID o null. Solo se recuerda si se leyó completo (si el cliente aún no está listo, la próxima vez se reintenta). */
    async get() {
      if (cached) return cached
      cached = (await read()) ?? null
      return cached
    },
    /** Olvida el ID (p. ej. al cambiar de cuenta en el cliente). */
    forget() { cached = null },
  }
}
