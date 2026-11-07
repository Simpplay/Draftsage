// draftsage/src/infrastructure/itero/client.js — POST /api/draft-picks de iTero (con caché, tiempo máximo y backoff)
//
// API privada y sin documentar (docs/ITERO-INTEGRATION.md): el cliente es discreto y defensivo.
//   · sin cuenta, sin cookies (`credentials: 'omit'`), sin Riot ID: solo viaja la composición del draft;
//   · cada respuesta pesa ~1,7 MB → se recorta al parsear (domain/itero.js) y solo se guarda lo recortado (~50 KB);
//   · peticiones idénticas en curso se comparten y las ya vistas salen de la caché (el draft dura minutos);
//   · tiempo máximo corto; ante 403/429/5xx se deja de pedir 1, 5 y luego 30 min (la UI sigue con lo demás).
// Devuelve { ok:true, data:{candidates, unrecognized} } | { ok:false, reason }
//   reason: 'network' | 'blocked' | 'http' | 'shape'
// Maestría (`basicInfo`): POST /api/basic-info con el Riot ID del jugador. Es lo ÚNICO personal que sale hacia iTero, por eso solo se llama
//   si el jugador lo activó (application/mastery.js). Se guarda solo la maestría (no el puuid ni el resto de la respuesta) y nunca se registra el ID.
//   reason: 'identity' (falta nombre/etiqueta/región) | 'not-found' (500/404: ID desconocido) | 'blocked' | 'network' | 'http' | 'shape'
// ❓ Que el `fetch` POST desde el cliente del LoL (CEF) funcione con DisableWebSecurity=1 no está verificado.

import { ENDPOINT, INFO_ENDPOINT, basicInfoRequest, findUnrecognized, normalizeBasicInfo, normalizeResponse, requestKey } from '../../domain/itero.js'

const BACKOFF_MS = [60_000, 5 * 60_000, 30 * 60_000]
const BLOCK_STATUS = new Set([403, 429, 500, 502, 503, 504])

/**
 * @param {Object} deps
 * @param {Object} deps.cache
 * @param {Function} deps.cache.memo
 * @param {object} [deps.log]
 * @param {typeof fetch} [deps.fetchImpl]
 * @param {() => number} [deps.now]
 * @param {number} [deps.timeoutMs]
 */
export function createIteroClient({ cache, log = null, fetchImpl = (...a) => globalThis.fetch(...a), now = () => Date.now(), timeoutMs = 10_000 }) {
  let blockedUntil = 0
  let failures = 0
  let requests = 0

  const block = (why) => {
    const wait = BACKOFF_MS[Math.min(failures, BACKOFF_MS.length - 1)]
    failures++
    blockedUntil = now() + wait
    log?.warn('itero: ' + why + '; sin peticiones durante ' + Math.round(wait / 60000) + ' min')
  }

  async function post(req) {
    if (now() < blockedUntil) return { ok: false, reason: 'blocked' }
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    requests++
    try {
      const res = await fetchImpl(ENDPOINT, { method: 'POST', body: JSON.stringify(req), signal: ctrl.signal, credentials: 'omit' })
      if (BLOCK_STATUS.has(res.status)) { block('HTTP ' + res.status); return { ok: false, reason: 'blocked' } }
      if (!res.ok) return { ok: false, reason: 'http' }
      let raw
      try { raw = await res.json() } catch { return { ok: false, reason: 'shape' } }
      const n = normalizeResponse(raw, req.lane)
      if (!n.ok) { log?.warn('itero: respuesta con forma inesperada (¿cambió la API?)'); return { ok: false, reason: 'shape' } }
      failures = 0
      const unrecognized = findUnrecognized(req, n.candidates)
      if (unrecognized.length) log?.warn('itero: nombres no reconocidos (se trataron como huecos):', unrecognized.join(', '))
      return { ok: true, data: { candidates: n.candidates, unrecognized } }
    } catch (e) {
      log?.debug('itero: fallo de red', String(e))
      return { ok: false, reason: 'network' }
    } finally {
      clearTimeout(timer)
    }
  }

  // Maestría del jugador. Un 500/404 aquí significa «ID desconocido»: no bloquea las peticiones de draft.
  async function postInfo(body) {
    if (now() < blockedUntil) return { ok: false, reason: 'blocked' }
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    requests++
    try {
      const res = await fetchImpl(INFO_ENDPOINT, { method: 'POST', body: JSON.stringify(body), signal: ctrl.signal, credentials: 'omit' })
      if (res.status === 500 || res.status === 404) return { ok: false, reason: 'not-found' }
      if (BLOCK_STATUS.has(res.status)) { block('HTTP ' + res.status + ' (maestría)'); return { ok: false, reason: 'blocked' } }
      if (!res.ok) return { ok: false, reason: 'http' }
      let raw
      try { raw = await res.json() } catch { return { ok: false, reason: 'shape' } }
      const info = normalizeBasicInfo(raw)
      if (!info) { log?.warn('itero: la respuesta de la maestría no tiene el formato esperado (¿cambió la API?)'); return { ok: false, reason: 'shape' } }
      return { ok: true, data: info }
    } catch (e) {
      log?.debug('itero: fallo de red (maestría)', String(e))
      return { ok: false, reason: 'network' }
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    /**
     * Maestría del jugador ({ points, avg, count }). `id` = { gameName, tagLine, region }. Nunca lanza.
     * Los aciertos se cachean (la clave lleva el ID solo en memoria); los fallos no, salvo que sean «ID desconocido» (no insistir).
     */
    basicInfo(id) {
      const body = basicInfoRequest(id)
      if (!body) return Promise.resolve({ ok: false, reason: 'identity' })
      return cache.memo('itero-info|' + body.region + '|' + body.gameName + '#' + body.tagLine, () => postInfo(body), (v) => v.ok || v.reason === 'not-found')
    },
    /** Candidatos recortados para esa petición (ver domain/itero.js buildRequest). Nunca lanza. */
    draftPicks: (req) => cache.memo(requestKey(req), () => post(req), (v) => v.ok),
    /** Estado del backoff y nº de peticiones reales hechas (para diagnóstico). */
    status: () => ({ blockedForMs: Math.max(0, blockedUntil - now()), failures, requests }),
  }
}
