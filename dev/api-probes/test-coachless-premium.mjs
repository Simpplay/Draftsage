// test-coachless-premium.mjs — contraste CON CUENTA PREMIUM de lo que solo se pudo verificar con la gratuita.
// Ejecuta el código real del plugin (src/) contra la API de Coachless. Solo lecturas.
//
// Qué comprueba (cada bloque imprime OK / REVISAR):
//   1. Sesión: login por el mismo módulo del plugin (auth.js) y claim isSubscribed = "1".
//   2. Plan premium: el servicio pide patchAdditions 1 y, con rival, matchupChampionIds (y no cae al 403).
//   3. Matchup vs sin matchup: ¿cambian de verdad las runas/hechizos? ¿cuánta muestra queda?
//      (calibra MIN_MATCHUP_SAMPLE = 300 en src/application/recommendation.js)
//   4. Fila 2 de Dominación (¿sigue vacía con premium?) y escala de wpaOverall.
//   5. Latencia de una recomendación completa (~10 peticiones) y señales de límite de uso (HTTP 429).
//
// Uso (desde la raíz del plugin):  node dev/api-probes/test-coachless-premium.mjs
//   Pide email y contraseña (no se muestra). No imprime tokens. Pega la salida completa.
import readline from 'node:readline'

// Globales mínimos de Pengu para importar los módulos del plugin fuera del cliente.
globalThis.window ??= globalThis
const mem = new Map()
globalThis.DataStore = { get: (k, d) => (mem.has(k) ? mem.get(k) : d), set: (k, v) => mem.set(k, v), remove: (k) => mem.delete(k) }

const { login, api, apiGet, hasPremium } = await import('../../src/infrastructure/coachless/auth.js')
const { createCoachlessClient } = await import('../../src/infrastructure/coachless/client.js')
const { createCache } = await import('../../src/infrastructure/coachless/cache.js')
const { createRecommendationService, MIN_MATCHUP_SAMPLE } = await import('../../src/application/recommendation.js')

function ask(q, hidden = false) {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    if (hidden) rl._writeToOutput = (s) => rl.output.write(s.includes(q) ? s : '*')
    rl.question(q, (a) => { rl.close(); if (hidden) process.stdout.write('\n'); res(a) })
  })
}
const email = process.env.CL_EMAIL || (await ask('Email (cuenta PREMIUM): '))
const pass = process.env.CL_PASS || (await ask('Contraseña (no se muestra): ', true))

const status = (cond, okMsg, badMsg) => console.log(cond ? '  OK      ' + okMsg : '  REVISAR ' + badMsg)
const section = (t) => console.log('\n== ' + t)

section('1. Sesión')
const lg = await login(email, pass)
if (!lg.ok) { console.error('Login falló'); process.exit(1) }
status(hasPremium(), 'cuenta premium (isSubscribed = "1")', 'la cuenta NO es premium: el resto de comprobaciones no sirve; usa la cuenta premium')

// Registro de peticiones para ver qué filtros salieron realmente.
const sent = []
let rateLimited = 0
const post = async (p, b) => { sent.push({ p, b }); const r = await api(p, b); if (r.status === 429) rateLimited++; return r }
const get = async (p) => { const r = await apiGet(p); if (r.status === 429) rateLimited++; return r }
const log = { info() {}, warn: (...a) => console.log('  (aviso del servicio)', ...a), error: console.error, debug() {} }
const client = createCoachlessClient({ post, get, cache: createCache() })
const svc = createRecommendationService({ client, log, cache: createCache() })

const fmt = (p) => (p ? `${p.rune ?? p.spell}(${p.wpa.toFixed(2)}/${p.occurrence})` : '-')
const line = (d) => `ks ${fmt(d.keystone)} | prim ${d.primaryPicks.map(fmt).join(' ')} | sec ${d.secondaryTree}: ${d.secondaryPicks.map(fmt).join(' ')} | hech ${d.spells.map(fmt).join(' ')}`

