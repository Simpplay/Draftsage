// dev/tests/ui/native.test.cjs — Playwright: la interfaz integrada en el Champion Select del cliente (presentation/native.js).
// Mismo harness que ui.test.cjs. El DOM del cliente sale de dev/tests/fixtures/champ-select-dom.html (recorte anonimizado de una captura real de la 16.22);
// LoLalytics se simula interceptando las peticiones (como overlay.test.cjs), así que no hace falta cuenta ni red.
// Uso:  node dev/tests/ui/native.test.cjs [carpeta-para-capturas]      (NODE_PATH = «npm root -g»)
const path = require('node:path'), os = require('node:os'), fs = require('node:fs')
const { pathToFileURL } = require('node:url')
const root = path.resolve(__dirname, '..', '..', '..')
const shots = process.argv[2] || os.tmpdir()
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
;(async () => {
const fx = await import(pathToFileURL(path.join(root, 'dev/tests/fixtures/lolalytics-fixture.mjs')).href)
const dom = fs.readFileSync(path.join(root, 'dev/tests/fixtures/champ-select-dom.html'), 'utf8')
const srv = spawn('python3', ['-m', 'http.server', '8767', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 800))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, locale: 'es-ES' })
const errors = [], logs = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.text().includes('[draftsage]')) logs.push(m.type() + ' ' + m.text()) })
await page.route('https://lolalytics.com/**', (route) => {
  const url = route.request().url()
  const body = url.includes('/tierlist/') ? fx.tierlistHtml() : /\/vs\//.test(url) ? fx.buildHtml({ cid: 145, vs: { cid: 222 } }) : fx.buildHtml({ cid: 145 })
  route.fulfill({ status: 200, contentType: 'text/html', headers: { 'access-control-allow-origin': '*' }, body })
})
let pass = 0, fail = 0
const ok = (c, msg) => { c ? pass++ : (fail++, console.log('FALLA:', msg)); if (c) console.log('ok  ', msg) }
const rect = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } })
const champSelect = (on) => page.evaluate((on) => {
  if (!on) { window.__lcu.phase = 'None'; window.__lcu.session = null; return }
  window.__lcu.phase = 'ChampSelect'
  const p = (cellId, championId, pos, puuid) => ({ cellId, championId, assignedPosition: pos, puuid })
  window.__lcu.session = { localPlayerCellId: 3, actions: [], myTeam: [p(0, 10, 'top', 'a'), p(1, 11, 'jungle', 'b'), p(2, 103, 'middle', 'c'), p(3, 145, 'bottom', 'd'), p(4, 412, 'utility', 'e')], theirTeam: [p(5, 238, 'middle'), p(6, 222, 'bottom')] }
}, on)
try {
  await page.goto('http://127.0.0.1:8767/dev/tests/ui/harness.html')
  await page.evaluate(() => window.DataStore.set('draftsage/source', { mode: 'lolalytics' }))
  await page.evaluate(() => window.__start())
  await page.waitForSelector('.ecp-fab', { timeout: 15000 })
  // El DOM nativo existe desde antes de empezar la selección (el cliente deja las pantallas montadas)
  await page.evaluate((html) => { const d = document.createElement('div'); d.id = 'dom-host'; d.insertAdjacentHTML('beforeend', html); document.body.append(d) }, dom)
  await page.waitForTimeout(500)
  ok((await page.$$('.ecx')).length === 0, 'fuera de Champion Select no se inserta nada en el cliente')
  ok(await page.isVisible('.ecp-fab'), 'fuera de Champion Select sigue el botón DS flotante')

  await champSelect(true)
  await page.waitForSelector('.ecx-key[data-state=ready]', { timeout: 15000 })
  // ---- Piezas en los contenedores nativos ----
  ok(await page.$eval('.ecx-loadout', (e) => e.parentElement.classList.contains('loadouts-edit-component') && e.nextElementSibling?.classList.contains('loadoutsSpacer')),
    'barra de runas: el botón va dentro de .loadouts-edit-component, antes de .loadoutsSpacer')
  ok(await page.$eval('.ecx-picks', (e) => e.parentElement.classList.contains('champion-grid-header') && e.nextElementSibling?.classList.contains('spacer')),
    'cabecera de la cuadrícula: la tira va dentro de .champion-grid-header, antes de .spacer')
  ok(await page.$eval('.ecx-launch', (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return e.parentElement === document.body && cs.position === 'fixed' && innerWidth - r.right <= 20 && innerHeight - r.bottom <= 20 }), 'botón DS fijo abajo a la derecha de la ventana')
  ok(await page.$eval('.ecx-launch', (e) => { const r = e.getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === e }), 'el botón DS recibe el clic (nada lo cubre)')
  ok(await page.$eval('.ecp-fab', (e) => getComputedStyle(e).display === 'none'), 'con la integración, el botón DS flotante se oculta')
  ok(!(await page.isVisible('.ecp')), 'el panel flotante no aparece solo: la información está en los widgets nativos')
  const keyImg = await page.$eval('.ecx-key', (e) => ({ k: e.querySelector('img.ecx-k')?.alt, tree: !!e.querySelector('img.ecx-tree'), title: e.title }))
  ok(!!keyImg.k && keyImg.title.includes(keyImg.k) && keyImg.title.includes('Kai\'Sa'), 'la runa clave y el campeón salen en el tooltip: ' + JSON.stringify(keyImg.title))
  const picks = await page.$$eval('.ecx-pk', (a) => a.map((e) => ({ cid: +e.dataset.pick, label: e.querySelector('b').textContent, title: e.title })))
  ok(picks.length >= 3 && picks.length <= 5, 'la tira muestra de 3 a 5 picks de matchup (' + picks.map((p) => p.cid + ':' + p.label) + ')')
  ok(picks[0].cid === 15 && picks[0].label.endsWith('%'), 'el primer pick es el mejor counter (Sivir) con su % de victorias')
  ok(await page.$eval('.ecx-ib', (e) => e.title.includes('Jinx')), 'el botón de la tira explica contra quién son los picks')
  await page.screenshot({ path: shots + '/native-ready.png' })

  // ---- Popover «build» (sube desde la barra) ----
  await page.click('.ecx-key')
  await page.waitForSelector('.ecp.ecp-docked.ecp-v-build', { state: 'visible' })
  await page.waitForTimeout(300) // fin de la animación de entrada (escala): se mide la posición final
  const key = await rect('.ecx-key'), pop = await rect('.ecp')
  ok(pop.b <= key.t - 4 && pop.b >= key.t - 14, 'el popover queda justo encima del botón (hueco ' + Math.round(key.t - pop.b) + ' px)')
  ok(Math.abs(pop.l - Math.max(8, key.l)) <= 2, 'alineado a la izquierda del botón (popover ' + pop.l + ' / botón ' + key.l + ')')
  ok(await page.$('.ecp [data-apply=all]') !== null && await page.$('.ecp .ecp-it img') !== null, 'la vista build trae runas y el botón Aplicar')
  ok(await page.$('.ecp .ecp-head .ecp-x[data-act=close]') !== null && (await page.$$('.ecp .ecp-head .ecp-x')).length === 2, 'cabecera anclada: enlace web y cerrar (sin plegar ni arrastre)')
  ok(await page.$('.ecp-mu, .ecp-flt') === null, 'la vista build no repite los picks')
  ok(await page.evaluate(() => { const z = (s) => +getComputedStyle(document.querySelector(s)).zIndex; return z('.ecp') > z('.ecb-layer') }), 'el popover queda por encima de los marcadores de la cuadrícula')
  await page.screenshot({ path: shots + '/native-build.png' })
  await page.keyboard.press('Escape')
  ok(!(await page.isVisible('.ecp')), 'Esc cierra el popover')
  await page.click('.ecx-key'); await page.waitForSelector('.ecp-v-build', { state: 'visible' })
  await page.click('.ecx-key'); ok(!(await page.isVisible('.ecp')), 'clic otra vez en el botón lo cierra')
  await page.click('.ecx-key'); await page.waitForSelector('.ecp-v-build', { state: 'visible' })
  await page.mouse.click(1200, 40)
  ok(!(await page.isVisible('.ecp')), 'clic fuera lo cierra')

  // ---- Popover «picks» (baja desde la cabecera) ----
  await page.click('.ecx-ib')
  await page.waitForSelector('.ecp.ecp-v-picks', { state: 'visible' })
  const hdr = await rect('.champion-grid-header'), ib = await rect('.ecx-ib'), pp = await rect('.ecp')
  ok(pp.t >= ib.b + 4 && pp.t <= ib.b + 14, 'el popover de picks baja desde la cabecera (hueco ' + Math.round(pp.t - ib.b) + ' px)')
  ok(await page.$('.ecp .ecp-mu[data-matchup]') !== null && await page.$('.ecp [data-filters]') !== null, 'la vista picks trae el matchup y los filtros')
  ok(await page.$('.ecp [data-apply]') === null && await page.$('.ecp [data-row]') === null, 'la vista picks no trae runas ni ítems')
  ok(await page.$('.ecp [data-foes]') !== null, 'la vista picks trae los rivales (línea de cada uno)')
  // cambiar de vista con el popover abierto
  await page.click('.ecx-key'); await page.waitForSelector('.ecp-v-build', { state: 'visible' })
  ok(!(await page.$('.ecp-v-picks')), 'abrir la otra vista reemplaza la actual')
  await page.keyboard.press('Escape')

  // ---- Localizar la ficha con un clic ----
  await page.click('.ecx-pk[data-pick="15"]')
  ok(await page.$eval('.grid-champion[data-id="15"]', (e) => e.classList.contains('ecx-flash')), 'clic en un pick resalta su ficha en la cuadrícula')
  ok(await page.$eval('.grid-champion[data-id="15"]', (e) => !e.classList.contains('selected')), 'no hace clic por ti: solo resalta')
  await page.waitForTimeout(1900)
  ok(await page.$eval('.grid-champion[data-id="15"]', (e) => !e.classList.contains('ecx-flash')), 'el resalte se apaga solo')
  await page.evaluate(() => document.querySelector('.grid-champion[data-id="15"]').parentElement.remove()) // ficha fuera de la parte virtualizada
  await page.click('.ecx-pk[data-pick="15"]')
  ok(await page.$eval('.ecx-pk[data-pick="15"]', (e) => e.title.includes('buscador')), 'si la ficha no está pintada, avisa en el tooltip')

  // ---- Estadísticas sobre las fichas nativas ----
  const badges = await page.$$eval('.ecb', (a) => a.map((e) => e.dataset.cid))
  ok(badges.length >= 5 && !badges.includes('114'), 'los marcadores del overlay usan las fichas nativas y se saltan los baneados (' + badges.length + ')')
  await page.waitForSelector('.ecb[data-cid="236"]', { timeout: 5000 })
  const geo = await page.evaluate(() => { const b = document.querySelector('.ecb[data-cid="236"]').getBoundingClientRect(), t = document.querySelector('.grid-champion[data-id="236"]').getBoundingClientRect(); return { dx: b.left + b.width / 2 - (t.left + t.width / 2), dy: b.top + b.height / 2 - t.top } })
  ok(Math.abs(geo.dx) <= 12 && Math.abs(geo.dy) <= 3, 'el marcador de Lucian (236) queda sobre el borde superior de su ficha nativa (' + geo.dx.toFixed(1) + ', ' + geo.dy.toFixed(1) + ')')

  // ---- Aplicar desde el botón ⚡ ----
  ok(await page.$eval('.ecx-ap', (e) => !e.disabled), 'el botón ⚡ está activo con una recomendación lista')
  await page.click('.ecx-ap')
  await page.waitForSelector('.ec-modal', { timeout: 5000 })
  await page.click('.ec-btn.ec-primary') // aviso de políticas (primera vez)
  await page.waitForSelector('.ecx-ap.ecx-done', { timeout: 8000 })
  ok(true, 'aplicar desde la barra pide el aviso la primera vez y acaba en ✓')
  const w = await page.evaluate(() => window.__writes.map((x) => x.method + ' ' + x.url))
  ok(w.some((x) => x.includes('/lol-perks/v1/pages')) && w.some((x) => x.includes('my-selection')), 'se escriben la página de runas y los hechizos (' + w.length + ' escrituras)')

  // ---- Resiliencia: Ember reconstruye partes de la pantalla ----
  await page.evaluate(() => document.querySelector('.ecx-loadout').remove())
  await page.waitForSelector('.loadouts-edit-component > .ecx-loadout', { timeout: 4000 })
  ok(true, 'si el cliente borra el botón de la barra, se repone solo')
  await page.evaluate(() => { const c = document.querySelector('.loadouts-edit-component'); c.insertBefore(document.createElement('div'), c.firstChild) })
  await page.waitForTimeout(300)
  ok((await page.$$('.ecx-loadout')).length === 1, 'sin duplicados tras cambios en el contenedor')
  await page.evaluate(() => document.querySelector('.loadouts-edit-wrapper').remove())
  await page.waitForFunction(() => !document.querySelector('.ecx-loadout'), null, { timeout: 4000 })
  ok(await page.isVisible('.ecx-picks') && !(await page.isVisible('.ecp')), 'si falta una ancla, las demás piezas siguen (modo integrado)')
  await page.evaluate(() => { document.querySelector('.champion-grid-header').remove(); document.querySelector('.bottom-right-buttons').remove() })
  await page.waitForSelector('.ecp', { state: 'visible', timeout: 4000 })
  ok(await page.isVisible('.ecp') && await page.isVisible('.ecp-fab') && !(await page.$('.ecp-docked')), 'sin ninguna ancla reconocida vuelve el panel flotante y el botón DS')
  ok(logs.some((l) => l.includes('sin puntos de anclaje')), 'se registra un aviso con cómo diagnosticarlo (nativeProbe)')

  // ---- Fin de la selección y simulación ----
  await page.evaluate((html) => { document.getElementById('dom-host').remove(); const d = document.createElement('div'); d.id = 'dom-host'; d.insertAdjacentHTML('beforeend', html); document.body.append(d) }, dom)
  await page.waitForSelector('.ecx-key[data-state=ready]', { timeout: 8000 })
  ok(await page.$eval('.ecp-fab', (e) => getComputedStyle(e).display === 'none'), 'al reaparecer el DOM nativo vuelve la integración')
  await champSelect(false)
  await page.waitForFunction(() => !document.querySelector('.ecx'), null, { timeout: 8000 })
  ok(true, 'al terminar la selección se retiran todas las piezas del cliente')
  await page.evaluate(() => window.draftsage.simulate({ championId: 145, opponentChampionId: 222, role: 3, lobbyTier: 5 }))
  await page.waitForSelector('.ecp', { state: 'visible', timeout: 8000 })
  ok((await page.$$('.ecx')).length === 0 && !(await page.$('.ecp-docked')), 'una simulación usa el panel flotante aunque el DOM nativo esté presente')
  await page.evaluate(() => window.draftsage.simulate(null))
  const probe = await page.evaluate(() => window.draftsage.nativeProbe())
  ok(probe.fichas >= 10 && probe.loadout?.visible, 'draftsage.nativeProbe() informa de las anclas y fichas: ' + JSON.stringify(probe))

  // ---- Zoom del cliente: el popover compensa la escala ----
  await champSelect(true)
  await page.waitForSelector('.ecx-key[data-state=ready]', { timeout: 8000 })
  await page.evaluate(() => { document.documentElement.style.zoom = '0.8' })
  await page.waitForTimeout(300)
  await page.click('.ecx-key'); await page.waitForSelector('.ecp-v-build', { state: 'visible' })
  await page.waitForTimeout(250)
  const k2 = await rect('.ecx-key'), p2 = await rect('.ecp')
  ok(Math.abs((k2.t - p2.b) - 8 * 0.8) <= 3 && Math.abs(p2.l - k2.l) <= 3, 'con zoom 0.8 el popover sigue pegado al botón (hueco ' + (k2.t - p2.b).toFixed(1) + ' px, desfase x ' + (p2.l - k2.l).toFixed(1) + ')')
  await page.evaluate(() => { document.documentElement.style.zoom = '' })
} catch (e) { fail++; console.log('EXCEPCIÓN:', e.message); await page.screenshot({ path: shots + '/native-fail.png' }).catch(() => {}) }
console.log('--- logs del plugin ---'); logs.slice(-12).forEach((l) => console.log(l.slice(0, 200)))
console.log('errores de página:', errors.length ? errors.join(' | ') : 'ninguno')
if (errors.length) fail++
console.log(`pass ${pass} / fail ${fail}`)
await browser.close(); srv.kill()
process.exit(fail ? 1 : 0)
})()
