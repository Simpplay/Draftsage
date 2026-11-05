// easy-coachless/src/application/recommendation.js — caso de uso: página de runas + hechizos para un matchup
//
// Entrada:  MatchContext { championId, opponentChampionId?, role?, lobbyTier? }  (ver domain/match-context.js)
// Salida:   { ok:true, data: Recommendation } | { ok:false, reason }
//   reason: 'auth' | 'forbidden' | 'network' | 'no-data' | 'aborted' | 'http' | 'shape' | 'no-patch'
//
// Reglas (verificadas contra la API real, ver docs/coachless-api.md):
//  - Parche: el último con muestra suficiente (GetPatches). Premium suma el parche anterior (patchAdditions 1); gratuita 0.
//  - Rangos: lobby ±1, nunca por debajo de 3 (Gold).
//  - Rival: el del mismo puesto si el cliente lo informa; si no, entre los rivales revelados (`ctx.enemies`) el campeón
//    cuyo rol principal (GetRecommendedBuilds con role 5) coincide con el tuyo. Solo premium (sin matchup no hace falta).
//  - Matchup: solo premium. Si la cuenta no es premium o la muestra del matchup es pequeña, se usa el campeón sin rival
//    y se avisa en `meta.notices`.
//  - 403 en un filtro premium NO es error de sesión: se reintenta con patchAdditions 0 y sin matchup, y se avisa.
//  - Cada recomendación pide ≈ 10 peticiones en dos tandas (se cachean 30 min por parche/campeón/filtros).
//  - Una petición obsoleta (el usuario cambió de campeón) se descarta con `signal`.

import { choosePatch } from '../domain/patch.js'
import { ROLE_FILL, tiersForLobby } from '../domain/lobby.js'
import { TREE_IDS, treeOfKeystone } from '../domain/runes.js'
import { pickKeystone, pickRows, pickSecondary, pickSpell } from '../domain/selection.js'

export const MIN_MATCHUP_SAMPLE = 3000 // partidas mínimas (suma de keystones) para fiarse de un matchup (con ~1 000 el error del WPA es ±1,6; medido: Kai'Sa vs Zed 1 039, vs Draven 30 802)

/**
 * @typedef {Object} Recommendation
 * @property {{rune:number,wpa:number,occurrence:number}} keystone
 * @property {number} primaryTree
 * @property {({rune:number,wpa:number,occurrence:number}|null)[]} primaryPicks   3 filas
 * @property {number|null} secondaryTree
 * @property {{rune:number,wpa:number,occurrence:number,row:number}[]} secondaryPicks  2 runas
 * @property {number[]} shards   3 ids (de la build recomendada; no dependen del matchup)
 * @property {{spell:number,wpa:number,occurrence:number}[]} spells   0–2
 * @property {{patch:string, patchFallback:boolean, tiers:number[], matchup:boolean, opponent:number|null, opponentSource:'position'|'role'|'manual'|null, premium:boolean, sample:number, notices:string[]}} meta
 */

const aborted = () => ({ ok: false, reason: 'aborted' })

