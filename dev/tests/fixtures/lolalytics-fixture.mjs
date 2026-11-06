// dev/tests/fixtures/lolalytics-fixture.mjs — páginas de Lolalytics SINTÉTICAS (no es contenido real de su web) para las pruebas.
// Codifica un objeto JS como estado Qwik (grafo `objs` con referencias en base 36) dentro de un HTML mínimo, igual que lo sirve la web.
// Lo usan las pruebas unitarias (node) y el arnés de UI (navegador). NO se distribuye (dev/).

/** Valor JS → { refs, ctx, objs, subs } con el formato de Qwik (cada elemento de arrays/objetos es una referencia base 36). */
export function encodeState(values) {
  const objs = []
  const refOf = (v) => {
    const i = objs.length
    objs.push(null)
    if (v === null || typeof v !== 'object') objs[i] = v
    else if (Array.isArray(v)) { const a = []; objs[i] = a; for (const x of v) a.push(refOf(x)) }
    else { const o = {}; objs[i] = o; for (const [k, x] of Object.entries(v)) o[k] = refOf(x) }
    return i.toString(36)
  }
  for (const v of values) refOf(v)
  return { refs: {}, ctx: {}, objs, subs: [] }
}

export const htmlOf = (values) => `<!doctype html><html><head><title>fixture</title></head><body><script type="qwik/json">${JSON.stringify(encodeState(values))}</script></body></html>`

const LANES = ['top', 'jungle', 'middle', 'bottom', 'support']
// Hechizos de Riot: 4 Destello, 21 Barrera, 14 Prender, 3 Extenuación, 7 Curar, 11 Aplastar, 12 Teletransporte, 6 Fantasma, 13 Claridad
const SPELLS = [['4_21', 52.1, 68, 25000], ['4_7', 51.5, 22, 8200], ['4_14', 49.9, 6, 2100], ['4_3', 50.2, 4, 1500], ['4_11', 51.0, 0.4, 150]]

/** Raíz de una página de build. `o`: { cid, lane, n, vs:{cid, lane, winRate}|null, keystone, enemy:{lane:[filas]} } */
export function buildRoot(o = {}) {
  const { cid = 81, lane = 'bottom', n = 37461, vs = null } = o
  const mk = (keystone, sec, sums, rn, rwr) => ({
    skillpriority: { id: 'QEW', n: rn, wr: rwr }, skillorder: { id: 132114131343322, n: rn, wr: rwr }, sums: { ids: sums, n: rn, wr: rwr },
    runes: { wr: rwr, n: rn, page: { pri: 0, sec: 4 }, set: { pri: [keystone, 8009, 9103, 8014], sec, mod: [5005, 5008, 5001] } },
    items: {
      start: { n: rn, wr: rwr, set: [1055, 2003, 2003], setUnique: [1055, 2003], count: [1, 2] },
      item1: { id: 3078, n: rn, wr: rwr }, item2: { id: 3158, n: rn, wr: rwr }, item3: { id: 3031, n: rn, wr: rwr },
      item4: [{ id: 3036, n: 900, wr: 51 }, { id: 3139, n: 700, wr: 50.5 }], item5: [{ id: 3026, n: 400, wr: 50 }], item6: [],
    },
  })
  const pick = o.pick ?? mk(8008, [8304, 8347], [4, 21], 6200, 51.3)
  const win = o.win ?? mk(8005, [8226, 8237], [4, 21], 1100, 53.9)
  const root = {
    header: { patch: '16.22', defaultLane: lane, cid, lane, queue: 420, wr: 50.6, avgWr: 50.1, avgWrDelta: 0.5, pr: 12.1, n, br: 3.1, rank: 20, rankTotal: 53, tier: 'C-',
      ...(vs ? { vs: vs.cid, vsLane: vs.lane ?? lane, defaultVsLane: vs.lane ?? lane, usualWinRate: 50.6, vsWinRate: vs.winRate ?? 52, delta1: -1.6, delta2: -0.9 } : { counters: { strong: [], weak: [] } }) },
    summary: { pick, win },
    spells: o.spells ?? SPELLS,
    startSet: [['1055_2003_2003', 50.9, 60, 20000]],
    startItem: [[1055, 50.9, 100, 33000]],
    boots: o.boots ?? [[3006, 51.0, 41, 15000, 14], [3009, 50.0, 22, 8000, 14], [3020, 49.0, 3, 900, 14]],
    item1: [[3078, 51.5, 30, 11000, 10]], item2: [[3158, 51.0, 20, 7500, 16]],
    item3: o.item3 ?? [[3031, 51.8, 24, 8800, 20], [3036, 51.0, 12, 4400, 20], [3139, 50.0, 3, 1100, 20]],
    item4: [[3036, 51.0, 20, 7000, 24]], item5: [[3026, 50.0, 18, 6000, 28]],
    popularItem: [[3031, 51.8, 40, 14000, 20], [3036, 51.0, 30, 11000, 20], [3085, 50.0, 12, 4000, 20]],
    winningItem: [[3031, 53.0, 3, 900, 20]],
    skillOrder: [['QEW', 51, 80, 29000]], skillEarly: [[[50, 80, 1000], [50, 10, 100], [50, 10, 100], [0, 0, 0]]],
  }
  if (!vs) {
    const row = (c, wr, d1, pr, nn) => [c, wr, d1, 0, pr, nn]
    root.enemy = o.enemy ?? Object.fromEntries(LANES.map((l) => [l, l === lane
      ? [row(145, 47.4, -1.9, 17, 6381), row(51, 52.0, 0.4, 14, 5200), row(236, 46.5, -3.0, 9, 3100), row(15, 45.5, -4.0, 6, 2300), row(119, 44.0, -5.0, 0.4, 150), row(222, 49.9, 0.1, 8, 3000), row(67, 51.0, 1.0, 5, 1900)]
      : [row(412, 50, 0, 10, 3500)]]))
  }
  return root
}

