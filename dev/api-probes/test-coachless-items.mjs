// test-coachless-items.mjs — ítems de las builds (GetRecommendedBuilds) y GetGlobalItemStatistics. Solo lecturas.
// Aclara lo que el plugin DEDUCE (docs/coachless-api.md §4.1/§4.2):
//   1) qué contiene cada `itemBlocks[].type` (0 inicial · 1 primera vuelta · 2 núcleo · 3 alternativas · 4 situacionales) y qué es `tier`;
//   2) si `firstLegendaryId`/`secondLegendaryId` condicionan el resultado de `itemSlots: [3]` (3.er ítem);
//   3) si `matchupChampionIds` cambia las estadísticas de ítems (solo premium; GetRecommendedBuilds ya se sabe que lo ignora).
// Uso: node test-coachless-items.mjs [campeónId] [rivalId]   (por defecto 145 Kai'Sa y 222 Jinx; pide email y contraseña; no imprime tokens)
import readline from 'node:readline';
const B = 'https://api.coachless.gg/api';
function ask(q, hidden = false) {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => rl.output.write(s.includes(q) ? s : '*');
    rl.question(q, (a) => { rl.close(); if (hidden) process.stdout.write('\n'); res(a); });
  });
}
const champ = Number(process.argv[2] || 145), rival = Number(process.argv[3] || 222);
const email = process.env.CL_EMAIL || (await ask('Email: '));
const pass = process.env.CL_PASS || (await ask('Contraseña (no se muestra): ', true));
const lg = await (await fetch(`${B}/Auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password: pass, rememberMe: false }) })).json();
if (lg.actionResult !== 0) { console.error('Login falló'); process.exit(1); }
const premium = JSON.parse(Buffer.from(lg.accessToken.split('.')[1], 'base64url').toString()).isSubscribed === '1';
const P = premium ? { patch: 22, add: 1 } : { patch: 21, add: 0 };
console.log(`Login OK | premium: ${premium} | parche 16.${P.patch} +${P.add} | campeón ${champ}${premium ? ' vs ' + rival : ''}\n`);
const cf = (matchup = null) => ({ patch: { major: 16, patch: P.patch, patchAdditions: P.add }, championIds: [champ],
  matchupChampionIds: premium ? matchup : null, leagueTiers: [5, 6, 7], regions: null, role: 5 });
const post = async (path, body) => {
  const r = await fetch(`${B}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + lg.accessToken }, body: JSON.stringify(body) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  await new Promise((s) => setTimeout(s, 300));
  return { status: r.status, json: j, text: t };
};
const it = (x) => `${x.itemId}${x.wpa != null ? ':' + (+x.wpa).toFixed(2) : ''}/${x.occurrence}${x.chooseOne ? ' ①' : ''}${x.highlighted ? ' ★' : ''}`;

// 1) Builds recomendadas: estructura de los bloques
const b = await post('ChampionWinprob/GetRecommendedBuilds', { commonFilters: cf() });
console.log(`== GetRecommendedBuilds → HTTP ${b.status}`);
for (const [i, x] of (b.json?.builds ?? []).entries()) {
  console.log(`build ${i}: keystone ${x.keystone} tier ${x.tier} winrate ${x.winrate} partidas ${x.occurrence} populares ${x.mostPopular}`);
  console.log(`   starterIds [${x.starterIds}] · firstItemId ${x.firstItemId} · secondItemId ${x.secondItemId}`);
  for (const blk of x.itemBlocks ?? []) console.log(`   bloque type ${blk.type} (${blk.items.length}): ${blk.items.slice(0, 8).map(it).join('  ')}${blk.items.length > 8 ? ' …' : ''}`);
}
const first = b.json?.builds?.[0];

// 2) Botas y 3.er ítem, con y sin condicionar al 1.º y 2.º legendario
const stat = async (label, extra, filters = cf()) => {
  const r = await post('ChampionWinprob/GetGlobalItemStatistics', { commonFilters: filters, itemSlots: null, itemType: 1, keystone: null, starterId: null,
    firstPurchaseId: null, firstLegendaryId: null, secondLegendaryId: null, loadFirstEpicPurchase: false, includeSupportItems: false, ...extra });
  const list = Array.isArray(r.json) ? [...r.json].sort((x, y) => y.wpaOverall - x.wpaOverall) : null;
  console.log(`\n${r.status} ${label}${list ? ` (${list.length})` : ' → ' + r.text.slice(0, 200)}`);
  if (list) console.log('   ' + list.slice(0, 8).map((x) => `${x.itemId}:${x.wpaOverall.toFixed(2)}/${x.occurrence}`).join('  '));
  return list;
};
console.log('\n== GetGlobalItemStatistics (itemId:wpa/partidas, mejores por WPA)');
await stat('botas (itemType 2)', { itemType: 2 });
const a = await stat('3.er ítem SIN condicionar (itemSlots [3])', { itemSlots: [3] });
let c = null;
if (first?.firstItemId && first?.secondItemId) {
  c = await stat(`3.er ítem CONDICIONADO a ${first.firstItemId}+${first.secondItemId}`, { itemSlots: [3], firstLegendaryId: first.firstItemId, secondLegendaryId: first.secondItemId });
}
console.log(`\n→ ¿firstLegendaryId/secondLegendaryId cambian el 3.er ítem? ${a && c ? (JSON.stringify(a) !== JSON.stringify(c) ? 'SÍ' : 'NO (idéntico)') : 'sin datos'}`);

// 3) Matchup en ítems (solo premium)
if (premium) {
  const m = await stat(`botas (itemType 2) vs ${rival}`, { itemType: 2 }, cf([rival]));
  const base = await stat('botas (itemType 2) sin rival', { itemType: 2 });
  console.log(`\n→ ¿el matchup cambia las botas? ${m && base ? (JSON.stringify(m) !== JSON.stringify(base) ? 'SÍ' : 'NO (idéntico)') : 'sin datos'}`);
} else console.log('\n(cuenta gratuita: no se prueba el matchup en ítems)');
console.log('\nPega la salida tal cual (no contiene tokens).');
