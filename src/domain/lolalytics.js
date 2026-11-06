// easy-coachless/src/domain/lolalytics.js — reglas puras para usar LoLalytics como fuente de recomendaciones
//
// Toda la lectura de campos del estado de la web (docs/lolalytics.md §6) vive AQUÍ: si Lolalytics cambia un nombre, es el único
// sitio que hay que arreglar. Entrada: la raíz ya decodificada de una página de build (infrastructure/lolalytics/qwik.js).
// Salida: una Recommendation con la misma forma que la de Coachless (application/recommendation.js), para que el panel y
// «Aplicar» no sepan de qué fuente viene. Lolalytics no da WPA: los números son porcentajes de victoria (`wr`) y de uso (`share`).
//
// ❓ Sin verificar contra la web real (ver docs/lolalytics.md §10): los valores de `tier` distintos de emerald_plus y el parámetro
//    de línea del rival (`vslane`). Por eso hay validaciones y recursos (cliente: rango por defecto; fuente: matchup → campeón solo).

import { ROLE_FILL, clampTier } from './lobby.js'
import { treeOfKeystone, treeOfRune } from './runes.js'
import { buildItemPlan, BLOCK } from './items.js'
import { isValidPair, spellRules } from './spells.js'

export const LANES = ['top', 'jungle', 'middle', 'bottom', 'support'] // índice = role de Coachless 0..4
export const DEFAULT_TIER = 'emerald_plus'                            // ✅ el único rango comprobado como parámetro de URL
export const MIN_MATCHUP_SAMPLE = 1000   // partidas mínimas de un duelo para fiarse de la página del matchup (con menos, campeón solo)
export const MIN_WIN_BUILD_GAMES = 300   // la build «de mayor win rate» solo se ofrece si tiene al menos estas partidas
export const MIN_BOOTS_PICK = 10         // botas: al menos el 10 % de uso (igual que con Coachless)
export const MIN_NEXT_PICK = 5           // 3.er ítem: al menos el 5 %
export const MIN_SPELL_PICK = 5          // pareja de hechizos alternativa: al menos el 5 % de uso
export const ALT_SPELLS = 3

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const int = (x) => (Number.isInteger(x) && x > 0 ? x : null)
const isArr = (x) => Array.isArray(x)

// ---- Líneas y rangos ----------------------------------------------------------------------------

/** role de Coachless (0..4) → línea de Lolalytics; null si no hay (5 = cualquiera). */
export const laneOfRole = (role) => (Number.isInteger(role) && role >= 0 && role <= 4 ? LANES[role] : null)
export const roleOfLane = (lane) => { const i = LANES.indexOf(lane); return i < 0 ? ROLE_FILL : i }

const TIER_PLUS = { 3: 'gold_plus', 4: 'platinum_plus', 5: 'emerald_plus', 6: 'diamond_plus', 7: 'master_plus' }
const TIER_ONE = { 3: 'gold', 4: 'platinum', 5: 'emerald', 6: 'diamond', 7: 'master_plus' }

/**
 * Rangos de Coachless (3 Gold … 7 Master+) → parámetro `tier` de Lolalytics y los rangos que ese parámetro realmente cubre.
 * Un solo rango → exacto; varios → «desde el más bajo, hacia arriba» (Lolalytics no admite un tope intermedio).
 * ❓ Salvo `emerald_plus`, los nombres no están comprobados: el cliente cae a emerald_plus si la página no se sirve.
 * @returns {{param:string, tiers:number[]}}
 */
export function tierParam(tiers) {
  const ts = [...(tiers ?? [])].filter(Number.isFinite).sort((a, b) => a - b)
  if (!ts.length) return { param: DEFAULT_TIER, tiers: [5, 6, 7] }
  const lo = clampTier(ts[0]), hi = clampTier(ts[ts.length - 1])
  if (lo === hi) return { param: TIER_ONE[lo], tiers: [lo] }
  const covered = []
  for (let n = lo; n <= 7; n++) covered.push(n)
  return { param: TIER_PLUS[lo], tiers: covered }
}

// ---- Validación -----------------------------------------------------------------------------------

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const isRow = (r, len) => isArr(r) && r.length >= len

/**
 * Comprueba que la raíz tiene el esquema que usamos (docs/lolalytics.md §6, §8). Devuelve la lista de problemas (vacía = válida).
 * @param {{vs?:boolean}} [o] vs = página de matchup (lleva header.vs y header.vsWinRate; no lleva la tabla `enemy`)
 */
