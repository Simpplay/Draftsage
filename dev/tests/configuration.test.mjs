// Pruebas de domain/configuration.js y application/configuration.js (ConfigurationApplier) con un LCU simulado.
import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRunePage, buildSpellPair, runePageName, OWN_PREFIX, NAME_MAX } from '../../src/domain/configuration.js'
import { createConfigurationApplier } from '../../src/application/configuration.js'

const rec = {
  keystone: { rune: 8008 }, primaryTree: 8000,
  primaryPicks: [{ rune: 9111 }, { rune: 9104 }, { rune: 8017 }],
  secondaryTree: 8300, secondaryPicks: [{ rune: 8321 }, { rune: 8313 }],
  shards: [5005, 5008, 5011],
  spells: [{ spell: 4 }, { spell: 7 }],
}
const quiet = { info() {}, warn() {}, debug() {}, error() {} }

test('página de runas: 9 ids en orden y estilos', () => {
  const r = buildRunePage(rec, 'x')
  assert.equal(r.ok, true)
  assert.deepEqual(r.page.selectedPerkIds, [8008, 9111, 9104, 8017, 8321, 8313, 5005, 5008, 5011])
  assert.equal(r.page.primaryStyleId, 8000); assert.equal(r.page.subStyleId, 8300); assert.equal(r.page.current, true)
})

test('página incompleta o inválida no se construye', () => {
  assert.equal(buildRunePage({ ...rec, primaryPicks: [{ rune: 9111 }, null, { rune: 8017 }] }, 'x').reason, 'incomplete')
  assert.equal(buildRunePage({ ...rec, shards: [5005, 5008] }, 'x').reason, 'incomplete')
  assert.equal(buildRunePage({ ...rec, secondaryPicks: [{ rune: 8321 }] }, 'x').reason, 'incomplete')
  assert.equal(buildRunePage({ ...rec, secondaryTree: 8000 }, 'x').reason, 'incomplete')
  assert.equal(buildRunePage({ ...rec, secondaryPicks: [{ rune: 9111 }, { rune: 8313 }] }, 'x').reason, 'invalid')
})

test('nombre de página: marca propia y recorte', () => {
  assert.equal(runePageName("Kai'Sa", 'Jinx'), "[EC] Kai'Sa vs Jinx")
  assert.ok(runePageName('Nombre larguísimo de campeón', 'Otro nombre muy largo').length <= NAME_MAX)
  assert.ok(runePageName('Ahri', null).startsWith(OWN_PREFIX))
})

test('hechizos: Destello en la tecla elegida', () => {
  assert.deepEqual(buildSpellPair(rec, 'f'), { ok: true, spell1Id: 7, spell2Id: 4 })
  assert.deepEqual(buildSpellPair(rec, 'd'), { ok: true, spell1Id: 4, spell2Id: 7 })
  assert.deepEqual(buildSpellPair({ spells: [{ spell: 7 }, { spell: 4 }] }, 'd'), { ok: true, spell1Id: 4, spell2Id: 7 })
  assert.equal(buildSpellPair({ spells: [{ spell: 7 }] }).reason, 'incomplete')
  assert.equal(buildSpellPair({ spells: [{ spell: 7 }, { spell: 7 }] }).reason, 'incomplete')
})

// LCU simulado: guarda páginas y registra las escrituras.
function fakeGateway({ pages = [], max = 3, phase = 'ChampSelect', putStatus = 200 } = {}) {
  const calls = []
  const g = {
    calls, pages,
    phase: async () => phase,
    listPages: async () => pages.map((p) => ({ ...p })),
    inventory: async () => ({ ownedPageCount: max }),
    createPage: async (page) => { calls.push(['create', page]); if (putStatus !== 200) return { ok: false, status: putStatus }; const p = { ...page, id: 100 + pages.length, isEditable: true }; pages.push(p); return { ok: true, status: 200, data: p } },
    updatePage: async (id, page) => { calls.push(['update', id, page]); if (putStatus !== 200) return { ok: false, status: putStatus }; Object.assign(pages.find((p) => p.id === id), page); return { ok: true, status: 200 } },
    setCurrent: async (id) => { calls.push(['current', id]); pages.forEach((p) => { p.current = p.id === id }); return { ok: true } },
    setSpells: async (a, b) => { calls.push(['spells', a, b]); return { ok: true, status: 200 } },
  }
  return g
}
const applier = (gateway, settings = {}) => {
  let prefs = { enabled: true, target: 'own', flashKey: 'f', ...settings }
  return createConfigurationApplier({ gateway, log: quiet, prefs: { get: () => prefs, set: (p) => (prefs = { ...prefs, ...p }) } })
}
const names = { champion: "Kai'Sa", opponent: 'Jinx' }