section('2-3. Matchup vs sin matchup (Kai\'Sa ADC Esmeralda; id 145)')
const MATCHUPS = [['Jinx', 222], ['Draven', 119], ['Ezreal', 81], ['Caitlyn', 51], ['Zed', 238]]
const base = await svc.getRecommendation({ championId: 145, role: 3, lobbyTier: 5 }, { premium: true })
if (!base.ok) console.log('  REVISAR sin matchup falló:', base.reason)
else {
  const f0 = sent.find((s) => s.p.endsWith('GetKeystoneData')).b.commonFilters
  status(f0.patch.patchAdditions === 1, 'premium pide patchAdditions 1 y no recibe 403', 'patchAdditions enviado: ' + f0.patch.patchAdditions)
  status(!base.data.meta.notices.includes('filters-downgraded'), 'sin degradación de filtros', 'el servicio degradó los filtros (403 con premium: ¿el claim está desfasado?)')
  console.log('  sin matchup :', line(base.data), '| parche', base.data.meta.patch, '| muestra', base.data.meta.sample)
}
for (const [name, id] of MATCHUPS) {
  const t0 = Date.now()
  const r = await svc.getRecommendation({ championId: 145, opponentChampionId: id, role: 3, lobbyTier: 5 }, { premium: true })
  const ms = Date.now() - t0
  if (!r.ok) { console.log(`  vs ${name}: REVISAR error ${r.reason}`); continue }
  const d = r.data
  const same = base.ok && JSON.stringify([d.keystone.rune, d.primaryPicks.map((p) => p?.rune), d.secondaryPicks.map((p) => p.rune), d.spells.map((s) => s.spell)]) ===
    JSON.stringify([base.data.keystone.rune, base.data.primaryPicks.map((p) => p?.rune), base.data.secondaryPicks.map((p) => p.rune), base.data.spells.map((s) => s.spell)])
  console.log(`  vs ${name.padEnd(8)} (${ms} ms) matchup aplicado: ${d.meta.matchup} | muestra ${d.meta.sample} | avisos [${d.meta.notices}] | ${same ? 'IGUAL que sin matchup' : 'distinto'}\n              ${line(d)}`)
}
console.log(`  (umbral actual MIN_MATCHUP_SAMPLE = ${MIN_MATCHUP_SAMPLE}: si los matchups habituales quedan por debajo, bajarlo o ponderar)`)

section('4. Fila 2 de Dominación y escala de wpaOverall')
const f = { patch: { major: 16, patch: 21, patchAdditions: 1 }, championIds: [145], matchupChampionIds: null, leagueTiers: [5, 6, 7], regions: null, role: 3 }
const dom = await client.treeRunes(f, 8000, 8100, 8008)
status(dom.ok && dom.data.rows[1].length > 0, 'la fila 2 de Dominación trae datos con premium', 'la fila 2 de Dominación sigue VACÍA (Sixth Sense / Grisly Mementos / Deep Ward no se registran)')
const ks = await client.keystones(f)
if (ks.ok) {
  const top = [...ks.data].sort((a, b) => b.occurrence - a.occurrence)[0]
  console.log(`  keystone más usado ${top.rune}: wpa ${top.wpa} (n=${top.occurrence}). ¿Es wpa en puntos porcentuales? Compáralo con coachless.gg/runes/... (la web muestra la misma cifra)`)
}

section('5. Latencia y límite de uso')
const t0 = Date.now()
const lat = []
for (const id of [412, 103, 122, 64, 266]) { // Thresh, Ahri, Darius, Lee Sin, Aatrox
  const t = Date.now()
  const r = await svc.getRecommendation({ championId: id, role: 5, lobbyTier: 6 }, { premium: true })
  lat.push(Date.now() - t)
  if (!r.ok) console.log('  campeón', id, 'error', r.reason)
}
console.log(`  5 recomendaciones sin caché: ${lat.join(' / ')} ms (total ${Date.now() - t0} ms, ${sent.length} peticiones acumuladas)`)
status(rateLimited === 0, 'ninguna respuesta 429 (sin señales de límite de uso)', `${rateLimited} respuesta(s) 429: hay límite de uso; conviene limitar la concurrencia`)

console.log('\nFin. Pega esta salida tal cual (no contiene tokens ni contraseña).')
