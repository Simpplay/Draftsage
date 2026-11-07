// draftsage/src/domain/update.js — reglas puras de las actualizaciones: versiones, manifiesto firmado y decisión de descargar.
// Sin red, sin DataStore, sin criptografía (eso vive en infrastructure/update/). Se prueba con node --test.

export const ENTRY = 'app.js'                    // único archivo que se descarga y ejecuta
export const MAX_BUNDLE_BYTES = 6 * 1024 * 1024  // tope de tamaño del paquete (el real ronda 0,5 MB)
export const MAX_ENVELOPE_BYTES = 16 * 1024      // tope del manifiesto firmado

const REPO_RE = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/
const SEMVER_RE = /^(\d{1,4})\.(\d{1,4})\.(\d{1,4})$/
const SHA256_RE = /^[0-9a-f]{64}$/

export const isValidRepo = (repo) => typeof repo === 'string' && REPO_RE.test(repo)

/** '1.2.3' → [1, 2, 3] · cualquier otra cosa (prefijos, sufijos, vacío…) → null. */
export function parseVersion(v) {
  const m = typeof v === 'string' ? SEMVER_RE.exec(v) : null
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

/** -1 / 0 / 1, o null si alguna de las dos versiones no es válida. */
export function compareVersions(a, b) {
  const x = parseVersion(a), y = parseVersion(b)
  if (!x || !y) return null
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1
  return 0
}

/** Manifiesto de la última versión publicada (jsDelivr resuelve «la última» al omitir la versión; puede tardar hasta ~12 h). */
export const manifestUrl = (repo) => `https://cdn.jsdelivr.net/gh/${repo}/dist/manifest.json`
/** Archivo de una versión concreta (la etiqueta de git es «v1.2.3»). Su integridad la fija el manifiesto firmado, no la CDN. */
export const fileUrl = (repo, version, name) => `https://cdn.jsdelivr.net/gh/${repo}@v${version}/dist/${name}`

/**
 * El manifiesto publicado es un sobre `{ payload, signature }`: `payload` es el JSON del manifiesto como TEXTO (los mismos bytes que se
 * firmaron, sin recanonicalizar) y `signature` la firma ECDSA P-256 en base64 (r‖s, 64 bytes).
 * @returns {{payload:string, signature:string}|null}
 */
export function parseEnvelope(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_ENVELOPE_BYTES) return null
  let o
  try { o = JSON.parse(raw) } catch { return null }
  if (!o || typeof o.payload !== 'string' || typeof o.signature !== 'string') return null
  if (!/^[A-Za-z0-9+/]{86}==$/.test(o.signature)) return null // 64 bytes en base64
  return { payload: o.payload, signature: o.signature }
}

/**
 * Valida el contenido ya verificado por firma. Estricto a propósito: nombres de archivo fijos, hashes y tamaños acotados.
 * @returns {{ok:true, manifest:{version:string, minLoader:number, createdAt:string, file:{sha256:string, size:number}}}|{ok:false, reason:string}}
 */
export function validatePayload(payload) {
  let o
  try { o = JSON.parse(payload) } catch { return { ok: false, reason: 'json' } }
  if (!o || typeof o !== 'object') return { ok: false, reason: 'forma' }
  if (o.schema !== 1) return { ok: false, reason: 'schema' }
  if (o.name !== 'draftsage') return { ok: false, reason: 'nombre' }
  if (!parseVersion(o.version)) return { ok: false, reason: 'versión' }
  if (!Number.isInteger(o.minLoader) || o.minLoader < 1 || o.minLoader > 1000) return { ok: false, reason: 'minLoader' }
  const files = o.files
  if (!files || typeof files !== 'object' || Object.keys(files).length !== 1 || !(ENTRY in files)) return { ok: false, reason: 'archivos' }
  const f = files[ENTRY]
  if (!f || !SHA256_RE.test(f.sha256) || !Number.isInteger(f.size) || f.size < 1 || f.size > MAX_BUNDLE_BYTES) return { ok: false, reason: 'archivo' }
  return { ok: true, manifest: { version: o.version, minLoader: o.minLoader, createdAt: typeof o.createdAt === 'string' ? o.createdAt.slice(0, 40) : '', file: { sha256: f.sha256, size: f.size } } }
}

/**
 * ¿Hay que descargar? Nunca se baja una versión menor que la ya guardada (protección contra repetir manifiestos antiguos firmados).
 * @returns {{action:'download'} | {action:'skip', reason:'loader-too-old'|'blocked'|'not-newer-than-local'|'same'|'rollback'}}
 */
export function decideUpdate({ manifest, loaderApi, localVersion, cachedVersion = null, badVersions = [] }) {
  if (manifest.minLoader > loaderApi) return { action: 'skip', reason: 'loader-too-old' }
  if (badVersions.includes(manifest.version)) return { action: 'skip', reason: 'blocked' }
  if (compareVersions(manifest.version, localVersion) !== 1) return { action: 'skip', reason: 'not-newer-than-local' }
  if (cachedVersion) {
    const c = compareVersions(manifest.version, cachedVersion)
    if (c === 0) return { action: 'skip', reason: 'same' }
    if (c === -1) return { action: 'skip', reason: 'rollback' }
  }
  return { action: 'download' }
}
