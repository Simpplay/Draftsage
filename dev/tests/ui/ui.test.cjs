// dev/tests/ui/ui.test.cjs — prueba de interfaz de extremo a extremo con Playwright (login, panel, simulación, errores).
// Carga el plugin real (index.js) en dev/tests/ui/harness.html, que simula Pengu, el LCU y la API de Coachless.
// Requisitos (solo desarrollo; el plugin no tiene dependencias):  npm i -g playwright && npx playwright install chromium
// Uso:  node dev/tests/ui/ui.test.cjs [carpeta-para-capturas]      (en Windows: definir NODE_PATH a «npm root -g»)
const path = require('node:path'), os = require('node:os')
const root = path.resolve(__dirname, '..', '..', '..')
const shots = process.argv[2] || os.tmpdir()
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
;(async () => {
let srv = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 800))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
const logs = [], errors = []
page.on('console', (m) => { if (m.text().includes('[easy-coachless]')) logs.push(m.type() + ' ' + m.text()) })
page.on('pageerror', (e) => errors.push(String(e)))
let pass = 0, fail = 0
const ok = (c, msg) => { c ? pass++ : (fail++, console.log('FALLA:', msg)); if (c) console.log('ok  ', msg) }
try {
  await page.goto('http://127.0.0.1:8765/dev/tests/ui/harness.html')
  await page.evaluate(() => window.__start())
  await page.waitForSelector('.ecp-fab', { timeout: 15000 })
  ok(true, 'el botón EC aparece tras whenReady')
  await page.waitForSelector('.ec-modal', { timeout: 5000 })
  ok((await page.textContent('.ec-title')).includes('Iniciar sesión'), 'sin sesión se pide login')
  await page.fill('input[name=email]', 'test@example.com'); await page.fill('input[name=password]', 'bad')
  await page.click('.ec-btn.ec-primary'); await page.waitForSelector('.ec-status.ec-error')
  ok(true, 'credenciales malas → error en el formulario')
  await page.fill('input[name=password]', 'good'); await page.click('.ec-btn.ec-primary')
  await page.waitForSelector('.ec-modal', { state: 'detached' })
  ok(!(await page.evaluate(() => JSON.stringify([...window.DataStore.get('easy-coachless/auth', {}) ? [window.DataStore.get('easy-coachless/auth')] : []])).then((s) => s.includes('good'))), 'la contraseña no se guarda')

  // Champion Select simulado: Kai'Sa ADC (bottom) contra Jinx
  await page.evaluate(() => {
    window.__lcu.phase = 'ChampSelect'
    const p = (cellId, championId, pos, puuid) => ({ cellId, championId, assignedPosition: pos, puuid })
    window.__lcu.session = { localPlayerCellId: 3, actions: [], myTeam: [p(0, 10, 'top', 'a'), p(1, 11, 'jungle', 'b'), p(2, 103, 'middle', 'c'), p(3, 145, 'bottom', 'd'), p(4, 412, 'utility', 'e')],
      theirTeam: [p(5, 238, 'middle'), p(6, 222, 'bottom')] }
  })
  await page.waitForSelector('.ecp .ecp-body img.ecp-ico', { timeout: 8000 })
  ok(true, 'el panel aparece en Champion Select con iconos')
  const title = await page.getAttribute('.ecp-title', 'title'); ok(title.includes("Kai'Sa") && !title.includes(' vs ') && title.includes('ADC'), 'título sin «vs» si el matchup no se aplica (cuenta gratuita): ' + title)
  ok((await page.$$('.ecp-head .ecp-por')).length === 1 && (await page.textContent('.ecp-role')) === 'ADC', 'cabecera gráfica: un retrato (sin rival) y el rol')
  const imgs = await page.$$eval('.ecp-it img', (a) => a.map((i) => i.title))
  ok(imgs.length >= 9, 'runas+fragmentos+hechizos mostrados (' + imgs.length + ')')
  ok(imgs[0].startsWith('Ritmo Letal'), 'primera runa = keystone: ' + imgs[0])
  const txt = await page.textContent('.ecp')
  ok((await page.$$('.ecp-tag.ecp-warn[title*="premium"]')).length === 1, 'cuenta gratuita: icono de aviso de matchup premium (tooltip)')
  ok(txt.length < 140, 'el panel casi no tiene texto (' + txt.length + ' caracteres): ' + txt)
  ok((await page.$$eval('.ecp-keycap', (a) => a.map((e) => e.textContent).join())) === 'D,F', 'los hechizos llevan la tecla D y F')
  ok((await page.$$eval('.ecp-it img[title^="Destello"]', (a) => a.length)) === 1, 'Destello en el panel (tecla F por defecto: el segundo hechizo)')
  ok(txt.includes('16.21') && txt.includes('Platino – Diamante'), 'pie con parche y rangos: ' + txt.slice(-60))
  const net = await page.evaluate(() => window.__net.filter((n) => n.path === 'Rune/GetKeystoneData'))
  ok(net.length === 1 && net[0].body.commonFilters.patch.patchAdditions === 0 && net[0].body.commonFilters.matchupChampionIds === null && net[0].body.commonFilters.role === 3 && net[0].body.commonFilters.leagueTiers.join() === '4,5,6' && net[0].auth, 'filtros enviados: sin rango de parches ni matchup, rol 3, rangos 4,5,6')
  await page.screenshot({ path: shots + '/panel-ready.png' })

  // rivales revelados como botones; elegir uno a mano relanza la consulta
  ok((await page.$$('.ecp-chip')).length === 2, 'los dos rivales revelados aparecen como botones')
  await page.click('.ecp-chip >> nth=0'); await page.waitForSelector('.ecp-body img.ecp-ico'); await page.waitForSelector('.ecp-chip')
  ok((await page.$$('.ecp-tag.ecp-warn[title*="premium"]')).length === 1, 'elegir un rival con cuenta gratuita sigue avisando de premium')
  // plegar, cerrar, reabrir
  await page.click('.ecp-head .ecp-x >> nth=0'); ok((await page.$('.ecp-body')) === null, 'plegar oculta el cuerpo')
  await page.click('.ecp-head .ecp-x >> nth=0'); ok((await page.$('.ecp-body')) !== null, 'desplegar lo vuelve a mostrar')
  await page.click('.ecp-head .ecp-x >> nth=1'); ok(!(await page.isVisible('.ecp')), '× oculta el panel')
  await page.click('.ecp-fab'); await page.waitForSelector('.ecp', { state: 'visible' })
  ok(await page.isVisible('.ecp') && !(await page.$('.ecp-menu, [data-ec-menu]')), 'el botón EC reabre el panel cerrado con ×')
  // arrastre
  // atajo de teclado
  await page.keyboard.press('Control+Shift+E'); await page.waitForSelector('.ec-modal')
  ok((await page.getAttribute('.ecs-plan', 'data-plan')) === 'free', 'Ctrl+Shift+E abre los ajustes (cuenta gratuita)')
  // orden: Aplicar → Runas → Destello arriba; «Más» plegado
  const order = await page.$$eval('.ec-modal [data-act=power], .ec-modal [data-target], .ec-modal [data-key], .ec-modal [data-act=more]', (a) => a.map((e) => e.dataset.act || e.dataset.target || e.dataset.key))
  ok(order.join() === 'power,own,current,d,f,more', 'lo importante primero: ' + order.join())
  ok((await page.$('[data-act=simulate]')) === null, 'simular un matchup está oculto en «Más»')
  ok((await page.textContent('.ec-modal')).length < 120, 'los ajustes casi no tienen texto (' + (await page.textContent('.ec-modal')).length + ' caracteres)')
  // ajustes en vivo: destino y tecla de Destello
  ok((await page.getAttribute('[data-key=f]', 'aria-checked')) === 'true', 'Destello en F por defecto')
  await page.click('[data-key=d]')
  ok((await page.getAttribute('[data-key=d]', 'aria-checked')) === 'true' && (await page.evaluate(() => window.DataStore.get('easy-coachless/apply').flashKey)) === 'd', 'elegir la tecla D se guarda y se marca')
  await page.click('[data-target=current]')
  ok((await page.getAttribute('[data-target=current]', 'aria-checked')) === 'true' && (await page.evaluate(() => window.DataStore.get('easy-coachless/apply').target)) === 'current', 'elegir «Activa» se guarda y se marca')
  await page.click('[data-target=own]'); await page.click('[data-key=f]')
  await page.screenshot({ path: shots + '/menu.png' })
  await page.click('[data-act=more]'); await page.click('[data-act=simulate]'); await page.waitForSelector('input[name=champion]')
  await page.fill('input[name=champion]', 'zzz'); await page.click('.ec-btn.ec-primary')
  await page.waitForFunction(() => /No encuentro/.test(document.querySelector('.ec-status')?.textContent ?? ''))
  ok(true, 'simulación: campeón desconocido → error')
  await page.fill('input[name=champion]', 'ahri'); await page.fill('input[name=role]', 'mid'); await page.fill('input[name=tier]', 'oro')
  await page.click('.ec-btn.ec-primary'); await page.waitForSelector('.ec-modal', { state: 'detached' })
  await page.waitForFunction(() => /Ahri/.test(document.querySelector('.ecp-title')?.getAttribute('title') ?? ''), null, { timeout: 8000 })
  await page.waitForSelector('.ecp-body img.ecp-ico')
  const simTxt = await page.textContent('.ecp'); ok((await page.$('.ecp-tag-sim')) !== null && simTxt.includes('Gold'), 'simulación manual mostrada (Ahri, Gold): ' + simTxt.slice(-60))
  ok((await page.$('.ecp-rivals')) === null, 'sin rivales revelados no hay fila de rivales')
  await page.screenshot({ path: shots + '/panel-sim.png' })
  await page.evaluate(() => window.easyCoachless.simulate(null))
  await page.waitForFunction(() => document.querySelector('.ecp-title')?.getAttribute('title').includes('Kai'))
  ok(true, 'quitar la simulación vuelve al Champion Select real (Kai\'Sa)')

  // 403 total → error con botón de reintento
  await page.evaluate(() => { window.__forbidAll = true; window.easyCoachless.simulate({ championId: 238, role: 2 }) })
  await page.waitForSelector('.ecp .ecp-btn'); ok(/rechaz/.test(await page.textContent('.ecp')), '403 sin remedio → mensaje corto y botón Reintentar')
  await page.evaluate(() => { window.__forbidAll = false }); await page.click('.ecp .ecp-btn'); await page.waitForSelector('.ecp-body img.ecp-ico')
  ok(true, 'Reintentar recupera la recomendación')

  // ---- Aplicar en el cliente ----
  await page.evaluate(() => { window.easyCoachless.simulate(null) })
  await page.waitForSelector('.ecp-apply .ecp-btn')
  ok((await page.$$('.ecp-apply .ecp-btn')).length === 3, 'botones Aplicar todo / Runas / Hechizos')
  await page.click('[data-apply=runes]'); await page.waitForSelector('.ec-modal')
  ok((await page.textContent('.ec-modal')).includes('Riot'), 'al aplicar por primera vez se muestra el aviso de políticas')
  ok((await page.evaluate(() => window.__writes.length)) === 0, 'sin aceptar, no se escribe nada en el cliente')
  await page.click('.ec-modal .ec-btn >> text=Cancelar'); await page.waitForSelector('.ec-modal', { state: 'detached' })
  ok((await page.evaluate(() => window.__writes.length)) === 0, 'cancelar el aviso no escribe nada')
  await page.click('[data-apply=runes]'); await page.waitForSelector('.ec-modal')
  await page.click('.ec-modal .ec-btn.ec-primary'); await page.waitForSelector('[data-apply=runes].ecp-done')
  const w1 = await page.evaluate(() => window.__writes)
  const post = w1.find((x) => x.method === 'POST')
  ok(!!post && post.body.name.startsWith('[EC] ') && post.body.selectedPerkIds.join() === '8008,9111,9104,8017,8321,8313,5005,5008,5011' && post.body.primaryStyleId === 8000 && post.body.subStyleId === 8300, 'POST de la página propia con 9 runas en orden')
  ok(await page.evaluate(() => window.__pages[0].name === 'Mi página' && window.__pages[0].selectedPerkIds.length === 9 && window.__pages[0].selectedPerkIds[0] === 1), 'la página del usuario no se modifica')
  ok((await page.$$('[data-apply=runes].ecp-done svg')).length === 1, 'el botón de runas muestra la marca ✓ tras aplicar')
  await page.click('[data-apply=spells]'); await page.waitForSelector('[data-apply=spells].ecp-done')
  const sp = (await page.evaluate(() => window.__writes)).find((x) => x.method === 'PATCH')
  ok(sp.body.spell1Id === 3 && sp.body.spell2Id === 4, 'PATCH de hechizos con Destello en F: ' + JSON.stringify(sp.body))
  await page.evaluate(() => { window.__rejectSpells = true })
  await page.keyboard.press('Control+Shift+A'); await page.waitForFunction(() => document.querySelector('.ecp-msg.ecp-err'))
  ok((await page.textContent('.ecp-msg')).includes('Rechazado'), 'Ctrl+Shift+A aplica todo y muestra el rechazo de los hechizos')
  ok((await page.evaluate(() => window.__writes.filter((x) => x.method === 'PUT' && x.url.includes('/pages/')).length)) >= 1, 'la segunda vez se actualiza la página propia (PUT) en vez de crear otra')
  await page.screenshot({ path: shots + '/panel-apply.png' })
  await page.evaluate(() => { window.__rejectSpells = false })
  ok(!(await page.evaluate(() => JSON.stringify(window.DataStore.get('easy-coachless/apply', {}))).then((s) => /token|password/i.test(s))), 'los ajustes de Aplicar no guardan credenciales')

  // simulación: las runas se pueden aplicar, los hechizos no (fuera de Champion Select)
  await page.evaluate(() => window.easyCoachless.simulate({ championId: 103, role: 2 }))
  await page.waitForFunction(() => document.querySelector('.ecp-title')?.getAttribute('title').includes('Ahri'))
  await page.waitForSelector('.ecp-apply .ecp-btn')
  ok(await page.$eval('[data-apply=spells]', (b) => b.disabled), 'en simulación el botón Hechizos está desactivado')

  // fin de Champion Select
  await page.evaluate(() => { window.easyCoachless.simulate(null); window.__lcu.phase = 'None' })
  await page.waitForFunction(() => document.querySelector('.ecp')?.style.display === 'none', null, { timeout: 8000 })
  ok(true, 'al salir de Champion Select el panel se oculta')

  // sin innerHTML en el DOM resultante: ningún script ni atributo on* inyectado
  ok((await page.$$eval('[onclick],[onerror],script[src*=evil]', (a) => a.length)) === 0, 'sin atributos on* inline')
  const leaked = logs.filter((l) => /refresh-token|Bearer|h\.ey|password|good/i.test(l))
  ok(leaked.length === 0, 'los logs no contienen tokens ni contraseña')
} catch (e) { fail++; console.log('EXCEPCIÓN', e.message.split('\n')[0]) }
console.log('--- logs del plugin ---'); logs.slice(0, 14).forEach((l) => console.log(l.slice(0, 160)))
console.log('errores de página:', errors.length ? errors : 'ninguno')
console.log(`pass ${pass} / fail ${fail}`)
await browser.close(); srv.kill()
process.exit(fail || errors.length ? 1 : 0)

})()