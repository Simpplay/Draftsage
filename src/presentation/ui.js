// easy-coachless/src/presentation/ui.js — sistema de ventanas reutilizable (DOM puro; compatible con Pengu Loader 1.1.x)
//
// Piezas:  openDialog (ventana genérica) · openForm (formulario) · openMenu (lista de opciones)
//          confirm · notify · h (crear DOM sin innerHTML) · copyText · whenReady
// Reglas:  - una sola ventana a la vez (las demás esperan turno en una cola)
//          - `id` evita duplicados: abrir dos veces la misma ventana devuelve la que ya hay
//          - nunca se inserta HTML: todo el texto entra como nodos de texto (sin riesgo de inyección)
//          - todas devuelven un handle { result: Promise<{action, value}>, close(), setStatus(), ... }
// Las pantallas concretas del plugin viven en menus.js.

import { log } from '../shared/logger.js'
import { t } from '../shared/i18n.js'

const STYLE_ID = 'easy-coachless-style'
const T0 = performance.now()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// El cliente monta su interfaz después de `load`: espera a que pasen `ms` desde que se cargó el plugin.
export const whenReady = (ms = 8000) => sleep(Math.max(0, ms - (performance.now() - T0)))

const CSS = `
.ec-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(1,10,19,.72)}
.ec-modal{box-sizing:border-box;width:min(var(--ec-w,520px),92vw);max-height:90vh;overflow:auto;background:#010a13;color:#cdbe91;border:1px solid #785a28;box-shadow:0 0 24px #000;padding:20px 24px;font-size:14px;line-height:1.5;outline:none}
.ec-title{font-size:16px;font-weight:bold;margin:0 0 10px;color:#f0e6d2}
.ec-body p{margin:0 0 8px}
.ec-box{margin:8px 0;padding:8px 10px;background:#0a1428}
.ec-status{min-height:20px;margin-top:8px;color:#0ac8b9}
.ec-status.ec-error{color:#e84057}
.ec-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.ec-btn{background:#1e2328;color:#cdbe91;border:1px solid #785a28;padding:6px 14px;cursor:pointer;font:inherit}
.ec-btn:hover:not(:disabled){border-color:#c8aa6e;color:#f0e6d2}
.ec-btn:disabled{opacity:.5;cursor:default}
.ec-btn.ec-primary{border-color:#c8aa6e;color:#f0e6d2}
.ec-btn.ec-danger{border-color:#e84057;color:#e84057}
.ec-field{display:block;margin:8px 0}
.ec-field>span{display:block;margin-bottom:2px;font-size:12px;color:#a09b8c}
.ec-input{box-sizing:border-box;width:100%;padding:6px 8px;background:#1e2328;color:#f0e6d2;border:1px solid #3c3c41;font:inherit}
.ec-input:focus{outline:none;border-color:#c8aa6e}
.ec-check{display:flex;align-items:center;gap:6px;margin:8px 0}
.ec-menu{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.ec-menu .ec-btn{text-align:left}
.ec-menu small{display:block;color:#a09b8c}
`

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = CSS
  document.head.append(s)
}

// ---------- utilidades ----------

// Crea un elemento: h('button', { class: 'x', onclick: fn }, 'texto', h('b', null, 'negrita'))
export function h(tag, props, ...children) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue
    if (k === 'class') el.className = v
    else if (k === 'style') el.style.cssText = v
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v)
    else el.setAttribute(k, v === true ? '' : String(v))
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue
    el.append(c instanceof Node ? c : document.createTextNode(String(c)))
  }
  return el
}

const asNodes = (body) =>
  [].concat(body ?? [])
    .filter((x) => x != null && x !== false)
    .map((x) => (x instanceof Node ? x : h('p', null, String(x))))

// Texto con **negrita** y `código` (los dos marcadores de los diccionarios) → nodos del DOM, sin innerHTML.
export function richText(text) {
  return String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map((part) =>
    part.startsWith('**') ? h('b', null, part.slice(2, -2)) : part.startsWith('`') ? h('code', null, part.slice(1, -1)) : part)
}

