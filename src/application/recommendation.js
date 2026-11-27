// draftsage/src/application/recommendation.js — caso de uso: página de runas + hechizos para un matchup
//
// Entrada:  MatchContext { championId, opponentChampionId?, role?, lobbyTier?, mode?, keystoneOverride?, spellOverride? }  (ver domain/match-context.js)
// Salida:   { ok:true, data: Recommendation } | { ok:false, reason }
//   reason: 'auth' | 'forbidden' | 'network' | 'no-data' | 'aborted' | 'http' | 'shape' | 'no-patch'
//
// Reglas (verificadas contra la API real, ver docs/coachless-api.md):
//  - Parche: el último con muestra suficiente (GetPatches). Premium suma el parche anterior (patchAdditions 1); gratuita 0.
//    El usuario puede elegir el rango de parches (0..MAX_PATCH_RANGE, solo premium; domain/filters.js).
//  - Rangos: lobby ±1, nunca por debajo de 3 (Gold); o el rango de Elo que el usuario haya elegido a mano.
//  - Regiones: todas (`regions: null`, como la web por defecto) o las que el usuario haya elegido (domain/filters.js).
//  - Rival: el del mismo puesto si el cliente lo informa; si no, entre los rivales revelados (`ctx.enemies`) el campeón
//    cuyo rol principal (GetRecommendedBuilds con role 5) coincide con el tuyo. Solo premium (sin matchup no hace falta).
//  - Matchup: solo premium. Si la cuenta no es premium o la muestra del matchup es pequeña, se usa el campeón sin rival
//    y se avisa en `meta.notices`.
//  - 403 en un filtro premium NO es error de sesión: se reintenta con patchAdditions 0, sin matchup y sin regiones, y se avisa.
//    (❓ no se sabe si el filtro de regiones es solo premium: la web no lo bloquea, pero por si acaso también se quita.)
//  - Hechizos: domain/spells.js los ajusta al modo de juego y al rol (Aplastar en jungla, ninguno en Arena, sin Aplastar en ARAM…).
//  - Elección del usuario: `keystoneOverride` (runa clave) y `spellOverride` (pareja de hechizos) mandan sobre la recomendación
//    si son válidos; el resto de la página (filas, secundario) sigue los datos para esa runa clave.
//  - Ítems: salen de la build de GetRecommendedBuilds que lleva la runa clave elegida (esa petición ya se hacía) y se completan con
//    dos peticiones de GetGlobalItemStatistics (botas y 3.er ítem por WPA) en la 2.ª tanda; si fallan, solo faltan esas filas.
//  - Cada recomendación pide ≈ 12 peticiones en dos tandas (se cachean 30 min por parche/campeón/filtros).
//    Cambiar de runa clave solo añade las 5 peticiones de filas de runas (lo demás ya está en caché).
//  - Una petición obsoleta (el usuario cambió de campeón) se descarta con `signal`.

import { choosePatch, patchSpanLabel } from '../domain/patch.js'
import { ROLE_FILL } from '../domain/lobby.js'
import { MAX_PATCH_RANGE, resolveAdditions, resolveRegions, resolveTiers } from '../domain/filters.js'
import { TREE_IDS, treeOfKeystone, pickShards } from '../domain/runes.js'
import { buildItemPlan, pickBuild } from '../domain/items.js'
import { pickKeystone, pickRows, pickSecondary, pickSpell, rankBest, rankKeystones } from '../domain/selection.js'
import { isValidPair, replaceableIndex, rulesKey, spellRules } from '../domain/spells.js'

export const MIN_MATCHUP_SAMPLE = 3000 // partidas mínimas (suma de keystones) para fiarse de un matchup (con ~1 000 el error del WPA es ±1,6; medido: Kai'Sa vs Zed 1 039, vs Draven 30 802)
export const ALT_KEYSTONES = 4         // runas clave que se ofrecen en total (la elegida incluida)
export const ALT_SPELLS = 3            // alternativas para el hechizo intercambiable
export const MIN_BOOTS_SHARE = 0.10    // botas: al menos el 10 % de las partidas de su grupo
export const MIN_NEXT_SHARE = 0.05     // 3.er ítem: al menos el 5 % (está más repartido)

