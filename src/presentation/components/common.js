// draftsage/src/presentation/components/common.js — piezas pequeñas compartidas por los componentes del panel (docs/UX-SPEC.md §10.3)
//
// Retrato/icono con respaldo de texto, línea flexible, formatos de cifras y tooltip de una estadística. Sin estado, sin red, sin innerHTML.
// Las sacó de presentation/panel.js la Fase 1 del rediseño sin cambiar su comportamiento.

import { h } from '../ui.js'
import { isLowData } from '../../domain/confidence.js'
import { getLang, t } from '../../shared/i18n.js'

/** Icono de un elemento del catálogo ({name, icon}); sin icono, un círculo con las dos primeras letras. */
export const pic = (info, cls, title) => info.icon
  ? h('img', { class: cls, src: info.icon, alt: info.name, title: title ?? info.name, draggable: 'false' })
  : h('div', { class: cls + ' ecp-ph', title: title ?? info.name, role: 'img', 'aria-label': info.name }, String(info.name).slice(0, 2))

/** Fila flexible con hueco de 7 px. */
export const line = (...children) => h('div', { class: 'ecp-line' }, children)

export const fmtWpa = (w) => (w >= 0 ? '+' : '') + w.toFixed(1)
export const fmtN = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(n))
export const signed = (n) => (n >= 0 ? '+' : '') + n.toFixed(1)

/** Texto de una clave con prefijo (err.network, applyErr.rejected…); si no existe, el genérico. */
export const known = (prefix, id) => { const k = prefix + id; const s = t(k); return s === k ? t('err.other') : s }

/** Tooltip de una estadística: «Nombre · WPA +1.1 · 146 000 partidas · 62 % de uso — pocas partidas…» (o win rate, si la fuente no da WPA). */
export function statTip(name, stat) {
  if (stat && stat.wpa == null && Number.isFinite(stat.wr)) return t('stat.tipWr', name, stat.wr.toFixed(1), (stat.occurrence ?? 0).toLocaleString(getLang()))
  if (!stat || stat.wpa == null) return name
  return t('stat.tip', name, fmtWpa(stat.wpa), stat.occurrence.toLocaleString(getLang())) +
    (stat.share != null ? t('stat.share', Math.round(stat.share * 100)) : '') +
    (isLowData(stat) ? ' — ' + t('lowdata') : '')
}
