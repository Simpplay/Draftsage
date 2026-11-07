// Pruebas de las funciones de «valor añadido»: enlace web, reglas de hechizos, confianza, alternativas, fijados e idiomas.
import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
const { buildsUrl, championSlug } = await import('../../src/domain/web.js')
const { spellRules, rulesKey, isValidPair, replaceableIndex, SPELL } = await import('../../src/domain/spells.js')
const { confidenceLevel, isLowData, LOW_ITEM_SAMPLE } = await import('../../src/domain/confidence.js')
const { rankBest, rankKeystones, pickKeystone } = await import('../../src/domain/selection.js')
const { tiersLabel } = await import('../../src/domain/lobby.js')
const { pins, setLanguagePref, initLanguage, getPanelPrefs } = await import('../../src/application/preferences.js')
const { t, setLang, getLang, resolveLang } = await import('../../src/shared/i18n.js')
const { STRINGS } = await import('../../src/shared/strings.js')

test('enlace web: campeón, rol y rival (ejemplo del usuario)', () => {
  assert.equal(buildsUrl({ champion: 'caitlyn', role: 3, opponent: 'jinx' }), 'https://coachless.gg/builds/caitlyn?role=adc&matchup=jinx')
  assert.equal(buildsUrl({ champion: 'kaisa', role: 3 }), 'https://coachless.gg/builds/kaisa?role=adc')
  assert.deepEqual([0, 1, 2, 3, 4].map((r) => buildsUrl({ champion: 'x', role: r }).split('role=')[1]), ['top', 'jungle', 'mid', 'adc', 'support'])
  assert.equal(buildsUrl({ champion: 'thresh', role: 5 }), 'https://coachless.gg/builds/thresh') // rol principal: sin parámetro
  assert.equal(buildsUrl({ champion: 'ahri', opponent: 'zed' }), 'https://coachless.gg/builds/ahri?matchup=zed')
  assert.equal(buildsUrl({ role: 3 }), null)
  assert.equal(buildsUrl({ champion: 'a/b?c', role: 9, opponent: 'x&y' }), 'https://coachless.gg/builds/a%2Fb%3Fc?matchup=x%26y') // nada se cuela en la URL
})

test('slug del campeón: alias del cliente, nombre sin signos, excepciones y catálogo sin cargar', () => {
  assert.equal(championSlug({ alias: 'Kaisa', name: "Kai'Sa" }), 'kaisa')
  assert.equal(championSlug({ name: "Kai'Sa" }), 'kaisa')
  assert.equal(championSlug({ name: 'Bardo', alias: 'Bard' }), 'bard')       // el alias no depende del idioma del cliente
  assert.equal(championSlug({ alias: 'MonkeyKing', name: 'Wukong' }), 'wukong')
  assert.equal(championSlug({ name: 'Cho’Gath' }), 'chogath')
  assert.equal(championSlug({ id: 5, name: '#5' }), '')                       // sin catálogo no se inventa un enlace
})

test('hechizos: reglas por modo y rol', () => {
  assert.deepEqual(spellRules({ mode: 'CHERRY', role: 5 }).none, true)
  const aram = spellRules({ mode: 'ARAM', role: 5 })
  assert.deepEqual(aram.exclude.sort((a, b) => a - b), [SPELL.SMITE, SPELL.TELEPORT])
  assert.equal(spellRules({ mode: 'CLASSIC', role: 1 }).require, SPELL.SMITE)
  assert.ok(spellRules({ mode: 'CLASSIC', role: 3 }).exclude.includes(SPELL.SMITE))
  assert.ok(spellRules({ mode: 'CLASSIC', role: 3 }).exclude.includes(SPELL.CLARITY))
  assert.deepEqual(spellRules({ role: 5 }).exclude, [])                       // modo y rol desconocidos: no se filtra nada
  assert.notEqual(rulesKey(spellRules({ mode: 'ARAM' })), rulesKey(spellRules({ mode: 'CLASSIC', role: 3 })))
})

