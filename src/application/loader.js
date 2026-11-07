// draftsage/src/application/loader.js — LOADER: decide qué código ejecuta el plugin y lo arranca. Lo invoca index.js.
//
// Orden de arranque (nunca bloquea ni depende de la red):
//   1. modo «packaged» o sin claves de confianza → código incluido en el plugin (src/application/bootstrap.js).
//   2. modo «auto» → si hay una versión descargada y TODAVÍA verifica (firma + hash), se ejecuta esa; si no, el código incluido.
//   3. en segundo plano busca una versión nueva; si la descarga y verifica, se aplica en el SIGUIENTE arranque (aviso por evento).
// Si la versión remota falla al cargarla (sintaxis, import) se usa la incluida en el momento; si falla al arrancar (start lanza) se marca
// como defectuosa y el siguiente arranque vuelve al código incluido. No hay doble arranque: un start() a medias deja efectos en el DOM.
//
// Este archivo y los de infrastructure/update/ son el loader: están en el equipo del usuario y NO se actualizan solos (ver docs/RELEASING.md).

import { createUpdater } from './updater.js'
import { getUpdatePrefs } from './update-prefs.js'
import { LOADER_API, PUBLIC_KEYS, UPDATE_REPO } from '../infrastructure/update/config.js'
import { byteLength, sha256Hex, verifyWithAny } from '../infrastructure/update/crypto.js'
import { createIdbStore } from '../infrastructure/update/store.js'
import { createFetchText, importModuleText } from '../infrastructure/update/remote.js'
import { VERSION } from '../shared/version.js'
import { log } from '../shared/logger.js'

const FIRST_CHECK_MS = 8000
const RECHECK_MS = 6 * 60 * 60 * 1000

function realDeps() {
  return {
    getPrefs: getUpdatePrefs,
    localVersion: VERSION,
    updater: createUpdater({
      repo: UPDATE_REPO, publicKeys: PUBLIC_KEYS, loaderApi: LOADER_API, localVersion: VERSION,
      fetchText: createFetchText(), store: createIdbStore(), verify: verifyWithAny, hash: sha256Hex, size: byteLength, log,
    }),
    importRemote: importModuleText,
    importPackaged: () => import('./bootstrap.js'),
    emit: (detail) => window.dispatchEvent(new CustomEvent('draftsage:update', { detail })),
    schedule: (fn, ms) => setTimeout(fn, ms),
  }
}

/**
 * @param {ReturnType<typeof realDeps>} [deps] (se inyectan en las pruebas)
 */
export async function run(deps = realDeps()) {
  const { getPrefs, updater, importRemote, importPackaged, emit, schedule, localVersion } = deps
  const prefs = getPrefs()
  const info = { version: localVersion, source: 'packaged', mode: prefs.mode, remoteEnabled: updater.enabled(), pending: null, needsReinstall: false }
  // Estado visible para la interfaz y el soporte:  draftsage.build()
  window.draftsage = Object.assign(window.draftsage ?? {}, { build: () => ({ ...info }) })

  let app = null
  if (prefs.mode === 'auto' && info.remoteEnabled) {
    let cached = null
    try {
      cached = await updater.loadVerified()
      if (cached) {
        app = await importRemote(cached.source)
        if (typeof app?.start !== 'function') throw new Error('el paquete no exporta start()')
        info.version = cached.version
        info.source = 'remote'
      }
    } catch (e) {
      log.error('la versión descargada no se pudo cargar; se usa la incluida:', e?.message ?? String(e))
      if (cached) await updater.markBad(cached.version)
      app = null
      info.version = localVersion
      info.source = 'packaged'
    }
  } else if (prefs.mode === 'auto') {
    log.info('actualizaciones remotas desactivadas (aún no hay claves de firma en el loader)')
  } else {
    log.info('modo «solo versión incluida»: no se buscan actualizaciones')
  }
  app ??= await importPackaged()

  if (prefs.mode === 'auto' && info.remoteEnabled) scheduleChecks({ updater, info, emit, schedule })

  log.info('versión', info.version, '(' + info.source + ')')
  try {
    return await app.start()
  } catch (e) {
    if (info.source === 'remote') {
      log.error('la versión descargada falló al arrancar; el próximo arranque usará la incluida')
      await updater.markBad(info.version)
    }
    throw e
  }
}

function scheduleChecks({ updater, info, emit, schedule }) {
  let notified = null
  const tick = async () => {
    const r = await updater.check()
    if (r.status === 'downloaded' && r.version !== notified) { notified = r.version; info.pending = r.version; emit({ kind: 'downloaded', version: r.version }) }
    else if (r.status === 'skip' && r.reason === 'loader-too-old' && notified !== 'reinstall') { notified = 'reinstall'; info.needsReinstall = true; emit({ kind: 'reinstall', version: r.version }) }
    schedule(tick, RECHECK_MS)
  }
  schedule(tick, FIRST_CHECK_MS)
}
