// dev/api-probes/test-itero-draft.mjs — sonda de iTero (POST /api/draft-picks). SIN credenciales ni cuenta.
//
// Uso:   node dev/api-probes/test-itero-draft.mjs [LINEA] [RANGO] [--write-fixture]
//        LINEA  TOP | JUNGLE | MIDDLE | BOTTOM | UTILITY   (por defecto TOP)
//        RANGO  IRON … MASTER+                              (por defecto GOLD)
// Qué hace: replica la petición del simulador con un draft fijo, valida la forma de la respuesta con el mismo código que usa el plugin
// (domain/itero.js), mide tiempo y tamaño, comprueba que un nombre mal escrito se detecta, y con --write-fixture guarda una
// fixture RECORTADA (25 candidatos con solo las cifras que lee el plugin) en dev/tests/fixtures/itero-fixture.mjs.
// Es una API privada: pocas peticiones (≈3 por ejecución), sin bucles.

import { writeFileSync } from 'node:fs'
import { buildRequest, ENDPOINT, findUnrecognized, normalizeResponse, LANES, PHASES } from '../../src/domain/itero.js'

const args = process.argv.slice(2)
const writeFixture = args.includes('--write-fixture')
const [lane = 'TOP', rankClass = 'GOLD'] = args.filter((a) => !a.startsWith('--'))
if (!LANES.includes(lane)) { console.error('Línea inválida:', lane); process.exit(1) }

// Draft fijo (el del documento): cada línea aliada/rival, menos la tuya.
const ALLIES = { TOP: 'Yorick', JUNGLE: 'Viego', MIDDLE: 'Diana', BOTTOM: 'Jinx', UTILITY: 'Bard' }
const ENEMIES = { TOP: 'Malzahar', JUNGLE: 'Shaco', MIDDLE: 'Sylas', BOTTOM: 'Lucian', UTILITY: 'Milio' }

async function post(body) {
  const t0 = Date.now()
  const res = await fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(body) })
  const text = await res.text()
  return { status: res.status, ms: Date.now() - t0, bytes: text.length, raw: res.ok ? JSON.parse(text) : null }
}

const ok = (c, msg) => console.log((c ? '  ✓ ' : '  ✗ ') + msg)
let bad = 0
const check = (c, msg) => { ok(c, msg); if (!c) bad++ }

const req = buildRequest({ lane, rankClass, side: 'Blue', allies: ALLIES, enemies: ENEMIES })
console.log(`1) Petición base (${lane}, ${rankClass}, azul)`)
const a = await post(req)
check(a.status === 200, `HTTP ${a.status} en ${a.ms} ms, ${(a.bytes / 1024 / 1024).toFixed(2)} MB`)
if (!a.raw) process.exit(1)
const n = normalizeResponse(a.raw, lane)
check(n.ok, `forma válida: ${n.ok ? n.candidates.length : '—'} candidatos de ${a.raw.length}`)
if (!n.ok) process.exit(1)
const c0 = n.candidates[0]
check(n.candidates.every((c, i, all) => i === 0 || all[i - 1].pred >= c.pred), 'ordenados de mayor a menor result_pred')
check(c0.syn && Object.keys(c0.syn).length === 4 && Object.keys(c0.ctr).length === 5, 'sinergia (4 líneas) y counter (5 líneas) por candidato')
check(PHASES.every((p) => typeof c0.scale[p] === 'number'), 'escalado early/mid/late')
check(findUnrecognized(req, n.candidates).length === 0, 'todos los nombres enviados reconocidos')
console.table(n.candidates.slice(0, 5).map((c) => ({ campeón: c.name, pred: c.pred, wr: c.champWr, sinergia: c.synAvg, counter: c.ctrAvg, línea: c.laning, partidas: c.count, uso: c.pick })))

console.log('2) Nombre mal escrito (debe detectarse)')
const badReq = buildRequest({ lane, rankClass, side: 'Blue', allies: ALLIES, enemies: { ...ENEMIES, TOP: 'malzahar' } })
const b = await post(badReq)
check(b.status === 200, `HTTP ${b.status} (no da error: lo ignora en silencio)`)
const nb = normalizeResponse(b.raw, lane)
check(nb.ok && findUnrecognized(badReq, nb.candidates).includes('malzahar'), 'findUnrecognized lo señala')

console.log('3) Draft vacío (todas las cifras cerca del 50 %)')
const e = await post(buildRequest({ lane, rankClass, side: 'Blue' }))
const ne = normalizeResponse(e.raw, lane)
check(ne.ok, `HTTP ${e.status}, ${ne.ok ? ne.candidates.length : '—'} candidatos`)
if (ne.ok) console.log('  rango de pred:', ne.candidates.at(-1).pred, '…', ne.candidates[0].pred)

if (writeFixture) {
  // 15 de cabeza + 5 del medio + 5 de cola; solo las claves que lee domain/itero.js
  const rows = a.raw.filter((_, i) => i < 15 || (i >= 80 && i < 85) || i >= a.raw.length - 5)
  const keep = (obj, test) => Object.fromEntries(Object.entries(obj ?? {}).filter(([k]) => test(k)))
  const slim = rows.map((r) => ({
    champion: r.champion, lane: r.lane, result_pred: r.result_pred, result_pred_rating: r.result_pred_rating, laning_pred_rating: r.laning_pred_rating,
    champ_count: r.champ_count, pick_perc: r.pick_perc,
    stats: {
      player: keep(r.stats?.player, (k) => /^t1_(syn|counter)_LANE_/.test(k) && k.endsWith('_wr') || ['t1_LANE_champ_wr', 't1_LANE_pred_gold', 't1_LANE_syn_avg', 't1_LANE_counter_avg'].includes(k)),
      t1: { damage: keep(r.stats?.t1?.damage, (k) => k === 't1_ad_ratio' || k === 't1_ad_ratio_without_player_var'), scaling: keep(r.stats?.t1?.scaling, (k) => /^t1_(early|mid|late)_wr_adj_diff$/.test(k)) },
    },
  }))
  const body = `// dev/tests/fixtures/itero-fixture.mjs — respuesta REAL de iTero recortada (generada con dev/api-probes/test-itero-draft.mjs --write-fixture)\n` +
    `// ${new Date().toISOString().slice(0, 10)} · ${lane} · ${rankClass} · azul · ${slim.length} de ${a.raw.length} candidatos, solo las cifras que lee domain/itero.js.\n\n` +
    `export const FIXTURE_REQUEST = ${JSON.stringify(req)}\n\nexport const FIXTURE_ROWS = ${JSON.stringify(slim, null, 1)}\n`
  writeFileSync(new URL('../tests/fixtures/itero-fixture.mjs', import.meta.url), body)
  console.log(`\nFixture escrita (${(body.length / 1024).toFixed(0)} KB, ${slim.length} candidatos).`)
}
console.log(bad ? `\n${bad} comprobación(es) fallida(s)` : '\nTodo correcto')
process.exit(bad ? 1 : 0)
