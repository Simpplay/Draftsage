// dev/tools/check.mjs — comprobaciones previas a entregar: sintaxis (node --check) e imports relativos de todo src/ e index.js.
// Uso (desde la raíz del plugin):  node dev/tools/check.mjs      · Sale con código 1 si algo falla.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..', '..')
const files = []
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') && files.push(p) } }
walk(join(root, 'src'))
files.push(join(root, 'index.js'))

let bad = 0
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }) } catch (e) { bad++; console.error('SINTAXIS', f, String(e.stderr)) }
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\s*\(\s*['"](\.[^'"]+)['"]\s*\)|^import\s+['"](\.[^'"]+)['"]/gm)) {
    const rel = m[1] ?? m[2] ?? m[3]
    if (!existsSync(resolve(dirname(f), rel))) { bad++; console.error('IMPORT NO RESUELTO', f.replace(root, ''), '→', rel) }
    if (/\/dev\//.test(rel)) { bad++; console.error('src/ no puede importar de dev/', f) }
  }
  if (/innerHTML|outerHTML|insertAdjacentHTML/.test(src.replace(/\/\/.*$/gm, ''))) { bad++; console.error('PROHIBIDO innerHTML en', f.replace(root, '')) }
  if (/console\.(log|info|warn|error)/.test(src) && !f.endsWith('logger.js')) { bad++; console.error('usa console.* en vez de log:', f.replace(root, '')) }
}
console.log(`${files.length} archivos revisados, ${bad} problema(s)`)
process.exit(bad ? 1 : 0)