export function validateRoot(root, { vs = false } = {}) {
  const p = []
  const need = (cond, msg) => { if (!cond) p.push(msg) }
  need(root && typeof root === 'object', 'raíz ausente')
  if (p.length) return p
  const h = root.header ?? {}
  need(isNum(h.cid) && typeof h.patch === 'string' && typeof h.lane === 'string' && isNum(h.n), 'header: cid/patch/lane/n')
  if (vs) need(isNum(h.vs) && isNum(h.vsWinRate), 'header: vs/vsWinRate (matchup)')
  for (const which of ['pick', 'win']) {
    const s = root.summary?.[which]
    need(!!s, `summary.${which} ausente`)
    if (!s) continue
    const set = s.runes?.set
    need(isArr(set?.pri) && set.pri.length === 4 && isArr(set?.sec) && set.sec.length === 2 && isArr(set?.mod) && set.mod.length === 3, `summary.${which}.runes.set (4/2/3)`)
    need(set && [...(set.pri ?? []), ...(set.sec ?? []), ...(set.mod ?? [])].every(int), `summary.${which}.runes.set: ids no válidos`)
    need(isArr(s.sums?.ids) && s.sums.ids.length === 2 && s.sums.ids.every(int), `summary.${which}.sums.ids`)
  }
  need(isArr(root.spells) && root.spells.length > 0 && isRow(root.spells[0], 4), 'spells = [["a_b", wr, pr, n], …]')
  need(isArr(root.boots), 'boots')
  if (!vs) need(root.enemy && typeof root.enemy === 'object', 'enemy (counters por línea)')
  return p
}

// Claves que se conservan de la raíz (el resto —gráficas, jugadores top…— no se usa y ocuparía memoria en la caché).
const KEEP = ['header', 'summary', 'spells', 'boots', 'item1', 'item2', 'item3', 'item4', 'item5', 'popularItem', 'enemy']
export function slimRoot(root) {
  const out = {}
  for (const k of KEEP) if (root?.[k] !== undefined) out[k] = root[k]
  return out
}

// ---- Filas posicionales ----------------------------------------------------------------------------

/** [cid, wr, d1, d2, pr, n] → objeto, o null si no son 6 números (tablas `enemy` y `team`). */
export function parseRow(r) {
  if (!isRow(r, 6) || !r.slice(0, 6).every(isNum)) return null
  return { cid: r[0], wr: r[1], d1: r[2], d2: r[3], pr: r[4], n: r[5] }
}

// ---- Recomendación ------------------------------------------------------------------------------------

const pairRows = (root) => (root.spells ?? [])
  .map((r) => {
    const ids = String(r?.[0] ?? '').split('_').map(Number)
    return ids.length === 2 && ids.every(int) && ids[0] !== ids[1] ? { ids, wr: num(r[1]), pr: num(r[2]) ?? 0, n: num(r[3]) ?? 0 } : null
  })
  .filter(Boolean)
  .sort((a, b) => b.n - a.n)
const sameSet = (a, b) => isArr(a) && isArr(b) && a.length === b.length && a.every((x) => b.includes(x))

// Fila de una tabla de ítems [id, wr, pr, n, …] → estadística
const rowStat = (r) => ({ item: r[0], wpa: null, wr: num(r[1]), occurrence: num(r[3]) ?? 0, share: (num(r[2]) ?? 0) / 100 })
const tableRows = (t) => (isArr(t) ? t.filter((r) => isRow(r, 4) && int(r[0])) : [])

function itemsOf(root, b) {
  const it = b.items ?? {}
  const objStat = (e) => (e && int(e.id) ? { item: e.id, wpa: null, wr: num(e.wr), occurrence: num(e.n) ?? 0 } : null)
  const start = isArr(it.start?.setUnique) && it.start.setUnique.length ? it.start.setUnique : (it.start?.set ?? [])
  const n3 = objStat(it.item3)
  const next = [...(n3 ? [n3] : []), ...tableRows(root.item3).filter((r) => (num(r[2]) ?? 0) >= MIN_NEXT_PICK).map(rowStat)]
  return buildItemPlan({
    tier: null,
    winrate: num(b.runes?.wr),
    occurrence: num(b.runes?.n) ?? 0,
    starterIds: start,
    firstItemId: num(it.item1?.id),
    secondItemId: num(it.item2?.id),
    itemBlocks: [
      { type: BLOCK.OPTIONS, items: (isArr(it.item4) ? it.item4 : []).map(objStat).filter(Boolean) },
      { type: BLOCK.SITUATIONAL, items: tableRows(root.popularItem).slice(0, 8).map(rowStat) },
    ],
  }, {
    keystoneMatch: true,
    boots: tableRows(root.boots).filter((r) => (num(r[2]) ?? 0) >= MIN_BOOTS_PICK).slice(0, 3).map(rowStat),
    next,
  })
}

/**
 * Raíz validada de una página de build/matchup → Recommendation (ver application/recommendation.js).
 * @param {object} root   raíz (validateRoot sin problemas)
 * @param {object} ctx    MatchContext (keystoneOverride y spellOverride se respetan si son válidos)
 * @param {{rules?:object, keystoneTrees?:Map, runeTrees?:Map, matchup?:boolean, opponent?:number|null, opponentSource?:string|null,
 *          tiers?:number[], tierSource?:string, premium?:boolean, notices?:string[]}} [o]
 * @returns {object|null}  null si no se puede deducir el árbol de alguna runa
 */