test('hechizos: parejas válidas y hechizo intercambiable', () => {
  const lane = spellRules({ mode: 'CLASSIC', role: 3 })
  const jungle = spellRules({ mode: 'CLASSIC', role: 1 })
  assert.equal(isValidPair([4, 7], lane), true)
  assert.equal(isValidPair([4, 11], lane), false)          // Aplastar fuera de la jungla
  assert.equal(isValidPair([4, 7], jungle), false)         // en jungla debe estar Aplastar
  assert.equal(isValidPair([11, 4], jungle), true)
  assert.equal(isValidPair([4, 4], lane), false)
  assert.equal(isValidPair([4], lane), false)
  assert.equal(isValidPair([4, 7], spellRules({ mode: 'CHERRY' })), false)
  assert.equal(replaceableIndex([4, 7], lane), 1)          // Destello se queda
  assert.equal(replaceableIndex([7, 4], lane), 0)
  assert.equal(replaceableIndex([11, 4], jungle), 1)       // jungla: Aplastar fijo, se puede cambiar Destello
  assert.equal(replaceableIndex([4, 11], jungle), 0)
})

test('confianza: niveles por muestra y datos escasos', () => {
  assert.deepEqual([0, 9999, 10000, 49999, 50000, 2e6, NaN, undefined].map(confidenceLevel), [1, 1, 2, 2, 3, 3, 1, 1])
  assert.equal(isLowData({ occurrence: LOW_ITEM_SAMPLE - 1 }), true)
  assert.equal(isLowData({ occurrence: LOW_ITEM_SAMPLE }), false)
  assert.equal(isLowData({ occurrence: 0 }), false)        // sin dato no es «poco fiable»
  assert.equal(isLowData(null), false)
})

test('alternativas: ordenadas por WPA, solo con muestra suficiente y con su cuota de uso', () => {
  const ks = [{ rune: 8005, wpa: -2.6, occurrence: 25000 }, { rune: 8008, wpa: 0.16, occurrence: 538000 }, { rune: 8010, wpa: 9, occurrence: 119 }, { rune: 8021, wpa: -1, occurrence: 60000 }]
  const r = rankKeystones(ks)
  assert.deepEqual(r.map((k) => k.rune), [8008, 8021, 8005])    // 8010 (119 partidas) no cuenta aunque tenga el mejor WPA
  assert.equal(r[0].rune, pickKeystone(ks).rune)                 // la primera es la recomendada
  assert.ok(Math.abs(r.reduce((s, k) => s + k.share, 0) - (623000 / 623119)) < 1e-9)
  assert.deepEqual(rankBest([], {}), [])
  assert.deepEqual(rankBest([{ spell: 4, wpa: 0, occurrence: 10 }], {}), [])  // por debajo del mínimo absoluto
})

test('tiersLabel acepta nombres traducidos', () => {
  assert.equal(tiersLabel([4, 5, 6]), 'Platino – Diamante')
  assert.equal(tiersLabel([4, 5, 6], { 4: 'Platinum', 6: 'Diamond' }), 'Platinum – Diamond')
})

test('fijados: guardar, leer, quitar, validar y limitar', () => {
  assert.equal(pins.get(145, 3), null)
  pins.set(145, 3, { keystone: 8005, spells: [4, 14] })
  assert.deepEqual(pins.get(145, 3), { keystone: 8005, spells: [4, 14] })
  assert.equal(pins.get(145, 2), null)                      // otro rol: no se mezcla
  pins.set(145, 3, { keystone: 8005, spells: [4] })         // pareja incompleta → se ignora
  assert.deepEqual(pins.get(145, 3), { keystone: 8005, spells: null })
  pins.set(145, 3, { keystone: 'x', spells: ['a', 'b'] })   // basura → nulos, nunca algo que se envíe al cliente
  assert.deepEqual(pins.get(145, 3), { keystone: null, spells: null })
  pins.remove(145, 3); assert.equal(pins.get(145, 3), null)
  for (let i = 1; i <= 205; i++) pins.set(i, 0, { keystone: 8005 })
  assert.equal(Object.keys(DataStore.get('draftsage/pins')).length, 200)
  assert.equal(pins.get(205, 0).keystone, 8005); assert.equal(pins.get(1, 0), null) // se descartan los más antiguos
  assert.ok(!/token|password/i.test(JSON.stringify(DataStore.get('draftsage/pins'))))
})

