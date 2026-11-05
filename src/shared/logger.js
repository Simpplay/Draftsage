// easy-coachless/src/shared/logger.js
// Todos los mensajes del plugin llevan el prefijo [easy-coachless] para filtrarlos en DevTools.
// Los de depuración usan console.log (no console.debug, que DevTools oculta en el nivel "Verbose").

const TAG = '[easy-coachless]'
const DEBUG_KEY = 'easy-coachless/debug'

const debugOn = () => {
  try { return !!DataStore.get(DEBUG_KEY, false) } catch { return false }
}

export const log = {
  info: (...a) => console.info(TAG, ...a),
  warn: (...a) => console.warn(TAG, ...a),
  error: (...a) => console.error(TAG, ...a),
  debug: (...a) => { if (debugOn()) console.log(TAG, '[debug]', ...a) },
}

// Desde la consola de DevTools:  easyCoachless.debug(true)  /  easyCoachless.debug(false)
window.easyCoachless = Object.assign(window.easyCoachless ?? {}, {
  debug: (on = true) => DataStore.set(DEBUG_KEY, !!on),
})