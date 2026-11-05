// easy-coachless/src/infrastructure/coachless/client.js — endpoints de datos de Coachless
//
// Recibe `post(path, body)` y `get(path)` (los de auth.js: ya añaden el token, renuevan y aplican tiempo máximo)
// y devuelve las respuestas normalizadas: { ok, data } | { ok:false, reason }.
//   reason: 'auth' | 'forbidden' | 'network' | 'http' | 'shape'
// Normalización: wpaOverall/wpa → wpa; summonerSpell → spell. Peticiones idénticas se cachean (cache.js).
// Formatos documentados en docs/coachless-api.md.

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null)

const runeStat = (x) => ({ rune: x.rune, wpa: num(x.wpaOverall ?? x.wpa), occurrence: num(x.occurrence) ?? 0 })
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

    /** Builds recomendadas (ignoran el matchup). Se usan para los fragmentos → [{keystone, primaryTree, secondaryTree, shards, occurrence}] */
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
            }))
          : null),
  }
}
