# Coachless.gg – Autenticación (adenda a `coachless-api.md`)

> Actualizado el 2026-11-04/05 con pruebas reales (script de Node con una cuenta gratuita de prueba y `fetch` desde el cliente de League).
> **No es documentación oficial.** No contiene contraseñas ni tokens.
> Leyenda: ✅ observado · 🔶 inferido · ❓ desconocido / no verificado
> Esta adenda responde los puntos 1 y 2 de «§9 Lo que falta por verificar» de `coachless-api.md` (salvo lo marcado ❓ aquí).

## 1. Flujo resumido

```
POST /api/Auth/login    {email, password, rememberMe}   → 200 {actionResult, accessToken, refreshToken}
POST /api/Auth/refresh  {refreshToken}                  → 200 {accessToken, refreshToken}
Datos: POST /api/<Controller>/<Action>  con  Authorization: Bearer <accessToken>
```

## 2. `POST /api/Auth/login` ✅

Cuerpo: `{ "email": "...", "password": "...", "rememberMe": false }` · `Content-Type: application/json`.
No hace falta `Authorization` (la web envía `Bearer null`).

| Caso | HTTP | Respuesta |
|---|---|---|
| Credenciales correctas | **200** | `{"actionResult":0,"accessToken":"<JWT>","refreshToken":"<JWT>"}` |
| Credenciales incorrectas | **200** | `{"actionResult":1,"accessToken":null,"refreshToken":null}` |

- **El error de login NO usa el código HTTP.** Hay que comprobar `actionResult === 0` y que `accessToken` no sea null.
- ❓ Otros valores de `actionResult` (email sin confirmar, cuenta bloqueada, captcha, 2FA): no capturados. `1` agrupa al menos «credenciales erróneas».
- Además emite `Set-Cookie: .AspNetCore.Identity.Application=…; httponly` (ASP.NET Core Identity). No hace falta para usar Bearer 🔶.

## 3. `POST /api/Auth/refresh` ✅

| Variante probada | Resultado |
|---|---|
| `POST` con cuerpo `{"refreshToken":"<JWT>"}` y `Authorization: Bearer <access>` | **200** `{accessToken, refreshToken}` |
| `POST` con cuerpo `{"refreshToken":"<JWT>"}` **sin** `Authorization` | **200** `{accessToken, refreshToken}` |
| `POST` sin cuerpo | 400 (problem-details de ASP.NET: `type,title,status,errors,traceId`) |
| `POST` sin cuerpo, con `Authorization: Bearer <refresh>` | 400 |
| `GET` | 405 |

- El refresh token va **en el cuerpo**; no se necesita el access token.
**Comportamiento del refresh token** (`test-coachless-refresh.mjs`) ✅:

| Prueba | Resultado |
|---|---|
| Refrescar con A, tras haber hecho un 2.º login | 200; el refresh devuelto es **distinto** y su caducidad se **renueva** (+30 días: ventana deslizante) |
| Reutilizar A (ya usado) | **200**: el refresh token antiguo **sigue valiendo** |
| Refrescar con el nuevo B | 200 |
| Refrescar con C (del 2.º login) | 200: un 2.º login **no invalida** la sesión anterior |

- Los refresh tokens son JWT **sin estado**: no hay detección de reutilización ni límite de sesiones. Usar el plugin **no cierra** la sesión del navegador.
- 🔶 **No existe cierre de sesión en el servidor** (no se vio ninguna ruta de logout): cerrar sesión en el plugin solo borra la copia local y el token sigue siendo válido hasta caducar. ❓ Si `Auth/change` o `Auth/reset` los invalidan.
- Con B y C el refresh devolvió un token **igual** al enviado. 🔶 Probablemente porque un JWT con el mismo `iat` (emitido en el mismo segundo) produce la misma cadena; no se verificó esperando más de 1 s.
- Conviene guardar siempre el refresh token devuelto (renueva la caducidad).
- ❓ Estado HTTP exacto cuando el refresh token está caducado o es inválido (se asume 400/401/403).

## 4. Tokens ✅

