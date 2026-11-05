# Easy Coachless — estado para retomar (2026-11-05)

Plugin de Pengu Loader **1.1.6** (no 1.2 beta) para el cliente de League. Usa la API privada de Coachless (cada usuario con su propia cuenta; premium para matchup y rangos de parche) para mostrar y (con un botón) **aplicar** runas, fragmentos y hechizos según campeón, matchup y rango de la lobby en Champion Select.
Carpeta: `C:\Program Files\Pengu Loader\plugins\easy-coachless`. Se editan los archivos directamente en ella.

## Hecho
- **Prototipo vertical completo** (`LCU → contexto → Coachless → UI`), ver `docs/ARCHITECTURE.md`:
  - `domain/`: roles, rangos de la lobby (media, mínimo Gold, ±1), parche (último con muestra suficiente), runas y selección (umbral de muestra, árbol secundario ponderado).
  - `infrastructure/coachless/`: auth con tiempo máximo y `apiGet`, cliente normalizado de endpoints, caché con caducidad y peticiones compartidas.
  - `infrastructure/lcu/`: proveedor por sondeo del Champion Select (campeón, rol, rival del mismo puesto, rango de tu equipo) y nombres/iconos del propio cliente.
  - `application/`: servicio de recomendación (reglas premium/403/matchup/parche), controlador (cancelación de consultas obsoletas, debounce 350 ms), preferencias, composición.
  - `presentation/`: panel flotante (arrastrable, plegable, cerrable), botón **EC**, atajo **Ctrl+Shift+E**, menú con «Ver runas de un matchup» (simulación) y mostrar/ocultar panel.
- **Verificado contra la API real** (cuenta gratuita, 2026-11-05): el servicio completo devuelve páginas coherentes para Kai'Sa, Thresh, Ahri, Darius y Lee Sin (Kai'Sa: Lethal Tempo + Triunfo/Presteza/Tajo + Inspiración, igual que la build recomendada de Coachless). 0,4–0,6 s por recomendación con parches en caché; ~3 s en frío.
- **Pruebas** (`dev/`, sin dependencias): `node dev/tests/run.mjs` → 74 pruebas (dominio, caché, cliente, servicio, controlador, proveedor LCU, datos del cliente, alternativas/fijados/hechizos por contexto, diccionarios es/en); `node dev/tools/check.mjs` (sintaxis, imports, reglas del proyecto); `dev/tests/ui/ui.test.cjs` (Playwright, 85 comprobaciones de UI de extremo a extremo con LCU/API simulados; el navegador de la prueba usa locale `es-ES`).
- Roles verificados: 0 Top · 1 Jungla · 2 Mid · 3 ADC · 4 Support · 5 rol principal. `GetRunesForKeystoneAndTree` cerrado (ver `docs/coachless-api.md` §4.4b y tabla de runas §6b).

## Aplicar en el cliente (2026-11-05, ❓ sin probar en el cliente real)
- Botones **Aplicar todo / Runas / Hechizos** en el panel y atajo **Ctrl+Shift+A**. Código: `domain/configuration.js` (página de 9 ids, hechizos, nombre `[EC] …`), `application/configuration.js` (`ConfigurationApplier`), `infrastructure/lcu/loadout-gateway.js` (único escritor del LCU).
- `canApply()` desactivado de inicio: el primer clic muestra un aviso (políticas de Riot/Pengu) y, si se acepta, activa la función (`easy-coachless/apply` en DataStore; se desactiva desde el menú). Solo actúa por clic/atajo; no hay aplicación automática.
- Runas: por defecto sobrescribe/crea SOLO la página «[EC] …» y la activa (si no hay hueco → error `no-slot`, sin tocar las del usuario). Opción de menú «reemplazar la página activa». Tras escribir se relee y se compara (`verified`). Nunca se envía una página incompleta.
- Hechizos: `PATCH my-selection` solo en Champion Select; Destello en D o F según el menú (por defecto F).
- Endpoints del LCU usados (no oficiales, ❓ **verificar en el cliente real**): `GET /lol-perks/v1/pages`, `GET /lol-perks/v1/inventory` (`ownedPageCount`), `POST /lol-perks/v1/pages`, `PUT /lol-perks/v1/pages/{id}`, `PUT /lol-perks/v1/currentpage` (body = id), `PATCH /lol-champ-select/v1/session/my-selection` `{spell1Id, spell2Id}`.
- Pruebas: `dev/tests/configuration.test.mjs` (11) y 16 comprobaciones nuevas en `ui.test.cjs`; todo en verde (45 unitarias, 39 de UI).
- Qué probar: (1) clic en «Runas» → aviso → aceptar → ¿aparece la página «[EC] …» activa en Runas? (2) logs `[easy-coachless] runas aplicadas: created|updated` o `no verificada`; (3) «Hechizos» en Champion Select (normal/ranked/ARAM: ¿rechaza hechizos no disponibles del modo?); (4) si `PUT currentpage` con body numérico falla, ver `easyCoachless.debug(true)` (`LCU PUT … → HTTP`); (5) ¿`fetch` con PUT/PATCH desde el cliente necesita cabeceras extra?
- No hecho a propósito: aplicar automáticamente al bloquear campeón (más riesgo de políticas); inyectar botones dentro de la pantalla de Runas del cliente (DOM no documentado en 1.1.6).

