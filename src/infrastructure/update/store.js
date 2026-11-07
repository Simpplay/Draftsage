// draftsage/src/infrastructure/update/store.js — almacén de la versión descargada (IndexedDB). El paquete pesa demasiado para el DataStore
// de Pengu (compartido entre plugins, sin cifrar y guardado como JSON). Todo lo guardado se vuelve a verificar al leerlo
// (application/updater.js), así que el almacén no es de confianza: si alguien lo altera, la versión se descarta.
// Nunca lanza: sin IndexedDB (o con errores) `get` devuelve null y `put` false, y el plugin usa el código incluido.

const DB_NAME = 'draftsage-updates'
const STORE = 'kv'

/** @param {IDBFactory|undefined} [idb] */
export function createIdbStore(idb = globalThis.indexedDB) {
  let dbPromise = null
  const open = () => {
    if (!idb) return Promise.reject(new Error('sin IndexedDB'))
    dbPromise ??= new Promise((resolve, reject) => {
      const req = idb.open(DB_NAME, 1)
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE) }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error ?? new Error('IndexedDB'))
    })
    return dbPromise
  }
  const run = async (mode, fn) => {
    const db = await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const out = fn(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(out.result)
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB'))
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB'))
    })
  }
  return {
    async get(key) { try { return (await run('readonly', (s) => s.get(key))) ?? null } catch { return null } },
    async put(key, value) { try { await run('readwrite', (s) => s.put(value, key)); return true } catch { return false } },
    async del(key) { try { await run('readwrite', (s) => s.delete(key)); return true } catch { return false } },
  }
}