/**
 * @typedef {Object} Recommendation
 * @property {{rune:number,wpa:number,occurrence:number}} keystone
 * @property {number} primaryTree
 * @property {({rune:number,wpa:number,occurrence:number}|null)[]} primaryPicks   3 filas
 * @property {number|null} secondaryTree
 * @property {{rune:number,wpa:number,occurrence:number,row:number}[]} secondaryPicks  2 runas
 * @property {number[]} shards   3 ids (de la build recomendada; no dependen del matchup)
 * @property {{spell:number,wpa:number|null,occurrence:number}[]} spells   0–2 (wpa null = sin dato)
 * @property {import('../domain/items.js').ItemPlan|null} items   ítems de la build de la runa clave elegida (null si Coachless no los dio)
 * @property {{keystones:{rune:number,wpa:number,occurrence:number,share:number}[], autoKeystone:number,
 *             spells:{spell:number,wpa:number,occurrence:number,share:number,pair:number[]}[]}} alternatives
 * @property {{keystone:boolean, spells:boolean}} custom   true = lo eligió el usuario (a mano o fijado)
 * @property {{patch:string, patchSpan:string, patchRange:number, patchSource:'auto'|'manual', patchFallback:boolean, tiers:number[], tierSource:'lobby'|'manual', regions:number[]|null, regionSource:'all'|'manual', matchup:boolean, opponent:number|null, opponentSource:'position'|'role'|'manual'|'assigned'|null, premium:boolean, sample:number, mode:string|null, notices:string[]}} meta
 */

const aborted = () => ({ ok: false, reason: 'aborted' })