## Rediseño gráfico de ajustes y panel (2026-11-05)
- **Ajustes** (`presentation/settings.js`, Ctrl+Shift+E): arriba lo que se toca a diario — interruptor **Aplicar**, destino de las runas (**Propia / Activa**) y **teclas D / F** de Destello (con el icono del hechizo) —; abajo, plegado en «Más»: simular matchup, salir de la simulación, mostrar/ocultar panel y conexión (CORS). Los cambios se guardan al instante; la cuenta es una chip (Premium/Gratis) con botón de salir.
- **Panel**: cabecera con retratos (tú ⚔ rival) y rol; iconos de árbol en vez de rótulos; hechizos con la tecla (D/F) donde se colocarán; botón grande «Aplicar» + cuadrados de runas/hechizos con giro → ✓; avisos como iconos con tooltip; esqueletos al cargar. El texto solo queda en errores cortos.
- Pruebas de UI: 49 comprobaciones (incluye el orden de los ajustes y que el panel/ajustes tengan poco texto).
- ❓ Probar en el cliente real: que los SVG y animaciones se vean bien, tamaño de las teclas D/F y que el icono de Destello cargue (si no, solo se ve la letra).

## Funciones de valor añadido (2026-11-05) — ❓ sin probar en el cliente real
- **Alternativas con un clic** (`recommendation.js` → `alternatives`, `panel.js`): bajo la runa clave, hasta 4 runas clave con su % de uso (la elegida con marco, la recomendada con un punto). Cambiar de runa clave solo cuesta 5 peticiones nuevas (el resto está en la caché de peticiones). Junto a los hechizos, hasta 3 sustitutos del hechizo intercambiable (ni Destello ni Aplastar obligatorio) y un botón «volver a la recomendación». Mientras llega la nueva recomendación se ve la anterior atenuada (`state.stale`), sin parpadeo.
- **Indicador de fiabilidad** (`domain/confidence.js`): medidor de 3 barras (< 10 k partidas rojo, < 50 k ámbar, resto turquesa) con las partidas; las runas/hechizos con < 500 partidas salen atenuados con borde discontinuo.
- **Hechizos según contexto** (`domain/spells.js`): jungla → Aplastar obligatorio; otras líneas → nunca Aplastar; ARAM (`ARAM`, `KIWI`) → sin Aplastar ni Teletransporte; Arena (`CHERRY`) → sin hechizos; Grieta clásica → sin Claridad ni Marca. Aviso (icono ✦) cuando se descartó el mejor por WPA. El modo sale de `GET /lol-gameflow/v1/session` → `gameData.queue.gameMode` (se pide una vez por Champion Select; si falla, solo rige la regla del rol). ❓ Verificar ese endpoint y los valores de `gameMode` (¿ARAM Caos = `KIWI`?).
- **Fijar** (`application/preferences.js` → `pins`, `champ-select.js`): botón 📌 junto a Aplicar. Guarda, por campeón y rol, la runa clave y la pareja de hechizos que se ven (DataStore `easy-coachless/pins`, solo ids; máx. 200). El resto de la página sigue los datos del parche. Lo elegido a mano en la selección manda sobre lo fijado; si cambias algo, el botón vuelve a ofrecer fijar (y fijar reemplaza); pulsar sobre lo ya fijado lo suelta sin cambiar la vista.
- **Botón web** (icono de enlace en la cabecera, `domain/web.js`): abre `https://coachless.gg/builds/{campeón}?role={top|jungle|mid|adc|support}&matchup={rival}` con `window.open` (si lanza, copia el enlace). El slug sale del `alias` de `champion-summary.json` (excepción: `MonkeyKing` → `wukong`). ❓ Verificar en el cliente real: que `window.open` abra el navegador del sistema, y los slugs de campeones raros (Wukong, Nunu y Willump, Renata, Cho'Gath…) y que `matchup` acepte el mismo slug.
- **Inglés** (`shared/i18n.js`, `shared/strings.js`): `t('clave', …)`; idioma «auto» (navegador: `es-*` → español, el resto → inglés) o forzado con el botón ES/EN en Ajustes → Más (DataStore `easy-coachless/panel.lang`). Los logs y comentarios siguen en español. `dev/tests/features.test.mjs` comprueba que ambos diccionarios tienen las mismas claves y que toda clave usada en `src/` existe. Los nombres de campeones/runas/hechizos ya vienen en el idioma del cliente.
- **No implementado — sugerencia de pick por matchup**: con los endpoints conocidos no se puede (`GetRecommendedBuilds` ignora el matchup y `matchupChampionIds` solo filtra runas y hechizos). Hace falta saber si Coachless tiene un endpoint de *counters/matchups* (secciones «Review»/«Worlds»/otras de la web). Para sondearlo: en `coachless.gg` con DevTools → Network → filtrar `api.coachless.gg`, abrir la sección de matchups/counters del campeón y pasar el nombre del endpoint, el body y una respuesta recortada (sin la cabecera `Authorization`).

## Rango de parches y de Elo elegibles (2026-11-05) — ❓ sin probar en el cliente real
- **Ajustes** (`presentation/settings.js`): dos filas nuevas bajo Destello. **Rango de Elo**: «Auto» (lobby ±1, como antes) o clic en Gold…Master+ para incluir/quitar rangos (contiguos, 3..7; clic en un extremo lo acorta; el único marcado vuelve a Auto). **Parches**: «Auto» (último parche con datos, +1 anterior con premium), «Actual» (solo el último) o «+1»/«+2» (parches anteriores; **solo premium**, bloqueados con cuenta gratuita).
- Reglas puras en `domain/filters.js` (`normalizeFilters`, `resolveTiers`, `resolveAdditions`, `toggleTier`; `MAX_PATCH_RANGE = 2`). Se guardan en DataStore `easy-coachless/filters` (solo modos y números) mediante `application/preferences.js`; `app.filters.set()` guarda y relanza la consulta. `recommendation.js` los lee con `getFilters()`; la clave de caché ya incluía parche/rangos, así que cambiarlos no reutiliza resultados viejos.
- Panel: la etiqueta del parche muestra el rango («16.20–21») y, si lo elegiste tú, la de parche/Elo sale en dorado (`meta.patchSource`/`meta.tierSource`). Aviso (corona) si pediste un rango de parches sin ser premium (`patch-range-requires-premium`; se usa solo el actual).
- ⚠ **Límite de `patchAdditions` sin verificar**: la web de Coachless envió 2 (✅); valores ≥ 3 no se han probado, por eso el máximo es 2. Si Coachless rechaza el rango con 403 el servicio ya reintenta con 0 y avisa. Para ampliarlo: probar con un probe de `dev/api-probes/` (cuenta premium) y subir `MAX_PATCH_RANGE`.
- El rango de Elo manual manda sobre el de la lobby y sobre el «rango» de la simulación.
- Pruebas: `dev/tests/filters.test.mjs` (8) y 8 comprobaciones nuevas en `ui.test.cjs` (el límite de texto de Ajustes pasó de 120 a 200 caracteres por las etiquetas nuevas).

## Rivales y aliados (2026-11-05, tras la primera prueba en el cliente real)
- La detección en vivo funciona (logs: campeón 51, rol 3, `lobbyTier` 5; se actualiza al pasar el cursor por campeones).
- **La API de Coachless no admite filtrar por aliados**: `commonFilters` solo tiene `patch`, `championIds`, `matchupChampionIds` (rivales), `leagueTiers`, `regions` y `role` (revisado en el código de coachless.gg). Los aliados se leen (`ctx.allies`) pero no influyen en la recomendación.
- Rival: el del mismo puesto si el LCU informa `assignedPosition`; si no, se deduce entre los rivales revelados el que tiene tu rol principal (`GetRecommendedBuilds` con role 5, solo premium); y se puede **elegir a mano en el panel** (fila «Rival (matchup)»; clic en el elegido vuelve al automático). Los rivales se actualizan solos al revelarse.
- ❓ Si el panel no aparecía en la prueba: ahora se registra `panel oculto (…)` con la causa (desactivado en el menú, cerrado con ×); revisar también `easyCoachless.state()`.

## Qué debe probar el usuario en el cliente real (no se puede probar fuera de él)
0. **Funciones nuevas:** (a) clic en una runa clave alternativa → la página cambia y el panel se atenúa un instante; (b) 📌 y empezar otra selección con el mismo campeón/rol; (c) icono de enlace → ¿se abre el navegador con la build correcta? (logs `[easy-coachless]` si no); (d) en ARAM/Arena/jungla, ¿los hechizos cuadran? (`easyCoachless.state().context.mode` dice qué modo detectó); (e) botón ES/EN en Ajustes → Más.
1. Reiniciar el cliente. En DevTools filtrar por `[easy-coachless]`: debe verse «plugin cargado», «acceso a la API: OK», «listo…». Activar `easyCoachless.debug(true)` para más detalle.
2. Botón **EC** abajo a la izquierda y **Ctrl+Shift+E** (z-index, que el cliente no se lo coma).
3. **Menú → Ver runas de un matchup** (p. ej. Kai'Sa, rol adc, rango esmeralda): el panel debe mostrar runas con **iconos** (si salen cuadros con texto, `iconPath` del LCU no carga como `<img src>`; avisar) y nombres en el idioma del cliente (tooltip).
4. **Champion Select real** (normal/ranked/ARAM): ¿aparece el panel? Los logs `contexto: {…}` dicen qué detectó (campeón, rol, rival, `lobbyTier`). Si no aparece: `easyCoachless.state()`.
   - Endpoints del LCU usados (no oficiales, ❓ sin verificar en el cliente): `/lol-gameflow/v1/gameflow-phase`, `/lol-champ-select/v1/session`, `/lol-ranked/v1/ranked-stats/{puuid}`, `/lol-perks/v1/perks|styles`, `/lol-game-data/assets/v1/summoner-spells.json|champion-summary.json`.
   - ¿`myTeam[].puuid` existe? Si no, no habrá rango de lobby (se usan los rangos por defecto Esmeralda+).
   - ¿`theirTeam[].assignedPosition` viene informado en ranked? Si no, no hay rival automático (el matchup solo funcionaría en la simulación).
5. `restartClient()` desde el diálogo de CORS (ya existía) y que el panel sobreviva a un cambio de pantalla del cliente (se re-engancha cada 5 s).
6. Con premium (cuenta de pruebas): ver que aparece «matchup» en el pie del panel (si el matchup tiene < 3000 partidas saldrá el aviso de pocas partidas).

## Contraste con cuenta premium (hecho el 2026-11-05, `dev/api-probes/test-coachless-premium.mjs`)
- ✅ Premium envía `patchAdditions: 1` y matchup sin 403; sin señales de 429 con ~100 peticiones.
- ✅ El matchup cambia los datos de verdad (Kai'Sa: sin matchup 1,71 M partidas; vs Jinx 146 k, vs Ezreal 139 k, vs Caitlyn 134 k, vs Draven 31 k, vs Zed 1 039). Con ~1 000 partidas las filas quedan con 100–300 partidas por opción (ruido) → `MIN_MATCHUP_SAMPLE` subido de 300 a 3000 (por debajo se usa el campeón sin rival y se avisa).
- ✅ La fila 2 de Dominación **sí trae datos con premium** (con la gratuita sale vacía): la hipótesis de «runas sin registrar» era falsa; causa real desconocida (¿solo existe en el rango de parches?). Con cuenta gratuita el secundario Dominación pierde una fila de candidatos.
- ⚠ Latencia con premium: 2,0–3,1 s por recomendación sin caché (con la gratuita 0,4–0,6 s). El panel muestra «Consultando…»; si molesta, reducir peticiones (p. ej. no pedir los 4 árboles candidatos si el keystone ya implica uno).
- ❓ Escala de `wpaOverall` sigue sin aclarar (keystone más usado: 0,166).

## Hallazgos clave (detalle en los docs)
- CORS: la API solo admite `Origin: https://coachless.gg` → `DisableWebSecurity=1` en `C:\Program Files\Pengu Loader\config` + reinicio (el plugin no puede escribir ahí; guía al usuario).
- `Auth/login` devuelve HTTP 200 siempre: mirar `actionResult` (0 = OK). Access JWT 24 h, refresh 30 d deslizante; solo se guarda el refresh en DataStore.
- Premium = claim `isSubscribed === "1"`. Solo premium: `patchAdditions ≥ 1` y `matchupChampionIds` (403 en gratuita; 403 ≠ error de sesión → reintentar con `patchAdditions: 0`).
- `GetRecommendedBuilds` **ignora** el matchup (de ahí solo salen los fragmentos); `GetKeystoneData`, `GetGlobalSummonerSpellStatistics` y `GetRunesForKeystoneAndTree` sí lo usan.
- `GetRunesForKeystoneAndTree`: `mainTree`/`treeToLoad` = ids Riot numéricos; devuelve las filas del árbol `treeToLoad`; `keystone` filtra ambos árboles; `keystoneId` se ignora.
- `leagueTiers` 0–2 devuelven vacío → mínimo 3 (Gold). El parche más nuevo tiene muy poca muestra (16.22: 3,6 %) → `choosePatch`.
- Elegir el secundario solo por WPA da resultados absurdos (muestras de cientos de partidas): hay que ponderar por uso del árbol (hecho, ≥ 10 %). Con ~7 000 partidas el error típico del WPA es ±0,6: por eso las opciones necesitan ≥ 10 % de su grupo.
- Fila 2 de Dominación vacía con la cuenta gratuita, con datos con premium (causa desconocida).

## Pendiente
1. Probar en el cliente real (lista de arriba) y corregir lo que falle (iconos, detección de rival/rango, posición del panel).
2. (Hecho) Script premium ejecutado; ver sección de contraste.
3. Aclarar la escala de `wpaOverall` en `GetRunesForKeystoneAndTree` (¿puntos porcentuales? el panel lo muestra como «+1.1» sin unidad).
4. Si el cliente real no informa el rival/rango en algún modo, añadir selección manual de rival desde el panel.
5. **Aplicar** runas/hechizos: implementado (ver sección arriba) pero sin probar en el cliente real; el usuario debe validar las políticas de Riot/Pengu antes de distribuirlo. Posibles ampliaciones: inyectar el botón en la pantalla de Runas del cliente, aplicar al bloquear campeón (solo con opción explícita).
6. **Antes de distribuir públicamente:** revisar los términos de uso de Coachless y el registro en el Developer Portal de Riot; excluir `dev/` de la release; revisar que el panel cumple las políticas de overlays; probar versiones de Pengu distintas de 1.1.6.
6b. Sugerencia de pick por matchup: bloqueada hasta conocer un endpoint de counters (ver «Funciones de valor añadido»). Siguientes ideas del listado: caché persistente con «usar la última si Coachless falla», backoff ante 429/5xx, autodiagnóstico de endpoints del LCU y botón «copiar diagnóstico».
7. Desconocidos: comportamiento de una suscripción cancelada en el claim, otros `actionResult` (captcha/2FA), límites de uso, significado de `leagueTiers: 8`, roles de campeones multi-rol, ids de regiones (solo Korea = 4).
8. Si se añade tooling (Vitest en `tests/`), migrar las pruebas de `dev/tests/` (ya son `node:test`, portables).

## Convenciones
- Sin `innerHTML`; contraseña nunca guardada; no imprimir tokens; scripts de prueba piden credenciales por prompt (en PowerShell, comillas simples si van en variables).
- Cuentas de pruebas desechables (premium y gratuita) autorizadas por el usuario; nunca otras.
- Aviso: `device_commit_files` dejó varias veces una versión anterior del archivo en la carpeta del usuario; tras escribir hay que volver a listar y comparar el tamaño en bytes (ya se detectó y corrigió una vez más el 2026-11-05).
