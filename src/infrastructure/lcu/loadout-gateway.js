// draftsage/src/infrastructure/lcu/loadout-gateway.js — ÚNICO módulo que ESCRIBE en el cliente (runas y hechizos)
//
// Solo lo usa application/configuration.js, tras una acción explícita del usuario (botón «Aplicar»).
// Endpoints del LCU (no oficiales; ❓ sin verificar en el cliente real, ver docs/HANDOFF.md):
//   GET   /lol-perks/v1/pages                 → páginas [{id, name, isEditable, current, selectedPerkIds, …}]
//   GET   /lol-perks/v1/inventory             → {ownedPageCount}
//   POST  /lol-perks/v1/pages                 → crea una página
//   PUT   /lol-perks/v1/pages/{id}            → sustituye el contenido de una página
//   PUT   /lol-perks/v1/currentpage           → body: id (número) — activa la página
//   PATCH /lol-champ-select/v1/session/my-selection → {spell1Id, spell2Id}
// Nunca lanza: devuelve { ok, status, data }. No se registra el cuerpo de las respuestas.

import { log } from '../../shared/logger.js'
import { lcuGet } from './lcu-client.js'

async function send(method, path, body, timeoutMs = 5000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(path, {
      method, signal: ctrl.signal,
      headers: { 'content-type': 'application/json' },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
    let data = null
    try { data = await r.json() } catch { /* 204 o sin cuerpo */ }
    if (!r.ok) log.debug('LCU', method, path, '→ HTTP', r.status)
    return { ok: r.ok, status: r.status, data }
  } catch (e) {
    log.debug('LCU', method, path, 'falló:', String(e))
    return { ok: false, status: 0, data: null }
  } finally {
    clearTimeout(timer)
  }
}

export function createLoadoutGateway() {
  return {
    phase: () => lcuGet('/lol-gameflow/v1/gameflow-phase'),
    listPages: async () => {
      const r = await lcuGet('/lol-perks/v1/pages')
      return Array.isArray(r) ? r : null
    },
    inventory: () => lcuGet('/lol-perks/v1/inventory'),
    createPage: (page) => send('POST', '/lol-perks/v1/pages', page),
    updatePage: (id, page) => send('PUT', `/lol-perks/v1/pages/${encodeURIComponent(id)}`, page),
    setCurrent: (id) => send('PUT', '/lol-perks/v1/currentpage', id),
    setSpells: (spell1Id, spell2Id) => send('PATCH', '/lol-champ-select/v1/session/my-selection', { spell1Id, spell2Id }),
  }
}
