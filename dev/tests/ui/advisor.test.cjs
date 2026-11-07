// dev/tests/ui/advisor.test.cjs — Playwright: consejero de picks (iTero + LoLalytics) en el panel y en Ajustes.
// Mismo harness que ui.test.cjs. iTero (con la fixture de respuesta REAL recortada), Data Dragon y LoLalytics se simulan interceptando las
// peticiones: sin red real. Uso:  node dev/tests/ui/advisor.test.cjs [carpeta-para-capturas]      (NODE_PATH = «npm root -g»)
const path = require('node:path'), os = require('node:os')
const { pathToFileURL } = require('node:url')
const root = path.resolve(__dirname, '..', '..', '..')
const shots = process.argv[2] || os.tmpdir()
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
;(async () => {
const lolaFx = await import(pathToFileURL(path.join(root, 'dev/tests/fixtures/lolalytics-fixture.mjs')).href)
const iteroFx = await import(pathToFileURL(path.join(root, 'dev/tests/fixtures/itero-fixture.mjs')).href)
const srv = spawn('python3', ['-m', 'http.server', '8767', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 800))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 760 }, locale: 'es-ES' })
const errors = [], iteroReqs = [], lolaCalls = []
let iteroMode = 'ok'
page.on('pageerror', (e) => errors.push(String(e)))
if (process.env.EC_DEBUG) page.on('console', (m) => { if (/draftsage/.test(m.text())) console.log('  ·', m.text().slice(0, 300)) })

// Data Dragon: los campeones de la fixture (ids 3000+) + los del arnés + relleno hasta 100+
const names = {}
iteroFx.FIXTURE_ROWS.forEach((r, i) => { if (i !== 10) names[3000 + i] = r.champion })
names[8000] = iteroFx.FIXTURE_ROWS[10].champion // el rival que se revela más tarde (fuera de los ids de relleno de la fixture de LoLalytics)
Object.assign(names, { 145: "Kai'Sa", 222: 'Jinx', 103: 'Ahri', 238: 'Zed', 412: 'Thresh', 10: 'Kayle', 11: 'Master Yi', 266: 'Aatrox' })
for (let i = 0; i < 100; i++) names[5000 + i] = 'Relleno ' + i
await page.route('https://ddragon.leagueoflegends.com/**', (route) => {
  const url = route.request().url()
  const body = url.endsWith('versions.json') ? ['16.22.1'] : { data: Object.fromEntries(Object.entries(names).map(([id, name]) => ['C' + id, { key: String(id), name }])) }
  route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) })
})
// Listas de tier por línea: cada campeón juega «su» línea al 95 % (así se colocan los rivales que el cliente no asigna); el resto, relleno al 5 %
const mk = (lane, pctLane) => ({ rank: 50, tier: 10, lane, defaultLane: lane, pctLane, wr: 50, avgWrDelta: 0, pr: 3, br: 1, pbi: 0, games: 9000, topRank: 5, topWr: '55.1', topGames: 2000, topDelta: 4, topElo: 800 })
const MAIN = { top: [8000, 266], jungle: [], middle: [238, 103], bottom: [222, 145], support: [412] }
const tierRows = (lane) => {
  if (lane === 'bottom') return undefined // la lista por defecto de la fixture (la usan las estadísticas del panel)
  const rows = Object.fromEntries(Array.from({ length: 14 }, (_, i) => [7000 + i, mk(lane, 5)]))
  for (const cid of MAIN[lane]) rows[cid] = mk(lane, 95)
  return rows
}
await page.route('https://lolalytics.com/**', (route) => {
  const url = route.request().url(); lolaCalls.push(url)
  const lane = /lane=([a-z]+)/.exec(url)?.[1] ?? 'bottom'
  const body = url.includes('/tierlist/') ? lolaFx.tierlistHtml({ lane, rows: tierRows(lane) }) : /\/vs\//.test(url) ? lolaFx.buildHtml({ cid: 145, vs: { cid: 222 } }) : lolaFx.buildHtml({ cid: 145 })
  route.fulfill({ status: 200, contentType: 'text/html', headers: { 'access-control-allow-origin': '*' }, body })
})
await page.route('https://www.itero.gg/api/draft-picks', (route) => {
  iteroReqs.push(JSON.parse(route.request().postData() || '{}'))
  const h = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }
  if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { ...h, 'access-control-allow-methods': 'POST' } })
  if (iteroMode === '503') return route.fulfill({ status: 503, headers: h, body: '{}' })
  route.fulfill({ status: 200, contentType: 'application/json', headers: h, body: JSON.stringify(iteroFx.FIXTURE_ROWS) })
})

