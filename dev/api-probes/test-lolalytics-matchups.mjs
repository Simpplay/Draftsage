// Sonda de counters, sinergias y lista de tier de Lolalytics (para el overlay de Champion Select).
// Uso:  node dev/api-probes/test-lolalytics-matchups.mjs <slug> <lane> [tier]
//       node dev/api-probes/test-lolalytics-matchups.mjs ezreal bottom emerald_plus
// Sin credenciales ni dependencias. Documentación: docs/lolalytics-counters-synergy.md. NO se distribuye (dev/).

const LANES = ['top', 'jungle', 'middle', 'bottom', 'support'];
const MIN_N = 200; // umbral que usa la web para «strong/weak» (header.counters)

// --- decodificador del estado Qwik (igual que test-lolalytics-html.mjs) ----------------------
export function parseQwikState(html) {
  const m = /<script type="qwik\/json">([\s\S]*?)<\/script>/.exec(html);
  if (!m) throw new Error('sin-estado-qwik');
  return JSON.parse(m[1]);
}
export function makeResolver(state) {
  const objs = state.objs, memo = new Map();
  function at(i) {
    if (memo.has(i)) return memo.get(i);
    const o = objs[i];
    if (o === null || typeof o !== 'object') { memo.set(i, o); return o; }
    const out = Array.isArray(o) ? [] : {};
    memo.set(i, out);
    const val = (v) => (typeof v === 'string' ? at(parseInt(v, 36)) : v);
    if (Array.isArray(o)) o.forEach((v) => out.push(val(v)));
    else for (const k in o) out[k] = val(o[k]);
    return out;
  }
  return { at, objs };
}
const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
export function findRoot(state, key = 'skillEarly') {
  const i = state.objs.findIndex((o) => isObj(o) && key in o);
  return i < 0 ? null : i;
}

// --- extracción ---------------------------------------------------------------------------------
/** Mapa cid → slug (objeto de objs con claves '81' y '62' y más de 100 entradas). */
export function findChampionMap(state) {
  const i = state.objs.findIndex((o) => isObj(o) && '81' in o && '62' in o && Object.keys(o).length > 100);
  if (i < 0) return null;
  const { at } = makeResolver(state);
  return at(i);
}
/** Filas de la lista de tier: todos los objetos con claves cid y row. → Map<cid, row> */
export function extractTierlist(state) {
  const { at } = makeResolver(state);
  const out = new Map();
  state.objs.forEach((o, i) => { if (isObj(o) && 'cid' in o && 'row' in o) { const r = at(i); if (r && r.row && typeof r.cid === 'number') out.set(r.cid, r.row); } });
  return out;
}
export const TIER_LETTERS = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-'];
export const tierLetter = (n) => TIER_LETTERS[n - 1] || '?';

// --- validación (devuelven la lista de problemas) -----------------------------------------------
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const validRow = (r) => Array.isArray(r) && r.length >= 6 && r.slice(0, 6).every(isNum);

function validateTable(tbl, lanes, label, gamesTotal) {
  const p = [];
  if (!isObj(tbl)) return [`${label}: no es un objeto por líneas`];
  for (const l of lanes) {
    const rows = tbl[l];
    if (!Array.isArray(rows) || !rows.length) { p.push(`${label}.${l}: vacío o ausente`); continue; }
    if (!rows.slice(0, 50).every(validRow)) p.push(`${label}.${l}: fila con forma inesperada (¿[cid,wr,d1,d2,pr,n]?)`);
    if (!rows.every((r, i) => i === 0 || rows[i - 1][5] >= r[5])) p.push(`${label}.${l}: no está ordenada por n desc`);
    if (gamesTotal) for (const r of rows.slice(0, 5)) if (Math.abs((r[5] / gamesTotal) * 100 - r[4]) > 0.6) p.push(`${label}.${l}: pr ${r[4]} no cuadra con n/total (${((r[5] / gamesTotal) * 100).toFixed(2)})`);
  }
  return p;
}
export const validateEnemy = (root, lanes = LANES) => validateTable(root.enemy, lanes, 'enemy', root.header?.n);
export function validateTeam(json, ownLane, gamesTotal) {
  const p = [];
  if (!isObj(json) || !isObj(json.team)) return ['team: ausente'];
  if (JSON.stringify(json.team_h) !== JSON.stringify(['id', 'wr', 'd1', 'd2', 'pr', 'n'])) p.push('team_h inesperado: ' + JSON.stringify(json.team_h));
  if (ownLane in json.team) p.push(`team contiene mi propia línea (${ownLane}), no se esperaba`);
  return p.concat(validateTable(json.team, LANES.filter((l) => l !== ownLane), 'team', gamesTotal));
}

