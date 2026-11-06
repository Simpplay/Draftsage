// easy-coachless/src/infrastructure/lolalytics/client.js — descarga y lectura de páginas de Lolalytics (con caché, tiempo máximo y backoff)
//
// Lolalytics no tiene API pública para build/counters: los datos viajan en el HTML de la página (ver qwik.js y docs/lolalytics.md).
// Es scraping de contenido de terceros, así que el cliente es deliberadamente discreto:
//   · caché larga (por página: campeón + línea + rango + rival) y UNA petición por consulta, nunca precargas masivas;
//   · peticiones idénticas en curso se comparten (cache.memo) y nada se pide con credenciales ni cookies;
//   · tiempo máximo corto: si Lolalytics va lento, la UI no se queda esperando;
//   · si responde con un bloqueo (403/429/503, reto de Cloudflare, HTML sin estado) se deja de pedir durante 1, 5 y luego 30 min.
// Devuelve { ok:true, data } | { ok:false, reason }  reason: 'network' | 'blocked' | 'http' | 'no-data' | 'shape'.
// ❓ Que `fetch` desde el cliente del LoL (CEF) funcione igual que desde Node no está verificado (DisableWebSecurity=1 ya es requisito).

import { DEFAULT_TIER, validateRoot, slimRoot } from '../../domain/lolalytics.js'
import { extractTierlist, findChampionMap, parseQwikState, readRoot } from './qwik.js'

const SITE = 'https://lolalytics.com/es/lol/'
const BACKOFF_MS = [60_000, 5 * 60_000, 30 * 60_000]
const BLOCK_STATUS = new Set([403, 429, 503])

/** URL de la página de build (con `rival`, la del matchup). `lane` es opcional (sin él, Lolalytics sirve la línea habitual). */
export function buildPageUrl({ slug, lane, tier, rival }) {
  const q = [`tier=${encodeURIComponent(tier)}`]
  if (lane) q.push(`lane=${encodeURIComponent(lane)}`)
  if (rival && lane) q.push(`vslane=${encodeURIComponent(lane)}`) // ❓ nombre del parámetro de la línea del rival sin verificar; se ignora si es otro
  return `${SITE}${encodeURIComponent(slug)}/${rival ? `vs/${encodeURIComponent(rival)}/` : ''}build/?${q.join('&')}`
}

export const tierlistUrl = ({ lane, tier }) => `${SITE}tierlist/?lane=${encodeURIComponent(lane)}&tier=${encodeURIComponent(tier)}`

/**
 * @param {{cache:{memo:Function}, log?:object, fetchImpl?:typeof fetch, now?:()=>number, timeoutMs?:number}} deps
 */
export function createLolalyticsClient({ cache, log = null, fetchImpl = (...a) => globalThis.fetch(...a), now = () => Date.now(), timeoutMs = 10_000 }) {
  let blockedUntil = 0
  let failures = 0

  const block = (why) => {
    const wait = BACKOFF_MS[Math.min(failures, BACKOFF_MS.length - 1)]
    failures++
    blockedUntil = now() + wait
    log?.warn('lolalytics: ' + why + '; sin peticiones durante ' + Math.round(wait / 60000) + ' min')
  }

  // Descarga una página como texto. Nunca lanza.
  async function getHtml(url) {
    if (now() < blockedUntil) return { ok: false, reason: 'blocked' }
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchImpl(url, { signal: ctrl.signal, credentials: 'omit' })
      if (res.status === 404) return { ok: false, reason: 'no-data' }
      if (BLOCK_STATUS.has(res.status)) { block('HTTP ' + res.status); return { ok: false, reason: 'blocked' } }
      if (!res.ok) return { ok: false, reason: 'http' }
      const html = await res.text()
      if (!html.includes('qwik/json')) { block('la página no trae datos (¿reto anti-bot?)'); return { ok: false, reason: 'blocked' } }
      failures = 0
      return { ok: true, html }
    } catch (e) {
      log?.debug('lolalytics: fallo de red', String(e))
      return { ok: false, reason: 'network' }
    } finally {
      clearTimeout(timer)
    }
  }

  const fetchBuild = async ({ slug, lane, tier, rival }) => {
    const page = await getHtml(buildPageUrl({ slug, lane, tier, rival }))
    if (!page.ok) return page
    let root
    try { root = readRoot(parseQwikState(page.html)) } catch { return { ok: false, reason: 'shape' } }
    const problems = root ? validateRoot(root, { vs: !!rival }) : ['sin raíz']
    if (problems.length) { log?.warn('lolalytics: esquema inesperado:', problems.join('; ')); return { ok: false, reason: 'shape' } }
    return { ok: true, data: { root: slimRoot(root) } }
  }

  const fetchTierlist = async ({ lane, tier }) => {
    const page = await getHtml(tierlistUrl({ lane, tier }))
    if (!page.ok) return page
    let rows, slugs
    try { const st = parseQwikState(page.html); rows = extractTierlist(st); slugs = findChampionMap(st) } catch { return { ok: false, reason: 'shape' } }
    if (rows.size < 10) { log?.warn('lolalytics: lista de tier con ' + rows.size + ' filas'); return { ok: false, reason: 'shape' } }
    return { ok: true, data: { rows, slugs } }
  }

  const memo = (key, fn) => cache.memo(key, fn, (v) => v.ok)

  // Si el rango pedido (excepto el de por defecto) no se sirve, se reintenta con emerald_plus (✅ comprobado). `tierUsed` dice cuál valió.
  async function withTierFallback(tier, run) {
    const r = await run(tier)
    if (r.ok || tier === DEFAULT_TIER || !['http', 'shape', 'no-data'].includes(r.reason)) return { ...r, tierUsed: tier }
    log?.warn('lolalytics: el rango «' + tier + '» no se sirvió (' + r.reason + '); se usa ' + DEFAULT_TIER)
    const f = await run(DEFAULT_TIER)
    return { ...f, tierUsed: DEFAULT_TIER }
  }

  return {
    /** Página de build (o de matchup si hay `rival`) → { root } reducida y validada. `tierUsed` = el rango que se acabó sirviendo. */
    build: ({ slug, lane = null, tier = DEFAULT_TIER, rival = null }) =>
      withTierFallback(tier, (tr) => memo(`build|${slug}|${lane ?? ''}|${tr}|${rival ?? ''}`, () => fetchBuild({ slug, lane, tier: tr, rival }))),
    /** Lista de tier de una línea → { rows: Map<cid, fila>, slugs: {cid: slug}|null }. */
    tierlist: ({ lane, tier = DEFAULT_TIER }) =>
      withTierFallback(tier, (tr) => memo(`tierlist|${lane}|${tr}`, () => fetchTierlist({ lane, tier: tr }))),
    /** Estado del backoff (para diagnóstico). */
    status: () => ({ blockedForMs: Math.max(0, blockedUntil - now()), failures }),
  }
}