let pass = 0, fail = 0
const ok = (c, msg) => { c ? pass++ : (fail++, console.log('FALLA:', msg)); if (c) console.log('ok  ', msg) }
const lcu = (enemies) => page.evaluate((en) => {
  window.__lcu.phase = 'ChampSelect'
  const p = (cellId, championId, pos, puuid, team) => ({ cellId, championId, assignedPosition: pos, puuid, team })
  window.__lcu.session = { localPlayerCellId: 3, actions: [], bans: { myTeamBans: [266], theirTeamBans: [] },
    myTeam: [p(0, 10, 'top', 'a', 2), p(1, 11, 'jungle', 'b', 2), p(2, 103, 'middle', 'c', 2), p(3, 145, 'bottom', 'd', 2), p(4, 412, 'utility', 'e', 2)],
    theirTeam: en.map((id, i) => p(5 + i, id, '', null, 1)) }
}, enemies)
try {
  await page.goto('http://127.0.0.1:8767/dev/tests/ui/harness.html')
  await page.evaluate(() => window.DataStore.set('draftsage/source', { mode: 'lolalytics' }))
  await page.evaluate(() => window.__start())
  await page.waitForSelector('.ecp-fab', { timeout: 15000 })
  await lcu([238, 222])
  await page.waitForSelector('.ecp-tag[data-source=lolalytics]', { timeout: 15000 })

  // 1) apagado por defecto: ni bloque ni peticiones a iTero
  await page.waitForTimeout(1500)
  ok(await page.$('.ecp-adv[data-advisor]') === null, 'apagado por defecto: el panel no muestra el consejero')
  ok(iteroReqs.length === 0, 'apagado: ninguna petición a iTero')
  ok(await page.evaluate(() => window.DataStore.get('draftsage/advisor')) === undefined, 'apagado: nada guardado')

  // 2) activarlo pasa por el aviso; cancelar no activa
  await page.click('.ecp-fab'); await page.waitForSelector('.ecs')
  await page.click('.ecs-more'); await page.waitForSelector('.ecs-mini[data-act=advisor]')
  ok(await page.$('.ecs-mini[data-act=advisor][aria-pressed=false]') !== null, 'ajustes: el interruptor del consejero aparece apagado')
  await page.click('.ecs-mini[data-act=advisor]'); await page.waitForSelector('.ec-modal .ec-btn.ec-primary')
  const msg = await page.textContent('.ec-modal')
  ok(/iTero/.test(msg) && /tercero/.test(msg) && /Riot ID/.test(msg) && /bajo tu responsabilidad/.test(msg), 'el aviso explica qué se envía, a quién y el riesgo')
  await page.click('.ec-modal .ec-btn:not(.ec-primary)')
  await page.waitForTimeout(400)
  ok(iteroReqs.length === 0 && !(await page.evaluate(() => window.DataStore.get('draftsage/advisor')?.enabled)), 'cancelar el aviso no activa nada')
  // aceptar
  await page.keyboard.press('Control+Shift+E'); await page.waitForSelector('.ecs')
  await page.click('.ecs-more')
  // actualizaciones (loader): «Auto» por defecto; «Solo incluida» se guarda y se puede volver a «Auto»
  ok((await page.getAttribute('[data-updates=auto]', 'aria-pressed')) === 'true' && (await page.getAttribute('[data-updates=packaged]', 'aria-pressed')) === 'false', 'actualizaciones: «Auto» por defecto')
  await page.click('[data-updates=packaged]')
  ok((await page.evaluate(() => window.DataStore.get('draftsage/updates').mode)) === 'packaged' && (await page.getAttribute('[data-updates=packaged]', 'aria-pressed')) === 'true', 'actualizaciones: «Solo incluida» se guarda')
  await page.click('[data-updates=auto]')
  ok((await page.evaluate(() => window.DataStore.get('draftsage/updates').mode)) === 'auto', 'actualizaciones: vuelve a «Auto»')
  await page.click('.ecs-mini[data-act=advisor]')
  await page.waitForSelector('.ec-modal .ec-btn.ec-primary'); await page.click('.ec-modal .ec-btn.ec-primary')
  await page.waitForSelector('.ecp-adv[data-advisor=ready]', { timeout: 20000 })
  ok(await page.evaluate(() => window.DataStore.get('draftsage/advisor').enabled) === true, 'aceptar activa y guarda solo el interruptor y los pesos')
  await page.keyboard.press('Escape').catch(() => {})
  const stored = JSON.stringify(await page.evaluate(() => window.DataStore.get('draftsage/advisor')))
  ok(!/token|password|email/i.test(stored), 'lo guardado no contiene datos sensibles: ' + stored)

  // 3) el bloque: 5 picks con puntuación relativa, sin porcentajes absolutos, motivos del primero
  const picks = await page.$$eval('.ecp-adv[data-advisor] .ecp-pk', (a) => a.map((e) => ({ id: e.dataset.pick, text: e.textContent.trim(), cls: e.className })))
  ok(picks.length === 5, '5 picks sugeridos: ' + picks.length)
  ok(picks.every((p) => /[+-]\d+\.\d$/.test(p.text)), 'cada pick lleva su puntuación relativa con signo: ' + picks.map((p) => p.text).join(' '))
  ok(picks[0].cls.includes('ecp-on'), 'el primero está seleccionado')
  const block = await page.textContent('.ecp-adv[data-advisor]')
  ok(!/\d\s?%/.test(block), 'nunca se enseña un porcentaje absoluto en el bloque')
  ok(await page.$('.ecp-reasons[data-reasons]') !== null, 'hay motivos del pick seleccionado')
  ok(await page.$('.ecp-adv[data-advisor] .ecp-tag[data-source=itero]') !== null, 'etiqueta de fuente: iTero')
  ok(await page.$('.ecp-adv [data-warn=names]') === null, 'sin aviso de nombres no reconocidos')
  ok(await page.$('.ecp-tag[data-source=lolalytics]') !== null && await page.$('.ecp-body .ecp-line') !== null, 'la recomendación principal sigue ahí')
  await page.screenshot({ path: shots + '/advisor-ready.png' })

  // 4) la petición: línea, rango, lado, bans, posiciones; sin tu campeón ni datos personales
  const r0 = iteroReqs[0]
  ok(r0.lane === 'BOTTOM' && r0.rankClass === 'EMERALD' && r0.side === 'Red', 'petición: línea BOTTOM, EMERALD, lado rojo (team 2): ' + [r0.lane, r0.rankClass, r0.side])
  ok(r0.teamComp.t1_MIDDLE_champion === 'Ahri' && r0.teamComp.t1_UTILITY_champion === 'Thresh' && r0.teamComp.t1_TOP_champion === 'Kayle' && r0.teamComp.t1_JUNGLE_champion === 'Master Yi', 'aliados por posición con nombre inglés exacto')
  ok(!('t1_BOTTOM_champion' in r0.teamComp), 'tu hueco va vacío')
  ok(r0.teamComp.t2_MIDDLE_champion === 'Zed' && r0.teamComp.t2_BOTTOM_champion === 'Jinx', 'rivales colocados por la cuota de línea de LoLalytics (sin posición del cliente)')
  ok(JSON.stringify(r0.bans) === '["Aatrox"]', 'bans: ' + JSON.stringify(r0.bans))
  ok(!/email|password|token|puuid|riot/i.test(JSON.stringify(r0)), 'la petición no lleva datos personales')
  const n1 = iteroReqs.length

  // 5) hacer clic en otro pick cambia los motivos sin red
  await page.click('.ecp-adv[data-advisor] .ecp-pk:nth-child(3)')
  ok(await page.$eval('.ecp-adv[data-advisor] .ecp-pk:nth-child(3)', (e) => e.classList.contains('ecp-on')), 'clic: el tercero queda seleccionado')
  await page.waitForTimeout(800)
  ok(iteroReqs.length === n1, 'clic en un pick: ninguna petición nueva')

  // 6) se revela otro rival → una petición nueva; el reposo no repite
  await lcu([238, 222, 8000])
  await page.waitForFunction((n) => true, n1)
  await page.waitForTimeout(3500)
  ok(iteroReqs.length === n1 + 1, 'un rival nuevo = una petición nueva (' + (iteroReqs.length - n1) + ')')
  ok(iteroReqs.at(-1).teamComp.t2_TOP_champion === iteroFx.FIXTURE_ROWS[10].champion, 'el rival nuevo va en su línea (Top)')
  ok(await page.$('.ecp-adv [data-warn=names]') !== null, 'si iTero devuelve entre los candidatos un campeón que enviamos (no lo reconoció), aparece el aviso')
  const n2 = iteroReqs.length; await page.waitForTimeout(2500)
  ok(iteroReqs.length === n2, 'sin peticiones repetidas en reposo')

  // 7) iTero falla: el consejero muestra el error y todo lo demás sigue igual
  iteroMode = '503'
  await page.evaluate(() => { const s = window.__lcu.session; s.bans = { myTeamBans: [266, 3001], theirTeamBans: [] } })
  await page.waitForSelector('.ecp-adv[data-advisor=error]', { timeout: 15000 })
  ok(await page.$eval('.ecp-adv[data-advisor]', (e) => e.dataset.reason) === 'blocked', 'HTTP 503 → «bloqueo temporal»')
  ok(await page.$('.ecp-tag[data-source=lolalytics]') !== null && await page.$('.ecp-mu[data-matchup]') !== null, 'con iTero caído la recomendación y la lista de matchup siguen')
  ok(await page.$('.ecp-adv [data-act=adv-retry]') !== null, 'hay botón de reintentar')
  await page.screenshot({ path: shots + '/advisor-error.png' })

  // 8) apagarlo desde Ajustes: desaparece y no vuelve a pedir
  await page.keyboard.press('Control+Shift+E'); await page.waitForSelector('.ecs')
  await page.click('.ecs-more'); await page.click('.ecs-mini[data-act=advisor]')
  await page.waitForFunction(() => !document.querySelector('.ecp-adv[data-advisor]'), null, { timeout: 5000 })
  ok(await page.evaluate(() => window.DataStore.get('draftsage/advisor').enabled) === false, 'apagar es inmediato y se guarda')
} catch (e) { fail++; console.log('EXCEPCIÓN:', e.message); await page.screenshot({ path: shots + '/advisor-fail.png' }).catch(() => {}) }
console.log('peticiones a iTero:', iteroReqs.length, '· a LoLalytics:', lolaCalls.length)
console.log('errores de página:', errors.length ? errors.join(' | ') : 'ninguno')
console.log(`pass ${pass} / fail ${fail}`)
await browser.close(); srv.kill()
process.exit(fail ? 1 : 0)
})()
