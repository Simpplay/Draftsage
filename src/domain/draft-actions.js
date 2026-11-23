// draftsage/src/domain/draft-actions.js — baneos, picks y turno del draft a partir de `session.actions` (reglas puras)
//
// En Clash (cola 700) `session.bans` llega VACÍO aunque ya se hayan hecho baneos: solo están en `actions` (docs/CLASH-BANS.md §2.4).
// `actions` = lista de grupos; cada acción: { type: 'ban' | 'pick' | marcador de 16 caracteres, championId, actorCellId (-1 en marcadores),
// isAllyAction, isInProgress, completed }. Los marcadores y las acciones sin campeón (0 / -1) se ignoran.
// Una acción SIN completar con championId > 0 es un hover (el jugador pasa el cursor): no cuenta como ban ni pick.

const isChamp = (id) => Number.isInteger(id) && id > 0
const flat = (session) => (Array.isArray(session?.actions) ? session.actions.flat() : []).filter((a) => a && (a.type === 'ban' || a.type === 'pick'))
const uniq = (list) => [...new Set(list)]

/**
 * @param {object} session  /lol-champ-select/v1/session
 * @returns {{bans:{ally:number[], enemy:number[]}, picks:{ally:number[], enemy:number[]},
 *            phase:'ban1'|'pick1'|'ban2'|'pick2'|'done'|null, banSlotsLeft:{ally:number, enemy:number},
 *            turn:{type:'ban'|'pick', isAlly:boolean, cellId:number}|null}}
 * phase: se deduce de lo hecho — con menos de 6 picks completados, 1.ª tanda; con 6 o más, 2.ª (el draft de Clash es 3 bans · 6 picks · 2 bans · 4 picks).
 */
export function parseDraftActions(session) {
  const acts = flat(session)
  const out = { bans: { ally: [], enemy: [] }, picks: { ally: [], enemy: [] }, phase: null, banSlotsLeft: { ally: 0, enemy: 0 }, turn: null }
  if (!acts.length) return out
  let picksDone = 0
  for (const a of acts) {
    const side = a.isAllyAction ? 'ally' : 'enemy'
    if (a.completed) {
      if (a.type === 'pick') picksDone++
      if (isChamp(a.championId)) (a.type === 'ban' ? out.bans : out.picks)[side].push(a.championId)
    } else if (a.type === 'ban') out.banSlotsLeft[side]++
  }
  out.bans.ally = uniq(out.bans.ally); out.bans.enemy = uniq(out.bans.enemy)
  const current = acts.find((a) => a.isInProgress && !a.completed)
  if (current) {
    out.turn = { type: current.type, isAlly: !!current.isAllyAction, cellId: Number.isInteger(current.actorCellId) ? current.actorCellId : -1 }
    out.phase = current.type === 'ban' ? (picksDone >= 6 ? 'ban2' : 'ban1') : (picksDone >= 6 ? 'pick2' : 'pick1')
  } else if (acts.every((a) => a.completed)) out.phase = 'done'
  return out
}

/**
 * Baneos de ambos equipos como lista plana de ids: lo que trae `session.bans` (ranked normal) más lo deducido de `actions` (Clash).
 * Sin duplicados; ignora 0 y negativos.
 */
export function allBans(session) {
  const fromBans = [...(session?.bans?.myTeamBans ?? []), ...(session?.bans?.theirTeamBans ?? [])].filter(isChamp)
  const d = parseDraftActions(session)
  return uniq([...fromBans, ...d.bans.ally, ...d.bans.enemy])
}
