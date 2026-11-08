// draftsage/src/domain/draft-summary.js — recomendación principal + alternativas con motivos (reglas puras; docs/UX-SPEC.md §4, §6)
//
// Junta las dos listas que ya existen SIN inventar una puntuación común (spec §6.2 y §14.5: nada de pesos arbitrarios sin calibrar):
//   · lista de LÍNEA (LoLalytics): win rate contra el rival de tu línea, ventaja sobre la media del candidato (`edge`) y partidas;
//   · lista de EQUIPO (iTero): encaje con la composición revelada, en puntos RELATIVOS (nunca un % absoluto) y sus motivos por línea.
// Perspectivas (spec §4.3–4.4):
//   · 'lane'  counter de línea   → la principal es la mejor de la lista de línea;
//   · 'team'  encaje con equipo  → la principal es la mejor de la lista de iTero (sinergia con aliados y respuesta a los rivales a la vez:
//                                   iTero no las separa, así que no se ofrecen como dos modos distintos);
//   · 'auto'  (por defecto)      → 'lane' si ya se sabe el rival de tu línea y hay datos; si no, 'team'. Es la regla de la spec
//                                   («si el rival está revelado, el matchup gana relevancia; si no, la composición») sin mezclar cifras.
// Alternativas (hasta 3, cada una con su PORQUÉ, no simplemente los puestos 2–4):
//   1. la mejor de la OTRA perspectiva («mejor matchup» / «mejor encaje con el equipo»);
//   2. la siguiente de la misma perspectiva;
//   3. si la maestría está activada, la que más dominas de las dos listas («tu campeón», con ≥ COMFORT_POINTS puntos).
// Cada candidato lleva motivos estructurados {type, polarity, evidence, importance, …} — evidence: 'statistical' (dato observado),
// 'model' (predicción de iTero), 'heuristic' (regla de Draftsage). El texto lo pone la presentación (aquí no hay idioma).
// Un dato desconocido se deja en null, nunca en 0 (spec §14.4).

export const PERSPECTIVES = Object.freeze(['auto', 'lane', 'team'])
export const DEFAULT_PERSPECTIVE = 'auto'
export const COMFORT_POINTS = 10_000   // puntos de maestría a partir de los que un campeón cuenta como «tuyo» (igual que el filtro «pool»)
export const EDGE_CLEAR = 1             // ventaja (pp sobre su media) a partir de la cual el matchup es favorable de verdad, no solo fuerza general
// Confianza de un dato de línea según sus partidas (heurística: por debajo de 200 la lista ya lo descarta; ver domain/overlay-stats.js).
export const SAMPLE_STEPS = Object.freeze({ medium: 500, high: 2000 })

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

/** Sanea la perspectiva guardada. */
export const normalizePerspective = (p) => (PERSPECTIVES.includes(p) ? p : DEFAULT_PERSPECTIVE)

/** 'auto' → la perspectiva concreta según lo que hay. null si no hay ninguna lista con datos. */
export function resolvePerspective(requested, { lane, team }) {
  const p = normalizePerspective(requested)
  if (p === 'lane') return lane ? 'lane' : team ? 'team' : null
  if (p === 'team') return team ? 'team' : lane ? 'lane' : null
  return lane ? 'lane' : team ? 'team' : null
}

/** Nivel de confianza de una cifra de línea por sus partidas: 'low' | 'medium' | 'high' (null sin dato). */
export function sampleLevel(n) {
  if (!isNum(n) || n <= 0) return null
  return n >= SAMPLE_STEPS.high ? 'high' : n >= SAMPLE_STEPS.medium ? 'medium' : 'low'
}

// ---- Motivos ----

/** Motivos del dato de línea (LoLalytics). */
function laneReasons(m) {
  if (!m) return []
  const out = []
  if (isNum(m.edge)) {
    const polarity = m.edge >= EDGE_CLEAR ? 'positive' : m.edge <= -EDGE_CLEAR ? 'negative' : 'neutral'
    out.push({ type: 'lane-matchup', polarity, importance: 'high', evidence: 'statistical', wr: m.wr, edge: m.edge, n: m.n })
    // Win rate alto pero ventaja específica pequeña: gana por fuerza general, no por el matchup (spec §2.1).
    if (polarity === 'neutral' && m.wr > 50) out.push({ type: 'general-strength', polarity: 'neutral', importance: 'medium', evidence: 'statistical', wr: m.wr, edge: m.edge })
  } else {
    out.push({ type: 'lane-matchup', polarity: m.wr > 50 ? 'positive' : m.wr < 50 ? 'negative' : 'neutral', importance: 'high', evidence: 'statistical', wr: m.wr, edge: null, n: m.n })
  }
  return out
}

