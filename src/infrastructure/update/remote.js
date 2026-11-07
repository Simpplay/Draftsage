// draftsage/src/infrastructure/update/remote.js — descarga de texto con tiempo máximo y tope de tamaño, y ejecución de un módulo desde texto.
// No decide nada de confianza: quien lo usa (application/updater.js) verifica firma y hash antes de ejecutar.

/**
 * @returns {(url:string, maxBytes:number) => Promise<string>} GET → texto. Lanza si la respuesta no es 2xx, tarda demasiado o pesa más de `maxBytes`.
 */
export function createFetchText({ fetchFn = globalThis.fetch?.bind(globalThis), timeoutMs = 15000 } = {}) {
  return async (url, maxBytes) => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchFn(url, { cache: 'no-store', credentials: 'omit', redirect: 'follow', signal: ctrl.signal })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const declared = Number(res.headers?.get?.('content-length'))
      if (Number.isFinite(declared) && declared > maxBytes) throw new Error('respuesta demasiado grande')
      const text = await res.text()
      if (text.length > maxBytes) throw new Error('respuesta demasiado grande')
      return text
    } finally { clearTimeout(timer) }
  }
}

/** Ejecuta un módulo ES a partir de su texto (URL de Blob). Devuelve el espacio de nombres del módulo. */
export async function importModuleText(text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }))
  try { return await import(url) } finally { URL.revokeObjectURL(url) }
}