/** HTML de una página de build/matchup. */
export const buildHtml = (o = {}) => htmlOf([buildRoot(o), { cid: 5, noise: true }])

/** Mapa cid → slug con más de 100 entradas (la web lo trae en cada página) y las filas de la lista de tier de una línea. */
export function tierlistHtml({ lane = 'bottom', rows } = {}) {
  const row = (rank, wr, pr, br, games, tier, pctLane = 95) => ({ rank, tier, lane, defaultLane: lane, pctLane, wr, avgWrDelta: 0.5, pr, br, pbi: 0, games, topRank: 5, topWr: '55.1', topGames: 2000, topDelta: 4, topElo: 800 })
  const base = rows ?? { 81: row(20, 50.6, 14, 4.3, 38101, 12), 145: row(5, 51.8, 18, 3.0, 52000, 4), 51: row(9, 51.0, 12, 2.0, 41000, 6), 222: row(3, 52.0, 15, 5.0, 47000, 3), 236: row(15, 50.0, 8, 1.0, 29000, 9), 15: row(30, 49.0, 5, 0.5, 18000, 11), 119: row(40, 48.0, 1, 0.2, 3000, 13), 67: row(12, 51.1, 6, 0.5, 21000, 7), 412: { ...row(60, 48, 0.5, 0.1, 400, 14), pctLane: 3 } }
  // relleno: una lista real tiene decenas de campeones por línea
  for (let i = 0; i < 14; i++) base[3000 + i] = row(70 + i, 49.5, 0.5, 0.1, 5000, 10)
  const slugs = Object.fromEntries(Array.from({ length: 120 }, (_, i) => [String(i + 1000), 'champ' + i]))
  Object.assign(slugs, { 81: 'ezreal', 62: 'wukong', 145: 'kaisa', 51: 'caitlyn', 222: 'jinx', 236: 'lucian', 15: 'sivir', 119: 'draven', 67: 'vayne', 412: 'thresh', 103: 'ahri', 238: 'zed' })
  return htmlOf([slugs, ...Object.entries(base).map(([cid, r]) => ({ cid: Number(cid), row: r }))])
}
