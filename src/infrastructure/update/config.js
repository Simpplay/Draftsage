// draftsage/src/infrastructure/update/config.js — de dónde salen las actualizaciones y con qué claves se verifican.
// Este archivo forma parte del LOADER (código fijo en el equipo del usuario): cambiarlo exige reinstalar el plugin.

/** Repositorio público de GitHub desde el que sirve jsDelivr. */
export const UPDATE_REPO = 'Simpplay/Draftsage'

/** Versión de la API del loader. Un manifiesto con `minLoader` mayor se ignora (el usuario debe reinstalar). Súbela solo si cambias el loader. */
export const LOADER_API = 1

/**
 * Claves PÚBLICAS ECDSA P-256 (JWK) que pueden firmar versiones. Varias permiten rotar la clave sin dejar a nadie sin actualizaciones.
 * La lista la rellena `node dev/tools/keygen.mjs`; mientras esté vacía las actualizaciones remotas están desactivadas y solo corre el código incluido.
 * La clave PRIVADA nunca va en el repositorio.
 */
export const PUBLIC_KEYS = [
  // BEGIN PUBLIC KEYS
  { kty: 'EC', crv: 'P-256', x: 'K23ntNeBdNytA-_ST9iWvZdc5-p12eLQtO4GB3qsgF8', y: 'jp2sxhxcDl2U3KbT9Ef7LxrYEl-ixe7X84bGKeaUnaI' },
  // END PUBLIC KEYS
]
