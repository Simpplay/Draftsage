// draftsage/src/application/configuration.js — ConfigurationApplier: aplicar la recomendación en el cliente
//
// Es la ÚNICA vía para modificar páginas de runas o hechizos. Reglas (ver CLAUDE.md, políticas de Riot/Pengu):
//  - canApply() está desactivado de inicio; el usuario lo activa tras leer un aviso (presentation/menus.js).
//  - Solo se aplica por una acción explícita del usuario (clic o atajo). Nunca automáticamente.
//  - Por defecto solo se toca la página propia «[DS] …»; reemplazar la página activa es una opción aparte.
//  - Nunca se envía una página incompleta.
// Resultado: { ok:true, … } | { ok:false, reason, status? }
//   reason: 'disabled' | 'incomplete' | 'invalid' | 'lcu' | 'not-editable' | 'no-slot' | 'rejected' | 'not-in-champ-select'

import { OWN_PREFIX, buildRunePage, buildSpellPair, runePageName, samePerks } from '../domain/configuration.js'

const fail = (reason, extra) => ({ ok: false, reason, ...extra })

/**
 * @param {{gateway: ReturnType<import('../infrastructure/lcu/loadout-gateway.js').createLoadoutGateway>,
 *          prefs: {get:()=>{enabled:boolean,target:'own'|'current',flashKey:'d'|'f'}, set:(p:object)=>object}, log: object}} deps
 */
export function createConfigurationApplier({ gateway, prefs, log }) {
  const canApply = () => !!prefs.get().enabled

  async function applyRunes(rec, { champion, opponent } = {}) {
    if (!canApply()) return fail('disabled')
    const name = runePageName(champion ?? '?', opponent)
    const built = buildRunePage(rec, name)
    if (!built.ok) return fail(built.reason)

    const pages = await gateway.listPages()
    if (!pages) return fail('lcu')
    const editable = pages.filter((p) => p.isEditable !== false)

    let target, mode
    if (prefs.get().target === 'current') {
      target = editable.find((p) => p.current)
      if (!target) return fail('not-editable')
      mode = 'replaced'
    } else {
      target = editable.find((p) => String(p.name ?? '').startsWith(OWN_PREFIX))
      mode = 'updated'
    }

    let id, res
    if (target) {
      id = target.id
      res = await gateway.updatePage(id, built.page)
    } else {
      const inv = await gateway.inventory()
      if (Number.isInteger(inv?.ownedPageCount) && editable.length >= inv.ownedPageCount) return fail('no-slot')
      res = await gateway.createPage(built.page)
      id = res.data?.id
      mode = 'created'
    }
    if (!res.ok) return fail('rejected', { status: res.status })

    if (id != null) await gateway.setCurrent(id) // best effort: PUT/POST ya llevan current:true
    const after = await gateway.listPages()
    const written = after?.find((p) => p.id === id)
    const verified = !!written && samePerks(written.selectedPerkIds, built.page.selectedPerkIds)
    if (!verified) log.warn('página de runas escrita pero no verificada (el cliente pudo cambiarla)')
    log.info('runas aplicadas:', mode, name)
    return { ok: true, mode, name, verified }
  }

  async function applySpells(rec) {
    if (!canApply()) return fail('disabled')
    const pair = buildSpellPair(rec, prefs.get().flashKey)
    if (!pair.ok) return fail(pair.reason)
    if ((await gateway.phase()) !== 'ChampSelect') return fail('not-in-champ-select')
    const res = await gateway.setSpells(pair.spell1Id, pair.spell2Id)
    if (!res.ok) return fail('rejected', { status: res.status })
    log.info('hechizos aplicados:', pair.spell1Id, pair.spell2Id)
    return { ok: true, spell1Id: pair.spell1Id, spell2Id: pair.spell2Id }
  }

  return {
    canApply,
    /** Activa o desactiva la función (el aviso al usuario lo muestra la capa de presentación). */
    setEnabled: (enabled) => prefs.set({ enabled: !!enabled }),
    getSettings: () => prefs.get(),
    setSettings: (patch) => prefs.set(patch),
    applyRunes,
    applySpells,
  }
}