// Abre un enlace en el navegador del sistema (el cliente de League delega los enlaces externos). Si no se puede, copia el enlace.
// Solo https. ❓ Sin verificar en el cliente real: si no abre nada, se verá en los logs `[easy-coachless]`.
export async function openExternal(url) {
  if (!/^https:\/\//.test(String(url))) return false
  try {
    const w = window.open(url, '_blank')
    if (w) w.opener = null
    return true
  } catch (e) {
    log.warn('window.open falló:', String(e))
  }
  notify.error(await copyText(url) ? t('web.copied', url) : t('web.failed'))
  return false
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {}
  try {
    const ta = h('textarea', { style: 'position:fixed;opacity:0;pointer-events:none' })
    ta.value = text
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

// Avisos breves: se apoyan en el Toast de Pengu (1.1.x tiene success/error).
export const notify = {
  success: (m) => { try { window.Toast.success(m) } catch { log.info(m) } },
  error: (m) => { try { window.Toast.error(m) } catch { log.error(m) } },
}

// ---------- ventana genérica ----------

const registry = new Map() // id -> handle (evita duplicados)
const queue = []           // ventanas esperando turno
let current = null

function pump() {
  if (current || !queue.length) return
  if (!document.body) { document.addEventListener('DOMContentLoaded', pump, { once: true }); return }
  const entry = queue.shift()
  current = entry
  try {
    show(entry)
  } catch (e) {
    log.error('no se pudo abrir la ventana:', e)
    current = null
    entry.handle.close({ action: 'error' })
  }
}

function show(entry) {
  const { opts, handle } = entry
  const prevFocus = document.activeElement
  ensureStyle()

  const status = h('div', { class: 'ec-status', role: 'status' })
  const actionsEl = h('div', { class: 'ec-actions' })
  const modal = h(
    'div',
    { class: 'ec-modal', role: 'dialog', 'aria-modal': 'true', tabindex: '-1', style: opts.width ? `--ec-w:${opts.width}px` : null },
    opts.title && h('div', { class: 'ec-title' }, opts.title),
    h('div', { class: 'ec-body' }, asNodes(opts.body)),
    status,
    actionsEl,
  )
  const overlay = h('div', { class: 'ec-overlay' }, modal)

  const actions = opts.actions ?? []
  const buttons = new Map()
  let busy = false

  const setStatus = (msg = '', kind = 'info') => {
    status.textContent = msg
    status.className = 'ec-status' + (kind === 'error' ? ' ec-error' : '')
  }
  const setBusy = (on) => {
    busy = on
    for (const b of buttons.values()) b.disabled = on
    for (const i of modal.querySelectorAll('input')) i.disabled = on
  }
  const refocus = () => (modal.querySelector('[data-ec-focus]') ?? modal.querySelector('input:not([type=checkbox])'))?.focus()

  async function run(a) {
    if (busy || entry.closed) return
    let out
    if (a.onClick) {
      setBusy(true)
      setStatus('')
      try {
        out = await a.onClick(handle)
      } catch (e) {
        log.error('error en la acción', a.id, e)
        if (!entry.closed) { setBusy(false); setStatus(t('common.unexpected', e?.message ?? e), 'error') }
        return
      }
      if (entry.closed) return
      setBusy(false)
      if (out === false) { refocus(); return } // false = no cerrar
    }
    if (!a.keepOpen) handle.close({ action: a.id, value: out })
  }

  for (const a of actions) {
    const b = h('button', { type: 'button', class: 'ec-btn' + (a.variant ? ' ec-' + a.variant : '') }, a.label)
    b.addEventListener('click', () => run(a))
    buttons.set(a.id, b)
    actionsEl.append(b)
  }

  const dismiss = () => { if (opts.closable !== false && !busy) handle.close({ action: 'dismiss' }) }
  // El cliente tiene atajos globales: que las teclas escritas aquí no salgan de la ventana.
  for (const ev of ['keydown', 'keyup', 'keypress']) {
    modal.addEventListener(ev, (e) => {
      e.stopPropagation()
      if (ev === 'keydown' && e.key === 'Escape') { e.preventDefault(); dismiss() }
    })
  }
  overlay.addEventListener('mousedown', (e) => { e.stopPropagation(); if (e.target === overlay) dismiss() })
  overlay.addEventListener('click', (e) => e.stopPropagation())

  entry.shown = true
  entry.modal = modal
  entry.applyStatus = setStatus
  entry.setBusy = setBusy
  entry.trigger = (id) => { const a = actions.find((x) => x.id === id); if (a) run(a) }
  entry.teardown = () => {
    for (const i of modal.querySelectorAll('input')) i.value = '' // no dejar contraseñas en el DOM
    overlay.remove()
    try { prevFocus?.focus?.() } catch {}
  }
  if (entry.pendingStatus) setStatus(...entry.pendingStatus)

  document.body.append(overlay)
  const first = modal.querySelector('input:not([type=checkbox])') ?? actionsEl.querySelector('.ec-primary') ?? actionsEl.querySelector('button') ?? modal
  setTimeout(() => first.focus(), 0)
  log.debug('ventana abierta:', opts.id ?? opts.title)
}

/**
 * Abre una ventana.
 * opts: { id?, title?, body?: string|Node|Array, width?: px, closable?: true,
 *         actions?: [{ id, label, variant?: 'primary'|'danger', keepOpen?, onClick?(handle) }] }
 * - onClick puede ser async: devuelve `false` para NO cerrar; cualquier otro valor se entrega en result.value.
 * - Sin onClick, el botón cierra la ventana con { action: id }.
 * Devuelve un handle: { result, close(res), setStatus(msg, 'info'|'error'), setBusy(bool), trigger(actionId), el }
 */
export function openDialog(opts = {}) {
  if (opts.id && registry.has(opts.id)) return registry.get(opts.id)

  const entry = { opts, closed: false, shown: false }
  let resolve
  const result = new Promise((r) => (resolve = r))
  const handle = {
    id: opts.id,
    result,
    get el() { return entry.modal ?? null },
    setStatus: (msg, kind) => { entry.pendingStatus = [msg, kind]; entry.applyStatus?.(msg, kind) },
    setBusy: (on) => entry.setBusy?.(on),
    trigger: (id) => entry.trigger?.(id),
    close: (res = { action: 'dismiss' }) => {
      if (entry.closed) return
      entry.closed = true
      if (opts.id) registry.delete(opts.id)
      if (entry.shown) {
        entry.teardown()
        if (current === entry) current = null
      } else {
        const i = queue.indexOf(entry)
        if (i >= 0) queue.splice(i, 1)
      }
      resolve(res)
      pump()
    },
  }
  entry.handle = handle
  if (opts.id) registry.set(opts.id, handle)
  queue.push(entry)
  pump()
  return handle
}

// ---------- confirmación ----------

export async function confirm({ id, title, message, confirmLabel = t('common.ok'), cancelLabel = t('common.cancel'), danger = false } = {}) {
  const r = await openDialog({
    id, title, body: message,
    actions: [
      { id: 'cancel', label: cancelLabel },
      { id: 'ok', label: confirmLabel, variant: danger ? 'danger' : 'primary' },
    ],
  }).result
  return r.action === 'ok'
}

// ---------- formulario ----------

/**
 * Formulario. fields: [{ name, label, type?: 'text'|'password'|'email'|'checkbox', placeholder?, value?,
 *                        required?, autocomplete?, focusOnError? }]
 * onSubmit(values, handle) puede ser async:
 *   - devuelve un string  -> se muestra como error y la ventana sigue abierta
 *   - devuelve false      -> sigue abierta sin mensaje
 *   - cualquier otra cosa -> se cierra con { action: 'submit', value: <lo devuelto> }
 * Enter envía el formulario. Los valores nunca se guardan: al cerrar se vacían los campos.
 */
export function openForm({ id, title, description, fields = [], submitLabel = t('common.ok'), cancelLabel = t('common.cancel'), closable = true, width, onSubmit } = {}) {
  const inputs = {}
  const rows = fields.map((f) => {
    const check = f.type === 'checkbox'
    const input = h('input', {
      class: check ? null : 'ec-input',
      type: f.type ?? 'text',
      name: f.name,
      placeholder: f.placeholder,
      autocomplete: f.autocomplete ?? 'off',
      spellcheck: 'false',
      'data-ec-focus': f.focusOnError ? '' : null,
    })
    if (f.value != null) { if (check) input.checked = !!f.value; else input.value = f.value }
    inputs[f.name] = input
    return check
      ? h('label', { class: 'ec-check' }, input, f.label)
      : h('label', { class: 'ec-field' }, h('span', null, f.label), input)
  })

  const form = h('form', { novalidate: true }, rows)
  form.addEventListener('submit', (e) => e.preventDefault())
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target?.type !== 'checkbox') { e.preventDefault(); handle.trigger('submit') }
  })

  const handle = openDialog({
    id, title, closable, width,
    body: [description, form].filter(Boolean),
    actions: [
      { id: 'cancel', label: cancelLabel },
      {
        id: 'submit', label: submitLabel, variant: 'primary',
        onClick: async (hd) => {
          const values = Object.fromEntries(fields.map((f) => [f.name, f.type === 'checkbox' ? inputs[f.name].checked : inputs[f.name].value]))
          const missing = fields.find((f) => f.required && f.type !== 'checkbox' && !String(values[f.name]).trim())
          if (missing) { hd.setStatus(t('common.missing', missing.label), 'error'); return false }
          const out = await onSubmit?.(values, hd)
          if (typeof out === 'string') { hd.setStatus(out, 'error'); return false }
          return out === false ? false : (out ?? true)
        },
      },
    ],
  })
  return handle
}

// ---------- menú de opciones ----------

/**
 * Menú vertical. items: [{ id, label, description?, disabled?, onSelect?() }]
 * Al elegir una opción, el menú se cierra y después se ejecuta onSelect (que puede abrir otra ventana).
 */
export function openMenu({ id, title, description, items = [], closable = true, width } = {}) {
  const list = h(
    'div',
    { class: 'ec-menu' },
    items.map((it) =>
      h(
        'button',
        {
          type: 'button', class: 'ec-btn', disabled: it.disabled ? true : null,
          onclick: () => {
            handle.close({ action: it.id, value: it })
            Promise.resolve().then(() => it.onSelect?.()).catch((e) => log.error('menú:', it.id, e))
          },
        },
        it.label,
        it.description && h('small', null, it.description),
      ),
    ),
  )
  const handle = openDialog({
    id, title, closable, width,
    body: [description, list].filter(Boolean),
    actions: [{ id: 'close', label: t('common.close') }],
  })
  return handle
}
