// draftsage/src/infrastructure/update/crypto.js — hash SHA-256 y verificación de firmas ECDSA P-256 con WebCrypto.
// Funciona igual en el cliente (Chromium) y en Node, así que las pruebas usan el mismo código que producción.
// La firma es «r‖s» (IEEE P1363, 64 bytes), que es lo que produce `crypto.sign(..., { dsaEncoding: 'ieee-p1363' })` en Node.

const enc = new TextEncoder()

const toHex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')

/** SHA-256 en hex de un texto (sus bytes UTF-8). */
export async function sha256Hex(text) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)))
}

/** Tamaño en bytes (UTF-8) de un texto. */
export const byteLength = (text) => enc.encode(text).length

const fromBase64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

/**
 * ¿Firmó `payload` (texto) la clave `jwk`? Nunca lanza: cualquier problema (clave rara, firma mal formada) es `false`.
 */
export async function verifySignature(jwk, payload, signatureB64) {
  try {
    if (!jwk || jwk.kty !== 'EC' || jwk.crv !== 'P-256') return false
    const sig = fromBase64(signatureB64)
    if (sig.length !== 64) return false
    const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
    return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, sig, enc.encode(payload))
  } catch { return false }
}

/** ¿Lo firmó alguna de las claves de confianza? (varias claves = rotación). Lista vacía → `false`. */
export async function verifyWithAny(jwks, payload, signatureB64) {
  for (const jwk of jwks ?? []) if (await verifySignature(jwk, payload, signatureB64)) return true
  return false
}
