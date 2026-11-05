// Lanza todas las pruebas de dev/tests sin dependencias:  node dev/tests/run.mjs
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
const dir = import.meta.dirname
const files = readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).map((f) => join(dir, f))
process.exit(spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' }).status ?? 1)
