// draftsage/src/infrastructure/ddragon/names.js — nombres de campeón en inglés (Data Dragon, el CDN público de Riot)
//
// iTero exige el nombre inglés exacto de cada campeón y NO avisa si no lo reconoce (domain/itero.js). Los nombres del LCU salen en el
// idioma del cliente y los alias no valen (`MonkeyKing`, `Nunu`, `Renata`), así que se leen una vez de
//   https://ddragon.leagueoflegends.com/api/versions.json  →  /cdn/{versión}/data/en_US/champion.json   (~160 KB)
// ✅ Comprobado (2026-11-05): los 173 nombres de Data Dragon coinciden con los de iTero.
// Todo es opcional: si falla, `name()` devuelve null y el consejero usa el nombre del cliente (validado después con findUnrecognized).

import { nameKey } from '../../domain/itero.js'

const BASE = 'https://ddragon.leagueoflegends.com'
const RETRY_MS = 5 * 60_000

/** @param {{log?:object, fetchImpl?:typeof fetch, now?:()=>number, timeoutMs?:number}} deps */
export function createEnglishNames({ log = null, fetchImpl = (...a) => globalThis.fetch(...a), now = () => Date.now(), timeoutMs = 8_000 } = {}) {
  const names = new Map() // id (número) → nombre inglés
  let ids = null          // nameKey → id (se construye al primer uso tras cargar)
  let loading = null
  let failedAt = null

  async function getJson(url) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchImpl(url, { signal: ctrl.signal, credentials: 'omit' })
      return res.ok ? await res.json() : null
    } finally {
      clearTimeout(timer)
    }
  }

  async function run() {
    try {
      const versions = await getJson(`${BASE}/api/versions.json`)
      const version = Array.isArray(versions) ? versions.find((v) => typeof v === 'string' && /^\d+\.\d+\.\d+$/.test(v)) : null
      if (!version) throw new Error('sin versión')
      const data = (await getJson(`${BASE}/cdn/${version}/data/en_US/champion.json`))?.data
      if (!data || typeof data !== 'object') throw new Error('sin datos')
      for (const c of Object.values(data)) {
        const id = Number(c?.key)
        if (Number.isInteger(id) && id > 0 && typeof c.name === 'string' && c.name) names.set(id, c.name)
      }
      if (names.size < 100) throw new Error('lista incompleta (' + names.size + ')')
      log?.debug('nombres ingleses:', names.size, 'campeones (Data Dragon ' + version + ')')
      return true
    } catch (e) {
      names.clear()
      ids = null
      failedAt = now()
      log?.warn('nombres ingleses no disponibles; se usarán los del cliente:', String(e))
      return false
    }
  }

  return {
    /** Carga la tabla (una vez; tras un fallo se reintenta pasados 5 min). Nunca lanza. Devuelve true si hay tabla. */
    load() {
      if (names.size) return Promise.resolve(true)
      if (failedAt !== null && now() - failedAt < RETRY_MS) return Promise.resolve(false)
      return (loading ??= run().finally(() => { loading = null }))
    },
    isLoaded: () => names.size > 0,
    /** Nombre inglés de un campeón o null (campeón recién salido que Data Dragon aún no trae, o tabla sin cargar). */
    name: (id) => names.get(id) ?? null,
    /** Id de un campeón a partir de su nombre inglés (como lo devuelve iTero; sin importar mayúsculas ni signos) o null. */
    idOf(name) {
      if (!ids) { ids = new Map(); for (const [id, n] of names) ids.set(nameKey(n), id) }
      return ids.get(nameKey(name)) ?? null
    },
  }
}
