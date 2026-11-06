// easy-coachless/src/application/lolalytics-source.js — fuente de recomendaciones basada en LoLalytics
//
// Misma firma que el servicio de Coachless (application/recommendation.js): getRecommendation(ctx, {premium, signal}) →
// { ok:true, data: Recommendation } | { ok:false, reason }   reason: 'network' | 'blocked' | 'http' | 'no-data' | 'shape' | 'aborted'
//
// Reglas:
//  - Rangos: los mismos filtros del usuario que con Coachless (lobby ±1 o rango elegido) traducidos a `tier` de Lolalytics
//    (domain/lolalytics.js → tierParam). El rango de parches no se aplica: Lolalytics sirve siempre el parche actual.
//  - Rival: el del mismo puesto si el cliente lo informa (o el elegido a mano); si no, se deduce entre los revelados con la lista de
//    tier de tu línea (el que más juega esa línea). Sin cuenta ni premium: el matchup de Lolalytics es gratuito.
//  - Matchup: página `/vs/{rival}/`. Si no existe, no es la línea pedida o tiene pocas partidas (< MIN_MATCHUP_SAMPLE), se usa el campeón
//    solo y se avisa (`matchup-low-sample`), nunca un error.
//  - Hechizos: domain/spells.js manda (Aplastar en jungla, ARAM, Arena…) sobre lo que diga la web.
//  - Se limita a UNA o dos páginas por consulta (la del campeón y, si hay rival, la del matchup), cacheadas en el cliente.

import { buildRecommendation, laneOfRole, MIN_MATCHUP_SAMPLE, tierParam } from '../domain/lolalytics.js'
import { resolveTiers } from '../domain/filters.js'
import { inferOpponent } from '../domain/overlay-stats.js'
import { spellRules } from '../domain/spells.js'
import { championSlug } from '../domain/web.js'

/**
 * @param {{client:object, catalog:{load:()=>Promise<void>, champion:(id:number)=>object, keystoneTrees?:()=>Map, runeTrees?:()=>Map},
 *          getFilters?:()=>object, log?:object}} deps
 */
export function createLolalyticsSource({ client, catalog, getFilters = () => undefined, log = null }) {
  const slugOf = (id) => championSlug(catalog.champion(id))

  async function getRecommendation(ctx, { premium = false, signal } = {}) {
    if (!ctx?.championId) return { ok: false, reason: 'no-data' }
    const aborted = () => ({ ok: false, reason: 'aborted' })
    const notices = []
    await catalog.load().catch(() => {}) // los nombres (slugs) salen del cliente; si no cargó, el slug será vacío y se avisa abajo

    const slug = slugOf(ctx.championId)
    if (!slug) return { ok: false, reason: 'no-data' }
    const lane = laneOfRole(ctx.role)
    const { tiers: wanted, manual } = resolveTiers(getFilters(), ctx.lobbyTier)
    let tp = tierParam(wanted)

    // Rival: el que ya viene en el contexto; si no, deducirlo con la lista de tier de la línea.
    let rival = ctx.opponentChampionId ?? null
    let rivalSource = rival ? (ctx.opponentSource ?? 'position') : null
    if (!rival && lane && ctx.enemies?.length) {
      const tl = await client.tierlist({ lane, tier: tp.param })
      if (signal?.aborted) return aborted()
      const id = tl.ok ? inferOpponent(ctx.enemies, tl.data.rows) : null
      if (id) { rival = id; rivalSource = 'role' }
    }

    let page = null
    let matchup = false
    if (rival && lane) {
      const rivalSlug = slugOf(rival)
      if (rivalSlug) {
        const r = await client.build({ slug, lane, tier: tp.param, rival: rivalSlug })
        if (signal?.aborted) return aborted()
        const h = r.ok ? r.data.root.header : null
        if (r.ok && h.vs === rival && h.lane === lane && h.n >= MIN_MATCHUP_SAMPLE) { page = r; matchup = true }
      }
      if (!matchup) notices.push('matchup-low-sample')
    }
    if (!page) {
      page = await client.build({ slug, lane, tier: tp.param })
      if (signal?.aborted) return aborted()
      if (!page.ok) return { ok: false, reason: page.reason }
    }
    if (page.tierUsed && page.tierUsed !== tp.param) { tp = tierParam([5, 6, 7]); notices.push('lola-tier-fallback') }

    const data = buildRecommendation(page.data.root, ctx, {
      rules: spellRules(ctx),
      keystoneTrees: catalog.keystoneTrees?.(), runeTrees: catalog.runeTrees?.(),
      matchup, opponent: rival, opponentSource: rivalSource,
      tiers: tp.tiers, tierSource: manual ? 'manual' : 'lobby',
      premium, notices,
    })
    if (!data) { log?.warn('lolalytics: no se pudo deducir el árbol de alguna runa'); return { ok: false, reason: 'shape' } }
    log?.info('lolalytics resultado', JSON.stringify({ campeon: ctx.championId, linea: lane, rival: matchup ? rival : null, tier: tp.param, muestra: data.meta.sample, avisos: data.meta.notices }))
    return { ok: true, data }
  }

  return { getRecommendation }
}
