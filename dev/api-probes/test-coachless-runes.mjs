// test-coachless-runes.mjs — Rune/GetRunesForKeystoneAndTree, ronda 3. Solo lecturas.
// Ronda 1 (resuelta): mainTree/treeToLoad = ids Riot numéricos (8000...). Nombres → 400 (enum sin conversor de strings); 0/1 → 500.
// Ronda 2 (resuelta): treeToLoad = árbol cuyas filas se devuelven; keystone filtra; campeón y matchup se respetan.
// Ronda 3: ¿keystone filtra también las filas del árbol principal (8000/8000)? ¿keystoneId es alias? wpaOverall SIN escalar.
// Uso: node test-coachless-runes.mjs   (pide email y contraseña; no imprime tokens)
import readline from 'node:readline';
const B = 'https://api.coachless.gg/api';
function ask(q, hidden = false) {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => rl.output.write(s.includes(q) ? s : '*');
    rl.question(q, (a) => { rl.close(); if (hidden) process.stdout.write('\n'); res(a); });
  });
}
const email = process.env.CL_EMAIL || (await ask('Email: '));
const pass = process.env.CL_PASS || (await ask('Contraseña (no se muestra): ', true));
const lg = await (await fetch(`${B}/Auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password: pass, rememberMe: false }) })).json();
if (lg.actionResult !== 0) { console.error('Login falló'); process.exit(1); }
const premium = JSON.parse(Buffer.from(lg.accessToken.split('.')[1], 'base64url').toString()).isSubscribed === '1';
const P = premium ? { patch: 22, add: 1 } : { patch: 21, add: 0 };
console.log(`Login OK | premium: ${premium} | parche 16.${P.patch} +${P.add}\n`);
const cf = (champ, matchup = null) => ({ patch: { major: 16, patch: P.patch, patchAdditions: P.add }, championIds: [champ],
  matchupChampionIds: premium ? matchup : null, leagueTiers: [5, 6, 7], regions: null, role: 5 });
const row = (r) => (r || []).map((x) => `${x.rune}:${x.wpaOverall.toFixed(3)}/${x.occurrence}`).join(' ') || '-';
const base = { commonFilters: cf(145), mainTree: 8000, treeToLoad: 8000 };
const variants = [
  ['8000/8000 sin keystone', base],
  ['8000/8000 keystone 8005', { ...base, keystone: 8005 }],
  ['8000/8000 keystone 8008', { ...base, keystone: 8008 }],
  ['8000/8000 keystone 8010', { ...base, keystone: 8010 }],
  ['8000/8100 keystone 8008', { ...base, treeToLoad: 8100, keystone: 8008 }],
  ['8000/8100 keystoneId 8008 (¿alias?)', { ...base, treeToLoad: 8100, keystoneId: 8008 }],
];
for (const [label, body] of variants) {
  const r = await fetch(`${B}/Rune/GetRunesForKeystoneAndTree`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + lg.accessToken }, body: JSON.stringify(body) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  console.log(`${r.status} ${label}`);
  if (j && r.status === 200) { console.log('   fila1:', row(j.rowOnes)); console.log('   fila2:', row(j.rowTwos)); console.log('   fila3:', row(j.rowThrees)); }
  else console.log('   ', (j ? JSON.stringify(j) : t).slice(0, 300));
  await new Promise((s) => setTimeout(s, 300));
}
console.log('\nFormato: idRuna:wpaOverall(sin escalar)/ocurrencias. Pega la salida tal cual (no contiene tokens).');
