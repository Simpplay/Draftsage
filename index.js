// easy-coachless/index.js — punto de entrada que carga Pengu Loader 1.1.x.
// Solo delega: la lógica vive en src/ (ver docs/ARCHITECTURE.md).
import { start } from './src/application/bootstrap.js'

export function load() {
  return start()
}
