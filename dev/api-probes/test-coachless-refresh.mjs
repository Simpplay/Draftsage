// test-coachless-refresh.mjs — requiere Node 18+. Averigua cómo se comporta Auth/refresh:
//   - ¿devuelve un refresh token nuevo (rotación)?  - ¿el antiguo sigue valiendo (reutilización)?
//   - ¿un segundo login invalida la sesión anterior (multi-sesión)?  - ¿la caducidad se renueva?
// Uso:  node test-coachless-refresh.mjs   (pide email y contraseña; no imprime tokens)

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

const post = async (path, body) => {
  const r = await fetch(`${B}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let j = null; try { j = await r.json(); } catch {}
  return { status: r.status, j };
};
const claims = (jwt) => { try { return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString()); } catch { return {}; } };
const mins = (s) => Math.round(s / 60);
const login = async () => {
  const { status, j } = await post('Auth/login', { email, password: pass, rememberMe: false });
  if (j?.actionResult !== 0 || !j?.accessToken) { console.error('Login falló. HTTP', status, 'actionResult', j?.actionResult); process.exit(1); }
  return j;
};
const refresh = (rt) => post('Auth/refresh', { refreshToken: rt });
const show = (label, r, inputRt) => {
  const ok = r.status === 200 && r.j?.refreshToken;
  console.log(label, '-> HTTP', r.status,
    ok ? `| refresh nuevo: ${r.j.refreshToken === inputRt ? 'IGUAL al enviado' : 'DISTINTO'}` : '| sin tokens');
};

const l1 = await login();
const c1 = claims(l1.accessToken);
console.log('claims del access token:', Object.keys(c1).join(', '), '| isSubscribed =', JSON.stringify(c1.isSubscribed));
const A = l1.refreshToken, a = claims(A);
console.log(`refresh A: caduca en ${mins(a.exp - a.iat)} min desde su emisión\n`);

const l2 = await login();                       // segundo login = otra "sesión"
const C = l2.refreshToken;

const r1 = await refresh(A);   show('1) refrescar con A (tras un 2º login)  ', r1, A);
const B1 = r1.j?.refreshToken;
if (B1) { const b = claims(B1); console.log(`   caducidad del nuevo refresh: iat/exp +${mins(b.exp - b.iat)} min; ¿renovada respecto a A? ${b.exp > a.exp ? 'sí (deslizante)' : 'no (misma caducidad)'}`); }
const r2 = await refresh(A);   show('2) reutilizar A (el ya usado)         ', r2, A);
if (B1) { const r3 = await refresh(B1); show('3) refrescar con el nuevo B          ', r3, B1); }
const r4 = await refresh(C);   show('4) refrescar con C (2º login)         ', r4, C);
