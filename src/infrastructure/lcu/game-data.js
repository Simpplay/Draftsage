// easy-coachless/src/infrastructure/lcu/game-data.js — nombres e iconos de runas, hechizos y campeones, del propio cliente
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

  const load = () => (loading ??= (async () => {
    const [perks, styles, sp, ch, it] = await Promise.all([
      lcuGet('/lol-perks/v1/perks'),
      lcuGet('/lol-perks/v1/styles'),
      lcuGet('/lol-game-data/assets/v1/summoner-spells.json'),
      lcuGet('/lol-game-data/assets/v1/champion-summary.json'),
      lcuGet('/lol-game-data/assets/v1/items.json'),
    ])
    for (const p of perks ?? []) runes.set(p.id, { id: p.id, name: p.name, icon: p.iconPath })
    for (const s of styles ?? []) {
      runes.set(s.id, { id: s.id, name: s.name, icon: s.iconPath })
      const keystones = (s.slots ?? []).find((x) => x.type === 'kKeyStone')?.perks ?? s.slots?.[0]?.perks ?? []
      for (const k of keystones) keystoneTrees.set(k, s.id)
      for (const slot of s.slots ?? []) for (const k of slot.perks ?? []) runeTrees.set(k, s.id)
    }
    for (const s of sp ?? []) spells.set(s.id, { id: s.id, name: s.name, icon: s.iconPath })
    for (const c of ch ?? []) if (c.id > 0) champions.set(c.id, { id: c.id, name: c.name, alias: c.alias, icon: c.squarePortraitPath })
    // ❓ items.json: { id, name, iconPath, categories[], priceTotal, from[] }; «Boots» en categories marca las botas (si no, solo se pierde separarlas de otras filas).
    for (const i of Array.isArray(it) ? it : []) if (i?.id > 0) items.set(i.id, { id: i.id, name: i.name, icon: i.iconPath, boots: Array.isArray(i.categories) && i.categories.includes('Boots'), priceTotal: Number.isFinite(i.priceTotal) ? i.priceTotal : null, from: Array.isArray(i.from) ? i.from : [] })
    loaded = true
    log.debug('datos del cliente:', runes.size, 'runas,', spells.size, 'hechizos,', champions.size, 'campeones,', items.size, 'ítems')
    if (!perks && !ch) loading = null // nada cargó (cliente aún no listo): permitir reintento
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
    champion: (id) => champions.get(id) ?? { id, name: '#' + id, icon: null },
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
