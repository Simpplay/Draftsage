# Easy Coachless — estado para retomar (2026-11-05)

Plugin de Pengu Loader **1.1.6** (no 1.2 beta) para el cliente de League. Usa la API privada de Coachless (cada usuario con su propia cuenta; premium para matchup y rangos de parche) para mostrar runas y hechizos según matchup y rango de la lobby.
Carpeta (reorganizada el 2026-11-05, sin cambios de comportamiento; pendiente de probar en el cliente real): `C:\Program Files\Pengu Loader\plugins\easy-coachless`. Se editan los archivos directamente en ella (no usar Claude outputs / SendUserFile).

## Hecho
- Código reorganizado por capas en `src/` (ver `docs/ARCHITECTURE.md`): `shared/logger.js`, `presentation/ui.js` (motor DOM) y `presentation/menus.js` (pantallas), `infrastructure/pengu/api-probe.js` + `application/ensure-api-access.js` (sonda CORS + aviso), `infrastructure/coachless/auth.js` (login, refresh, `api()`), `application/session.js` (fachada), `application/bootstrap.js` (arranque). `index.js` en la raíz solo delega. `easyCoachless.menu()`/`loginMenu()` siguen disponibles desde la consola.
- Probado con Playwright (19 comprobaciones del UI) y, en el cliente real, el diálogo de CORS y los logs. El login/refresh se verificó con scripts Node contra la API real.
- Documentación: `docs/coachless-auth.md` (flujo, gating, CORS; copia en el Project como `claude/coachless-auth.md`) y `docs/coachless-api.md` (referencia de endpoints).

## Hallazgos clave (detalle en los docs)
- CORS: la API solo admite `Origin: https://coachless.gg` → `DisableWebSecurity=1` en `C:\Program Files\Pengu Loader\config` + reinicio del cliente (el plugin no puede escribir ahí; el usuario lo hace a mano guiado por el diálogo).
- `Auth/login` devuelve HTTP 200 siempre: mirar `actionResult` (0 = OK). Access JWT 24 h, refresh 30 d deslizante; solo se guarda el refresh en DataStore.
- Premium se lee del claim `isSubscribed` (`"1"`/`"0"`). Solo premium: `patchAdditions ≥ 1` y `matchupChampionIds` (403 en gratuita). Gratuita funciona con `patchAdditions: 0`. 403 ≠ error de sesión.
- `GetRecommendedBuilds` **ignora** el matchup; `GetKeystoneData` y `GetGlobalSummonerSpellStatistics` sí lo usan (solo WPA por runa clave / hechizo).
- `leagueTiers` 0–2 devuelven vacío → fijar mínimo 3 (3 = Gold). `role: 5` = rol principal del campeón. `regions: [4]` y `pairedSpell` funcionan.
- `GET ChampionWinprob/GetPatches` da los parches con `matchCount`; el parche más nuevo tiene pocos datos (usar el último con muestra suficiente).

## En curso: página de runas completa por matchup
Endpoint candidato (visto en `/runes/tree/kaisa/precision/domination` del sitio): `POST Rune/GetRunesForKeystoneAndTree`.
- El servidor exige `mainTree` y `treeToLoad` (mensaje: «missing required properties including: 'mainTree', 'treeToLoad'»; «including» → puede haber más).
- Formato de valores aún desconocido. `dev/api-probes/test-coachless-runes.mjs` prueba: ids Riot (8000/8100), nombres, minúsculas, enum 0/1, con `keystone`/`keystoneId`. **El usuario aún debe ejecutarlo y pegar la salida.** Si todo da 400: copiar el body de la petición en DevTools > Network (sin la cabecera Authorization).
- Aviso: `device_commit_files` dejó en la carpeta del usuario una versión anterior del archivo en varias ocasiones; tras escribir, volver a hacer stage y comparar el tamaño en bytes.

## Pendiente
1. Cerrar el body de `GetRunesForKeystoneAndTree` y documentarlo.
2. Capa de datos: elegir parche (GetPatches), clamp de rango ≥ 3, 403 → reintentar con `patchAdditions: 0` y avisar de filtro no disponible, caché por parche/campeón/filtros.
3. Detectar champ select (`context.socket` / LCU) y leer campeón, rol, rival y rango de la lobby.
4. Mostrar runas y hechizos en el cliente y, si procede, aplicarlos (LCU).
5. Acceso al menú desde el cliente (botón/atajo) en lugar de la consola.
6. Probar en el cliente real: z-index, teclado, `restartClient()` tras el cambio de config.
7. Antes de distribuir, excluir `dev/` (scripts `dev/api-probes/test-*.mjs`) de la release.
8. Desconocidos: comportamiento de una suscripción cancelada en el claim, otros `actionResult` (captcha/2FA), límites de uso, términos de servicio de Coachless, significado de `leagueTiers: 8`, roles de campeones multi-rol.

## Convenciones
- Sin `innerHTML`; contraseña nunca guardada; no imprimir tokens; scripts de prueba piden credenciales por prompt (en PowerShell, comillas simples si van en variables).
- Cuenta de pruebas desechable (tanto premium como gratuita) autorizada por el usuario.
