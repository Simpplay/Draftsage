/* Draftsage — sondeo de Clash para DevTools del cliente (Pengu). SOLO LECTURA (todo son GET).
 * Uso: abre DevTools del cliente, pestaña Console, pega TODO este archivo y pulsa Enter.
 *   - Entra antes en Clash > pestaña Bracket (con scouting abierto si puedes).
 *   - Opciones:  DS_PROBE.run({ roster: '4838509' })   // roster concreto a analizar (por defecto: el rival que halle en el bracket)
 *   - Draft real de Clash:  DS_PROBE.watch(300)        // vigila 300 s y resume la secuencia de bans/picks
 *   - Instantánea puntual:  DS_PROBE.session()
 * El INFORME (DS_PROBE.report) solo contiene la FORMA de las respuestas: tipos, claves y valores cortos
 * en MAYÚSCULAS (FILL, DIAMOND…); nombres, puuids e ids largos salen enmascarados. Se copia al portapapeles.
 * Los datos crudos quedan solo en memoria (DS_PROBE.raw); no se envían a ningún sitio. No imprime tokens.
 */
(function () {
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
  var raw = {}
  var report = { at: new Date().toISOString(), ua: navigator.userAgent.replace(/\s+/g, ' ').slice(0, 120), steps: {} }

  function shape(v, d) {
    d = d || 0
    if (v === null) return 'null'
    if (Array.isArray(v)) {
      var item = null
      if (v.length) {
        if (typeof v[0] === 'object' && v[0] !== null && !Array.isArray(v[0])) {
          item = {}
          v.slice(0, 5).forEach(function (x) { Object.keys(x || {}).forEach(function (k) { if (!(k in item)) item[k] = shape(x[k], d + 1) }) })
        } else item = shape(v[0], d + 1)
      }
      return { _array: v.length, _item: item }
    }
    switch (typeof v) {
      case 'object':
        if (d > 7) return '{…}'
        var o = {}
        Object.keys(v).forEach(function (k) { o[k] = shape(v[k], d + 1) })
        return o
      case 'string':
        if (UUID.test(v)) return '<uuid>'
        if (v === '' || /^[A-Z0-9_+]{1,24}$/.test(v)) return v
        return '<str ' + v.length + '>'
      case 'number': return Math.abs(v) < 1000 ? v : '<num>'
      default: return v
    }
  }

  async function get(path) {
    var t0 = performance.now()
    try {
      var r = await fetch(path, { method: 'GET' })
      var txt = await r.text()
      var json = null
      try { json = JSON.parse(txt) } catch (e) { /* no JSON */ }
      return { path: path, status: r.status, ms: Math.round(performance.now() - t0), bytes: txt.length, json: json }
    } catch (e) {
      return { path: path, status: 0, ms: Math.round(performance.now() - t0), err: String(e && e.message || e).slice(0, 80), json: null }
    }
  }
  var cleanPath = function (p) { return p.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/gi, '<uuid>').replace(/\/\d{6,}/g, '/<id>').replace(/=\[[^\]]*\]/g, '=[…]') }
  function rec(step, res, extra) {
    var e = { path: cleanPath(res.path), status: res.status, ms: res.ms, bytes: res.bytes }
    if (res.err) e.err = res.err
    if (res.json !== null && res.status === 200) e.shape = shape(res.json)
    if (extra) Object.keys(extra).forEach(function (k) { e[k] = extra[k] })
    ;(report.steps[step] = report.steps[step] || []).push(e)
    raw[step] = raw[step] || []
    raw[step].push(res)
    return res
  }
  var enc = function (a) { return encodeURIComponent(JSON.stringify(a)) }

  function findParents(obj, id, out, depth) {
    depth = depth || 0
    if (!obj || typeof obj !== 'object' || depth > 12) return out
    var hit = Object.keys(obj).some(function (k) { return String(obj[k]) === String(id) && typeof obj[k] !== 'object' })
    if (hit) out.push(obj)
    Object.keys(obj).forEach(function (k) { findParents(obj[k], id, out, depth + 1) })
    return out
  }
  function collectRosterIds(obj, out, depth) {
    depth = depth || 0
    if (!obj || typeof obj !== 'object' || depth > 12) return out
    Object.keys(obj).forEach(function (k) {
      if (/roster/i.test(k) && typeof obj[k] !== 'object' && obj[k]) out[String(obj[k])] = true
      else collectRosterIds(obj[k], out, depth + 1)
    })
    return out
  }

  // ---- 0. descubrimiento de endpoints -----------------------------------------------------------
  async function discover() {
    var h = rec('0_help', await get('/help'))
    var names = []
    if (h.json) names = Array.isArray(h.json) ? h.json : Object.keys(h.json.functions || h.json)
    var rx = /clash|matchhistory|match-history|championmastery|ranked|summoner|gameflow|champselect|champ-select/i
    var hit = names.filter(function (n) { return rx.test(n) })
    report.helpNames = {
      total: names.length,
      clash: hit.filter(function (n) { return /clash/i.test(n) }),
      matchHistory: hit.filter(function (n) { return /matchhistory/i.test(n) }),
      mastery: hit.filter(function (n) { return /mastery/i.test(n) }),
      ranked: hit.filter(function (n) { return /ranked/i.test(n) }).slice(0, 40)
    }
    var full = rec('0_help', await get('/help?format=Full'))
    if (full.json && typeof full.json === 'object') {
      var s = JSON.stringify(full.json)
      report.helpFullHasUrls = /\/lol-clash\/v1/.test(s)
      // si trae rutas, las extraemos (solo las de clash y las de historial/maestría)
      var urls = {}
      ;(s.match(/\/lol-(clash|match-history|champion-mastery)\/[A-Za-z0-9_\/{}\-]*/g) || []).forEach(function (u) { urls[u] = true })
      report.helpUrls = Object.keys(urls).slice(0, 120)
    }
    rec('0_help', await get('/swagger/v3/openapi.json'))
  }

  // ---- 1. Clash: resumen, bracket y rival -------------------------------------------------------
  async function clashBasics() {
    var ts = rec('1_clash', await get('/lol-clash/v1/tournament-summary'))
    var s = ts.json && ts.json[0]
    var rid = s && s.rosterId, bid = s && s.bracketId, tid = s && s.tournamentId
    raw.ids = { rid: rid, bid: bid, tid: tid }
    var extra = ['/lol-clash/v1/playmode-restricted', '/lol-clash/v1/tournament-state', '/lol-clash/v1/enabled', '/lol-clash/v1/time',
      '/lol-clash/v1/tournaments', '/lol-clash/v1/tournament/' + tid, '/lol-clash/v1/tournament/' + tid + '/bracket',
      '/lol-clash/v1/roster/' + rid, '/lol-clash/v1/bracket/' + bid, '/lol-clash/v1/ready-check', '/lol-clash/v1/scouting/matchhistory']
    for (var i = 0; i < extra.length; i++) { rec('1_clash', await get(extra[i])); await sleep(150) }
    // ¿qué roster es mi rival? buscamos mi rosterId dentro del bracket y miramos a sus vecinos
    var br = raw['1_clash'].filter(function (x) { return /\/bracket\/\d+$/.test(x.path) && x.json })[0]
    var opp = []
    if (br && rid) {
      var parents = findParents(br.json, rid, [])
      report.bracketParents = parents.slice(0, 4).map(function (p) { return shape(p) })
      parents.forEach(function (p) { Object.keys(collectRosterIds(p, {})).forEach(function (id) { if (id !== String(rid)) opp.push(id) }) })
      report.bracketRosterIdCount = Object.keys(collectRosterIds(br.json, {})).length
      raw.allRosterIds = Object.keys(collectRosterIds(br.json, {}))
    }
    raw.opponentCandidates = opp
    report.opponentFoundInBracket = opp.length
    return { rid: rid, opp: opp }
  }

  // ---- 2. Análisis de un roster ------------------------------------------------------------------
  async function scoutRoster(label, rid, deep) {
    var step = '2_' + label
    var ro = rec(step, await get('/lol-clash/v1/roster/' + rid))
    var members = (ro.json && ro.json.members) || []
    var ids = members.map(function (m) { return m.summonerId })
    if (!ids.length) return
    var sm = rec(step, await get('/lol-summoner/v2/summoners?ids=' + JSON.stringify(ids)))
    var puuids = (sm.json || []).map(function (x) { return x.puuid }).filter(Boolean)
    raw[step + '_puuids'] = puuids
    var tiers = rec(step, await get('/lol-ranked/v2/tiers?summonerIds=' + JSON.stringify(ids) + '&queueTypes=' + enc(['RANKED_SOLO_5x5', 'RANKED_FLEX_SR'])))
    var sc = rec(step, await get('/lol-clash/v1/scouting/champions?puuids=' + enc(puuids)))
    if (sc.json) {
      report[step + '_scouting'] = {
        playersReturned: sc.json.length,
        sameOrderAsPuuids: ids.join() === sc.json.map(function (x) { return x.playerId }).join(),
        seasonGames: sc.json.map(function (p) { return (p.topSeasonChampions || []).map(function (c) { return c.gameCount }) })
      }
    }
    if (!deep) return
    // historial de scouting: no sabemos los parámetros → probamos variantes
    var cands = [
      '/lol-clash/v1/scouting/matchhistory?puuids=' + enc(puuids),
      '/lol-clash/v1/scouting/matchhistory?puuid=' + puuids[0],
      '/lol-clash/v1/scouting/matchhistory?summonerIds=' + JSON.stringify(ids),
      '/lol-clash/v1/scouting/matchhistory?rosterId=' + rid,
      '/lol-clash/v1/scouting/matchhistory/' + rid,
      '/lol-clash/v1/roster/' + rid + '/matchhistory'
    ]
    for (var i = 0; i < cands.length; i++) { rec(step + '_history', await get(cands[i])); await sleep(150) }
    // rango actual vs «achievedTiers» (primer jugador)
    var rs = rec(step, await get('/lol-ranked/v1/ranked-stats/' + puuids[0]))
    var solo = rs.json && rs.json.queueMap && rs.json.queueMap.RANKED_SOLO_5x5
    var ach = tiers.json && tiers.json.filter(function (t) { return t.summonerId === ids[sm.json.findIndex(function (x) { return x.puuid === puuids[0] })] })[0]
    var achSolo = ach && ach.achievedTiers.filter(function (a) { return a.queueType === 'RANKED_SOLO_5x5' })[0]
    report[step + '_rankCompare'] = { current: solo ? [solo.tier, solo.division] : null, achievedTiers: achSolo ? [achSolo.tier, achSolo.division] : null,
      note: 'si difieren, achievedTiers no es el rango actual' }
    // maestría y partidas por puuid (solo el primer jugador, 20 partidas)
    var mast = ['/lol-champion-mastery/v1/' + puuids[0] + '/champion-mastery', '/lol-champion-mastery/v1/' + puuids[0] + '/champion-mastery-score',
      '/lol-champion-mastery/v1/' + puuids[0] + '/top?limit=5']
    for (var j = 0; j < mast.length; j++) { rec(step + '_mastery', await get(mast[j])); await sleep(150) }
    var mh = rec(step + '_matches', await get('/lol-match-history/v1/products/lol/' + puuids[0] + '/matches?begIndex=0&endIndex=20'))
    var games = mh.json && mh.json.games && mh.json.games.games
    if (games) {
      var qs = {}
      games.forEach(function (g) { qs[g.queueId] = (qs[g.queueId] || 0) + 1 })
      var p0 = games[0] && games[0].participants && games[0].participants[0]
      report[step + '_matchSummary'] = { games: games.length, queues: qs, hasLane: !!(p0 && p0.timeline && p0.timeline.lane), hasRole: !!(p0 && p0.timeline && p0.timeline.role), hasKda: !!(p0 && p0.stats) }
    }
    var mh2 = rec(step + '_matches', await get('/lol-match-history/v1/products/lol/current-summoner/matches?begIndex=0&endIndex=1'))
    return mh2
  }

  // ---- 3. Draft real: forma de la sesión (bans, acciones, equipo rival) ----------------------------
  function sessionSummary(sj) {
    if (!sj) return null
    var acts = []
    ;(sj.actions || []).forEach(function (grp) { grp.forEach(function (a) { acts.push({ t: a.type, ally: a.isAllyAction, done: a.completed, now: a.isInProgress }) }) })
    var seq = acts.map(function (a) { return (a.t === 'ban' ? 'B' : a.t === 'pick' ? 'P' : '?') + (a.ally ? 'a' : 'e') + (a.done ? '✓' : a.now ? '…' : '') }).join(' ')
    var their = sj.theirTeam || []
    return {
      timerPhase: sj.timer && sj.timer.phase,
      isCustomGame: sj.isCustomGame, benchEnabled: sj.benchEnabled,
      banSlotsAlly: acts.filter(function (a) { return a.t === 'ban' && a.ally }).length,
      banSlotsEnemy: acts.filter(function (a) { return a.t === 'ban' && !a.ally }).length,
      sequence: seq,
      myTeamSide: sj.myTeam && sj.myTeam[0] && sj.myTeam[0].team,
      theirTeamHasSummonerId: their.some(function (p) { return p.summonerId > 0 }),
      theirTeamHasPuuid: their.some(function (p) { return !!p.puuid && !/^0+$/.test(p.puuid) }),
      theirTeamKeys: their[0] ? Object.keys(their[0]) : [],
      bans: sj.bans ? { keys: Object.keys(sj.bans), my: (sj.bans.myTeamBans || []).length, their: (sj.bans.theirTeamBans || []).length } : null
    }
  }
  async function session() {
    var out = {}
    out.phase = rec('3_session', await get('/lol-gameflow/v1/gameflow-phase')).json
    var cs = rec('3_session', await get('/lol-champ-select/v1/session'))
    out.summary = sessionSummary(cs.json)
    var gf = rec('3_session', await get('/lol-gameflow/v1/session'))
    out.queue = gf.json && gf.json.gameData && gf.json.gameData.queue && { id: gf.json.gameData.queue.id, type: gf.json.gameData.queue.type, gameMode: gf.json.gameData.queue.gameMode, isRanked: gf.json.gameData.queue.isRanked }
    out.teamTwoVisible = !!(gf.json && gf.json.gameData && gf.json.gameData.teamTwo && gf.json.gameData.teamTwo.length)
    rec('3_session', await get('/lol-clash/v1/tournament-summary'))
    report.sessionSnapshot = out
    return out
  }
  async function watch(seconds) {
    seconds = seconds || 300
    var seen = {}, end = Date.now() + seconds * 1000, n = 0
    report.watch = []
    console.log('[probe] vigilando ' + seconds + ' s: entra al draft de Clash (y/o a una ranked normal para comparar)…')
    while (Date.now() < end) {
      var cs = await get('/lol-champ-select/v1/session')
      if (cs.status === 200 && cs.json) {
        var sm = sessionSummary(cs.json)
        var key = sm.timerPhase + '|' + sm.sequence
        if (!seen[key] && n < 40) {
          seen[key] = 1; n++
          var extra
          if (n === 1) { // una vez: reglas de baneo de la cola y si el LCU expone al equipo rival
            var gf = await get('/lol-gameflow/v1/session')
            var gd = gf.json && gf.json.gameData
            extra = gd && { queueId: gd.queue && gd.queue.id, gameMode: gd.queue && gd.queue.gameMode, isCustomGame: gd.isCustomGame, gameTypeConfig: gd.queue && gd.queue.gameTypeConfig && shape(gd.queue.gameTypeConfig), teamTwoLen: (gd.teamTwo || []).length }
          }
          report.watch.push({ t: Math.round((end - Date.now()) / 1000), summary: sm, shape: n === 1 ? shape(cs.json) : undefined, gameflow: extra })
        }
      }
      await sleep(1200)
    }
    console.log('[probe] fin del vigilante: ' + n + ' cambios. Ejecuta DS_PROBE.finish() para copiar el informe.')
    return report.watch
  }

  // ---- 4. DOM del modal de scouting y del bracket --------------------------------------------------
  function dom() {
    var o = {}
    var modal = document.querySelector('.tournament-scouting')
    o.scoutingModalPresent = !!modal
    if (modal) {
      o.members = modal.querySelectorAll('.util-tournament-scouting-member').length
      o.tabs = Array.prototype.map.call(modal.querySelectorAll('.tournament-scouting-nav-button .clash-generic-button-state.up .clash-generic-button-text'), function (e) { return e.textContent.trim() })
      var tag = modal.querySelector('.clash-roster-details-team-tag'), nm = modal.querySelector('.clash-roster-details-team-name')
      raw.modalTag = tag && tag.textContent.trim()
      raw.modalName = nm && nm.textContent.trim()
      // atributos que podrían llevar ids
      var attrs = {}
      Array.prototype.forEach.call(modal.querySelectorAll('*'), function (el) {
        Array.prototype.forEach.call(el.attributes, function (a) { if (/roster|puuid|summoner|team-id|data-id/i.test(a.name)) attrs[a.name] = (attrs[a.name] || 0) + 1 })
      })
      o.modalIdAttributes = attrs
      var pick = modal.querySelector('.clash-roster-details-pick-side-image')
      o.pickSideImage = pick && /pick-(\w+)\.svg/.exec(pick.getAttribute('src') || '') && /pick-(\w+)\.svg/.exec(pick.getAttribute('src'))[1]
    }
    var nodes = document.querySelectorAll('[roster-id]')
    var tags = {}, dup = false
    var map = {}
    Array.prototype.forEach.call(nodes, function (n) {
      var t = (n.querySelector('.tag') || {}).textContent
      t = t && t.trim().toLowerCase()
      if (!t) return
      if (map[t] && map[t] !== n.getAttribute('roster-id')) dup = true
      map[t] = n.getAttribute('roster-id'); tags[t] = 1
    })
    raw.tagToRoster = map
    o.bracketRosterNodes = nodes.length
    o.duplicateTagsWithDifferentRosters = dup
    o.modalTagResolvable = !!(raw.modalTag && map[String(raw.modalTag).toLowerCase()])
    o.modalTeamResolvedToRoster = o.modalTagResolvable ? '<resuelto>' : null
    report.dom = o
    return o
  }

  function finish() {
    var txt = JSON.stringify(report, null, 1)
    try { copy(txt); console.log('[probe] informe copiado al portapapeles (' + txt.length + ' caracteres). Pégalo en el chat.') } catch (e) { console.log(txt) }
    return report
  }

  async function run(opts) {
    opts = opts || {}
    console.log('[probe] 0/4 descubrimiento…'); await discover()
    console.log('[probe] 1/4 Clash y bracket…'); var b = await clashBasics()
    console.log('[probe] 2/4 DOM del modal…'); dom()
    var target = opts.roster || (raw.tagToRoster && raw.modalTag && raw.tagToRoster[String(raw.modalTag).toLowerCase()]) || b.opp[0]
    report.targetChosenBy = opts.roster ? 'opts' : (target && raw.tagToRoster && raw.modalTag && raw.tagToRoster[String(raw.modalTag).toLowerCase()] === target) ? 'modal' : target ? 'bracket-vecino' : 'ninguno'
    if (target) { console.log('[probe] 3/4 rival…'); await scoutRoster('rival', target, true) } else console.log('[probe] sin rival identificable: usa DS_PROBE.run({roster:"<id>"})')
    if (b.rid) { console.log('[probe] 3b/4 mi equipo…'); await scoutRoster('mio', b.rid, false) }
    console.log('[probe] 4/4 sesión (si hay draft)…'); await session()
    return finish()
  }

  window.DS_PROBE = { run: run, watch: watch, session: session, finish: finish, dom: dom, report: report, raw: raw, get: get, shape: shape }
  console.log('[probe] listo. Ejecuta:  await DS_PROBE.run()   — y durante el draft real:  await DS_PROBE.watch(300); DS_PROBE.finish()')
})()