// --- consultas de ayuda para el overlay ----------------------------------------------------------
export const findRow = (rows, cid) => (rows || []).find((r) => r[0] === cid) || null;
/** Ordenaciones propias equivalentes a las pestañas de la web. key: 'wr' | 'd1' | 'd2' | 'pr'. */
export function rank(rows, key, dir = 'desc', minN = MIN_N) {
  const i = { wr: 1, d1: 2, d2: 3, pr: 4 }[key];
  return rows.filter((r) => r[5] >= minN).sort((a, b) => (dir === 'desc' ? b[i] - a[i] : a[i] - b[i]));
}

// --- ejecución ----------------------------------------------------------------------------------
async function get(url, asJson) {
  const t0 = Date.now();
  const res = await fetch(url, { headers: { accept: asJson ? 'application/json' : 'text/html', 'accept-language': 'es-ES,es;q=0.9' }, signal: AbortSignal.timeout(15000) });
  const body = asJson ? await res.json().catch(() => null) : await res.text();
  console.log(`  HTTP ${res.status} en ${Date.now() - t0} ms · ${asJson ? JSON.stringify(body)?.length : body.length} bytes · ${url}`);
  return { res, body };
}

async function main() {
  const [slug, lane, tier = 'emerald_plus'] = process.argv.slice(2);
  if (!slug || !LANES.includes(lane)) { console.error('Uso: node dev/api-probes/test-lolalytics-matchups.mjs <slug> <top|jungle|middle|bottom|support> [tier]'); process.exit(2); }
  let fails = 0; const report = (name, problems) => { if (problems.length) { fails++; console.log(`✗ ${name}`); problems.forEach((x) => console.log('   -', x)); } else console.log(`✓ ${name}`); };

  console.log('1) HTML de la build (counters)');
  const { body: html } = await get(`https://lolalytics.com/es/lol/${slug}/build/?tier=${tier}&lane=${lane}`, false);
  const state = parseQwikState(html); const idx = findRoot(state);
  if (idx === null) { console.log('✗ sin raíz'); process.exit(1); }
  const root = makeResolver(state).at(idx); const h = root.header;
  console.log(`  campeón ${h.cid} · ${h.lane} · parche ${h.patch} · n=${h.n} · tier ${h.tier} · rank ${h.rank}/${h.rankTotal}`);
  report('enemy (counters por línea)', validateEnemy(root));
  const champs = findChampionMap(state);
  report('mapa cid → slug', champs && champs[h.cid] === slug ? [] : [`no hay mapa o ${h.cid} no es «${slug}»`]);
  const name = (cid) => (champs && champs[cid]) || String(cid);

  const own = root.enemy[lane] || [];
  const show = (rows) => rows.slice(0, 5).map((r) => `${name(r[0])} wr ${r[1]} d1 ${r[2]} n ${r[5]}`).join(' | ');
  console.log(`  header.counters:`, JSON.stringify({ strong: h.counters?.strong?.map(name), weak: h.counters?.weak?.map(name) }));
  console.log(`  fuertes (wr desc, n≥${MIN_N}):`, show(rank(own, 'wr')));
  console.log(`  débiles (wr asc,  n≥${MIN_N}):`, show(rank(own, 'wr', 'asc')));
  const rule = rank(own, 'wr').slice(0, 3).map((r) => r[0]);
  report('regla strong de header.counters (3 mejores wr con n≥200)', JSON.stringify(rule) === JSON.stringify(h.counters?.strong) ? [] : [`calculado ${JSON.stringify(rule)} ≠ ${JSON.stringify(h.counters?.strong)}`]);

  console.log('2) JSON build-team (sinergias)');
  const { res: r2, body: team } = await get(`https://a1.lolalytics.com/mega/?ep=build-team&v=1&patch=${h.patch}&c=${slug}&lane=${lane}&tier=${tier}&queue=ranked&region=all`, true);
  report('team (sinergias por línea)', r2.ok && team ? validateTeam(team, lane, h.n) : [`HTTP ${r2.status} o cuerpo no JSON`]);
  if (team?.team) for (const l of Object.keys(team.team)) console.log(`  ${l}: buenas`, show(rank(team.team[l], 'wr').slice(0, 3)), '· malas', show(rank(team.team[l], 'wr', 'asc').slice(0, 2)));

  console.log('3) HTML de la lista de tier');
  const { body: tl } = await get(`https://lolalytics.com/es/lol/tierlist/?lane=${lane}&tier=${tier}`, false);
  const tiers = extractTierlist(parseQwikState(tl));
  const mine = tiers.get(h.cid);
  report('lista de tier', tiers.size > 10 && mine && isNum(mine.wr) && isNum(mine.tier) ? [] : [`filas: ${tiers.size}; fila propia: ${JSON.stringify(mine)}`]);
  if (mine) console.log(`  ${slug}: ${tierLetter(mine.tier)} (#${mine.rank}/${tiers.size}) wr ${mine.wr} pr ${mine.pr} br ${mine.br} partidas ${mine.games}`);

  console.log(fails ? `\n${fails} comprobación(es) con problemas` : '\nTodo correcto');
  process.exit(fails ? 1 : 0);
}

if (process.argv[1]?.endsWith('test-lolalytics-matchups.mjs')) main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
