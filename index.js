// draftsage/index.js — punto de entrada que carga Pengu Loader 1.1.x.
// Solo delega en el loader (src/application/loader.js), que decide si ejecuta el código incluido o una versión firmada descargada.
// Este archivo no debe cambiar salvo que cambie el loader (ver docs/RELEASING.md).
import { run } from './src/application/loader.js'

export function load() {
  return run()
}