/** Motivos del consejero (iTero): encaje global y los chips de domain/pick-advice.js (chipsOf). */
function teamReasons(p) {
  if (!p) return []
  const out = [{ type: 'team-fit', polarity: p.score >= 0 ? 'positive' : 'negative', importance: 'high', evidence: 'model', score: p.score }]
  for (const c of p.chips ?? []) {
    if (c.kind === 'syn') out.push({ type: 'ally-synergy', polarity: 'positive', importance: 'medium', evidence: 'model', lane: c.lane, value: c.value })
    else if (c.kind === 'ctr') out.push({ type: 'enemy-counter', polarity: 'positive', importance: 'medium', evidence: 'model', lane: c.lane, value: c.value })
    else if (c.kind === 'weak') out.push({ type: 'enemy-weakness', polarity: 'negative', importance: 'medium', evidence: 'model', lane: c.lane, value: c.value })
    else if (c.kind === 'scale') out.push({ type: 'scaling', polarity: 'positive', importance: 'low', evidence: 'model', phase: c.phase, value: c.value })
    else if (c.kind === 'dmg') out.push({ type: 'damage', polarity: 'neutral', importance: 'low', evidence: 'model', value: c.value })
  }
  if (p.agree === 'conflict') out.push({ type: 'sources-disagree', polarity: 'negative', importance: 'medium', evidence: 'heuristic' })
  return out
}

const RANK = { high: 0, medium: 1, low: 2 }
const byImportance = (a, b) => RANK[a.importance] - RANK[b.importance]

/**
 * Un candidato con todo lo que se sabe de él en las dos listas.
 * @returns {{cid:number, why:string, reasons:object[], tradeoffs:object[], confidence:{level:string, evidence:string, n:number|null},
 *            lane:object|null, team:object|null, mastery:number|null}}
 */
function candidate(cid, why, { laneOf, teamOf, masteryOf }) {
  const m = laneOf(cid), p = teamOf(cid)
  const pts = masteryOf(cid)
  const all = [...laneReasons(m), ...teamReasons(p)]
  if (m && p && p.agree === 'agree') all.push({ type: 'both-sources', polarity: 'positive', importance: 'medium', evidence: 'heuristic' })
  if (isNum(pts) && pts >= COMFORT_POINTS) all.push({ type: 'comfort', polarity: 'positive', importance: 'medium', evidence: 'statistical', points: pts })
  const reasons = all.filter((r) => r.polarity !== 'negative').sort(byImportance)
  const tradeoffs = all.filter((r) => r.polarity === 'negative').sort(byImportance)
  // Confianza: la del dato de línea si lo hay (partidas observadas); si solo está iTero, es una predicción del modelo.
  const confidence = m
    ? { level: sampleLevel(m.n) ?? 'low', evidence: 'statistical', n: isNum(m.n) ? m.n : null }
    : { level: 'model', evidence: 'model', n: isNum(p?.games) ? p.games : null }
  return { cid, why, reasons, tradeoffs, confidence, lane: m ?? null, team: p ?? null, mastery: isNum(pts) ? pts : null }
}

/**
 * Recomendación principal + alternativas.
 * @param {{lanePicks?:{cid:number, wr:number, edge:number|null, n:number}[], teamPicks?:{championId:number, score:number, games?:number, chips?:object[], agree?:string|null}[],
 *          perspective?:string, masteryOf?:(cid:number)=>number|null, maxAlternatives?:number}} input
 *   Las listas ya vienen ordenadas, filtradas y SIN campeones no disponibles (application/pick-filters.js).
 * @returns {{requested:string, perspective:'lane'|'team'|null, available:{lane:boolean, team:boolean}, primary:object|null, alternatives:object[]}}
 */
export function buildDraftSummary({ lanePicks = [], teamPicks = [], perspective = DEFAULT_PERSPECTIVE, masteryOf = () => null, maxAlternatives = 3 } = {}) {
  const requested = normalizePerspective(perspective)
  const available = { lane: lanePicks.length > 0, team: teamPicks.length > 0 }
  const resolved = resolvePerspective(requested, available)
  const out = { requested, perspective: resolved, available, primary: null, alternatives: [] }
  if (!resolved) return out

  const laneMap = new Map(lanePicks.map((m) => [m.cid, m]))
  const teamMap = new Map(teamPicks.map((p) => [p.championId, p]))
  const ctx = { laneOf: (cid) => laneMap.get(cid) ?? null, teamOf: (cid) => teamMap.get(cid) ?? null, masteryOf: (cid) => { const v = masteryOf(cid); return isNum(v) ? v : null } }
  const own = resolved === 'lane' ? lanePicks.map((m) => m.cid) : teamPicks.map((p) => p.championId)
  const other = resolved === 'lane' ? teamPicks.map((p) => p.championId) : lanePicks.map((m) => m.cid)

  out.primary = candidate(own[0], 'primary', ctx)
  const used = new Set([own[0]])
  const add = (cid, why) => { if (cid == null || used.has(cid) || out.alternatives.length >= maxAlternatives) return; used.add(cid); out.alternatives.push(candidate(cid, why, ctx)) }
  add(other.find((c) => !used.has(c)), resolved === 'lane' ? 'best-team' : 'best-lane')
  add(own.find((c) => !used.has(c)), resolved === 'lane' ? 'next-lane' : 'next-team')
  // Tu campeón: el de más maestría de las dos listas que aún no salió (solo con la maestría activada y ≥ COMFORT_POINTS).
  const comfort = [...new Set([...own, ...other])].filter((c) => !used.has(c) && (ctx.masteryOf(c) ?? 0) >= COMFORT_POINTS)
    .sort((a, b) => ctx.masteryOf(b) - ctx.masteryOf(a))[0]
  add(comfort, 'comfort')
  return out
}
