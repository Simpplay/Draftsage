// Actualizaciones firmadas: dominio, criptografía, updater (descarga/verificación/almacén) y loader (qué código arranca).
// Todo con claves reales de Node y dependencias falsas: sin red ni navegador.
import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync, sign } from 'node:crypto'
import { ENTRY, compareVersions, decideUpdate, fileUrl, manifestUrl, parseEnvelope, parseVersion, validatePayload } from '../../src/domain/update.js'
import { byteLength, sha256Hex, verifySignature, verifyWithAny } from '../../src/infrastructure/update/crypto.js'
import { createIdbStore } from '../../src/infrastructure/update/store.js'
import { createFetchText } from '../../src/infrastructure/update/remote.js'
import { createUpdater } from '../../src/application/updater.js'
import { run } from '../../src/application/loader.js'
import { getUpdatePrefs, setUpdatePrefs } from '../../src/application/update-prefs.js'

// ---------- utilidades ----------
const newKey = () => { const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' }); const { x, y } = publicKey.export({ format: 'jwk' }); return { privateKey, jwk: { kty: 'EC', crv: 'P-256', x, y } } }
const signB64 = (privateKey, text) => sign('sha256', Buffer.from(text), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64')

/** Crea un «release» como lo hace dev/tools/release.mjs: paquete + sobre firmado. */
async function makeRelease(key, version, { minLoader = 1, bundle = `export const start = () => '${version}'\n`, tweak } = {}) {
  const obj = { schema: 1, name: 'draftsage', version, minLoader, createdAt: '2026-11-06T00:00:00Z', files: { [ENTRY]: { sha256: await sha256Hex(bundle), size: byteLength(bundle) } } }
  tweak?.(obj)
  const payload = JSON.stringify(obj)
  return { bundle, envelope: JSON.stringify({ payload, signature: signB64(key.privateKey, payload) }) }
}
const memStore = (initial = {}) => {
  const m = new Map(Object.entries(initial))
  return { m, get: async (k) => (m.has(k) ? structuredClone(m.get(k)) : null), put: async (k, v) => { m.set(k, structuredClone(v)); return true }, del: async (k) => { m.delete(k); return true } }
}
const quietLog = () => { const l = { warns: [], infos: [] }; return Object.assign(l, { info: (...a) => l.infos.push(a.join(' ')), warn: (...a) => l.warns.push(a.join(' ')), debug() {}, error() {} }) }
const REPO = 'Simpplay/Draftsage'

function makeUpdater({ key, remote = {}, store = memStore(), localVersion = '1.0.0', loaderApi = 1, keys = [key.jwk] } = {}) {
  const calls = []
  const fetchText = async (url) => { calls.push(url); if (!(url in remote)) throw new Error('HTTP 404'); const v = remote[url]; if (v instanceof Error) throw v; return v }
  const updater = createUpdater({ repo: REPO, publicKeys: keys, loaderApi, localVersion, fetchText, store, verify: verifyWithAny, hash: sha256Hex, size: byteLength, log: quietLog() })
  return { updater, store, calls }
}
const serve = (rel) => ({ [manifestUrl(REPO)]: rel.envelope, [fileUrl(REPO, JSON.parse(JSON.parse(rel.envelope).payload).version, ENTRY)]: rel.bundle })

// ---------- dominio ----------
test('versiones: solo x.y.z estricto y comparación', () => {
  assert.deepEqual(parseVersion('1.2.3'), [1, 2, 3])
  for (const bad of ['v1.2.3', '1.2', '1.2.3-beta', '1.2.3.4', '', null, undefined, 123, '01.2.x']) assert.equal(parseVersion(bad), null, String(bad))
  assert.equal(compareVersions('1.0.10', '1.0.9'), 1)
  assert.equal(compareVersions('1.2.0', '1.10.0'), -1)
  assert.equal(compareVersions('2.0.0', '2.0.0'), 0)
  assert.equal(compareVersions('2.0.0', 'x'), null)
})

test('URLs: jsDelivr con el repo y la etiqueta vX.Y.Z', () => {
  assert.equal(manifestUrl(REPO), 'https://cdn.jsdelivr.net/gh/Simpplay/Draftsage/dist/manifest.json')
  assert.equal(fileUrl(REPO, '1.2.3', 'app.js'), 'https://cdn.jsdelivr.net/gh/Simpplay/Draftsage@v1.2.3/dist/app.js')
})

test('sobre: exige payload texto y firma de 64 bytes en base64', () => {
  const sig = Buffer.alloc(64, 1).toString('base64')
  assert.deepEqual(parseEnvelope(JSON.stringify({ payload: '{}', signature: sig })), { payload: '{}', signature: sig })
  for (const bad of ['no json', '[]', JSON.stringify({ payload: {}, signature: sig }), JSON.stringify({ payload: '{}', signature: 'abc' }), JSON.stringify({ payload: '{}', signature: Buffer.alloc(63).toString('base64') }), 'x'.repeat(20000)]) {
    assert.equal(parseEnvelope(bad), null)
  }
})

test('manifiesto: rechaza formas raras, nombres de archivo ajenos y hashes mal formados', async () => {
  const good = { schema: 1, name: 'draftsage', version: '1.0.1', minLoader: 1, files: { 'app.js': { sha256: 'a'.repeat(64), size: 10 } } }
  assert.equal(validatePayload(JSON.stringify(good)).ok, true)
  const bad = [
    { ...good, schema: 2 }, { ...good, name: 'otro' }, { ...good, version: '1.0' }, { ...good, minLoader: 0 }, { ...good, minLoader: 1.5 },
    { ...good, files: {} }, { ...good, files: { '../evil.js': good.files['app.js'] } }, { ...good, files: { 'app.js': good.files['app.js'], 'extra.js': good.files['app.js'] } },
    { ...good, files: { 'app.js': { sha256: 'A'.repeat(64), size: 10 } } }, { ...good, files: { 'app.js': { sha256: 'a'.repeat(63), size: 10 } } },
    { ...good, files: { 'app.js': { sha256: 'a'.repeat(64), size: 0 } } }, { ...good, files: { 'app.js': { sha256: 'a'.repeat(64), size: 1e9 } } },
  ]
  for (const b of bad) assert.equal(validatePayload(JSON.stringify(b)).ok, false, JSON.stringify(b).slice(0, 80))
  assert.equal(validatePayload('{{').ok, false)
})

test('decideUpdate: descarga solo versiones nuevas, compatibles y no bloqueadas', () => {
  const m = (version, minLoader = 1) => ({ version, minLoader })
  const base = { loaderApi: 1, localVersion: '1.0.0', cachedVersion: null, badVersions: [] }
  assert.equal(decideUpdate({ ...base, manifest: m('1.0.1') }).action, 'download')
  assert.equal(decideUpdate({ ...base, manifest: m('1.0.0') }).reason, 'not-newer-than-local')
  assert.equal(decideUpdate({ ...base, manifest: m('0.9.0') }).reason, 'not-newer-than-local')
  assert.equal(decideUpdate({ ...base, manifest: m('2.0.0', 2) }).reason, 'loader-too-old')
  assert.equal(decideUpdate({ ...base, manifest: m('1.0.2'), cachedVersion: '1.0.2' }).reason, 'same')
  assert.equal(decideUpdate({ ...base, manifest: m('1.0.2'), cachedVersion: '1.0.3' }).reason, 'rollback')
  assert.equal(decideUpdate({ ...base, manifest: m('1.0.2'), cachedVersion: '1.0.1' }).action, 'download')
  assert.equal(decideUpdate({ ...base, manifest: m('1.0.2'), badVersions: ['1.0.2'] }).reason, 'blocked')
})

// ---------- criptografía ----------
test('firma: verifica la buena y rechaza texto alterado, otra clave, firmas rotas y claves no P-256', async () => {
  const a = newKey(), b = newKey()
  const sig = signB64(a.privateKey, 'hola')
  assert.equal(await verifySignature(a.jwk, 'hola', sig), true)
  assert.equal(await verifySignature(a.jwk, 'hola!', sig), false)
  assert.equal(await verifySignature(b.jwk, 'hola', sig), false)
  assert.equal(await verifySignature(a.jwk, 'hola', Buffer.alloc(64).toString('base64')), false)
  assert.equal(await verifySignature(a.jwk, 'hola', 'no es base64!'), false)
  assert.equal(await verifySignature(a.jwk, 'hola', Buffer.alloc(32).toString('base64')), false)
  assert.equal(await verifySignature({ kty: 'RSA' }, 'hola', sig), false)
  assert.equal(await verifySignature(null, 'hola', sig), false)
  // rotación: vale cualquiera de las claves de confianza; sin claves no vale nada
  assert.equal(await verifyWithAny([b.jwk, a.jwk], 'hola', sig), true)
  assert.equal(await verifyWithAny([b.jwk], 'hola', sig), false)
  assert.equal(await verifyWithAny([], 'hola', sig), false)
})

test('sha256 y tamaño en bytes UTF-8', async () => {
  assert.equal(await sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  assert.equal(byteLength('añ'), 3)
})

test('almacén IndexedDB: sin IndexedDB nunca lanza', async () => {
  const s = createIdbStore(undefined)
  assert.equal(await s.get('x'), null); assert.equal(await s.put('x', 1), false); assert.equal(await s.del('x'), false)
})

test('descarga: aborta por tiempo, por HTTP y por tamaño', async () => {
  const resp = (body, { ok = true, status = 200, len } = {}) => ({ ok, status, headers: { get: () => len ?? null }, text: async () => body })
  assert.equal(await createFetchText({ fetchFn: async () => resp('hola') })('u', 100), 'hola')
  await assert.rejects(createFetchText({ fetchFn: async () => resp('', { ok: false, status: 404 }) })('u', 100), /HTTP 404/)
  await assert.rejects(createFetchText({ fetchFn: async () => resp('x', { len: '5000' }) })('u', 100), /grande/)
  await assert.rejects(createFetchText({ fetchFn: async () => resp('x'.repeat(200)) })('u', 100), /grande/)
  await assert.rejects(createFetchText({ timeoutMs: 20, fetchFn: (u, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('abortado')))) })('u', 100), /abortado/)
})

// ---------- updater ----------
test('updater: descarga, verifica y guarda; la versión guardada se recupera verificada', async () => {
  const key = newKey()
  const rel = await makeRelease(key, '1.0.1')
  const { updater, store } = makeUpdater({ key, remote: serve(rel) })
  assert.deepEqual(await updater.check(), { status: 'downloaded', version: '1.0.1' })
  assert.ok(store.m.has('current'))
  const got = await updater.loadVerified()
  assert.equal(got.version, '1.0.1'); assert.equal(got.source, rel.bundle)
  assert.equal((await updater.check()).reason, 'same')
})

test('updater: sin claves o sin repositorio válido está desactivado y no toca la red', async () => {
  const key = newKey()
  const a = makeUpdater({ key, keys: [] })
  assert.equal(a.updater.enabled(), false); assert.deepEqual(await a.updater.check(), { status: 'disabled' }); assert.equal(await a.updater.loadVerified(), null); assert.equal(a.calls.length, 0)
})

test('updater: manifiesto firmado por otra clave, alterado o basura → rechazado y nada se guarda', async () => {
  const good = newKey(), evil = newKey()
  const forged = await makeRelease(evil, '9.9.9')
  let r = makeUpdater({ key: good, remote: serve(forged) })
  assert.equal((await r.updater.check()).status, 'rejected'); assert.equal(r.store.m.size, 0)
  assert.equal(r.calls.length, 1)                                     // ni siquiera pide el paquete

  const rel = await makeRelease(good, '1.0.1')
  const env = JSON.parse(rel.envelope); env.payload = env.payload.replace('1.0.1', '9.9.9')
  r = makeUpdater({ key: good, remote: { [manifestUrl(REPO)]: JSON.stringify(env) } })
  assert.equal((await r.updater.check()).reason, 'firma')

  r = makeUpdater({ key: good, remote: { [manifestUrl(REPO)]: '<html>captive portal</html>' } })
  assert.equal((await r.updater.check()).reason, 'sobre')
})

test('updater: paquete que no coincide con el hash o el tamaño firmados → rechazado', async () => {
  const key = newKey()
  const rel = await makeRelease(key, '1.0.1')
  let r = makeUpdater({ key, remote: { ...serve(rel), [fileUrl(REPO, '1.0.1', ENTRY)]: rel.bundle + 'fetch("https://evil")' } })
  assert.equal((await r.updater.check()).reason, 'hash'); assert.equal(r.store.m.size, 0)
  r = makeUpdater({ key, remote: { ...serve(rel), [fileUrl(REPO, '1.0.1', ENTRY)]: rel.bundle.replace('1.0.1', '1.0.2') } }) // mismo tamaño, distinto contenido
  assert.equal((await r.updater.check()).reason, 'hash')
})

test('updater: anti-rollback, versión no superior a la incluida y loader demasiado antiguo', async () => {
  const key = newKey()
  const v2 = await makeRelease(key, '1.0.2'), v1 = await makeRelease(key, '1.0.1')
  const r = makeUpdater({ key, remote: serve(v2) })
  assert.equal((await r.updater.check()).status, 'downloaded')
  const older = makeUpdater({ key, store: r.store, remote: serve(v1) })      // el servidor «vuelve» a 1.0.1 (manifiesto antiguo, firma válida)
  assert.equal((await older.updater.check()).reason, 'rollback')
  assert.equal((await older.updater.loadVerified()).version, '1.0.2')       // lo guardado no se toca

  const same = makeUpdater({ key, remote: serve(await makeRelease(key, '1.0.0')) })
  assert.equal((await same.updater.check()).reason, 'not-newer-than-local')

  const future = makeUpdater({ key, remote: serve(await makeRelease(key, '2.0.0', { minLoader: 2 })) })
  assert.deepEqual(await future.updater.check(), { status: 'skip', reason: 'loader-too-old', version: '2.0.0' })
  assert.equal(future.store.m.size, 0)
})

test('updater: lo guardado se re-verifica al leer; si lo tocan, se borra y se usa el código incluido', async () => {
  const key = newKey()
  const rel = await makeRelease(key, '1.0.1')
  const base = async () => { const r = makeUpdater({ key, remote: serve(rel) }); await r.updater.check(); return r }
  let r = await base()
  const rec = r.store.m.get('current'); rec.files[ENTRY] += ' //'; r.store.m.set('current', rec)
  assert.equal(await r.updater.loadVerified(), null); assert.equal(r.store.m.has('current'), false)

  r = await base()
  const rec2 = r.store.m.get('current'); rec2.version = '1.0.9'; r.store.m.set('current', rec2)  // versión que no es la firmada
  assert.equal(await r.updater.loadVerified(), null)

  r = await base()
  const evil = makeUpdater({ key: newKey(), store: r.store })                                       // otro juego de claves de confianza
  assert.equal(await evil.updater.loadVerified(), null)

  r = await base()
  const newer = makeUpdater({ key, store: r.store, localVersion: '1.0.1' })                         // el plugin reinstalado ya trae esa versión
  assert.equal(await newer.updater.loadVerified(), null); assert.equal(r.store.m.has('current'), false)

  r = await base()
  const tooOld = makeUpdater({ key, store: r.store, loaderApi: 0 })                                 // (defensivo) loader por debajo del mínimo
  assert.equal(await tooOld.updater.loadVerified(), null)
})

test('updater: marcar una versión defectuosa la borra y no se vuelve a descargar', async () => {
  const key = newKey()
  const rel = await makeRelease(key, '1.0.1')
  const r = makeUpdater({ key, remote: serve(rel) })
  await r.updater.check()
  await r.updater.markBad('1.0.1')
  assert.equal(r.store.m.has('current'), false)
  assert.equal((await r.updater.check()).reason, 'blocked')
  await r.updater.markBad('basura'); await r.updater.markBad(undefined)       // entradas inválidas se ignoran
  assert.deepEqual(r.store.m.get('bad'), ['1.0.1'])
})

test('updater: errores de red o de almacén nunca lanzan', async () => {
  const key = newKey()
  assert.deepEqual(await makeUpdater({ key, remote: { [manifestUrl(REPO)]: new Error('offline') } }).updater.check(), { status: 'error', reason: 'red' })
  const rel = await makeRelease(key, '1.0.1')
  const r = makeUpdater({ key, remote: serve(rel) }); r.store.put = async () => false
  assert.equal((await r.updater.check()).reason, 'almacén')
})

// ---------- ajustes ----------
test('ajustes de actualización: valores por defecto, saneado y persistencia', () => {
  DataStore.remove('draftsage/updates')
  assert.deepEqual(getUpdatePrefs(), { mode: 'auto', lastNotified: '' })
  setUpdatePrefs({ mode: 'packaged', lastNotified: '1.2.3' })
  assert.deepEqual(getUpdatePrefs(), { mode: 'packaged', lastNotified: '1.2.3' })
  setUpdatePrefs({ mode: 'loquesea', lastNotified: 'v9' })
  assert.deepEqual(getUpdatePrefs(), { mode: 'auto', lastNotified: '' })
  DataStore.set('draftsage/updates', 'corrupto')
  assert.equal(getUpdatePrefs().mode, 'auto')
})

// ---------- loader ----------
function loaderDeps({ mode = 'auto', enabled = true, cached = null, remoteModule, packagedModule, checkResult = { status: 'skip' } } = {}) {
  const t = { markBad: [], timers: [], events: [], imports: [], loadVerified: 0 }
  const packaged = packagedModule ?? { start: async () => 'packaged-started' }
  return {
    t,
    deps: {
      getPrefs: () => ({ mode, lastNotified: '' }), localVersion: '1.0.0',
      updater: { enabled: () => enabled, loadVerified: async () => { t.loadVerified++; return cached }, markBad: async (v) => { t.markBad.push(v) }, check: async () => checkResult },
      importRemote: async (src) => { t.imports.push('remote'); if (remoteModule instanceof Error) throw remoteModule; return remoteModule ?? { start: async () => 'remote-started', src } },
      importPackaged: async () => { t.imports.push('packaged'); return packaged },
      emit: (d) => t.events.push(d), schedule: (fn, ms) => t.timers.push({ fn, ms }),
    },
  }
}

test('loader: modo «solo incluida» ni mira el almacén ni programa comprobaciones', async () => {
  const { t, deps } = loaderDeps({ mode: 'packaged', cached: { version: '1.0.1', source: 'x' } })
  assert.equal(await run(deps), 'packaged-started')
  assert.deepEqual(t.imports, ['packaged']); assert.equal(t.loadVerified, 0); assert.equal(t.timers.length, 0)
  assert.equal(window.draftsage.build().source, 'packaged')
})

test('loader: sin claves de confianza arranca el código incluido y no busca actualizaciones', async () => {
  const { t, deps } = loaderDeps({ enabled: false, cached: { version: '1.0.1', source: 'x' } })
  assert.equal(await run(deps), 'packaged-started')
  assert.equal(t.loadVerified, 0); assert.equal(t.timers.length, 0)
})

test('loader: con una versión descargada y verificada arranca esa', async () => {
  const { t, deps } = loaderDeps({ cached: { version: '1.0.1', source: 'CODIGO' } })
  assert.equal(await run(deps), 'remote-started')
  assert.deepEqual(t.imports, ['remote'])
  assert.deepEqual({ v: window.draftsage.build().version, s: window.draftsage.build().source }, { v: '1.0.1', s: 'remote' })
  assert.equal(t.timers.length, 1)                                    // comprobación en segundo plano
})

test('loader: sin versión descargada arranca la incluida (y comprueba después)', async () => {
  const { t, deps } = loaderDeps({ cached: null })
  assert.equal(await run(deps), 'packaged-started'); assert.deepEqual(t.imports, ['packaged']); assert.equal(t.timers.length, 1)
})

test('loader: si la versión descargada no se puede cargar, usa la incluida y la marca defectuosa', async () => {
  const { t, deps } = loaderDeps({ cached: { version: '1.0.1', source: 'x' }, remoteModule: new SyntaxError('boom') })
  assert.equal(await run(deps), 'packaged-started')
  assert.deepEqual(t.imports, ['remote', 'packaged']); assert.deepEqual(t.markBad, ['1.0.1'])
  assert.equal(window.draftsage.build().source, 'packaged'); assert.equal(window.draftsage.build().version, '1.0.0')
})

test('loader: un paquete sin start() se trata como cargado mal', async () => {
  const { t, deps } = loaderDeps({ cached: { version: '1.0.1', source: 'x' }, remoteModule: { nada: 1 } })
  assert.equal(await run(deps), 'packaged-started'); assert.deepEqual(t.markBad, ['1.0.1'])
})

test('loader: si la versión descargada falla al arrancar, se marca defectuosa y el error sigue subiendo (sin doble arranque)', async () => {
  const { t, deps } = loaderDeps({ cached: { version: '1.0.1', source: 'x' }, remoteModule: { start: async () => { throw new Error('explotó') } } })
  await assert.rejects(run(deps), /explotó/)
  assert.deepEqual(t.markBad, ['1.0.1']); assert.deepEqual(t.imports, ['remote'])
})

test('loader: un fallo del código incluido no marca nada y se propaga', async () => {
  const { t, deps } = loaderDeps({ packagedModule: { start: async () => { throw new Error('mal') } } })
  await assert.rejects(run(deps), /mal/); assert.deepEqual(t.markBad, [])
})

test('loader: avisa una sola vez de cada versión descargada y del «hay que reinstalar»', async () => {
  const state = { r: { status: 'downloaded', version: '1.0.1' } }
  const { t, deps } = loaderDeps()
  deps.updater.check = async () => state.r
  await run(deps)
  const tick = async () => { const { fn } = t.timers.at(-1); await fn() }
  await tick(); await tick()
  assert.deepEqual(t.events, [{ kind: 'downloaded', version: '1.0.1' }])
  assert.equal(window.draftsage.build().pending, '1.0.1')
  state.r = { status: 'downloaded', version: '1.0.2' }; await tick()
  assert.equal(t.events.length, 2)
  state.r = { status: 'skip', reason: 'loader-too-old', version: '3.0.0' }; await tick(); await tick()
  assert.deepEqual(t.events.at(-1), { kind: 'reinstall', version: '3.0.0' }); assert.equal(t.events.length, 3)
  assert.equal(window.draftsage.build().needsReinstall, true)
  assert.equal(t.timers.at(-1).ms, 6 * 60 * 60 * 1000)               // se vuelve a programar
})
