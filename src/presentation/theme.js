// draftsage/src/presentation/theme.js — tokens visuales comunes de toda la interfaz (docs/UX-SPEC.md §10)
//
// Antes cada hoja de estilo (ui, panel, native, overlay, settings) repetía los colores en literal. Ahora todas usan estas variables CSS,
// con el prefijo `--ds-` para no chocar con las del cliente. Los valores son los mismos que había (la identidad visual no cambia):
//   fondo azul oscuro · superficies algo más claras · dorado = selección y énfasis · turquesa = confirmación y aplicación ·
//   rojo = amenazas y errores · ámbar = avisos · gris = metadatos.
// También añade lo que la especificación pide a todos los controles: foco visible con teclado y respeto a «reducir movimiento».
// Sin innerHTML: es una hoja de estilo con textContent. Cada ensureStyle() de presentación llama primero a ensureTheme().

const STYLE_ID = 'draftsage-theme'

/** Tokens: nombre → valor. Exportados para las pruebas y por si algún componente necesita el valor en JS. */
export const TOKENS = Object.freeze({
  // Fondos y superficies
  'bg': '#010a13',
  'surface': '#0a1428',
  'surface-2': '#1e2328',
  'border': '#3c3c41',
  'border-soft': '#2a2a30',
  // Dorado (selección y énfasis)
  'gold-dim': '#785a28',
  'gold': '#c8aa6e',
  'gold-hi': '#f0c870',
  'gold-bg': '#2a2314',
  // Texto
  'text': '#cdbe91',
  'text-hi': '#f0e6d2',
  'meta': '#a09b8c',
  'mute': '#7b7a76',
  'mute-2': '#5b5a56',
  // Estados
  'teal': '#0ac8b9',
  'teal-bg': '#06201f',
  'red': '#e84057',
  'rival': '#a8404f',
  'amber': '#e0a93a',
})

/** Tamaños de letra (spec §10.2): nada importante por debajo de 10 px. */
export const FONT = Object.freeze({ meta: '10px', text: '12px', section: '12px', name: '14px', title: '15px' })

// Contenedores raíz de la interfaz del plugin (para limitar el foco y la reducción de movimiento a lo nuestro).
const ROOTS = ['.ecp', '.ecx', '.ec-overlay', '.ecs', '.ecb-layer', '.ecp-fab', '.ecx-launch']

const css = () => {
  const vars = Object.entries(TOKENS).map(([k, v]) => `--ds-${k}:${v}`).join(';')
  const fs = Object.entries(FONT).map(([k, v]) => `--ds-fs-${k}:${v}`).join(';')
  const inside = (sel) => ROOTS.map((r) => `${r} ${sel}, ${r}${sel}`).join(',')
  return `:root{${vars};${fs}}
${inside(':focus-visible')}{outline:2px solid var(--ds-gold-hi);outline-offset:1px}
@media (prefers-reduced-motion: reduce){${ROOTS.map((r) => `${r}, ${r} *`).join(',')}{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}`
}

/** Inserta (una vez) las variables y las reglas comunes. Idempotente. */
export function ensureTheme(doc = document) {
  if (doc.getElementById(STYLE_ID)) return
  const s = doc.createElement('style')
  s.id = STYLE_ID
  s.textContent = css()
  ;(doc.head ?? doc.documentElement).append(s)
}

/** `var(--ds-…)` de un token (para estilos en línea). */
export const tok = (name) => `var(--ds-${name})`
