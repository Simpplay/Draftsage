// draftsage/src/infrastructure/lcu/game-data.js — nombres e iconos de runas, hechizos y campeones, del propio cliente
//
// Usa los datos locales del LCU (ya en el idioma del cliente y sin depender de Data Dragon):
//   /lol-perks/v1/perks · /lol-perks/v1/styles · /lol-game-data/assets/v1/summoner-spells.json · …/champion-summary.json · …/items.json
// Todo es opcional: si algo no carga, la interfaz muestra el id en lugar del nombre.

import { log } from '../../shared/logger.js'

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

export function createGameData({ lcuGet }) {
  const runes = new Map()     // id -> { id, name, icon }
  const spells = new Map()
  const champions = new Map()
  const items = new Map()     // id -> { id, name, icon, boots, priceTotal, from }
  const keystoneTrees = new Map() // id keystone -> id árbol
  const runeTrees = new Map()     // id de CUALQUIER runa -> id árbol (las de Lolalytics no siguen la regla «centenas = árbol»)
  let loading = null
  let loaded = false

  // Las runas (/lol-perks) son la parte más frágil: la lista es grande y el plugin de runas del cliente tarda en estar listo tras el
  // arranque, así que puede dar timeout o HTTP no-OK mientras los hechizos y campeones ya cargan. Se reintenta solo esa parte.
  const RUNE_RETRY_MS = [1_500, 4_000, 8_000]
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  /** Carga nombres e iconos de runas y árboles. Devuelve true si llegaron las runas y los árboles. */
  async function loadRunes() {
    const [perks, styles] = await Promise.all([
      lcuGet('/lol-perks/v1/perks', { timeoutMs: 12_000 }),
      lcuGet('/lol-perks/v1/styles', { timeoutMs: 8_000 }),
    ])
    for (const p of Array.isArray(perks) ? perks : []) runes.set(p.id, { id: p.id, name: p.name, icon: p.iconPath })
    for (const s of Array.isArray(styles) ? styles : []) {
      runes.set(s.id, { id: s.id, name: s.name, icon: s.iconPath })
      const keystones = (s.slots ?? []).find((x) => x.type === 'kKeyStone')?.perks ?? s.slots?.[0]?.perks ?? []
      for (const k of keystones) keystoneTrees.set(k, s.id)
      for (const slot of s.slots ?? []) for (const k of slot.perks ?? []) runeTrees.set(k, s.id)
    }
    return Array.isArray(perks) && perks.length > 0 && Array.isArray(styles) && styles.length > 0
  }

  async function loadRunesWithRetry() {
    for (let attempt = 0; ; attempt++) {
      if (await loadRunes()) return true
      if (attempt >= RUNE_RETRY_MS.length) return false
      log.debug('runas del cliente no disponibles; reintento', attempt + 1, 'de', RUNE_RETRY_MS.length)
      await sleep(RUNE_RETRY_MS[attempt])
    }
  }

  const load = () => (loading ??= (async () => {
    const [runesOk, sp, ch, it] = await Promise.all([
      loadRunesWithRetry(),
      lcuGet('/lol-game-data/assets/v1/summoner-spells.json'),
      lcuGet('/lol-game-data/assets/v1/champion-summary.json'),
      lcuGet('/lol-game-data/assets/v1/items.json'),
    ])
    for (const s of sp ?? []) spells.set(s.id, { id: s.id, name: s.name, icon: s.iconPath })
    // `roles` = clases del campeón en minúsculas ('fighter', 'tank', 'mage', 'marksman', 'assassin', 'support'); ❓ sin verificar en el cliente real (si falta, el filtro de clase no encuentra nada).
    for (const c of ch ?? []) if (c.id > 0) champions.set(c.id, { id: c.id, name: c.name, alias: c.alias, icon: c.squarePortraitPath, classes: Array.isArray(c.roles) ? c.roles.map((r) => String(r).toLowerCase()) : [] })
    // ❓ items.json: { id, name, iconPath, categories[], priceTotal, from[] }; «Boots» en categories marca las botas (si no, solo se pierde separarlas de otras filas).
    for (const i of Array.isArray(it) ? it : []) if (i?.id > 0) items.set(i.id, { id: i.id, name: i.name, icon: i.iconPath, boots: Array.isArray(i.categories) && i.categories.includes('Boots'), priceTotal: Number.isFinite(i.priceTotal) ? i.priceTotal : null, from: Array.isArray(i.from) ? i.from : [] })
    loaded = true
    log.debug('datos del cliente:', runes.size, 'runas,', spells.size, 'hechizos,', champions.size, 'campeones,', items.size, 'ítems')
    if (!runesOk) log.warn('no se pudieron cargar las runas del cliente (/lol-perks/v1/perks|styles): la interfaz mostrará "#id" en lugar de iconos; activa draftsage.debug(true) para ver el motivo')
    if (!runesOk || !ch) loading = null // faltó algo esencial (cliente aún no listo): la próxima llamada a load() reintenta
  })())

  return {
    load,
    isLoaded: () => loaded,
    rune: (id) => runes.get(id) ?? { id, name: '#' + id, icon: null },
    spell: (id) => spells.get(id) ?? { id, name: '#' + id, icon: null },
    item: (id) => items.get(id) ?? { id, name: '#' + id, icon: null, boots: false, priceTotal: null, from: [] },
    /** Precio total y componentes (para el seguimiento en partida) o null si no se conocen. */
    recipe: (id) => { const i = items.get(id); return i && i.priceTotal != null ? { priceTotal: i.priceTotal, from: i.from } : null },
    isBoots: (id) => items.get(id)?.boots === true,
    champion: (id) => champions.get(id) ?? { id, name: '#' + id, icon: null, classes: [] },
    keystoneTrees: () => keystoneTrees,
    runeTrees: () => runeTrees,
    /** Busca un campeón por nombre o alias (sin tildes ni mayúsculas): nombre exacto, alias exacto y por último prefijo. */
    findChampion(query) {
      const q = norm(query)
      if (!q) return null
      const all = [...champions.values()]
      return all.find((c) => norm(c.name) === q) ?? all.find((c) => norm(c.alias) === q) ?? all.find((c) => norm(c.name).startsWith(q)) ?? null
    },
  }
}