test('desactivado: no escribe nada', async () => {
  const g = fakeGateway()
  const a = applier(g, { enabled: false })
  assert.equal(a.canApply(), false)
  assert.equal((await a.applyRunes(rec, names)).reason, 'disabled')
  assert.equal((await a.applySpells(rec)).reason, 'disabled')
  assert.equal(g.calls.length, 0)
})

test('página propia: crea si no existe y actualiza la siguiente vez', async () => {
  const g = fakeGateway({ pages: [{ id: 1, name: 'Mi página', isEditable: true, current: true, selectedPerkIds: [] }] })
  const a = applier(g)
  const r1 = await a.applyRunes(rec, names)
  assert.equal(r1.ok, true); assert.equal(r1.mode, 'created'); assert.equal(r1.verified, true)
  assert.equal(g.pages.find((p) => p.id === 1).name, 'Mi página') // la del usuario intacta
  const r2 = await a.applyRunes({ ...rec, keystone: { rune: 8021 } }, names)
  assert.equal(r2.mode, 'updated')
  assert.equal(g.calls.filter(([k]) => k === 'create').length, 1)
  assert.equal(g.pages.length, 2)
  assert.ok(g.calls.some(([k]) => k === 'current'))
})

test('sin hueco para página nueva: error, no toca las del usuario', async () => {
  const g = fakeGateway({ max: 1, pages: [{ id: 1, name: 'Mi página', isEditable: true, current: true, selectedPerkIds: [1] }] })
  const r = await applier(g).applyRunes(rec, names)
  assert.equal(r.reason, 'no-slot')
  assert.equal(g.calls.length, 0)
})

test('destino «reemplazar la activa»: sobrescribe la página activa editable', async () => {
  const g = fakeGateway({ pages: [{ id: 1, name: 'A', isEditable: true, current: false }, { id: 2, name: 'B', isEditable: true, current: true }] })
  const r = await applier(g, { target: 'current' }).applyRunes(rec, names)
  assert.equal(r.mode, 'replaced')
  assert.equal(g.calls.find(([k]) => k === 'update')[1], 2)
  const none = fakeGateway({ pages: [{ id: 1, name: 'A', isEditable: false, current: true }] })
  assert.equal((await applier(none, { target: 'current' }).applyRunes(rec, names)).reason, 'not-editable')
})

test('el cliente rechaza o no responde', async () => {
  assert.equal((await applier(fakeGateway({ putStatus: 400 })).applyRunes(rec, names)).reason, 'rejected')
  const g = fakeGateway(); g.listPages = async () => null
  assert.equal((await applier(g).applyRunes(rec, names)).reason, 'lcu')
})

test('recomendación incompleta: no se envía nada', async () => {
  const g = fakeGateway()
  assert.equal((await applier(g).applyRunes({ ...rec, shards: [] }, names)).reason, 'incomplete')
  assert.equal(g.calls.length, 0)
})

test('hechizos: solo en Champion Select y con Destello en su tecla', async () => {
  const g = fakeGateway()
  const r = await applier(g, { flashKey: 'd' }).applySpells(rec)
  assert.deepEqual(g.calls[0], ['spells', 4, 7]); assert.equal(r.ok, true)
  const out = fakeGateway({ phase: 'Lobby' })
  assert.equal((await applier(out).applySpells(rec)).reason, 'not-in-champ-select')
  assert.equal(out.calls.length, 0)
})
