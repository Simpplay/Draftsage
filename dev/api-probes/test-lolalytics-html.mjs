// Sonda de Lolalytics: descarga la página de build (o matchup), extrae el estado Qwik y comprueba el esquema.
// Uso:  node dev/api-probes/test-lolalytics-html.mjs <slug> <lane> <tier> [rival]
//       node dev/api-probes/test-lolalytics-html.mjs ezreal bottom emerald_plus jinx
// Sin credenciales ni dependencias. Documentación: docs/lolalytics.md. NO se distribuye (dev/).

const LANES = ['top', 'jungle', 'middle', 'bottom', 'support'];

// --- decodificador (copia de docs/lolalytics.md §5) -------------------------------------------
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

export function findRoot(state, key = 'skillEarly') {
  const i = state.objs.findIndex((o) => o && typeof o === 'object' && !Array.isArray(o) && key in o);
  return i < 0 ? null : i;
}

// --- validación del esquema (docs/lolalytics.md §6 y §8). Devuelve la lista de problemas ----------
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isRow = (r, len) => Array.isArray(r) && r.length >= len;

export function validateRoot(root, { vs = false } = {}) {
  const p = [];
  const need = (cond, msg) => { if (!cond) p.push(msg); };
  need(root && typeof root === 'object', 'raíz ausente');
  if (p.length) return p;
  const h = root.header || {};
  need(isNum(h.cid) && typeof h.patch === 'string' && typeof h.lane === 'string', 'header: cid/patch/lane');
  need(h.queue === 420, `header.queue = ${h.queue} (se esperaba 420)`);
  if (vs) need(isNum(h.vs) && isNum(h.vsWinRate), 'header: vs/vsWinRate (matchup)');
  for (const which of ['pick', 'win']) {
    const s = root.summary && root.summary[which];
    need(!!s, `summary.${which} ausente`);
    if (!s) continue;
    const set = s.runes && s.runes.set;
    need(set && set.pri?.length === 4 && set.sec?.length === 2 && set.mod?.length === 3, `summary.${which}.runes.set (4/2/3)`);
    need(set && [...(set.pri || []), ...(set.sec || []), ...(set.mod || [])].every(isNum), `summary.${which}.runes.set: ids no numéricos`);
    need(s.sums && s.sums.ids?.length === 2 && s.sums.ids.every(isNum), `summary.${which}.sums.ids`);
    need(s.items && isNum(s.items.item1?.id), `summary.${which}.items.item1`);
  }
  for (const k of ['spells', 'startSet', 'boots', 'item1', 'skillOrder']) need(Array.isArray(root[k]) && root[k].length > 0, `${k}: no es un array con filas`);
  need(isRow(root.spells?.[0], 4) && typeof root.spells[0][0] === 'string' && /^\d+_\d+$/.test(root.spells[0][0]), 'spells[0] = ["a_b", wr, pr, n]');
  need(isRow(root.item1?.[0], 4) && isNum(root.item1[0][0]), 'item1[0] = [id, wr, pr, n, …]');
  need(root.runes && root.runes.stats && typeof root.runes.stats === 'object', 'runes.stats');
  if (!vs) {
    for (const lane of LANES) need(Array.isArray(root.enemy?.[lane]), `enemy.${lane}`);
    need(isRow(root.enemy?.bottom?.[0], 6) && root.enemy.bottom.slice(0, 20).every((r) => isNum(r[0]) && isNum(r[5])), 'enemy.bottom[i] = [cid, wr, d1, d2, pr, n]');
  }
  return p;
}

// --- ejecución --------------------------------------------------------------------------------
function buildUrl(slug, lane, tier, rival) {
  const base = `https://lolalytics.com/es/lol/${slug}/${rival ? `vs/${rival}/` : ''}build/`;
  return `${base}?tier=${encodeURIComponent(tier)}&lane=${encodeURIComponent(lane)}`;
}

async function main() {
  const [slug, lane, tier = 'emerald_plus', rival] = process.argv.slice(2);
  if (!slug || !LANES.includes(lane)) {
    console.error('Uso: node dev/api-probes/test-lolalytics-html.mjs <slug> <top|jungle|middle|bottom|support> [tier] [rival]');
    process.exit(2);
  }
  const url = buildUrl(slug, lane, tier, rival);
  console.log('GET', url);
  const t0 = Date.now();
  const res = await fetch(url, { headers: { accept: 'text/html', 'accept-language': 'es-ES,es;q=0.9' }, signal: AbortSignal.timeout(15000) });
  const html = await res.text();
  console.log(`HTTP ${res.status} en ${Date.now() - t0} ms · ${(html.length / 1024).toFixed(0)} KB · content-type=${res.headers.get('content-type')} · server=${res.headers.get('server')} · cf-ray=${res.headers.get('cf-ray') ? 'sí' : 'no'}`);
  if (!res.ok) console.log('⚠ respuesta no OK (¿reto de Cloudflare?). Primeros 200 caracteres:', html.slice(0, 200).replace(/\s+/g, ' '));

  let state;
  try { state = parseQwikState(html); } catch (e) { console.log('✗ no se encontró <script type="qwik/json">:', e.message); process.exit(1); }
  console.log(`✓ estado Qwik: ${state.objs.length} objetos, ${(JSON.stringify(state.objs).length / 1024).toFixed(0)} KB`);

  const idx = findRoot(state);
  if (idx === null) { console.log('✗ no hay objeto raíz con la clave skillEarly'); process.exit(1); }
  const root = makeResolver(state).at(idx);
  console.log('✓ raíz en objs[' + idx.toString(36) + '] con', Object.keys(root).length, 'claves');

  const problems = validateRoot(root, { vs: Boolean(rival) });
  if (problems.length) { console.log('✗ esquema con problemas:'); problems.forEach((x) => console.log('   -', x)); } else console.log('✓ esquema válido');

  const h = root.header, pick = root.summary?.pick;
  console.log('header:', JSON.stringify({ cid: h.cid, lane: h.lane, patch: h.patch, queue: h.queue, n: h.n, wr: h.wr, tier: h.tier, vs: h.vs, vsLane: h.vsLane, vsWinRate: h.vsWinRate, delta1: h.delta1, delta2: h.delta2 }));
  if (pick) {
    console.log('runas (pick):', JSON.stringify(pick.runes.set), `wr ${pick.runes.wr} n ${pick.runes.n}`);
    console.log('hechizos (pick):', JSON.stringify(pick.sums));
    console.log('ítems (pick):', JSON.stringify({ start: pick.items.start?.setUnique, item1: pick.items.item1?.id, item2: pick.items.item2?.id, item3: pick.items.item3?.id }));
  }
  console.log('habilidades:', JSON.stringify(root.skillOrder?.[0]), JSON.stringify(root.skill15?.[0]));
  if (root.enemy) console.log('counters (3 primeros de', lane + '):', JSON.stringify(root.enemy[lane]?.slice(0, 3)));
  const rs = root.runes?.stats;
  if (rs && pick) {
    const key = pick.runes.set.sec[0];
    console.log(`runes.stats[${key}] (¿[como primaria, como secundaria]?):`, JSON.stringify(rs[key]));
  }
  process.exit(problems.length ? 1 : 0);
}

// Solo ejecuta main() cuando se lanza el script directamente (permite importarlo en pruebas).
if (process.argv[1]?.endsWith('test-lolalytics-html.mjs')) {
  main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
}
