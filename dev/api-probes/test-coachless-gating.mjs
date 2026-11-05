// test-coachless-gating.mjs — ¿qué filtros dan 403 con tu cuenta? Solo lecturas (POST de consulta).
// Contexto: con una cuenta gratuita, parche 16.21 + patchAdditions 0 da 200 en el navegador,
// y parche 16.22 + patchAdditions 2 da 403. Este script varía un filtro cada vez.
// Uso:  node test-coachless-gating.mjs   (pide email y contraseña; no imprime tokens)

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

const call = async (method, path, token, body) => {
  const r = await fetch(`${B}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const t = await r.text();
  let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, j, bytes: t.length, text: t };
};

const lg = await call('POST', 'Auth/login', null, { email, password: pass, rememberMe: false });
if (lg.j?.actionResult !== 0 || !lg.j?.accessToken) { console.error('Login falló (actionResult', lg.j?.actionResult + ')'); process.exit(1); }
const token = lg.j.accessToken;
const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
console.log('Login OK | isSubscribed =', JSON.stringify(claims.isSubscribed), '\n');

// 1) GetPatches: método y forma (nunca se capturó)
console.log('--- GetPatches ---');
for (const [method, body] of [['POST', {}], ['GET', undefined]]) {
  const r = await call(method, 'ChampionWinprob/GetPatches', token, body);
  const shape = Array.isArray(r.j) ? `array(${r.j.length})` : typeof r.j;
  console.log(method, '-> HTTP', r.status, '|', shape, '|', r.text.slice(0, 300).replace(/\s+/g, ' '));
  await sleep(300);
}

// 2) GetKeystoneData variando un filtro cada vez (campeón 145, role 5)
const mk = (patch, add, tiers = [5, 6, 7]) => ({ commonFilters: {
  patch: { major: 16, patch, patchAdditions: add }, championIds: [145], matchupChampionIds: null,
  leagueTiers: tiers, regions: null, role: 5 } });
const variants = [
  ['16.21 +0 tiers[5,6,7]  (el que funciona en el navegador)', mk(21, 0)],
  ['16.22 +0', mk(22, 0)],
  ['16.22 +1', mk(22, 1)],
  ['16.22 +2  (el que dio 403)', mk(22, 2)],
  ['16.21 +1', mk(21, 1)],
  ['16.21 +2', mk(21, 2)],
  ['16.20 +0', mk(20, 0)],
  ['16.21 +0 tiers[4,5,6,7] (Platinum+)', mk(21, 0, [4, 5, 6, 7])],
  ['16.21 +0 tiers[3,4,5,6,7] (Gold+)', mk(21, 0, [3, 4, 5, 6, 7])],
  ['16.21 +0 tiers[7] (Master+)', mk(21, 0, [7])],
];
console.log('\n--- GetKeystoneData ---');
for (const [label, body] of variants) {
  const r = await call('POST', 'Rune/GetKeystoneData', token, body);
  console.log(String(r.status).padEnd(3), label.padEnd(58), Array.isArray(r.j) ? `${r.j.length} runas` : `${r.bytes} bytes`);
  await sleep(300);
}
console.log('\nPega esta salida tal cual (no contiene tokens).');
