// dev/tests/ui/clash.test.cjs — Playwright: bans recomendados junto al modal de scouting de Clash (presentation/components/scouting.js).
// Mismo harness que native.test.cjs; el LCU de Clash y LoLalytics se simulan (sin cuenta ni red). Datos sintéticos.
// Uso:  node dev/tests/ui/clash.test.cjs [carpeta-para-capturas]      (NODE_PATH = «npm root -g»)
const path = require('node:path'), os = require('node:os'), fs = require('node:fs')
const { pathToFileURL } = require('node:url')
const root = path.resolve(__dirname, '..', '..', '..')
const shots = process.argv[2] || os.tmpdir()
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
;(async () => {
const fx = await import(pathToFileURL(path.join(root, 'dev/tests/fixtures/lolalytics-fixture.mjs')).href)
const dom = fs.readFileSync(path.join(root, 'dev/tests/fixtures/clash-scouting-dom.html'), 'utf8')
const srv = spawn('python3', ['-m', 'http.server', '8768', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 800))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, locale: 'es-ES' })
const errors = [], logs = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.text().includes('[draftsage]')) logs.push(m.type() + ' ' + m.text()) })
await page.route('https://lolalytics.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', headers: { 'access-control-allow-origin': '*' }, body: fx.tierlistHtml() }))
let pass = 0, fail = 0
const ok = (c, msg) => { c ? pass++ : (fail++, console.log('FALLA:', msg)); if (c) console.log('ok  ', msg) }
try {
  await page.goto('http://127.0.0.1:8768/dev/tests/ui/harness.html')
  await page.evaluate(() => {
    const now = Date.now(), day = 864e5
    const names = { 101: 'Alfa', 102: 'Beta', 103: 'Gamma', 104: 'Delta', 105: 'Epsilon' }
    const pool = (list) => list.map(([championId, championPoints, d]) => ({ championId, championLevel: 7, championPoints, lastPlayTime: now - d * day }))
    // Alfa: one-trick de Kai'Sa (145); el resto, pools anchos con campeones del catálogo del arnés.
    const masteries = { pa: pool([[145, 400000, 1], [222, 20000, 2], [103, 15000, 2]]), pb: pool([[222, 90000, 1], [103, 85000, 1], [238, 80000, 2]]), pc: pool([[103, 70000, 1], [412, 65000, 3]]), pd: pool([[238, 60000, 1], [412, 59000, 1]]), pe: pool([[412, 50000, 1]]) }
    window.__lcuExtra = (url) => {
      if (url === '/lol-clash/v1/tournament-summary') return [{ bracketId: 10, rosterId: 1, state: 'SCOUTING', tournamentId: 5 }]
      if (url === '/lol-clash/v1/bracket/10') return { rosters: [{ rosterId: 1, name: 'Yo', shortName: 'YO' }, { rosterId: 2, name: 'Rival', shortName: 'RIV' }], matches: [{ round: 1, status: 'UPCOMING', rosterId1: 1, rosterId2: 2, winnerId: 0 }] }
      if (url === '/lol-clash/v1/roster/2') return { members: Object.keys(names).map((id) => ({ summonerId: +id })) }
      if (url === '/lol-clash/v1/roster/2/stats') return { periodStats: [] }
      if (url.startsWith('/lol-summoner/v2/summoners')) return Object.entries(names).map(([id, gameName]) => ({ summonerId: +id, puuid: 'p' + 'abcde'[id - 101], gameName }))
      if (url.startsWith('/lol-ranked/v2/tiers')) return Object.keys(names).map((id) => ({ summonerId: +id, achievedTiers: [{ queueType: 'RANKED_SOLO_5x5', tier: 'DIAMOND', division: 2 }] }))
      if (url.startsWith('/lol-clash/v1/scouting/champions')) return [{ playerId: 102, topMasteries: [], topSeasonChampions: [{ championId: 222, gameCount: 9, winCount: 5 }] }, { playerId: 101, topMasteries: [], topSeasonChampions: [{ championId: 145, gameCount: 20, winCount: 15 }] }]
      const m = url.match(/champion-mastery\/v1\/(p[a-e])\//); if (m) return masteries[m[1]]
      return undefined
    }
    window.DataStore.set('draftsage/source', { mode: 'lolalytics' })
  })
  await page.evaluate(() => window.__start())
  await page.waitForSelector('.ecp-fab', { timeout: 15000 })
  await page.waitForTimeout(500)
  ok((await page.$$('.ecc')).length === 0, 'sin modal de scouting no se inserta nada')

  await page.evaluate((html) => { const d = document.createElement('div'); d.id = 'dom-host'; d.insertAdjacentHTML('beforeend', html); document.body.append(d) }, dom)
  await page.waitForSelector('.ecc [data-ban]', { timeout: 15000 })
  const bans = await page.$$eval('.ecc [data-ban]', (a) => a.map((e) => ({ id: +e.dataset.ban, rel: e.dataset.rel, tags: [...e.querySelectorAll('.ecc-ch span')].map((s) => s.textContent), tip: e.title })))
  ok(bans.length >= 3 && bans[0].id === 145, 'el one-trick de Kai\'Sa encabeza los bans (' + bans.map((b) => b.id) + ')')
  ok(bans[0].tags.includes('One-trick'), 'chip «One-trick» en la primera recomendación: ' + JSON.stringify(bans[0].tags))
  ok(bans[0].tip.includes('20 partidas de temporada') && bans[0].tip.includes('Alfa'), 'el tooltip da la evidencia por jugador')
  ok((await page.$$('.ecc [data-player]')).length === 5, 'ficha de los 5 jugadores')
  ok((await page.textContent('.ecc .ecc-head b')).includes('RIV'), 'la cabecera dice contra quién son (tag del modal)')
  ok(await page.$eval('.ecc', (e) => e.parentElement === document.body && getComputedStyle(e).position === 'fixed'), 'bloque fijo colgado de <body> (no depende del DOM del modal)')
  const r = await page.$eval('.ecc', (e) => { const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom } })
  const mr = await page.$eval('.tournament-scouting', (e) => { const b = e.getBoundingClientRect(); return { r: b.right } })
  ok(r.l >= mr.r && r.r <= 1280 && r.t >= 0, 'va a la derecha del modal y dentro de la ventana: ' + JSON.stringify(r))
  ok(await page.$eval('.ecc', (e) => { const b = e.getBoundingClientRect(); return document.elementFromPoint(b.left + 20, b.top + 20)?.closest('.ecc') === e }), 'el bloque recibe el clic (nada lo cubre)')
  ok(!(await page.textContent('.ecc')).includes('undefined'), 'ningún texto «undefined»')
  await page.screenshot({ path: shots + '/clash-bans.png' })

  await page.click('[data-ecc=fold]')
  ok(await page.$eval('.ecc', (e) => e.classList.contains('ecc-fold')) && !(await page.isVisible('.ecc [data-ban]')), 'el botón pliega el bloque')
  await page.click('[data-ecc=fold]')
  ok(await page.isVisible('.ecc [data-ban]'), 'y lo vuelve a desplegar')

  const st = await page.evaluate(() => window.draftsage.clashState())
  ok(st.status === 'ready' && st.jugadores === 5 && !JSON.stringify(st).includes('Alfa'), 'draftsage.clashState() resume sin nombres: ' + JSON.stringify(st))
  ok(!logs.some((l) => /Alfa|Beta|puuid|RIV/.test(l)), 'los logs no contienen nombres ni ids de jugadores')

  // Mi propio roster: no se recomienda nada
  await page.evaluate(() => { document.querySelector('.clash-roster-details-team-tag').textContent = 'YO' })
  await page.waitForFunction(() => !document.querySelector('.ecc'), null, { timeout: 8000 })
  ok(true, 'con mi propio equipo el bloque desaparece')
  // Equipo desconocido: mensaje de error legible
  await page.evaluate(() => { document.querySelector('.clash-roster-details-team-tag').textContent = 'NOPE' })
  await page.waitForSelector('.ecc [data-ecc=error]', { timeout: 8000 })
  ok((await page.textContent('.ecc [data-ecc=error]')).includes('bracket'), 'tag desconocido: mensaje «no está en tu bracket»')
  // Cerrar el modal
  await page.evaluate(() => document.getElementById('dom-host').remove())
  await page.waitForFunction(() => !document.querySelector('.ecc'), null, { timeout: 8000 })
  ok(true, 'al cerrar el modal el bloque se quita')
} catch (e) { fail++; console.log('EXCEPCIÓN:', e.message); await page.screenshot({ path: shots + '/clash-fail.png' }).catch(() => {}) }
console.log('--- logs del plugin ---'); logs.slice(-10).forEach((l) => console.log(l.slice(0, 200)))
console.log('errores de página:', errors.length ? errors.join(' | ') : 'ninguno')
if (errors.length) fail++
console.log(`pass ${pass} / fail ${fail}`)
await browser.close(); srv.kill()
process.exit(fail ? 1 : 0)
})()
