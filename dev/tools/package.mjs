// dev/tools/package.mjs — crea el .zip que se distribuye a los usuarios, a partir de lo COMMITEADO (git archive de HEAD), tras comprobar que el release es coherente.
// Uso:   node dev/tools/package.mjs [--tag vX.Y.Z] [--out <carpeta>]      (por defecto la carpeta es ./release-assets)
// Lo usa el workflow .github/workflows/release.yml al subir una etiqueta, y puedes ejecutarlo a mano para probar.
//
// Qué lleva el zip:  draftsage/{index.js, README.md, src/**}   (nada de dev/, docs/, dist/, .git ni CLAUDE.md)
// Qué comprueba antes de crearlo (si algo falla, no crea nada):
//   · la etiqueta (si se pasa) es exactamente v<VERSION de src/shared/version.js>
//   · hay al menos una clave pública en el loader (si no, los usuarios no recibirían nunca actualizaciones)
//   · dist/manifest.json está firmado por una de esas claves, es de esta misma versión y dist/app.js coincide con su hash y tamaño
//   · los archivos del zip no tienen cambios sin commitear, y no hay ninguna clave privada (*.pem, *.key) versionada
// Nunca firma nada ni necesita la clave privada: la firma se hace en tu equipo con release.mjs.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..', '..')
const src = (...p) => pathToFileURL(join(root, 'src', ...p)).href
const { parseEnvelope, validatePayload, ENTRY } = await import(src('domain', 'update.js'))
const { PUBLIC_KEYS } = await import(src('infrastructure', 'update', 'config.js'))
const { byteLength, sha256Hex, verifyWithAny } = await import(src('infrastructure', 'update', 'crypto.js'))

const die = (m) => { console.error('✗', m); process.exit(1) }
const arg = (n) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null)
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' })
const INCLUDE = ['index.js', 'README.md', 'src']

const version = /VERSION = '([^']+)'/.exec(readFileSync(join(root, 'src', 'shared', 'version.js'), 'utf8'))?.[1]
if (!version) die('No se pudo leer la versión de src/shared/version.js')
const tag = arg('--tag')
if (tag && tag !== `v${version}`) die(`La etiqueta ${tag} no coincide con la versión del código (v${version}). Etiqueta el commit del release.`)

if (!PUBLIC_KEYS.length) die('El loader no tiene claves públicas (src/infrastructure/update/config.js): ejecuta dev/tools/keygen.mjs y commitea el resultado.')

// El release firmado debe ser de ESTA versión y estar íntegro (lo mismo que comprobará el loader en cada cliente).
let manifest, bundle
try {
  manifest = readFileSync(join(root, 'dist', 'manifest.json'), 'utf8')
  bundle = readFileSync(join(root, 'dist', ENTRY), 'utf8')
} catch { die('Falta dist/manifest.json o dist/app.js: ejecuta dev/tools/release.mjs y commitea dist/ antes de etiquetar.') }
const env = parseEnvelope(manifest)
if (!env) die('dist/manifest.json no tiene el formato esperado.')
if (!(await verifyWithAny(PUBLIC_KEYS, env.payload, env.signature))) die('dist/manifest.json NO está firmado por ninguna de las claves del loader.')
const parsed = validatePayload(env.payload)
if (!parsed.ok) die('Manifiesto inválido: ' + parsed.reason)
if (parsed.manifest.version !== version) die(`dist/ es de la versión ${parsed.manifest.version} pero el código es ${version}: vuelve a ejecutar release.mjs.`)
if (parsed.manifest.file.sha256 !== await sha256Hex(bundle) || parsed.manifest.file.size !== byteLength(bundle)) die('dist/app.js no coincide con el hash/tamaño firmados.')

const dirty = git('status', '--porcelain', '--', ...INCLUDE, 'dist').trim()
if (dirty) die('Hay cambios sin commitear en lo que se va a empaquetar:\n' + dirty)
const secrets = git('ls-files').split('\n').filter((f) => /\.(pem|key)$/i.test(f))
if (secrets.length) die('Hay claves versionadas en el repositorio: ' + secrets.join(', '))

const out = resolve(arg('--out') ?? join(root, 'release-assets'))
mkdirSync(out, { recursive: true })
const zip = join(out, `Draftsage-${version}.zip`)
git('archive', '--format=zip', '--prefix=draftsage/', '-o', zip, 'HEAD', ...INCLUDE)
const digest = createHash('sha256').update(readFileSync(zip)).digest('hex')
writeFileSync(`${zip}.sha256`, `${digest}  Draftsage-${version}.zip\n`)
console.log(`✓ ${zip}\n  sha256 ${digest}`)
