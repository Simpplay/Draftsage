// draftsage/src/infrastructure/coachless/cache.js — caché en memoria con caducidad y peticiones compartidas
//
// - memo(key, fn): si hay un valor vigente lo devuelve; si hay una petición en curso con la misma clave, la comparte;
//   si no, ejecuta fn. Solo se guardan los resultados con `cacheable(valor) === true` (los fallos no se cachean).
// - Máximo `max` entradas (se descarta la más antigua). Nada se persiste: al recargar el cliente se vuelve a pedir.

export function createCache({ ttlMs = 30 * 60 * 1000, max = 200, now = () => Date.now() } = {}) {
  const store = new Map()    // clave -> { value, exp }
  const inflight = new Map() // clave -> Promise

  const get = (key) => {
    const e = store.get(key)
    if (!e) return undefined
    if (e.exp <= now()) { store.delete(key); return undefined }
    return e.value
  }
  const set = (key, value) => {
    store.delete(key)
    store.set(key, { value, exp: now() + ttlMs })
    while (store.size > max) store.delete(store.keys().next().value)
  }

  async function memo(key, fn, cacheable = () => true) {
    const hit = get(key)
    if (hit !== undefined) return hit
    if (inflight.has(key)) return inflight.get(key)
    const p = (async () => {
      try {
        const v = await fn()
        if (cacheable(v)) set(key, v)
        return v
      } finally {
        inflight.delete(key)
      }
    })()
    inflight.set(key, p)
    return p
  }

  return { get, set, memo, clear: () => { store.clear(); inflight.clear() }, size: () => store.size }
}
