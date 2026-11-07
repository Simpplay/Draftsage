// dev/tools/release.mjs — empaqueta, firma y deja listo un release de Draftsage.
// Uso:   node dev/tools/release.mjs <x.y.z> [--key <ruta.pem>] [--require-tests]
//   1. comprueba la versión (mayor que la actual), la clave (debe estar registrada en el loader) y pasa dev/tools/check.mjs (+ pruebas)
//   2. escribe src/shared/version.js
//   3. empaqueta src/application/bootstrap.js en UN archivo con esbuild  →  dist/app.js
//   4. crea y firma el manifiesto (hash SHA-256 + tamaño)                →  dist/manifest.json
//   5. se verifica a sí mismo exactamente como lo hará el loader (firma, hash, tamaño, sintaxis) y solo entonces escribe dist/
// NO hace commit, ni etiqueta, ni sube nada: al final imprime los comandos de git. dist/ se versiona en el repositorio (jsDelivr lo sirve desde ahí).
// La clave privada se lee de --key, de DRAFTSAGE_SIGNING_KEY o de ~/.draftsage/signing-key.pem (ver keygen.mjs) y nunca debe estar en el repositorio.
import { createPrivateKey, createPublicKey, sign } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = resolve(import.meta.dirname, '..', '..')
const src = (...p) => pathToFileURL(join(root, 'src', ...p)).href
const { compareVersions, parseVersion, parseEnvelope, validatePayload, ENTRY, MAX_BUNDLE_BYTES } = await import(src('domain', 'update.js'))
const { LOADER_API, PUBLIC_KEYS } = await import(src('infrastructure', 'update', 'config.js'))
const { byteLength, sha256Hex, verifyWithAny } = await import(src('infrastructure', 'update', 'crypto.js'))

const die = (m) => { console.error('✗', m); process.exit(1) }
const args = process.argv.slice(2)
const flag = (n) => args.includes(n)
const keyArg = flag('--key') ? args[args.indexOf('--key') + 1] : null
const version = args.find((a) => !a.startsWith('--') && a !== keyArg)
const keyPath = resolve(keyArg ?? process.env.DRAFTSAGE_SIGNING_KEY ?? join(homedir(), '.draftsage', 'signing-key.pem'))

if (!parseVersion(version)) die('Uso: node dev/tools/release.mjs <x.y.z> [--key <ruta.pem>] [--require-tests]')
if ((keyPath + sep).startsWith(root + sep)) die('La clave privada no puede estar dentro del repositorio.')

const versionFile = join(root, 'src', 'shared', 'version.js')
const previousText = readFileSync(versionFile, 'utf8')
const current = /VERSION = '([^']+)'/.exec(previousText)?.[1]
if (compareVersions(version, current) !== 1) die(`La versión ${version} debe ser mayor que la actual (${current}).`)
if (!PUBLIC_KEYS.length) die('No hay claves públicas en el loader. Ejecuta primero: node dev/tools/keygen.mjs')

let privateKey
try { privateKey = createPrivateKey(readFileSync(keyPath)) } catch { die('No se pudo leer la clave privada en ' + keyPath + ' (ver keygen.mjs).') }
const mine = createPublicKey(privateKey).export({ format: 'jwk' })
if (!PUBLIC_KEYS.some((k) => k.x === mine.x && k.y === mine.y)) die('Esa clave privada no corresponde a ninguna clave pública registrada en el loader (config.js).')

console.log('· comprobaciones (check.mjs)')
try { execFileSync(process.execPath, [join(root, 'dev', 'tools', 'check.mjs')], { stdio: 'inherit' }) } catch { die('check.mjs falló.') }
console.log('· pruebas')
const tests = spawnSync(process.execPath, [join(root, 'dev', 'tests', 'run.mjs')], { stdio: 'inherit' })
if (tests.status !== 0) {
  if (flag('--require-tests')) die('Las pruebas fallan y se pidió --require-tests.')
  console.warn('! Hay pruebas que fallan (revisa que sean las ya conocidas en docs/HANDOFF.md). Se continúa; usa --require-tests para bloquear.')
}

const dist = join(root, 'dist')
const tmp = mkdtempSync(join(tmpdir(), 'draftsage-release-'))
try {
  writeFileSync(versionFile, previousText.replace(/VERSION = '[^']+'/, `VERSION = '${version}'`))

  console.log('· empaquetando con esbuild')
  const result = await build({
    entryPoints: [join(root, 'src', 'application', 'bootstrap.js')], bundle: true, format: 'esm', target: 'chrome90', platform: 'browser',
    write: false, legalComments: 'none', logLevel: 'warning', banner: { js: `/* draftsage v${version} — generado por dev/tools/release.mjs; no editar */` },
  })
  if (result.outputFiles.length !== 1) throw new Error('esbuild devolvió más de un archivo')
  const bundle = result.outputFiles[0].text
  if (byteLength(bundle) > MAX_BUNDLE_BYTES) throw new Error('el paquete supera el tope de tamaño')

  const payload = JSON.stringify({
    schema: 1, name: 'draftsage', version, minLoader: LOADER_API, createdAt: new Date().toISOString(),
    files: { [ENTRY]: { sha256: await sha256Hex(bundle), size: byteLength(bundle) } },
  })
  const signature = sign('sha256', Buffer.from(payload), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64')
  const manifest = JSON.stringify({ payload, signature }, null, 2) + '\n'

  console.log('· verificando como lo hará el loader')
  const env = parseEnvelope(manifest)
  if (!env) throw new Error('el sobre del manifiesto no es válido')
  if (!(await verifyWithAny(PUBLIC_KEYS, env.payload, env.signature))) throw new Error('la firma no verifica con las claves del loader')
  const v = validatePayload(env.payload)
  if (!v.ok) throw new Error('manifiesto inválido: ' + v.reason)
  if (v.manifest.file.sha256 !== await sha256Hex(bundle) || v.manifest.file.size !== byteLength(bundle)) throw new Error('hash/tamaño no coinciden')
  const probe = join(tmp, 'app.mjs'); writeFileSync(probe, bundle)
  execFileSync(process.execPath, ['--check', probe], { stdio: 'pipe' })

  mkdirSync(dist, { recursive: true })
  writeFileSync(join(dist, ENTRY), bundle)
  writeFileSync(join(dist, 'manifest.json'), manifest)
  console.log(`✓ dist/app.js (${(byteLength(bundle) / 1024).toFixed(0)} KB) y dist/manifest.json firmados — versión ${version}`)
  console.log(`\nSiguiente (revisa el diff antes):\n  git add -A\n  git commit -m "release v${version}"\n  git tag v${version}\n  git push origin main --tags\n` +
    '  # jsDelivr tarda hasta ~12 h en resolver «la última»; para acelerarlo: https://purge.jsdelivr.net/gh/Simpplay/Draftsage/dist/manifest.json')
} catch (e) {
  writeFileSync(versionFile, previousText)
  die('Release abortado (version.js restaurado): ' + (e?.message ?? e))
} finally { rmSync(tmp, { recursive: true, force: true }) }
