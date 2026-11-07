// draftsage/src/application/updater.js — actualizaciones firmadas: descargar, verificar y guardar; y recuperar la guardada ya verificada.
//
// Modelo de confianza (resumen; detalle en docs/ARCHITECTURE.md y docs/RELEASING.md):
//   · El plugin trae un LOADER fijo con las claves públicas. Solo se ejecuta código remoto si un manifiesto lleva la firma de esas claves
//     y el paquete coincide con el hash y el tamaño del manifiesto. Quien controle GitHub/jsDelivr pero no la clave privada no ejecuta nada.
//   · Lo guardado se vuelve a verificar CADA VEZ que se lee (el almacén no es de confianza).
//   · Nunca se baja una versión menor que la guardada (anti-rollback) ni una que no supere a la incluida en el plugin.
// Todas las dependencias (red, almacén, cripto) entran por parámetro: así se prueba sin red ni navegador.

import { ENTRY, MAX_ENVELOPE_BYTES, compareVersions, decideUpdate, fileUrl, isValidRepo, manifestUrl, parseEnvelope, parseVersion, validatePayload } from '../domain/update.js'

const BAD_MAX = 20

/**
 * @param {{repo:string, publicKeys:object[], loaderApi:number, localVersion:string,
 *          fetchText:(url:string, maxBytes:number)=>Promise<string>,
 *          store:{get:(k:string)=>Promise<any>, put:(k:string,v:any)=>Promise<boolean>, del:(k:string)=>Promise<boolean>},
 *          verify:(keys:object[], payload:string, sig:string)=>Promise<boolean>,
 *          hash:(text:string)=>Promise<string>, size:(text:string)=>number,
 *          log:{info:Function, warn:Function}}} deps
 */
export function createUpdater({ repo, publicKeys, loaderApi, localVersion, fetchText, store, verify, hash, size, log }) {
  /** Sin repositorio válido o sin claves de confianza no hay actualizaciones remotas. */
  const enabled = () => isValidRepo(repo) && Array.isArray(publicKeys) && publicKeys.length > 0

  async function readEnvelope(raw) {
    const env = parseEnvelope(raw)
    if (!env) return { ok: false, reason: 'sobre' }
    if (!(await verify(publicKeys, env.payload, env.signature))) return { ok: false, reason: 'firma' }
    const v = validatePayload(env.payload)
    return v.ok ? { ok: true, manifest: v.manifest } : { ok: false, reason: 'manifiesto: ' + v.reason }
  }

  const bundleMatches = async (manifest, text) =>
    typeof text === 'string' && size(text) === manifest.file.size && (await hash(text)) === manifest.file.sha256

  const badVersions = async () => {
    const b = await store.get('bad')
    return Array.isArray(b) ? b.filter((v) => parseVersion(v)) : []
  }

  /**
   * La versión guardada, SOLO si sigue siendo válida: firma, manifiesto, hash, tamaño, versión mayor que la incluida y compatible con este loader.
   * Si no, la borra y devuelve null (se usa el código incluido).
   * @returns {Promise<{version:string, source:string}|null>}
   */
  async function loadVerified() {
    if (!enabled()) return null
    const rec = await store.get('current')
    if (!rec) return null
    const drop = async (why) => { log.warn('versión descargada descartada:', why); await store.del('current'); return null }
    const r = await readEnvelope(rec.envelope)
    if (!r.ok) return drop(r.reason)
    const m = r.manifest
    if (m.version !== rec.version) return drop('la versión guardada no coincide con la firmada')
    if (compareVersions(m.version, localVersion) !== 1) return drop('ya no supera a la versión incluida')
    if (m.minLoader > loaderApi) return drop('exige un loader más nuevo')
    if ((await badVersions()).includes(m.version)) return drop('marcada como defectuosa')
    const text = rec.files?.[ENTRY]
    if (!(await bundleMatches(m, text))) return drop('el paquete no coincide con el manifiesto')
    return { version: m.version, source: text }
  }

  /**
   * Busca una versión nueva y, si la hay y es válida, la guarda para el PRÓXIMO arranque. Nunca lanza.
   * @returns {Promise<{status:'disabled'|'downloaded'|'skip'|'rejected'|'error', version?:string, reason?:string}>}
   */
  async function check() {
    if (!enabled()) return { status: 'disabled' }
    try {
      const raw = await fetchText(manifestUrl(repo), MAX_ENVELOPE_BYTES)
      const r = await readEnvelope(raw)
      if (!r.ok) { log.warn('manifiesto remoto rechazado:', r.reason); return { status: 'rejected', reason: r.reason } }
      const m = r.manifest
      const cached = await store.get('current')
      const d = decideUpdate({ manifest: m, loaderApi, localVersion, cachedVersion: parseVersion(cached?.version) ? cached.version : null, badVersions: await badVersions() })
      if (d.action === 'skip') { log.debug('actualización omitida:', d.reason, m.version); return { status: 'skip', reason: d.reason, version: m.version } }

      const text = await fetchText(fileUrl(repo, m.version, ENTRY), m.file.size)
      if (!(await bundleMatches(m, text))) { log.warn('paquete remoto rechazado: no coincide con el manifiesto firmado', m.version); return { status: 'rejected', reason: 'hash', version: m.version } }
      const saved = await store.put('current', { version: m.version, envelope: raw, files: { [ENTRY]: text }, savedAt: Date.now() })
      if (!saved) return { status: 'error', reason: 'almacén', version: m.version }
      log.info('versión', m.version, 'descargada y verificada; se aplica al reiniciar el cliente')
      return { status: 'downloaded', version: m.version }
    } catch (e) {
      log.warn('no se pudo comprobar actualizaciones:', e?.message ?? String(e))
      return { status: 'error', reason: 'red' }
    }
  }

  /** Marca una versión como defectuosa (falló al cargar o al arrancar): no se vuelve a usar ni a descargar. */
  async function markBad(version) {
    if (!parseVersion(version)) return
    const bad = [...new Set([...(await badVersions()), version])].slice(-BAD_MAX)
    await store.put('bad', bad)
    const cur = await store.get('current')
    if (cur?.version === version) await store.del('current')
  }

  return { enabled, loadVerified, check, markBad }
}