export function createRecommendationService({ client, log, keystoneTrees = () => undefined, cache }) {
  const filtersOf = (ctx, patch, tiers, { additions, matchup }) => ({
    patch: { major: patch.major, patch: patch.patch, patchAdditions: additions },
    championIds: [ctx.championId],
    matchupChampionIds: matchup ? [ctx.opponentChampionId] : null,
    leagueTiers: tiers,
    regions: null,
    role: ctx.role ?? ROLE_FILL,
  })

  // Una pasada con unos filtros concretos. status: 'ok' | 'forbidden' | 'error'
  async function compute(ctx, patch, tiers, plan, signal) {
    const f = filtersOf(ctx, patch, tiers, plan)

    const [ks, sp, bd] = await Promise.all([client.keystones(f), client.spells(f), client.builds(f)])
    if (signal?.aborted) return { status: 'aborted' }
    for (const r of [ks, sp, bd]) if (!r.ok && r.reason === 'forbidden') return { status: 'forbidden' }
    if (!ks.ok) return { status: 'error', reason: ks.reason }

    const sample = ks.data.reduce((s, x) => s + x.occurrence, 0)
    const keystone = pickKeystone(ks.data)
    if (!keystone) return { status: 'error', reason: 'no-data', sample }

    const build = bd.ok ? (bd.data.find((b) => b.keystone === keystone.rune) ?? bd.data[0]) : null
    const primaryTree = treeOfKeystone(keystone.rune, keystoneTrees()) ?? (build?.keystone === keystone.rune ? build.primaryTree : undefined)
    if (!primaryTree) return { status: 'error', reason: 'no-data', sample }

    const spell1 = sp.ok ? pickSpell(sp.data) : null
    const others = TREE_IDS.filter((t) => t !== primaryTree)
    const [prim, paired, ...secs] = await Promise.all([
      client.treeRunes(f, primaryTree, primaryTree, keystone.rune),
      spell1 ? client.spells(f, spell1.spell) : null,
      ...others.map((t) => client.treeRunes(f, primaryTree, t, keystone.rune)),
    ])
    if (signal?.aborted) return { status: 'aborted' }
    for (const r of [prim, ...secs]) if (!r.ok && r.reason === 'forbidden') return { status: 'forbidden' }

    const treeRows = {}
    others.forEach((t, i) => { if (secs[i].ok) treeRows[t] = secs[i].data.rows })
    const secondary = pickSecondary(treeRows)

    const spells = []
    if (spell1) {
      spells.push(spell1)
      const spell2 = paired?.ok ? pickSpell(paired.data, [spell1.spell]) : null
      if (spell2) spells.push(spell2)
    }

    return {
      status: 'ok',
      sample,
      page: {
        keystone,
        primaryTree,
        primaryPicks: prim.ok ? pickRows(prim.data.rows) : [null, null, null],
        secondaryTree: secondary?.tree ?? null,
        secondaryPicks: secondary?.picks ?? [],
        shards: build?.shards ?? [],
        spells,
      },
    }
  }

  async function getRecommendation(ctx, { premium = false, signal } = {}) {
    if (!ctx?.championId) return { ok: false, reason: 'no-data' }
    const notices = []

    const pr = await client.patches()
    if (signal?.aborted) return aborted()
    if (!pr.ok) return { ok: false, reason: pr.reason }
    const patch = choosePatch(pr.data)
    if (!patch) return { ok: false, reason: 'no-patch' }
    if (patch.fallback) notices.push('patch-low-sample')

    const tiers = tiersForLobby(ctx.lobbyTier)

    let opponentSource = ctx.opponentChampionId ? (ctx.opponentSource ?? 'position') : null
    if (!ctx.opponentChampionId && premium && ctx.role !== ROLE_FILL && ctx.enemies?.length) {
      const f = (id) => filtersOf({ championId: id, role: ROLE_FILL }, patch, tiers, { additions: 0, matchup: false })
      const roles = await Promise.all(ctx.enemies.map((e) => client.championRole(f(e.championId))))
      if (signal?.aborted) return aborted()
      const i = roles.findIndex((r) => r.ok && r.data === ctx.role)
      if (i >= 0) { ctx = { ...ctx, opponentChampionId: ctx.enemies[i].championId }; opponentSource = 'role' }
    }
    const wantsMatchup = !!ctx.opponentChampionId
    if (wantsMatchup && !premium) notices.push('matchup-requires-premium')

    let plan = { additions: premium ? 1 : 0, matchup: wantsMatchup && premium }
    const key = [patch.label, plan.additions, tiers.join(), ctx.championId, plan.matchup ? ctx.opponentChampionId : 0, ctx.role ?? ROLE_FILL].join('|')
    const cached = cache.get(key)
    if (cached) return { ok: true, data: { ...cached, meta: { ...cached.meta, notices: [...new Set([...cached.meta.notices, ...notices])] } } }

    let res = await compute(ctx, patch, tiers, plan, signal)
    if (res.status === 'forbidden' && (plan.additions > 0 || plan.matchup)) {
      log.warn('403 con filtros premium; se reintenta sin rango de parches ni matchup')
      plan = { additions: 0, matchup: false }
      notices.push('filters-downgraded')
      res = await compute(ctx, patch, tiers, plan, signal)
    }
    // Matchup sin datos suficientes (o ninguno): se muestra la build del campeón sin rival, nunca un error.
    const noMatchupData = res.status === 'error' && res.reason === 'no-data'
    if (plan.matchup && ((res.status === 'ok' && res.sample < MIN_MATCHUP_SAMPLE) || noMatchupData)) {
      log.info('muestra del matchup pequeña (' + (res.sample ?? 0) + '); se usa el campeón sin rival')
      notices.push('matchup-low-sample')
      plan = { ...plan, matchup: false }
      res = await compute(ctx, patch, tiers, plan, signal)
    }

    if (res.status === 'aborted') return aborted()
    if (res.status === 'forbidden') return { ok: false, reason: 'forbidden' }
    if (res.status !== 'ok') return { ok: false, reason: res.reason }

    const data = {
      ...res.page,
      meta: { patch: patch.label, patchFallback: patch.fallback, tiers, matchup: plan.matchup, opponent: plan.matchup ? ctx.opponentChampionId : null, opponentSource: plan.matchup ? opponentSource : null, premium, sample: res.sample, notices: [...new Set(notices)] },
    }
    cache.set(key, data)
    return { ok: true, data }
  }

  return { getRecommendation }
}
