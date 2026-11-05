// test-coachless-data.mjs — ¿qué devuelven runas, hechizos y builds con matchup, rol y rangos bajos? Solo lecturas.
// Usa el parche 16.22 +1 con una cuenta premium, o 16.21 +0 con una gratuita (la salida indica isSubscribed).
// Idea: ejecútalo con la cuenta premium y, si puedes, otra vez con la gratuita (¿el matchup también es premium?).
// Uso:  node test-coachless-data.mjs   (pide email y contraseña; no imprime tokens)

import readline from 'node:readline';
const B = 'https://api.coachless.gg/api';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ask(q, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => rl.output.write(s.includes(q) ? s : '*');
    rl.question(q, (a) => { rl.close(); if (hidden) process.stdout.write('\n'); resolve(a); });
  });
}
const email = process.env.CL_EMAIL || (await ask('Email: '));
const pass = process.env.CL_PASS || (await ask('Contraseña (no se muestra): ', true));

const call = async (path, token, body) => {
  const r = await fetch(`${B}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, j, bytes: t.length };
};

const lr = await fetch(`${B}/Auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password: pass, rememberMe: false }) });
const lg = await lr.json();
if (lg.actionResult !== 0 || !lg.accessToken) { console.error('Login falló (actionResult', lg.actionResult + ')'); process.exit(1); }
const token = lg.accessToken;
const premium = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).isSubscribed === '1';
const BASE = premium ? { patch: 22, add: 1 } : { patch: 21, add: 0 };
console.log(`Login OK | isSubscribed = ${premium ? '"1"' : '"0"'} | parche base: 16.${BASE.patch} +${BASE.add}\n`);

const mk = (o = {}) => ({ commonFilters: {
  patch: { major: 16, patch: BASE.patch, patchAdditions: BASE.add },
  championIds: [o.champ ?? 145], matchupChampionIds: o.matchup ?? null,
  leagueTiers: o.tiers ?? [5, 6, 7], regions: o.regions ?? null, role: o.role ?? 5 } });

const top = (arr, key, n = 3) => [...arr].sort((a, b) => b[key] - a[key]).slice(0, n);
const sumBuilds = (j) => j && Array.isArray(j.builds)
  ? `role=${j.role} | ${j.builds.length} builds: ` + j.builds.map((b) => `ks ${b.keystone} t${b.tier} wr ${b.winrate} n=${b.occurrence}`).join('; ')
    + ' | duos: ' + (j.spellDuos ?? []).slice(0, 2).map((d) => `[${d.spellIds}] wpa ${d.wpa}`).join(' ')
  : 'forma inesperada';
const sumSpells = (j) => Array.isArray(j)
  ? `${j.length} hechizos | top wpa: ` + top(j, 'wpaOverall').map((x) => `${x.summonerSpell}(wpa ${x.wpaOverall}, n=${x.occurrence})`).join(' ')
  : 'forma inesperada';
const sumKeystone = (j) => Array.isArray(j)
  ? `${j.length} runas | top n: ` + top(j, 'occurrence').map((x) => `${x.rune}(n=${x.occurrence}, wpa ${x.wpaOverall})`).join(' ')
  : 'forma inesperada';

const probe = async (label, ep, body, sum) => {
  const r = await call(ep, token, body);
  console.log(String(r.status).padEnd(3), label.padEnd(40), r.status === 200 ? sum(r.j) : `${r.bytes} bytes`);
  await sleep(300);
};

console.log('--- GetRecommendedBuilds (Kai\'Sa = 145) ---');
await probe('base (role 5)', 'ChampionWinprob/GetRecommendedBuilds', mk(), sumBuilds);
await probe('role 3', 'ChampionWinprob/GetRecommendedBuilds', mk({ role: 3 }), sumBuilds);
await probe('role 2', 'ChampionWinprob/GetRecommendedBuilds', mk({ role: 2 }), sumBuilds);
await probe('role 3 vs Jinx (222)', 'ChampionWinprob/GetRecommendedBuilds', mk({ role: 3, matchup: [222] }), sumBuilds);
await probe('role 3 vs Ezreal (81)', 'ChampionWinprob/GetRecommendedBuilds', mk({ role: 3, matchup: [81] }), sumBuilds);
await probe('role 3 vs id inexistente (99999)', 'ChampionWinprob/GetRecommendedBuilds', mk({ role: 3, matchup: [99999] }), sumBuilds);

console.log('\n--- GetGlobalSummonerSpellStatistics ---');
await probe('base', 'ChampionWinprob/GetGlobalSummonerSpellStatistics', { ...mk(), pairedSpell: null }, sumSpells);
await probe('vs Jinx (role 3)', 'ChampionWinprob/GetGlobalSummonerSpellStatistics', { ...mk({ role: 3, matchup: [222] }), pairedSpell: null }, sumSpells);
await probe('pairedSpell = 4 (Flash)', 'ChampionWinprob/GetGlobalSummonerSpellStatistics', { ...mk(), pairedSpell: 4 }, sumSpells);

console.log('\n--- GetKeystoneData ---');
await probe('base', 'Rune/GetKeystoneData', mk(), sumKeystone);
await probe('vs Jinx (role 3)', 'Rune/GetKeystoneData', mk({ role: 3, matchup: [222] }), sumKeystone);
for (const t of [[0], [1], [2], [3], [8]]) await probe(`leagueTiers ${JSON.stringify(t)}`, 'Rune/GetKeystoneData', mk({ tiers: t }), sumKeystone);
await probe('regions [4] (Korea)', 'Rune/GetKeystoneData', mk({ regions: [4] }), sumKeystone);

console.log('\nPega esta salida tal cual (no contiene tokens).');