| | Access token | Refresh token |
|---|---|---|
| Formato | JWT HS256 | JWT HS256 |
| Duración | 24 h | 30 días |
| Claims | `email`, `paddleCustomerId`, `isSubscribed`, `subscriptionPeriodEnd`, `isSubscriptionCanceled`, `nbf`, `exp`, `iat`, `iss`, `aud` | `type` (`"refresh"`), `email`, `nbf`, `exp`, `iat`, `iss`, `aud` |

- Los claims de suscripción son **strings**. Cuenta gratuita: `isSubscribed = "0"`, `paddleCustomerId = ""`.
- ✅ `isSubscribed` es `"1"` en una cuenta premium y `"0"` en una gratuita. ❓ Valores de `subscriptionPeriodEnd` e `isSubscriptionCanceled` en premium, y si una suscripción cancelada sigue figurando como `"1"` hasta que caduque el access token.
- Cliente: solo puede leer `exp`; no puede validar la firma.

## 5. Acceso a los datos según los filtros ✅

Con una cuenta **gratuita** (`isSubscribed: "0"`), `Rune/GetKeystoneData` (campeón 145, role 5):

| Filtro | HTTP |
|---|---|
| `patchAdditions: 0` en 16.20, 16.21 o 16.22 | **200** |
| `patchAdditions` ≥ 1 (rango de varios parches) en 16.21 o 16.22 | **403**, cuerpo vacío |
| `leagueTiers` `[5,6,7]`, `[4,5,6,7]`, `[3,4,5,6,7]` o `[7]` con 16.21 +0 | **200** |
| sin token | 403 |

Con una cuenta **premium** (`isSubscribed: "1"`), mismas peticiones:

| Filtro | HTTP |
|---|---|
| `patchAdditions` 0, 1 o 2 en 16.21 y 16.22 | **200** |
| 16.22 +0 / 16.22 +1 / 16.22 +2 | 3 runas / **13** / 13 |

- ✅ **El 403 lo provoca `patchAdditions ≥ 1`**, no el parche ni el rango de liga. Una cuenta gratuita solo puede consultar **un parche cada vez**.
- ✅ **Confirmado con cuenta premium: los rangos de parches (`patchAdditions ≥ 1`) son una función premium.** El rango también compensa la poca muestra del parche más reciente (16.22 +0 → 3 runas; 16.22 +1 → 13).
- ❓ Solo se probó `GetKeystoneData` con `patchAdditions: 0`. `GetGlobalSummonerSpellStatistics` y `GetRecommendedBuilds` (y `GetGlobalItemStatistics`) solo se probaron con `patchAdditions: 2` (403). Tampoco se probaron `matchupChampionIds` ni `regions`.
- **Poca muestra en el parche más reciente:** 16.22 +0 devolvió 3 runas (13 en 16.21, 12 en 16.20) y `[7]` (Master+) en 16.21 también 3. `GetPatches` (ver `coachless-api.md` §4.5) da `matchCount` por parche para elegir uno con muestra suficiente.
- Para el plugin: con premium usar un rango (`patchAdditions ≥ 1`) cuando el último parche tenga poca muestra; sin premium, `patchAdditions: 0`. Si llega un 403 con un rango, reintentar una vez con 0 y tratarlo como «filtro no disponible», no como error de sesión (no renovar el token).

### 5.1 Matchup, rol, rango y región (`test-coachless-data.mjs`) ✅

Kai'Sa (145). Premium: parche 16.22 +1. Gratuita: 16.21 +0.

| Petición | Premium | Gratuita |
|---|---|---|
| `GetRecommendedBuilds` (role 5 o 3) | 200, 3 builds, `role` resuelto = 3 | 200, mismo formato |
| `GetRecommendedBuilds` con `matchupChampionIds` 222, 81 o 99999 | 200, **idéntico al base**: el filtro se ignora | 200, idéntico |
| `GetRecommendedBuilds` con role 2 | 200, `builds: []` (sin datos en ese rol) | igual |
| `GetKeystoneData` con matchup 222 + role 3 | **200, datos distintos** (2 runas) | **403** |
| `GetGlobalSummonerSpellStatistics` con matchup 222 + role 3 | **200, datos distintos** (6 hechizos) | **403** |
| `GetGlobalSummonerSpellStatistics` con `pairedSpell: 4` | 200 (8 hechizos) | 200 |
| `leagueTiers` `[0]`, `[1]` o `[2]` | 200, **array vacío** | igual |
| `leagueTiers` `[3]` | 200, 13 runas (n≈358 k) | 200 (n≈343 k) |
| `leagueTiers` `[8]` | 200, 2 runas (n≈7,5 k) | 200 |
| `regions: [4]` (Korea) | 200, 6 runas | 200 |

