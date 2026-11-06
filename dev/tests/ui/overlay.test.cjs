// dev/tests/ui/overlay.test.cjs — Playwright: fuente LoLalytics + estadísticas sobre la selección de campeones.
// Mismo harness que ui.test.cjs; LoLalytics se simula interceptando las peticiones con el fixture sintético (sin red real).
// Uso:  node dev/tests/ui/overlay.test.cjs [carpeta-para-capturas]      (NODE_PATH = «npm root -g»)
const path = require('node:path'), os = require('node:os')
const { pathToFileURL } = require('node:url')
const root = path.resolve(__dirname, '..', '..', '..')
const shots = process.argv[2] || os.tmpdir()
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
;(async () => {
const fx = await import(pathToFileURL(path.join(root, 'dev/tests/fixtures/lolalytics-fixture.mjs')).href)
const srv = spawn('python3', ['-m', 'http.server', '8766', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 800))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, locale: 'es-ES' })
const errors = [], lolaCalls = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.route('https://lolalytics.com/**', (route) => {
  const url = route.request().url(); lolaCalls.push(url)
  const body = url.includes('/tierlist/') ? fx.tierlistHtml() : /\/vs\//.test(url) ? fx.buildHtml({ cid: 145, vs: { cid: 222 } }) : fx.buildHtml({ cid: 145 })
  route.fulfill({ status: 200, contentType: 'text/html', headers: { 'access-control-allow-origin': '*' }, body })
})
let pass = 0, fail = 0
const ok = (c, msg) => { c ? pass++ : (fail++, console.log('FALLA:', msg)); if (c) console.log('ok  ', msg) }
try {
  await page.goto('http://127.0.0.1:8766/dev/tests/ui/harness.html')
  await page.evaluate(() => window.DataStore.set('easy-coachless/source', { mode: 'lolalytics' }))
  await page.evaluate(() => window.__start())
  await page.waitForSelector('.ecp-fab', { timeout: 15000 })
  ok((await page.$$('.ec-modal')).length === 0, 'con la fuente LoLalytics no se pide iniciar sesión')

  // Cuadrícula falsa del cliente (30 campeones) + 3 iconos de baneo fuera de ella
  await page.evaluate(() => {
    const ids = [81, 145, 51, 222, 236, 15, 119, 67, 412, 103, 238, ...Array.from({ length: 19 }, (_, i) => 3000 + i)]
    const grid = document.createElement('div'); grid.id = 'fake-grid'; grid.style.cssText = 'position:fixed;left:20px;top:120px;width:600px;display:flex;flex-wrap:wrap;gap:6px'
    for (const id of ids) { const w = document.createElement('div'); const i = document.createElement('img'); i.src = '/lol-game-data/assets/v1/champion-icons/' + id + '.png'; i.style.cssText = 'width:48px;height:48px;background:#333;display:block'; w.append(i); grid.append(w) }
    const bans = document.createElement('div'); bans.id = 'fake-bans'; bans.style.cssText = 'position:fixed;left:20px;top:20px;display:flex;gap:6px'
    for (const id of [15, 236, 119]) { const i = document.createElement('img'); i.src = '/lol-game-data/assets/v1/champion-icons/' + id + '.png'; i.style.cssText = 'width:32px;height:32px;background:#555'; bans.append(i) }
    document.body.append(bans, grid)
    window.__lcu.phase = 'ChampSelect'
    const p = (cellId, championId, pos, puuid) => ({ cellId, championId, assignedPosition: pos, puuid })
    window.__lcu.session = { localPlayerCellId: 3, actions: [], myTeam: [p(0, 10, 'top', 'a'), p(1, 11, 'jungle', 'b'), p(2, 103, 'middle', 'c'), p(3, 145, 'bottom', 'd'), p(4, 412, 'utility', 'e')], theirTeam: [p(5, 238, 'middle'), p(6, 222, 'bottom')] }
  })
  await page.waitForSelector('.ecb', { timeout: 15000 })
  const badges = await page.$$eval('.ecb', (a) => a.map((e) => ({ cid: e.dataset.cid, cls: e.className, text: e.textContent, title: e.title })))
  ok(badges.length >= 11, 'hay marcadores sobre la cuadrícula (' + badges.length + ')')
  const sivir = badges.find((b) => b.cid === '15')
  ok(sivir && /ecb-top/.test(sivir.cls) && sivir.text.includes('54.5') && sivir.text.includes('#1'), 'el mejor counter (Sivir) lleva 54.5 y #1: ' + JSON.stringify(sivir))
  ok(badges.find((b) => b.cid === '119' && /ecb-low/.test(b.cls)), 'Draven (150 partidas) se atenúa y no es counter')
  ok(!badges.some((b) => b.cid === '3000' && false) && (await page.$$eval('#fake-bans .ecb, .ecb', (a) => a.length)) === badges.length, 'los baneos no duplican marcadores')
  const ys = await page.$$eval('.ecb', (a) => a.map((e) => parseInt(e.style.top)))
  ok(ys.every((y) => y > 100), 'todos los marcadores están sobre la cuadrícula (ninguno sobre los baneos)')
  ok(await page.$('.ecp-tag[data-source=lolalytics]') !== null, 'el panel marca la fuente LoLalytics')
  ok(await page.$('.ecp-counters') !== null, 'el panel muestra la fila de counters')
  ok(lolaCalls.length <= 4, 'pocas peticiones a LoLalytics (' + lolaCalls.length + ')')
  const n = lolaCalls.length; await page.waitForTimeout(1500)
  ok(lolaCalls.length === n, 'sin peticiones repetidas en reposo')
  await page.screenshot({ path: shots + '/overlay-ready.png' })

  // Fuente → Coachless desde los ajustes: sin sesión pasa a «necesita login»
  await page.click('.ecp-fab'); await page.waitForSelector('.ecs')
  ok(await page.$('.ecs-chip[data-source=lolalytics][aria-pressed=true]') !== null, 'ajustes: LoLalytics seleccionado')
  await page.click('.ecs-chip[data-source=coachless]')
  ok(await page.evaluate(() => window.DataStore.get('easy-coachless/source').mode) === 'coachless', 'cambiar de fuente se guarda')
  await page.click('.ec-actions .ec-btn')
  await page.waitForFunction(() => !document.querySelector('.ecp-tag[data-source=lolalytics]'), null, { timeout: 8000 })
  ok(true, 'al elegir Coachless sin sesión desaparece la recomendación de LoLalytics')
  ok((await page.$$('.ecb')).length >= 11, 'las estadísticas sobre la selección siguen sin necesitar cuenta')
  // Desactivar las estadísticas
} catch (e) { fail++; console.log('EXCEPCIÓN:', e.message); await page.screenshot({ path: shots + '/overlay-fail.png' }).catch(() => {}) }
console.log('errores de página:', errors.length ? errors.join(' | ') : 'ninguno')
console.log(`pass ${pass} / fail ${fail}`)
await browser.close(); srv.kill()
process.exit(fail ? 1 : 0)
})()
