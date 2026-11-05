// test-coachless-auth.mjs (v2) — requiere Node 18+. En Node no hay CORS.
// Uso (PowerShell):   node test-coachless-auth.mjs
//   Pide el email y la contraseña por teclado (la contraseña no se muestra), así PowerShell no
//   interpreta caracteres como ` o $. También acepta las variables CL_EMAIL / CL_PASS si existen
//   (en ese caso usa COMILLAS SIMPLES al definirlas:  $env:CL_PASS='...').
//   Opción:  --bad-login   añade un login con contraseña incorrecta (por defecto no, para no
//                          acumular intentos fallidos y provocar un bloqueo de la cuenta).
// No imprime tokens ni contraseñas: solo códigos HTTP, longitudes y nombres de campos.

import readline from 'node:readline';

const B = 'https://api.coachless.gg/api';

function ask(q, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => rl.output.write(s.includes(q) ? s : '*');
    rl.question(q, (a) => { rl.close(); if (hidden) process.stdout.write('\n'); resolve(a); });
  });
}

const email = process.env.CL_EMAIL || (await ask('Email: '));
const pass = process.env.CL_PASS || (await ask('Contraseña (no se muestra): ', true));
console.log(`Credenciales recibidas -> email: ${email.length} caracteres | contraseña: ${pass.length} caracteres`);
console.log('(compara esas longitudes con las reales; si no coinciden, algo las alteró)\n');

const post = (path, body, token) => fetch(`${B}/${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
  body: body === undefined ? undefined : JSON.stringify(body),
});
const redact = (s) => String(s).slice(0, 80).replace(/eyJ[\w.-]+/g, '<jwt>');
const filters = { commonFilters: { patch: { major: 16, patch: 22, patchAdditions: 2 },
  championIds: [145], matchupChampionIds: null, leagueTiers: [5, 6, 7], regions: null, role: 5 } };

// 0) Opcional: login incorrecto (ya sabemos que devuelve HTTP 200 + actionResult 1 + tokens null)
if (process.argv.includes('--bad-login')) {
  const r = await post('Auth/login', { email, password: pass + '_mal', rememberMe: false });
  console.log('0) login incorrecto -> HTTP', r.status, '|', redact(await r.text()));
}

// 1) Login
const lr = await post('Auth/login', { email, password: pass, rememberMe: false });
const login = await lr.json();
console.log('1) login -> HTTP', lr.status, '| actionResult:', login.actionResult, '| accessToken:', login.accessToken ? 'sí' : 'null');
if (login.actionResult !== 0 || !login.accessToken) {
  console.error('\nEl login falló (actionResult distinto de 0). Causas posibles:');
  console.error(' - Contraseña o email alterados por la terminal (mira las longitudes de arriba).');
  console.error(' - Cuenta sin confirmar por email, o bloqueada tras varios intentos fallidos (espera unos minutos).');
  console.error(' - La cuenta ya no existe (los correos desechables a veces caducan).');
  process.exit(1);
}

// 2) ¿La cuenta puede leer estadísticas?
for (const [ep, b] of [['Rune/GetKeystoneData', filters],
                       ['ChampionWinprob/GetGlobalSummonerSpellStatistics', { ...filters, pairedSpell: null }],
                       ['ChampionWinprob/GetRecommendedBuilds', filters]]) {
  const r = await post(ep, b, login.accessToken);
  const t = await r.text();
  console.log('2)', ep, '-> HTTP', r.status, '| bytes:', t.length);
}

// 3) Auth/refresh: probar variantes (método, cuerpo, cabecera)
const variants = [
  ['POST body {refreshToken}', 'POST', { refreshToken: login.refreshToken }, login.accessToken],
  ['POST body {refreshToken} sin Authorization', 'POST', { refreshToken: login.refreshToken }, null],
  ['POST sin cuerpo', 'POST', undefined, login.accessToken],
  ['POST Authorization = refreshToken', 'POST', undefined, login.refreshToken],
  ['GET', 'GET', undefined, login.accessToken],
];
for (const [name, method, body, token] of variants) {
  const r = await fetch(`${B}/Auth/refresh`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch {}
  console.log('3) refresh', name, '-> HTTP', r.status, '| campos:', j ? Object.keys(j) : '-', '|', redact(t));
}