- ✅ **El filtro de matchup es premium** (403 en gratuita) y solo actúa en `GetKeystoneData` y `GetGlobalSummonerSpellStatistics`. **`GetRecommendedBuilds` lo ignora** (devuelve lo mismo con un id inexistente), así que las builds recomendadas no cambian con el matchup.
- ✅ **No hay datos por debajo de `leagueTiers` 3**: 0, 1 y 2 devuelven un array vacío. Para lobbies de rango bajo hay que usar 3 como mínimo.
- ❓ `leagueTiers: [8]` devuelve datos (poca muestra); su significado es desconocido.
- ✅ `role: 5` = «rol principal del campeón» (el servidor lo resuelve; Kai'Sa → 3). ❓ Falta probar campeones con varios roles.
- Ejemplo (Kai'Sa vs Jinx, premium, `role: 3`):
  - runas: 8008 (n=39 759, wpa +1.106) y 8005 (n=1 877, wpa −1.113). Sin matchup: 8008 con wpa +0.153.
  - hechizos: 3 (wpa +1.762, n=6 701), 6 (wpa +1.761, n=570), 1 (+1.456, n=2 095). Sin matchup: 6 (+1.487) y 3 (+0.755).
- Para elegir con poca muestra, filtrar por `occurrence` (p. ej. 6 con n=570 y wpa casi igual que 3 con n=6 701 es ruido).

## 6. CORS y Pengu Loader ✅

- La API solo permite `Access-Control-Allow-Origin: https://coachless.gg`. Un `fetch` desde el cliente de League (origen `https://127.0.0.1:<puerto>`) falla en el preflight.
- **Solución verificada:** añadir `DisableWebSecurity=1` al archivo `config` de Pengu Loader (junto a la carpeta `plugins`) y reiniciar el cliente. Con eso, `fetch` a `Auth/login` desde el cliente devuelve 200 ✅.
- Implicaciones: la opción desactiva la seguridad web de **todo** el cliente (todos los plugins); es un paso manual del usuario (el plugin no puede escribir fuera de su carpeta, ni en 1.2). Se implementó un diálogo (`cors-gate.js`) que detecta el bloqueo, explica el cambio y ofrece reiniciar.
- **Pengu Loader 1.1.6** (la 1.2 aún no está firmada): no existen `context.fs`, `Settings`, `Toast.custom/warning/update`, `DataStore.flush()`. Sí existen `DataStore` (get/set/has/remove), `Toast.success/error/promise`, `openPluginsFolder`, `restartClient`.

## 7. Almacenamiento en el plugin

- `DataStore` es **compartido por todos los plugins y no está cifrado** ⇒ guardar solo el **refresh token** (nunca la contraseña), con clave propia (`draftsage/auth`). El access token, solo en memoria.
- Guardar siempre el refresh token que devuelve `Auth/refresh` (renueva la caducidad deslizante de 30 días).
- Renovar con una sola petición a la vez: la reutilización no se penaliza, pero evita peticiones redundantes.
- El refresh token **no se puede revocar en el servidor** (ver §3): conviene que «Cerrar sesión» lo borre del disco y que no se guarde más de lo necesario.

## 8. Pendiente

1. ❓ Qué ocurre al cancelar la suscripción (claims `subscriptionPeriodEnd` / `isSubscriptionCanceled`).
2. ❓ **Endpoint para una página de runas completa según el matchup**: `GetRecommendedBuilds` no filtra por matchup y `GetKeystoneData` solo da la runa clave. Buscar en la sección Runes del sitio (¿algún endpoint que acepte `keystone`?).
3. ❓ Valores de `actionResult` distintos de 0/1, captcha/2FA, límites de tasa.
4. ❓ Estado HTTP con un refresh token inválido o caducado; si cambiar/restablecer la contraseña invalida los refresh tokens.
5. ❓ Términos de uso de Coachless (no revisados; es una API privada con CORS limitado a su dominio).
