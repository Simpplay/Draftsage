// dev/tools/keygen.mjs — crea el par de claves ECDSA P-256 con el que se firman las versiones y registra la clave PÚBLICA en el loader.
// Uso (una vez, en TU equipo):   node dev/tools/keygen.mjs [--out <ruta.pem>]
//   · La clave privada se guarda FUERA del repositorio (por defecto ~/.draftsage/signing-key.pem) y nunca se sobrescribe.
//   · La pública se añade a src/infrastructure/update/config.js (entre los marcadores BEGIN/END PUBLIC KEYS). Hay que reinstalar el plugin
//     para que los usuarios la tengan: las claves son parte del loader. Para ROTAR una clave: ejecuta esto otra vez (se añade, no se reemplaza),
//     publica con la nueva y, cuando todos hayan actualizado el plugin, quita la antigua a mano.
// La clave privada es lo único que protege a los usuarios de código malicioso en las actualizaciones: haz copia de seguridad y no la compartas.
import { generateKeyPairSync } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..', '..')
const configPath = join(root, 'src', 'infrastructure', 'update', 'config.js')
const argOut = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : null
const out = resolve(argOut ?? join(homedir(), '.draftsage', 'signing-key.pem'))

if ((out + sep).startsWith(root + sep)) { console.error('La clave privada no puede estar dentro del repositorio:', out); process.exit(1) }
if (existsSync(out)) { console.error('Ya existe una clave en', out, '— no se sobrescribe. Usa --out para otra ruta (rotación).'); process.exit(1) }

const config = readFileSync(configPath, 'utf8')
if (!config.includes('// BEGIN PUBLIC KEYS') || !config.includes('// END PUBLIC KEYS')) { console.error('Faltan los marcadores BEGIN/END PUBLIC KEYS en', configPath); process.exit(1) }

const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
const { x, y } = publicKey.export({ format: 'jwk' })
mkdirSync(dirname(out), { recursive: true, mode: 0o700 })
writeFileSync(out, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600, flag: 'wx' })

const entry = `  { kty: 'EC', crv: 'P-256', x: '${x}', y: '${y}' },\n`
writeFileSync(configPath, config.replace('  // END PUBLIC KEYS', entry + '  // END PUBLIC KEYS'))

console.log('Clave privada :', out, '(copia de seguridad ya; sin ella no puedes publicar actualizaciones)')
console.log('Clave pública : añadida a', configPath.replace(root + sep, ''))
console.log('Siguiente     : commit de config.js y reinstalar el plugin; después `node dev/tools/release.mjs 1.0.1`')
