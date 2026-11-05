// test-coachless-runes.mjs — explora Rune/GetRunesForKeystoneAndTree (página de runas por keystone + árbol). Solo lecturas.
// El nombre del endpoint viene del sitio (/runes/tree/kaisa/precision/domination); los nombres de los campos
// extra del body son hipótesis: el script prueba variantes e imprime la forma de la respuesta.
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
const cf = { patch: { major: 16, patch: P.patch, patchAdditions: P.add }, championIds: [145], matchupChampionIds: null,
  leagueTiers: [5, 6, 7], regions: null, role: 5 };
const shape = (v, d = 0) => Array.isArray(v) ? `[${v.length}] ` + (v[0] && d < 2 ? shape(v[0], d + 1) : '')
  : v && typeof v === 'object' ? '{' + Object.entries(v).map(([k, x]) => k + ':' + (d < 2 ? shape(x, d + 1) : typeof x)).join(', ') + '}' : typeof v;
const variants = {
  'ids Riot (8000/8100)': { commonFilters: cf, mainTree: 8000, treeToLoad: 8100 },
  'nombres (Precision/Domination)': { commonFilters: cf, mainTree: 'Precision', treeToLoad: 'Domination' },
  'minúsculas (precision/domination)': { commonFilters: cf, mainTree: 'precision', treeToLoad: 'domination' },
  'enum 0/1': { commonFilters: cf, mainTree: 0, treeToLoad: 1 },
  'ids + keystone 8008': { commonFilters: cf, mainTree: 8000, treeToLoad: 8100, keystone: 8008 },
  'ids + keystoneId 8008': { commonFilters: cf, mainTree: 8000, treeToLoad: 8100, keystoneId: 8008 },
};
for (const [label, body] of Object.entries(variants)) {
  const r = await fetch(`${B}/Rune/GetRunesForKeystoneAndTree`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + lg.accessToken }, body: JSON.stringify(body) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  console.log(String(r.status).padEnd(3), label.padEnd(36), r.status === 400 ? (j?.errors ? JSON.stringify(j.errors).slice(0, 500) : t.slice(0, 300) || '(sin cuerpo)') : j ? shape(j).slice(0, 400) : t.slice(0, 300));
  await new Promise((s) => setTimeout(s, 300));
}
console.log('\nPega esta salida tal cual (no contiene tokens).');
