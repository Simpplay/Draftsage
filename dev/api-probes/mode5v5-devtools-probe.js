/* Draftsage — sondeo del nuevo modo 5v5 con identidades visibles (DevTools del cliente, Pengu). SOLO LECTURA (todo son GET).
 * Uso: en Champion Select del modo nuevo, abre DevTools > Console, pega TODO este archivo y pulsa Enter. Ejecuta DS_MODE.run().
 * El informe (DS_MODE.report, copiado al portapapeles) solo lleva la FORMA de los datos: nombres, puuids e ids largos salen enmascarados.
 * Responde: ¿qué cola/modo es? ¿theirTeam trae puuid/summonerId/nombre? ¿hay posiciones? ¿dónde están los bans? ¿funcionan rangos, maestría
 * y scouting con los puuids rivales? Los datos crudos quedan solo en memoria (DS_MODE.raw). No imprime tokens.
 */
(function () {
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i
  var raw = {}
  var report = { at: new Date().toISOString(), steps: {} }
  var enc = function (a) { return encodeURIComponent(JSON.stringify(a)) }

  function shape(v, d) {
    d = d || 0
    if (v === null) return 'null'
    if (Array.isArray(v)) {
      var item = null
      if (v.length) {
        if (typeof v[0] === 'object' && v[0] !== null) {
          item = {}
          v.slice(0, 10).forEach(function (x) { Object.keys(x || {}).forEach(function (k) { if (!(k in item)) item[k] = shape(x[k], d + 1) }) })
        } else item = shape(v[0], d + 1)
      }
      return { _array: v.length, _item: item }
    }
    if (typeof v === 'object') {
      if (d > 6) return '{…}'
      var o = {}
      Object.keys(v).forEach(function (k) { o[k] = shape(v[k], d + 1) })
      return o
    }
    if (typeof v === 'string') {
      if (UUID.test(v)) return '<uuid>'
      return v === '' || /^[A-Z0-9_+]{1,24}$/.test(v) ? v : '<str ' + v.length + '>'
    }
    if (typeof v === 'number') return Math.abs(v) < 1000 ? v : '<num>'
    return v
  }

  async function get(path) {
    var t0 = performance.now()
    try {
      var r = await fetch(path)
      var txt = await r.text()
      var json = null
      try { json = JSON.parse(txt) } catch (e) { /* no JSON */ }
      return { status: r.status, ms: Math.round(performance.now() - t0), bytes: txt.length, json: json }
    } catch (e) { return { status: 0, ms: 0, err: String((e && e.message) || e).slice(0, 80), json: null } }
  }
  function rec(name, res, extra) {
    raw[name] = res.json
    var e = { status: res.status, ms: res.ms, bytes: res.bytes }
    if (res.err) e.err = res.err
    if (res.json !== null && res.status === 200) e.shape = shape(res.json)
    if (extra) Object.keys(extra).forEach(function (k) { e[k] = extra[k] })
    report.steps[name] = e
    return res
  }

  async function run() {
    var ph = await get('/lol-gameflow/v1/gameflow-phase'); rec('phase', ph)
    var gf = rec('gameflow', await get('/lol-gameflow/v1/session'))
    var q = gf.json && gf.json.gameData && gf.json.gameData.queue
    if (q) {
      report.queue = { id: q.id, gameMode: q.gameMode, type: q.type, category: q.category, isRanked: q.isRanked, mapId: q.mapId, teamSize: (q.maximumParticipantListSize || null), description: String(q.description || '').slice(0, 60), shortName: String(q.shortName || '').slice(0, 40) }
    }
    report.customGame = !!(gf.json && gf.json.gameData && gf.json.gameData.isCustomGame)
    if (q && q.id != null) rec('queueInfo', await get('/lol-game-queues/v1/queues/' + q.id))

    var s = rec('session', await get('/lol-champ-select/v1/session'))
    if (!s.json) { report.error = 'sin Champion Select'; return finish() }
    var j = s.json, my = j.myTeam || [], th = j.theirTeam || []
    var facts = function (t) {
      return {
        n: t.length,
        conPuuid: t.filter(function (p) { return p.puuid }).length,
        conSummonerId: t.filter(function (p) { return p.summonerId > 0 }).length,
        conNombre: t.filter(function (p) { return p.gameName || p.summonerName || p.summonerInternalName }).length,
        nameVisibilityType: t.map(function (p) { return p.nameVisibilityType || '-' }),
        posiciones: t.map(function (p) { return p.assignedPosition || '-' }),
        equipo: t.map(function (p) { return p.team }),
        obfuscated: t.map(function (p) { return p.obfuscatedPuuid ? 'y' : '-' })
      }
    }
    report.myTeam = facts(my)
    report.theirTeam = facts(th)
    report.session = {
      type: j.type || j.gameType || null, isCustomGame: j.isCustomGame, benchEnabled: j.benchEnabled, allowSkinSelection: j.allowSkinSelection,
      bansSession: { my: (j.bans && j.bans.myTeamBans || []).length, their: (j.bans && j.bans.theirTeamBans || []).length, numBans: j.bans && j.bans.numBans },
      timerPhase: j.timer && j.timer.phase, localPlayerCellId: j.localPlayerCellId,
      actionGroups: (j.actions || []).map(function (g) { return g.map(function (a) { return (a.type || '?').slice(0, 4) + (a.isAllyAction ? 'A' : 'E') + (a.completed ? '✓' : '') }).join('+') })
    }

    // ¿Funcionan los datos de jugador con los puuids rivales? (solo se pide lo que ya usa Draftsage)
    var pu = th.map(function (p) { return p.puuid }).filter(Boolean)
    var sids = th.map(function (p) { return p.summonerId }).filter(function (x) { return x > 0 })
    if (pu.length) {
      rec('rankedStats1', await get('/lol-ranked/v1/ranked-stats/' + encodeURIComponent(pu[0])))
      rec('mastery1', await get('/lol-champion-mastery/v1/' + encodeURIComponent(pu[0]) + '/champion-mastery'))
      rec('scoutingChampions', await get('/lol-clash/v1/scouting/champions?puuids=' + enc(pu)))
      rec('summoners', await get('/lol-summoner/v2/summoners-by-puuid-cached/' + encodeURIComponent(pu[0])))
      rec('matchHistory1', await get('/lol-match-history/v1/products/lol/' + encodeURIComponent(pu[0]) + '/matches?begIndex=0&endIndex=4'))
    }
    if (sids.length) rec('tiers', await get('/lol-ranked/v2/tiers?summonerIds=' + enc(sids) + '&queueTypes=' + enc(['RANKED_SOLO_5x5', 'RANKED_FLEX_SR'])))
    finish()
  }

  function finish() {
    var out = JSON.stringify(report, null, 1)
    DS_MODE.report = report
    try { if (typeof copy === 'function') copy(out) } catch (e) { /* sin portapapeles */ }
    console.log(out)
    console.log('[DS_MODE] informe copiado al portapapeles (si hay `copy`). Pégalo en la conversación.')
  }

  window.DS_MODE = { run: run, raw: raw, report: report }
  console.log('[DS_MODE] listo: ejecuta DS_MODE.run() dentro de Champion Select del modo nuevo.')
})()
