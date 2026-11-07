// draftsage/src/shared/logger.js
// Todos los mensajes del plugin llevan el prefijo [draftsage] para filtrarlos en DevTools.
// Los de depuración usan console.log (no console.debug, que DevTools oculta en el nivel "Verbose").

const TAG = '[draftsage]'
const DEBUG_KEY = 'draftsage/debug'

const debugOn = () => {
  try { return !!DataStore.get(DEBUG_KEY, false) } catch { return false }
}

export const log = {
  info: (...a) => console.info(TAG, ...a),
  warn: (...a) => console.warn(TAG, ...a),
  error: (...a) => console.error(TAG, ...a),
  debug: (...a) => { if (debugOn()) console.log(TAG, '[debug]', ...a) },
}

// Desde la consola de DevTools:  draftsage.debug(true)  /  draftsage.debug(false)
window.draftsage = Object.assign(window.draftsage ?? {}, {
  debug: (on = true) => DataStore.set(DEBUG_KEY, !!on),
})