test('idioma: auto según el navegador, preferencia guardada y sustitución de argumentos', () => {
  assert.equal(resolveLang('auto', 'es-CO'), 'es'); assert.equal(resolveLang('auto', 'en-US'), 'en'); assert.equal(resolveLang('auto', 'pt-BR'), 'en')
  assert.equal(resolveLang('en', 'es-ES'), 'en')
  setLang('es'); assert.equal(t('apply.btn'), 'Aplicar'); assert.equal(t('common.missing', 'Email'), 'Falta: Email')
  setLang('en'); assert.equal(t('apply.btn'), 'Apply'); assert.equal(t('common.missing', 'Email'), 'Missing: Email')
  assert.equal(t('no.existe'), 'no.existe')                  // clave desconocida: se ve la clave, no `undefined`
  assert.equal(t('stat.tip', 'X', '+1.0'), 'X · WPA +1.0 · {2} games') // argumento que falta: se deja el marcador
  setLanguagePref('es'); assert.equal(getLang(), 'es'); assert.equal(getPanelPrefs().lang, 'es')
  setLanguagePref('klingon'); assert.equal(getPanelPrefs().lang, 'auto')
  DataStore.set('draftsage/panel', { lang: 'en' }); initLanguage(); assert.equal(getLang(), 'en')
  setLang('es')
})

// Todas las claves del español existen en inglés y viceversa; las claves usadas en el código existen; sin textos vacíos.
test('diccionarios: mismas claves en es y en, y todas las claves usadas por el código existen', () => {
  const es = Object.keys(STRINGS.es), en = Object.keys(STRINGS.en)
  assert.deepEqual(es.filter((k) => !(k in STRINGS.en)), [], 'faltan en inglés')
  assert.deepEqual(en.filter((k) => !(k in STRINGS.es)), [], 'faltan en español')
  for (const k of es) { assert.ok(STRINGS.es[k].trim() && STRINGS.en[k].trim(), 'texto vacío: ' + k) }
  // los marcadores {n} deben coincidir entre idiomas
  const marks = (s) => [...s.matchAll(/\{(\d+)\}/g)].map((m) => m[1]).sort().join()
  for (const k of es) assert.equal(marks(STRINGS.es[k]), marks(STRINGS.en[k]), 'marcadores distintos en ' + k)

  const files = []
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') && !p.endsWith('strings.js') && files.push(p) } }
  walk(join(import.meta.dirname, '..', '..', 'src'))
  const used = new Set()
  for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/\bt\('([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)'\s*[,)]/g)) used.add(m[1])
  assert.ok(used.size > 40, 'debería haber muchas claves en uso: ' + used.size)
  assert.deepEqual([...used].filter((k) => !(k in STRINGS.es)), [])
  // familias dinámicas: role.N, tier.N, err.*, applyErr.*, notice.*, conf.N, cors.stepN, key|label|tip de los ajustes
  const dynamic = [0, 1, 2, 3, 4, 5].map((n) => 'role.' + n).concat([3, 4, 5, 6, 7].map((n) => 'tier.' + n), [1, 2, 3].map((n) => 'conf.' + n),
    ['network', 'forbidden', 'no-data', 'no-patch', 'auth', 'other'].map((r) => 'err.' + r),
    ['disabled', 'incomplete', 'invalid', 'lcu', 'not-editable', 'no-slot', 'rejected', 'not-in-champ-select'].map((r) => 'applyErr.' + r),
    ['matchup-requires-premium', 'matchup-low-sample', 'filters-downgraded', 'patch-low-sample', 'spells-adjusted'].map((r) => 'notice.' + r),
    ['set.own', 'set.ownTip', 'set.current', 'set.currentTip'], [1, 2, 3, 4].map((n) => 'cors.step' + n)).flat()
  assert.deepEqual(dynamic.filter((k) => !(k in STRINGS.es)), [])
})
