// easy-coachless/src/infrastructure/liveclient/live-client.js — Live Client Data API de Riot (solo lectura, solo durante la partida)
//
// https://127.0.0.1:2999/liveclientdata/... es la API OFICIAL del juego para apps (docs: developer.riotgames.com/docs/lol#game-client-api).
// Solo responde mientras hay una partida en marcha; fuera de ella la conexión se rechaza (→ 'offline'), nunca lanza.
// Una sola llamada, `allgamedata` (formato verificado por el usuario desde el cliente real): activePlayer (riotId, currentGold, level),
// allPlayers[] (championName, rawChampionName, position, team, riotId, items[]) y gameData (gameMode, gameTime).
// El jugador activo se busca en allPlayers por riotId (o summonerName) para leer sus ítems. No se registra ningún dato del jugador.

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const URL_ALL = 'https://127.0.0.1:2999/liveclientdata/allgamedata'
const RAW_PREFIX = /^game_character_displayname_/

const player = (p) => ({
  championName: typeof p?.championName === 'string' ? p.championName : '',
  alias: typeof p?.rawChampionName === 'string' ? p.rawChampionName.replace(RAW_PREFIX, '') : '',
  position: typeof p?.position === 'string' ? p.position : '',
  team: typeof p?.team === 'string' ? p.team : '',
})

/**
 * @typedef {{championName:string, alias:string, position:string, team:string}} LivePlayer
 * @typedef {{ok:true, gold:number, level:number|null, gameTime:number|null, mode:string|null,
 *            items:{item:number,count:number,slot:number|null}[], me:LivePlayer, players:LivePlayer[]}
 *          |{ok:false, reason:'offline'|'shape'}} LiveSnapshot
 * @returns {{snapshot: () => Promise<LiveSnapshot>}}
 */
export function createLiveClient({ fetchFn = (u, o) => fetch(u, o), timeoutMs = 2500 } = {}) {
  async function getJson(url) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const r = await fetchFn(url, { signal: ctrl.signal })
      return r.ok ? await r.json() : null
    } catch { return null } finally { clearTimeout(timer) }
  }

  async function snapshot() {
    const d = await getJson(URL_ALL)
    if (!d || typeof d !== 'object') return { ok: false, reason: 'offline' }
    const ap = d.activePlayer
    const all = Array.isArray(d.allPlayers) ? d.allPlayers : []
    if (!ap || typeof ap !== 'object' || !all.length) return { ok: false, reason: 'shape' }
    const mine = all.find((p) => (ap.riotId && p?.riotId === ap.riotId) || (ap.summonerName && p?.summonerName === ap.summonerName))
    if (!mine) return { ok: false, reason: 'shape' }
    return {
      ok: true,
      gold: num(ap.currentGold) ?? 0,
      level: Number.isInteger(ap.level) ? ap.level : null,
      gameTime: num(d.gameData?.gameTime),
      mode: typeof d.gameData?.gameMode === 'string' ? d.gameData.gameMode.toUpperCase() : null,
      items: (Array.isArray(mine.items) ? mine.items : []).filter((i) => Number.isInteger(i?.itemID) && i.itemID > 0)
        .map((i) => ({ item: i.itemID, count: Number.isInteger(i.count) && i.count > 0 ? i.count : 1, slot: Number.isInteger(i.slot) ? i.slot : null })),
      me: player(mine),
      players: all.map(player),
    }
  }
  return { snapshot }
}
