// easy-coachless/src/infrastructure/coachless/auth.js — sesión de Coachless para Pengu Loader 1.1.x
//
// - Login con email/contraseña: la contraseña NO se guarda; solo se guarda el refresh token en DataStore.
// - El access token vive solo en memoria y se renueva solo (con una única renovación a la vez).
// - Siempre guarda el refresh token que devuelve el servidor (renueva la caducidad deslizante de 30 días).
//
// NOTA: DataStore es compartido por todos los plugins y no está cifrado: cualquier otro plugin
// instalado podría leer el refresh token. Es una limitación de Pengu, no de este módulo.

import { log } from '../../shared/logger.js'

const API = 'https://api.coachless.gg/api/'
const KEY = 'easy-coachless/auth'            // { refreshToken }
const SKEW_MS = 5 * 60 * 1000                // renovar 5 min antes de que caduque

let access = null                            // { token, exp (ms), claims }
let inflight = null                          // renovación en curso (evita refrescos en paralelo)

const post = async (path, body, token) => {
  const r = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: JSON.stringify(body),
  })
  let data = null
  try { data = await r.json() } catch {}
  return { status: r.status, data }
}

function claimsOf(jwt) {
  try {
    const seg = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(seg.padEnd(Math.ceil(seg.length / 4) * 4, '=')))
  } catch { return null }
}

function setSession(accessToken, refreshToken) {
  const claims = claimsOf(accessToken)
  access = { token: accessToken, exp: (claims?.exp ?? 0) * 1000, claims }
  DataStore.set(KEY, { refreshToken })
}

function clearSession() {
  access = null
  DataStore.remove(KEY)
}

// El servidor responde HTTP 200 también en un login fallido: hay que mirar actionResult (0 = OK).
export async function login(email, password) {
  let res
  try { res = await post('Auth/login', { email, password, rememberMe: false }) }
  catch (e) { log.error('login: error de red', String(e)); return { ok: false, reason: 'network' } }

  const d = res.data
  if (res.status !== 200 || d?.actionResult !== 0 || !d?.accessToken || !d?.refreshToken) {
    log.warn('login rechazado | HTTP', res.status, '| actionResult', d?.actionResult)
    return { ok: false, reason: 'rejected' } // credenciales erróneas, sin confirmar, bloqueada…
  }
  setSession(d.accessToken, d.refreshToken)
  log.info('sesión iniciada | premium:', hasPremium())
  return { ok: true, premium: hasPremium() }
}

// Solo borra la copia local: el servidor no tiene logout y el refresh token (JWT sin estado)
// sigue siendo válido hasta caducar.
export function logout() {
  clearSession()
  log.info('sesión cerrada')
}

async function refresh() {
  const saved = DataStore.get(KEY)
  if (!saved?.refreshToken) return false
  let res
  try { res = await post('Auth/refresh', { refreshToken: saved.refreshToken }) }
  catch (e) { log.warn('refresh: error de red (se conserva la sesión)', String(e)); return false }

  if (res.status === 200 && res.data?.accessToken && res.data?.refreshToken) {
    setSession(res.data.accessToken, res.data.refreshToken)
    log.debug('access token renovado')
    return true
  }
  if ([400, 401, 403].includes(res.status)) { // rechazo definitivo: habrá que iniciar sesión otra vez
    log.warn('refresh rechazado (HTTP ' + res.status + '); se pide login de nuevo')
    clearSession()
  }
  return false
}

export async function getAccessToken() {
  if (access && access.exp - Date.now() > SKEW_MS) return access.token
  inflight ??= refresh().finally(() => { inflight = null })
  return (await inflight) ? access.token : null
}

export const isLoggedIn = () => !!access || !!DataStore.get(KEY)?.refreshToken

// Verificado: isSubscribed es el string "1" en cuentas premium y "0" en las gratuitas.
// La claim viaja en el access token (24 h): una suscripción cancelada podría seguir figurando
// como premium hasta que el token se renueve (sin verificar).
export function hasPremium() {
  return access?.claims?.isSubscribed === '1'
}

export const sessionInfo = () => ({
  loggedIn: isLoggedIn(),
  premium: hasPremium(),
  email: access?.claims?.email ?? null, // solo disponible con el access token en memoria
})

// Al arrancar: si hay un refresh token guardado, intenta recuperar la sesión (true = sesión válida).
export async function restoreSession() {
  if (!DataStore.get(KEY)?.refreshToken) return false
  return !!(await getAccessToken())
}

// Llamada autenticada a un endpoint de datos. Devuelve { ok, status, data, reason?, premium? }
// reason: 'auth' (sin sesión válida) | 'forbidden' (403: ese filtro no está disponible para tu cuenta;
// una cuenta gratuita recibe 403 con patchAdditions >= 1, así que NO es un error de sesión:
// no renueves el token; reintenta con patchAdditions: 0).
export async function api(path, body) {
  let token = await getAccessToken()
  if (!token) return { ok: false, reason: 'auth' }

  let res = await post(path, body, token)
  if (res.status === 401) {                 // token caducado antes de tiempo: una renovación y un reintento
    access = null
    token = await getAccessToken()
    if (!token) return { ok: false, reason: 'auth' }
    res = await post(path, body, token)
  }
  if (res.status === 403) return { ok: false, status: 403, reason: 'forbidden', premium: hasPremium() }
  return { ok: res.status === 200, status: res.status, data: res.data }
}

// Solo para pruebas desde DevTools (la contraseña quedaría en el historial de la consola):
//   await easyCoachless.auth.login('email', 'pass')   |   easyCoachless.auth.status()
window.easyCoachless = Object.assign(window.easyCoachless ?? {}, {
  auth: { login, logout, status: () => ({ loggedIn: isLoggedIn(), premium: hasPremium(), exp: access?.exp }) },
})
