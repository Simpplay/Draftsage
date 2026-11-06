// easy-coachless/src/infrastructure/coachless/client.js — endpoints de datos de Coachless
//
// Recibe `post(path, body)` y `get(path)` (los de auth.js: ya añaden el token, renuevan y aplican tiempo máximo)
// y devuelve las respuestas normalizadas: { ok, data } | { ok:false, reason }.
//   reason: 'auth' | 'forbidden' | 'network' | 'http' | 'shape'
// Normalización: wpaOverall/wpa → wpa; summonerSpell → spell. Peticiones idénticas se cachean (cache.js).
// Formatos documentados en docs/coachless-api.md.

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null)

const runeStat = (x) => ({ rune: x.rune, wpa: num(x.wpaOverall ?? x.wpa), occurrence: num(x.occurrence) ?? 0 })
const itemStat = (x) => ({ item: x.itemId, wpa: num(x.wpaOverall), occurrence: num(x.occurrence) ?? 0 })
const spellStat = (x) => ({ spell: x.summonerSpell, wpa: num(x.wpaOverall), occurrence: num(x.occurrence) ?? 0 })

const asList = (data, map) => (Array.isArray(data) ? data.map(map).filter((x) => x.wpa != null) : null)

export function createCoachlessClient({ post, get, cache }) {
  const call = (key, fn, normalize) =>
    cache.memo(
      key,
      async () => {
        const r = await fn()
        if (!r.ok) return { ok: false, reason: r.reason ?? 'http', status: r.status }
        const data = normalize(r.data)
        return data == null ? { ok: false, reason: 'shape' } : { ok: true, data }
      },
      (v) => v.ok,
    )

  const body = (filters, extra) => JSON.stringify({ commonFilters: filters, ...extra })
  const postNorm = (path, filters, extra, normalize) =>
    call(path + body(filters, extra), () => post(path, { commonFilters: filters, ...extra }), normalize)

  return {
    /** GET GetPatches → [{major, patch, label, matchCount}] */
    patches: () =>
      call('GET patches', () => get('ChampionWinprob/GetPatches'), (d) =>
        Array.isArray(d) ? d.filter((x) => Number.isFinite(x?.matchCount)) : null),

    /** Keystones con su WPA (admite matchup en premium) → [{rune, wpa, occurrence}] */
    keystones: (filters) => postNorm('Rune/GetKeystoneData', filters, {}, (d) => asList(d, runeStat)),

    /** Hechizos (admite matchup en premium; `paired` fija un hechizo y da el otro) → [{spell, wpa, occurrence}] */
    spells: (filters, paired = null) =>
      postNorm('ChampionWinprob/GetGlobalSummonerSpellStatistics', filters, { pairedSpell: paired }, (d) => asList(d, spellStat)),

    /** Filas de runas de un árbol → { rows: [fila1, fila2, fila3] } con [{rune, wpa, occurrence}] (puede haber filas vacías). */
    treeRunes: (filters, mainTree, treeToLoad, keystone) =>
      postNorm('Rune/GetRunesForKeystoneAndTree', filters, { mainTree, treeToLoad, ...(keystone != null && { keystone }) }, (d) =>
        d && typeof d === 'object' && ('rowOnes' in d)
          ? { rows: [d.rowOnes, d.rowTwos, d.rowThrees].map((r) => (Array.isArray(r) ? r.map(runeStat).filter((x) => x.wpa != null) : [])) }
          : null),

    /** Rol principal de un campeón (GetRecommendedBuilds con role 5 devuelve el rol resuelto) → número 0–4, o null. */
    championRole: (filters) =>
      call('role|' + body(filters, {}), () => post('ChampionWinprob/GetRecommendedBuilds', { commonFilters: filters }), (d) =>
        d && Number.isInteger(d.role) ? d.role : null),

    /**
     * Builds recomendadas (ignoran el matchup). Llevan los fragmentos y los ítems →
     * [{keystone, primaryTree, secondaryTree, shards, occurrence, tier, winrate, mostPopular, starterIds, firstItemId, secondItemId, itemBlocks}]
     * itemBlocks: [{type, items:[{item, wpa, occurrence, chooseOne, highlighted}]}] (sin filtrar: un ítem sin partidas trae wpa 0 de relleno).
     */
    builds: (filters) =>
      postNorm('ChampionWinprob/GetRecommendedBuilds', filters, {}, (d) =>
        d && Array.isArray(d.builds)
          ? d.builds.map((b) => ({
              keystone: b.keystone,
              primaryTree: b.runes?.primaryTree,
              secondaryTree: b.runes?.secondaryTree,
              selectedRunes: b.runes?.selectedRunes ?? [],
              shards: b.runes?.selectedShards ?? [],
              occurrence: num(b.occurrence) ?? 0,
              tier: Number.isInteger(b.tier) ? b.tier : null,
              winrate: num(b.winrate),
              mostPopular: b.mostPopular === true,
              starterIds: Array.isArray(b.starterIds) ? b.starterIds : [],
              firstItemId: num(b.firstItemId),
              secondItemId: num(b.secondItemId),
              itemBlocks: (Array.isArray(b.itemBlocks) ? b.itemBlocks : []).map((blk) => ({
                type: blk?.type,
                items: (Array.isArray(blk?.items) ? blk.items : []).map((i) => ({
                  item: i?.itemId, wpa: num(i?.wpa), occurrence: num(i?.occurrence) ?? 0, chooseOne: i?.chooseOne === true, highlighted: i?.highlighted === true,
                })),
              })),
            }))
          : null),

    /**
     * Estadísticas de ítems (GetGlobalItemStatistics) → [{item, wpa, occurrence}] sin ordenar.
     * `o`: { type (1 ítems completos por posición · 2 botas · 6 iniciales), slots (p. ej. [3]), first, second (1.er y 2.º legendario ya comprados) }.
     * ❓ Que `first`/`second` condicionen el resultado y que el matchup se respete en ítems no está verificado (dev/api-probes/test-coachless-items.mjs).
     */
    items: (filters, o = {}) =>
      postNorm('ChampionWinprob/GetGlobalItemStatistics', filters, {
        itemSlots: o.slots ?? null, itemType: o.type ?? 1, keystone: null, starterId: null, firstPurchaseId: null,
        firstLegendaryId: o.first ?? null, secondLegendaryId: o.second ?? null, loadFirstEpicPurchase: false, includeSupportItems: false,
      }, (d) => asList(d, itemStat)),
  }
}