export function buildRecommendation(root, ctx, o = {}) {
  const { rules = spellRules(ctx), keystoneTrees, runeTrees, matchup = false, opponent = null, opponentSource = null,
    tiers = [], tierSource = 'lobby', premium = false } = o
  const notices = [...(o.notices ?? [])]
  const h = root.header
  const { pick, win } = root.summary
  const ksOf = (b) => b?.runes?.set?.pri?.[0]
  const gamesOf = (b) => num(b?.runes?.n) ?? 0
  const sample = num(h.n) ?? gamesOf(pick)

  // Build: la más común; la de mayor win rate solo si el usuario eligió su runa clave (y es otra, con muestra suficiente).
  const wantWin = !!ctx.keystoneOverride && ksOf(win) === ctx.keystoneOverride && ksOf(pick) !== ctx.keystoneOverride && gamesOf(win) >= MIN_WIN_BUILD_GAMES
  const b = wantWin ? win : pick
  const set = b.runes.set
  const n = gamesOf(b)
  const stat = (rune) => ({ rune, wpa: null, occurrence: n })

  const keystone = { ...stat(set.pri[0]), wr: num(b.runes.wr) }
  const primaryTree = treeOfKeystone(keystone.rune, keystoneTrees) ?? treeOfRune(keystone.rune, runeTrees)
  const secondaryTree = treeOfRune(set.sec[0], runeTrees)
  if (!primaryTree || !secondaryTree) return null

  const autoKeystone = ksOf(pick)
  const alts = [{ ...stat(autoKeystone), occurrence: gamesOf(pick), wr: num(pick.runes.wr), share: sample > 0 ? gamesOf(pick) / sample : 0 }]
  if (ksOf(win) !== autoKeystone && gamesOf(win) >= MIN_WIN_BUILD_GAMES) alts.push({ ...stat(ksOf(win)), occurrence: gamesOf(win), wr: num(win.runes.wr), share: sample > 0 ? gamesOf(win) / sample : 0 })

  // Hechizos: la elección del usuario si es válida; si no, la pareja de la build si cumple las reglas del modo/rol; si no, la más jugada que las cumpla.
  const pairs = pairRows(root)
  const pickIds = b.sums.ids
  const zero = (ids) => ({ ids, wr: null, pr: 0, n: 0 })
  const statOfIds = (ids) => pairs.find((p) => sameSet(p.ids, ids)) ?? zero(ids)
  let rec = null
  if (!rules.none) rec = isValidPair(pickIds, rules) ? (pairs.find((p) => sameSet(p.ids, pickIds)) ?? { ids: pickIds, wr: num(b.sums.wr), pr: 0, n: num(b.sums.n) ?? 0 }) : (pairs.find((p) => isValidPair(p.ids, rules)) ?? null)
  const useOverride = isValidPair(ctx.spellOverride, rules)
  const chosen = useOverride ? statOfIds(ctx.spellOverride) : rec
  const spells = chosen ? chosen.ids.map((id) => ({ spell: id, wpa: null, wr: chosen.wr, occurrence: chosen.n })) : []
  const customSpells = useOverride && !(rec && sameSet(rec.ids, ctx.spellOverride))
  if (!rules.none && !useOverride && rec && !isValidPair(pickIds, rules)) notices.push('spells-adjusted')

  const altSpells = []
  if (chosen) {
    for (const p of pairs) {
      if (altSpells.length >= ALT_SPELLS) break
      if (!isValidPair(p.ids, rules) || sameSet(p.ids, chosen.ids) || p.pr < MIN_SPELL_PICK) continue
      const diff = p.ids.filter((id) => !chosen.ids.includes(id))
      if (diff.length !== 1 || altSpells.some((a) => a.spell === diff[0])) continue
      altSpells.push({ spell: diff[0], wpa: null, wr: p.wr, occurrence: p.n, share: p.pr / 100, pair: p.ids })
    }
  }

  return {
    keystone,
    primaryTree,
    primaryPicks: set.pri.slice(1).map(stat),
    secondaryTree,
    secondaryPicks: set.sec.map((r, i) => ({ ...stat(r), row: i })),
    shards: [...set.mod],
    items: itemsOf(root, b),
    spells,
    alternatives: { keystones: alts, autoKeystone, spells: altSpells },
    custom: { keystone: !!ctx.keystoneOverride && keystone.rune === ctx.keystoneOverride && keystone.rune !== autoKeystone, spells: customSpells },
    meta: {
      patch: h.patch, patchSpan: h.patch, patchRange: 0, patchSource: 'auto', patchFallback: false,
      tiers, tierSource, matchup, opponent: matchup ? opponent : null, opponentSource: matchup ? opponentSource : null,
      premium, sample, mode: ctx.mode ?? null, notices: [...new Set(notices)], source: 'lolalytics',
    },
  }
}
