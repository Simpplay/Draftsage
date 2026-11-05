// easy-coachless/src/infrastructure/lcu/game-data.js — nombres e iconos de runas, hechizos y campeones, del propio cliente
//
// Usa los datos locales del LCU (ya en el idioma del cliente y sin depender de Data Dragon):
//   /lol-perks/v1/perks · /lol-perks/v1/styles · /lol-game-data/assets/v1/summoner-spells.json · …/champion-summary.json
// Todo es opcional: si algo no carga, la interfaz muestra el id en lugar del nombre.

import { log } from '../../shared/logger.js'

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

export function createGameData({ lcuGet }) {
  const runes = new Map()     // id -> { id, name, icon }
  const spells = new Map()
  const champions = new Map()
  const keystoneTrees = new Map() // id keystone -> id árbol
  let loading = null
  let loaded = false

  const load = () => (loading ??= (async () => {
    const [perks, styles, sp, ch] = await Promise.all([
      lcuGet('/lol-perks/v1/perks'),
      lcuGet('/lol-perks/v1/styles'),
      lcuGet('/lol-game-data/assets/v1/summoner-spells.json'),
      lcuGet('/lol-game-data/assets/v1/champion-summary.json'),
    ])
    for (const p of perks ?? []) runes.set(p.id, { id: p.id, name: p.name, icon: p.iconPath })
    for (const s of styles ?? []) {
      runes.set(s.id, { id: s.id, name: s.name, icon: s.iconPath })
      const keystones = (s.slots ?? []).find((x) => x.type === 'kKeyStone')?.perks ?? s.slots?.[0]?.perks ?? []
      for (const k of keystones) keystoneTrees.set(k, s.id)
    }
    for (const s of sp ?? []) spells.set(s.id, { id: s.id, name: s.name, icon: s.iconPath })
    for (const c of ch ?? []) if (c.id > 0) champions.set(c.id, { id: c.id, name: c.name, icon: c.squarePortraitPath })
    loaded = true
    log.debug('datos del cliente:', runes.size, 'runas,', spells.size, 'hechizos,', champions.size, 'campeones')
    if (!perks && !ch) loading = null // nada cargó (cliente aún no listo): permitir reintento
  })())

  return {
    load,
    isLoaded: () => loaded,
    rune: (id) => runes.get(id) ?? { id, name: '#' + id, icon: null },
    spell: (id) => spells.get(id) ?? { id, name: '#' + id, icon: null },
    champion: (id) => champions.get(id) ?? { id, name: '#' + id, icon: null },
    keystoneTrees: () => keystoneTrees,
    /** Busca un campeón por nombre (sin tildes ni mayúsculas): exacto primero, luego por prefijo. */
    findChampion(query) {
      const q = norm(query)
      if (!q) return null
      const all = [...champions.values()]
      return all.find((c) => norm(c.name) === q) ?? all.find((c) => norm(c.name).startsWith(q)) ?? null
    },
  }
}