export function createRecommendationService({ client, log, keystoneTrees = () => undefined, cache, getFilters = () => undefined }) {
  const filtersOf = (ctx, patch, tiers, { additions, matchup, regions = null }) => ({
    patch: { major: patch.major, patch: patch.patch, patchAdditions: additions },
    championIds: [ctx.championId],
    matchupChampionIds: matchup ? [ctx.opponentChampionId] : null,
    leagueTiers: tiers,
    regions,
    role: ctx.role ?? ROLE_FILL,
  })

  // Una pasada con unos filtros concretos. status: 'ok' | 'forbidden' | 'error'
  async function compute(ctx, patch, tiers, plan, signal, premium = false) {
    const f = filtersOf(ctx, patch, tiers, plan)
    const rules = spellRules(ctx)

    const [ks, sp, bd] = await Promise.all([client.keystones(f), client.spells(f), client.builds(f)])
    if (signal?.aborted) return { status: 'aborted' }
    for (const r of [ks, sp, bd]) if (!r.ok && r.reason === 'forbidden') return { status: 'forbidden' }
    if (!ks.ok) return { status: 'error', reason: ks.reason }

    const sample = ks.data.reduce((s, x) => s + x.occurrence, 0)
    const auto = pickKeystone(ks.data)
    if (!auto) return { status: 'error', reason: 'no-data', sample }
    const ranked = rankKeystones(ks.data)
    const forced = ctx.keystoneOverride ? ranked.find((k) => k.rune === ctx.keystoneOverride) : null
    const keystone = forced ?? ranked.find((k) => k.rune === auto.rune) ?? auto
    const customKeystone = !!forced && forced.rune !== auto.rune

    // Diagnóstico: filtros exactos enviados a Coachless en esta pasada + lo que devolvió para las runas clave.
    log.info('pasada', JSON.stringify({
      filtros: f,
      muestra: sample,
      topKeystones: ranked.slice(0, ALT_KEYSTONES).map((k) => ({ rune: k.rune, wpa: k.wpa, partidas: k.occurrence })),
      auto: auto.rune, elegida: keystone.rune, keystoneOverride: ctx.keystoneOverride ?? null,
    }))

    const build = bd.ok ? (bd.data.find((b) => b.keystone === keystone.rune) ?? bd.data[0]) : null
    const primaryTree = treeOfKeystone(keystone.rune, keystoneTrees()) ?? (build?.keystone === keystone.rune ? build.primaryTree : undefined)
    if (!primaryTree) return { status: 'error', reason: 'no-data', sample }

    // Hechizos: la elección del usuario si es válida; si no, Aplastar (jungla) o el mejor por WPA, y el 2.º emparejado con el 1.º.
    const stat = (id) => (sp.ok ? sp.data.find((s) => s.spell === id) : null)
    const asStat = (id) => stat(id) ?? { spell: id, wpa: null, occurrence: 0 }
    const useOverride = isValidPair(ctx.spellOverride, rules)
    const plain1 = sp.ok ? pickSpell(sp.data) : null
    // (Se calcula la pareja recomendada aunque haya elección propia: así se sabe si la elegida es distinta de la recomendada.)
    const spell1 = rules.none ? null
      : rules.require != null ? asStat(rules.require)
      : sp.ok ? pickSpell(sp.data, rules.exclude) : null

    // Ítems: la build de la runa clave elegida (ya vino en `bd`) + botas y 3.er ítem por WPA (peticiones sueltas que, si fallan, se omiten).
    const picked = bd.ok ? pickBuild(bd.data, keystone.rune) : null
    const itemBuild = picked?.build
    const others = TREE_IDS.filter((t) => t !== primaryTree)
    const [prim, paired, bootsRes, nextRes, ...secs] = await Promise.all([
      client.treeRunes(f, primaryTree, primaryTree, keystone.rune),
      spell1 ? client.spells(f, spell1.spell) : null,
      itemBuild ? client.items(f, { type: 2 }) : null,
      itemBuild?.firstItemId && itemBuild?.secondItemId ? client.items(f, { type: 1, slots: [3], first: itemBuild.firstItemId, second: itemBuild.secondItemId }) : null,
      ...others.map((t) => client.treeRunes(f, primaryTree, t, keystone.rune)),
    ])
    if (signal?.aborted) return { status: 'aborted' }
    for (const r of [prim, ...secs]) if (!r.ok && r.reason === 'forbidden') return { status: 'forbidden' }

    const rankedItems = (r, minShare) => (r?.ok ? rankBest(r.data, { minShare }) : [])
    const items = itemBuild
      ? buildItemPlan(itemBuild, { keystoneMatch: picked.keystoneMatch, boots: rankedItems(bootsRes, MIN_BOOTS_SHARE).slice(0, 3), next: rankedItems(nextRes, MIN_NEXT_SHARE).slice(0, 3) })
      : null

    // Fragmentos: de la build de la runa clave; si no los trae, de otra build. Sin ninguno la página no se puede aplicar → se deja rastro.
    let shards = bd.ok ? pickShards(bd.data, keystone.rune) : []
    // Con el último parche y pocas partidas, GetRecommendedBuilds puede venir vacío (medido: builds 0 con patchAdditions 0, con datos en 1).
    // Los fragmentos no dependen del matchup: se piden a las builds con un parche más (solo premium; una cuenta gratuita daría 403).
    if (shards.length !== 3 && premium && plan.additions < MAX_PATCH_RANGE) {
      const alt = await client.builds(filtersOf(ctx, patch, tiers, { ...plan, additions: plan.additions + 1, matchup: false }))
      if (signal?.aborted) return { status: 'aborted' }
      if (alt.ok) shards = pickShards(alt.data, keystone.rune)
      log.info('fragmentos desde builds con un parche más', JSON.stringify({ ok: alt.ok, builds: alt.ok ? alt.data.length : alt.reason, fragmentos: shards.length === 3 }))
    }
    if (shards.length !== 3) log.warn('sin fragmentos en las builds', JSON.stringify({ builds: bd.ok ? bd.data.length : bd.reason, keystone: keystone.rune }))

    const treeRows = {}
    others.forEach((t, i) => { if (secs[i].ok) treeRows[t] = secs[i].data.rows })
    const secondary = pickSecondary(treeRows)

    const recommended = []
    if (spell1) {
      recommended.push(spell1)
      const spell2 = paired?.ok ? pickSpell(paired.data, [spell1.spell, ...rules.exclude]) : null
      if (spell2) recommended.push(spell2)
    }
    const spells = useOverride ? ctx.spellOverride.map(asStat) : recommended
    const sameSpells = recommended.length === 2 && recommended.every((s) => ctx.spellOverride?.includes(s.spell))
    const customSpells = useOverride && !sameSpells
    const spellsAdjusted = !rules.none && !useOverride && !!plain1 && rules.exclude.includes(plain1.spell)

    // Alternativas con un clic: runas clave (la elegida siempre incluida) y sustitutos del hechizo intercambiable.
    const altKeystones = ranked.slice(0, ALT_KEYSTONES)
    if (!altKeystones.some((k) => k.rune === keystone.rune)) altKeystones.splice(ALT_KEYSTONES - 1, 1, keystone)
    let altSpells = []
    if (spells.length === 2 && sp.ok) {
      const pair = spells.map((s) => s.spell)
      const idx = replaceableIndex(pair, rules)
      altSpells = rankBest(sp.data, { minShare: 0.05, exclude: (e) => pair.includes(e.spell) })
        .map((e) => ({ ...e, pair: pair.map((id, i) => (i === idx ? e.spell : id)) }))
        .filter((e) => isValidPair(e.pair, rules))
        .slice(0, ALT_SPELLS)
    }

    return {
      status: 'ok',
      sample,
      spellsAdjusted,
      page: {
        keystone,
        primaryTree,
        primaryPicks: prim.ok ? pickRows(prim.data.rows) : [null, null, null],
        secondaryTree: secondary?.tree ?? null,
        secondaryPicks: secondary?.picks ?? [],
        shards,
        items,
        spells,
        alternatives: { keystones: altKeystones, autoKeystone: auto.rune, spells: altSpells },
        custom: { keystone: customKeystone, spells: customSpells },
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

    const filters = getFilters()
    const { tiers, manual: tiersManual } = resolveTiers(filters, ctx.lobbyTier)
    const range = resolveAdditions(filters, premium)
    const { regions } = resolveRegions(filters)
    if (range.limited) notices.push('patch-range-requires-premium')

    let opponentSource = ctx.opponentChampionId ? (ctx.opponentSource ?? 'position') : null
    if (!ctx.opponentChampionId && premium && ctx.role !== ROLE_FILL && ctx.enemies?.length) {
      const f = (id) => filtersOf({ championId: id, role: ROLE_FILL }, patch, tiers, { additions: 0, matchup: false, regions })
      const roles = await Promise.all(ctx.enemies.map((e) => client.championRole(f(e.championId))))
      if (signal?.aborted) return aborted()
      const i = roles.findIndex((r) => r.ok && r.data === ctx.role)
      if (i >= 0) { ctx = { ...ctx, opponentChampionId: ctx.enemies[i].championId }; opponentSource = 'role' }
    }
    const wantsMatchup = !!ctx.opponentChampionId
    if (wantsMatchup && !premium) notices.push('matchup-requires-premium')

    let plan = { additions: range.additions, matchup: wantsMatchup && premium, regions }
    const key = [
      patch.label, plan.additions, tiers.join(), (regions ?? []).join('+') || 'all', ctx.championId, plan.matchup ? ctx.opponentChampionId : 0, ctx.role ?? ROLE_FILL,
      rulesKey(spellRules(ctx)), ctx.keystoneOverride ?? 0, (ctx.spellOverride ?? []).join('+'),
    ].join('|')
    const cached = cache.get(key)
    // Diagnóstico: todos los filtros/decisiones que determinan la recomendación (una línea JSON, fácil de copiar).
    log.info('filtros', JSON.stringify({
      campeon: ctx.championId, rival: ctx.opponentChampionId ?? null, rivalOrigen: opponentSource, rivalesReveladosCliente: ctx.enemies?.length ?? 0,
      rol: ctx.role ?? ROLE_FILL, modo: ctx.mode ?? null, rangoLobby: ctx.lobbyTier ?? null,
      premium, matchupPedido: wantsMatchup, matchupActivo: plan.matchup,
      parche: patch.label, parcheMuestraBaja: !!patch.fallback, parchesExtra: plan.additions, parchesManual: range.manual,
      rangos: tiers, rangosManual: tiersManual, regiones: regions,
      keystoneOverride: ctx.keystoneOverride ?? null, spellOverride: ctx.spellOverride ?? null,
      avisos: notices, cache: !!cached,
    }))
    if (cached) return { ok: true, data: { ...cached, meta: { ...cached.meta, notices: [...new Set([...cached.meta.notices, ...notices])] } } }

    let res = await compute(ctx, patch, tiers, plan, signal, premium)
    if (res.status === 'forbidden' && (plan.additions > 0 || plan.matchup || plan.regions)) {
      log.warn('403 con filtros premium; se reintenta sin rango de parches, matchup ni regiones')
      plan = { additions: 0, matchup: false, regions: null }
      notices.push('filters-downgraded')
      res = await compute(ctx, patch, tiers, plan, signal, premium)
    }
    // Orden de preferencia cuando la muestra es pequeña (cada cambio se avisa en pantalla):
    //   1. los filtros del usuario  2. un parche más (solo premium; `patch-widened`)
    //   3. la general, sin rival (`matchup-low-sample`)  4. la general con un parche más (`patch-widened`).
    const tooSmall = (r) => (r.status === 'ok' && r.sample < MIN_MATCHUP_SAMPLE) || (r.status === 'error' && r.reason === 'no-data')
    const base = plan
    let widened = false
    // Un parche más sobre `from`; solo se adopta si da más muestra. Devuelve false si no aplica o no mejora.
    const tryWiden = async (from) => {
      if (!tooSmall(res) || !premium || from.additions >= MAX_PATCH_RANGE || notices.includes('filters-downgraded')) return false
      const wider = { ...from, additions: from.additions + 1 }
      const r2 = await compute(ctx, patch, tiers, wider, signal, premium)
      if (r2.status === 'aborted') return null
      if (r2.status !== 'ok' || r2.sample <= (res.sample ?? 0)) return false
      log.info('muestra pequeña (' + (res.sample ?? 0) + ', mínimo ' + MIN_MATCHUP_SAMPLE + '); se añade un parche más (' + wider.additions + ' → ' + r2.sample + ' partidas)')
      plan = wider; res = r2
      return true
    }
    const w1 = await tryWiden(plan)
    if (w1 === null) return aborted()
    widened = w1
    if (plan.matchup && tooSmall(res)) {
      log.info('muestra del matchup pequeña (' + (res.sample ?? 0) + ', mínimo ' + MIN_MATCHUP_SAMPLE + ', rival ' + ctx.opponentChampionId + '); se usa el campeón sin rival')
      plan = { ...base, matchup: false }
      widened = false
      notices.push('matchup-low-sample')
      res = await compute(ctx, patch, tiers, plan, signal, premium)
      const w2 = await tryWiden(plan)
      if (w2 === null) return aborted()
      widened = w2
    }
    if (widened) notices.push('patch-widened')

    if (res.status === 'aborted') return aborted()
    if (res.status === 'forbidden') return { ok: false, reason: 'forbidden' }
    if (res.status !== 'ok') return { ok: false, reason: res.reason }
    if (res.spellsAdjusted) notices.push('spells-adjusted')

    const data = {
      ...res.page,
      meta: {
        patch: patch.label, patchSpan: patchSpanLabel(patch, plan.additions), patchRange: plan.additions, patchSource: range.manual ? 'manual' : 'auto', patchFallback: patch.fallback,
        tiers, tierSource: tiersManual ? 'manual' : 'lobby', regions: plan.regions, regionSource: plan.regions ? 'manual' : 'all', matchup: plan.matchup,
        opponent: plan.matchup ? ctx.opponentChampionId : null, opponentSource: plan.matchup ? opponentSource : null,
        premium, sample: res.sample, mode: ctx.mode ?? null, notices: [...new Set(notices)],
      },
    }
    log.info('resultado', JSON.stringify({
      keystone: data.keystone.rune, matchup: plan.matchup, rival: data.meta.opponent, muestra: res.sample,
      parche: data.meta.patchSpan, rangos: tiers, regiones: plan.regions, avisos: data.meta.notices,
    }))
    cache.set(key, data)
    return { ok: true, data }
  }

  return { getRecommendation }
}
