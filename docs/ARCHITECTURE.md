# Arquitectura

Módulos ES (JavaScript plano, sin bundler ni dependencias) cargados por Pengu Loader 1.1.6 desde `index.js`.
Capas con dependencias hacia dentro: `presentation → application → domain`; `infrastructure` implementa lo que
`application` necesita. `application/app.js` es el único sitio que conecta las piezas (composición).

```
draftsage/
├── index.js                         Entrada de Pengu: solo exporta load() y delega en el loader (application/loader.js)
├── .github/workflows/release.yml   Al subir una etiqueta vX.Y.Z crea el Release de GitHub con el .zip (no firma, no usa secretos)
├── dist/                            app.js + manifest.json firmados (los genera dev/tools/release.mjs; los sirve jsDelivr)
├── src/
│   ├── domain/                      Reglas puras (sin DOM, sin fetch, sin Pengu): se prueban con node --test
│   │   ├── match-context.js         Tipos: MatchContext, MatchContextProvider, AuthState (JSDoc)
│   │   ├── lobby.js                 Roles (LCU → Coachless), rangos (media de la lobby, mínimo Gold), parseRole/parseTier
│   │   ├── patch.js                 choosePatch: último parche con muestra suficiente
│   │   ├── filters.js               Filtros elegidos por el usuario: rango de Elo y de parches (normalizar, resolver, alternar)
│   │   ├── runes.js                 Árboles y keystones (ids Riot) y keystone → árbol
│   │   ├── selection.js             Qué runa/hechizo/árbol secundario elegir (umbral de muestra, WPA) y ranking para alternativas
│   │   ├── spells.js                Hechizos válidos según modo de juego y rol (Aplastar en jungla, ARAM, Arena…)
│   │   ├── items.js                 Ítems de una build: elegir build por runa clave, plan (inicio, núcleo, botas, siguientes…) y maquetación sin repetidos
│   │   ├── live.js                  Partida en vivo: ítems que tienes, siguiente por comprar y coste restante; contexto desde allgamedata
│   │   ├── confidence.js            Nivel de fiabilidad según las partidas y datos escasos
│   │   ├── web.js                   Enlaces a coachless.gg y lolalytics.com (campeón, rol, rival) y slug del campeón
│   │   ├── sources.js               Fuentes de datos (coachless | lolalytics | auto): modo, orden y si exige sesión
│   │   ├── lolalytics.js            Raíz de Lolalytics → Recommendation (validar, rango→tier, runas, hechizos, ítems)
│   │   ├── overlay-stats.js         Win rate por campeón, rival deducido y mejores counters (reglas puras)
│   │   ├── update.js                Actualizaciones (puro): versiones x.y.z, URLs de jsDelivr, sobre firmado, validación del manifiesto, decideUpdate
│   │   └── configuration.js         Recomendación → página de runas (9 ids) y pareja de hechizos; nombre «[DS] …»
│   ├── application/                 Casos de uso y flujos
│   │   ├── loader.js                LOADER: elige código incluido o versión firmada descargada y lo arranca; busca actualizaciones en segundo plano
│   │   ├── updater.js               Descargar/verificar/guardar versiones firmadas y recuperar la guardada (re-verificada); todo por inyección
│   │   ├── update-prefs.js          Ajuste «actualizaciones» (auto | packaged) y última versión avisada (DataStore, sin dependencias pesadas)
│   │   ├── bootstrap.js             Arranque: acceso API → panel → sesión → vigilar Champion Select (+ avisos de actualización)
│   │   ├── app.js                   Composición: cliente, cachés, proveedor LCU, controlador
│   │   ├── recommendation.js        Caso de uso: contexto → página de runas + hechizos (reglas premium/403/matchup)
│   │   ├── sources.js               Router de fuentes: prueba en orden, etiqueta meta.source y avisa del fallback
│   │   ├── lolalytics-source.js     Fuente Lolalytics con la firma del servicio de Coachless
│   │   ├── overlay.js               Estadísticas de selección: createChampionStats + createOverlayController
│   │   ├── champ-select.js          Controlador: proveedor → recomendación → estado para la UI (cancelación, debounce)
│   │   ├── live-game.js             Sondeo de la partida (oro e ítems) solo mientras hay partida
│   │   ├── configuration.js         ConfigurationApplier: aplicar runas/hechizos (canApply desactivado de inicio)
│   │   ├── catalog.js               Nombres e iconos de campeones/runas/hechizos (fachada de lcu/game-data)
│   │   ├── preferences.js           Ajustes de interfaz (DataStore): panel, idioma, aplicar, filtros de parches/Elo y elecciones fijadas (pins)
│   │   ├── ensure-api-access.js     Comprueba CORS y avisa al usuario
│   │   └── session.js               Fachada de sesión (login/logout/api/apiGet/premium)
│   ├── infrastructure/              Detalles externos
│   │   ├── coachless/auth.js        Login, refresh, api()/apiGet() contra api.coachless.gg (con tiempo máximo)
│   │   ├── coachless/client.js      Endpoints de datos normalizados (wpa, occurrence) con caché
│   │   ├── lolalytics/qwik.js       Decodifica el estado Qwik del HTML (raíz por clave, mapa id→slug, lista de tier)
│   │   ├── lolalytics/client.js     Páginas de Lolalytics con caché, timeout y backoff; nunca lanza
│   │   ├── coachless/cache.js       Caché en memoria con caducidad y peticiones compartidas
│   │   ├── liveclient/live-client.js  Live Client Data API (127.0.0.1:2999, allgamedata): una foto de la partida; nunca lanza
│   │   ├── lcu/lcu-client.js        GET al LCU desde el cliente (nunca lanza)
│   │   ├── lcu/champ-select-provider.js   MatchContextProvider por sondeo (fase, sesión, rangos del equipo; en partida repite el último contexto con phase 'game')
│   │   ├── lcu/loadout-gateway.js   ÚNICO escritor del LCU: páginas de runas y hechizos (solo desde ConfigurationApplier)
│   │   ├── lcu/game-data.js        Nombres/iconos del cliente (runas, hechizos, campeones, ítems) y keystone → árbol
│   │   ├── update/config.js         Repositorio, LOADER_API y claves PÚBLICAS de firma (parte del loader)
│   │   ├── update/crypto.js         SHA-256 y verificación ECDSA P-256 con WebCrypto (igual en cliente y en Node)
│   │   ├── update/store.js          Almacén IndexedDB de la versión descargada (no es de confianza; nunca lanza)
│   │   ├── update/remote.js         Descarga con timeout y tope de tamaño; ejecutar un módulo desde texto (Blob)
│   │   └── pengu/api-probe.js       Sonda de CORS
│   ├── presentation/                Interfaz (solo DOM con h(); sin fetch)
│   │   ├── ui.js                    Motor DOM (diálogos, formularios, menús, toasts)
│   │   ├── menus.js                 Pantallas: CORS, login, simular matchup, aviso de Aplicar; mainMenu → settings.js
│   │   ├── settings.js              Ajustes gráficos: Aplicar, destino de runas, tecla de Destello; lo raro, plegado en «Más»
│   │   ├── icons.js                 Iconos SVG de trazo (createElementNS, sin innerHTML)
│   │   ├── overlay.js               Capa de etiquetas (win rate/counters) sobre las fichas nativas (`.grid-champion[data-id]`); sin fetch
│   │   ├── native.js                Interfaz INTEGRADA en Champion Select: botón de runas en la barra de loadout, tira de picks en la cabecera de la cuadrícula, botón DS; reconcilia con el DOM del cliente (docs/champ-select-dom.md)
│   │   └── panel.js                 Panel: flotante (respaldo/simulación/partida) o popover anclado a native.js; atajo Ctrl+Shift+E
│   └── shared/                      logger.js (prefijo [draftsage]) · i18n.js + strings.js (textos es/en, t('clave')) · version.js (la reescribe release.mjs)
├── dev/                             NO se distribuye
│   ├── api-probes/                  Scripts Node que sondean la API real (piden credenciales por prompt)
│   ├── tests/                       node dev/tests/run.mjs  (node:test, sin dependencias) + ui/ (Playwright, opcional)
│   ├── tools/check.mjs              node --check + imports relativos + reglas del proyecto
│   ├── tools/keygen.mjs             Crea el par de claves de firma (privada fuera del repo) y registra la pública en el loader
│   ├── tools/release.mjs            Empaqueta con esbuild, firma y se autoverifica → dist/ (ver docs/RELEASING.md)
│   ├── tools/package.mjs            Crea el .zip de distribución (git archive) tras verificar etiqueta, firma, hash y que no haya claves
│   └── package.json                 Única dependencia: esbuild (solo desarrollo)
└── docs/                            HANDOFF, coachless-api, coachless-auth, lolalytics (análisis y estado de la 2.ª fuente), champ-select-dom (anclas del DOM del cliente), este archivo
```

## Flujo (prototipo vertical)
`LCU (sondeo) → MatchContextProvider → ChampSelectController → SourceRouter → {RecommendationService → CoachlessClient | LolalyticsSource → LolalyticsClient} (+caché) → panel`
En paralelo: `ChampSelectController → OverlayController → ChampionStats → LolalyticsClient → presentation/overlay.js (etiquetas) y panel (counters)`.
Interfaz integrada: `mountPanel()` devuelve un manejador (`setDocked/open/toggle/apply/status/subscribe`) que usa `presentation/native.js`; native no habla con application salvo leyendo los mismos controladores que el panel. Sin anclas reconocibles → panel flotante.

1. `champ-select-provider` sondea `gameflow-phase` y, en `ChampSelect`, la sesión: campeón (elegido, en hover o intención),
   rol (`assignedPosition`), rival (mismo puesto en el equipo contrario) y rango de la lobby (media de los rangos de tu equipo).
2. El controlador espera 350 ms (debounce), cancela la consulta anterior y llama al servicio.
3. El servicio elige parche (`GetPatches`), rangos (lobby ±1, mínimo Gold) y filtros según la cuenta; consulta keystones,
   hechizos y builds (tanda 1) y después las filas de runas del árbol principal y de los 4 candidatos a secundario más el 2.º hechizo (tanda 2).
4. Lo elegido (`domain/selection.js`) se entrega al panel con `meta` (parche, rangos, muestra, avisos).

## Consejero de picks (añadido 2026-11-05)
`ChampSelectController → PickAdvisorController → PickAdvisor → {IteroClient (POST draft-picks, caché, backoff), EnglishNames (Data Dragon), LolalyticsClient/ChampionStats (matchup y cuota de línea)} → domain/pick-advice.js → panel (bloque superior)`.
Desactivado por defecto (aviso de consentimiento); solo muestra. Si iTero falla, el estado es `error` con la razón y el resto del plugin no se ve afectado. Dominio: `domain/itero.js` (petición/normalización) y `domain/pick-advice.js` (líneas, mezcla, chips).

## Roles de rivales, maestría y filtros (añadido 2026-11-06)
- `domain/enemy-roles.js` (puro: elecciones manuales y resolución de líneas) ← `application/enemy-roles.js` (controlador; completa con cuotas de línea de Lolalytics) ← `champ-select.js` (`setEnemyRole`, mapa `enemyManual`).
- `infrastructure/lcu/identity.js` (Riot ID del LCU, en memoria) → `application/mastery.js` (`POST basic-info` vía `IteroClient.basicInfo`, caché) → `pick-advisor.js` (`masteryData` y peso en la petición).
- `domain/pick-filters.js` + `application/pick-filters.js`: reúnen clase (LCU), maestría, estadísticas de Lolalytics y filas del consejero; alimentan la cuadrícula (velo) y las dos listas del panel (`matchupPicks()`, `draftPicks()`). No hacen peticiones.

## Partida (añadido 2026-11-05)
El proveedor recuerda el último contexto de Champion Select con campeón y, en las fases `GameStart`/`InProgress`/`Reconnect`, lo devuelve con `phase: 'game'`.
El controlador no vuelve a consultar al empezar la partida: conserva `state.data` (una partida larga no debe depender de la red) y el panel pasa a «modo partida»
(ítems grandes y completos, solo lectura). Al salir de la partida el contexto vuelve a ser `null` (idle). Los ítems salen de `GetRecommendedBuilds` (ya pedida) más
dos peticiones de `GetGlobalItemStatistics` que pueden fallar sin afectar al resto (`application/recommendation.js`, `domain/items.js`).

### Seguimiento y recuperación (Live Client Data API)
`app.js` arranca `live-game` cuando el contexto es `phase:'game'` y lo para al salir. El panel se suscribe y pinta ✓/barra/oro con `domain/live.js`.
Si el plugin arranca en plena partida sin selección previa, el proveedor llama a `recoverGameContext` (glue en `app.js`: `allgamedata` → `contextFromSnapshot` → campeón por alias/nombre en el catálogo) y lo recuerda; si aún no responde (pantalla de carga) reintenta en el siguiente sondeo. Presentación no hace `fetch`.

## Reglas de dependencia comprobadas
`dev/tools/check.mjs` falla si `src/` importa de `dev/`, usa `innerHTML` o `console.*` fuera del logger, o si algún import relativo no resuelve.

## Decisiones y desviaciones respecto a la propuesta inicial
- **JavaScript, no TypeScript/Vite**: el proyecto se edita directamente dentro de `plugins/` y Pengu 1.1.6 carga módulos ES tal cual.
- **Sondeo en vez de socket** para el Champion Select: en Pengu 1.1.6 no hay un socket documentado para plugins; el proveedor está tras
  `MatchContextProvider`, así que cambiarlo no afecta al resto.
- **Logger en `shared/`**: lo usan todas las capas.
- **`application` importa `presentation`** en `ensure-api-access.js` y `bootstrap.js` (abren diálogos). Si crece, extraer un puerto `Prompter`.
- **`presentation` importa `application/app.js`** (menús y panel leen el controlador); el panel nunca hace `fetch`.
- **Pruebas sin dependencias**: `node:test` (integrado en Node) en lugar de Vitest, hasta que se apruebe añadir tooling.
- **Aplicar (añadido 2026-11-05)**: `ConfigurationApplier` (`application/configuration.js`) escribe runas/hechizos por LCU solo tras un clic del usuario
  (o Ctrl+Shift+A). `canApply()` está desactivado de inicio: el primer clic muestra un aviso de políticas de Riot/Pengu y, si se acepta, lo activa
  (ajuste en DataStore `draftsage/apply`, también en el menú). Nunca hay aplicación automática. Por defecto solo se sobrescribe la página propia
  «[DS] …»; «reemplazar la página activa» es opcional. Nunca se envía una página incompleta. El riesgo con las políticas de Riot/Pengu
  sigue abierto: el usuario debe validarlas antes de distribuir.
- **Elecciones del usuario (añadido 2026-11-05)**: el contexto (`MatchContext`) puede llevar `keystoneOverride`, `spellOverride` y `mode`. El controlador
  los compone (elección de la selección > fijado en `pins` > automático) y el servicio los valida; una elección inválida o sin datos se ignora. La clave de
  caché del resultado incluye reglas de hechizos y elecciones. El controlador conserva la recomendación anterior (`state.stale`) mientras llega la nueva.
- **Idiomas**: `shared/i18n.js` (`t`) con diccionarios `es`/`en` en `shared/strings.js`; solo la presentación y los diálogos usan `t`. El dominio no depende del idioma
  (`tiersLabel` acepta nombres traducidos). Los logs y comentarios siguen en español.
- Pengu solo carga `index.js` de la carpeta del plugin: los subdirectorios no se ejecutan por sí solos.

## Actualizaciones firmadas (añadido 2026-11-06)
Objetivo: publicar cambios desde GitHub sin que los usuarios reinstalen. Detalle operativo en `docs/RELEASING.md`.
- **Dos mitades**: el **loader** (`index.js`, `application/loader.js`, `updater.js`, `update-prefs.js`, `infrastructure/update/*`, `domain/update.js`, `shared/version.js`/`logger.js`) está en el equipo del usuario y casi no cambia; **todo lo demás** (`bootstrap.js` y lo que cuelga de él) viaja en un solo archivo, `dist/app.js`, que el loader puede sustituir por una versión descargada.
- **Por qué un solo archivo**: los módulos ES con imports relativos no se pueden cargar desde `fetch` + Blob sin reescribir imports, y las dependencias circulares (`presentation ↔ application/app.js`) lo rompen. `esbuild` (solo en `dev/`) lo empaqueta al publicar; el runtime sigue sin build.
- **Cadena de confianza**: `dist/manifest.json` = `{ payload, signature }`. `payload` es el texto JSON firmado (versión, `minLoader`, SHA-256 y tamaño de `app.js`); la firma es ECDSA P-256 (WebCrypto, r‖s). El loader trae las claves públicas (varias → rotación). Sin firma válida + hash + tamaño no se ejecuta nada remoto. Quien controle GitHub o jsDelivr pero no la clave privada no puede ejecutar código.
- **Flujo**: arranque → (modo `auto`) ¿hay versión guardada que SIGA verificando? la usa : usa el código incluido → a los 8 s (y cada 6 h) `check()` descarga `manifest.json` de «la última» (jsDelivr), lo verifica, y si es nueva descarga `app.js` de la etiqueta `vX.Y.Z`, lo verifica y lo guarda para el **siguiente** arranque. Se avisa por el evento `draftsage:update` (toast en `bootstrap.js`).
- **Salvaguardas**: lo guardado se re-verifica en cada lectura (el almacén no es de confianza); nunca se baja una versión menor que la guardada ni una que no supere a la incluida (anti-rollback); `minLoader` mayor que `LOADER_API` → no se aplica y se avisa de que hay que reinstalar; si la versión remota falla al cargar se usa la incluida en el momento, y si falla al arrancar se marca defectuosa y el siguiente arranque vuelve a la incluida (sin doble arranque, porque un `start()` a medias deja efectos en el DOM). Sin IndexedDB, sin red o sin claves: se usa el código incluido.
- **Ajustes**: «Actualizaciones: Auto | Solo incluida» (Ajustes → Más); `draftsage.build()` en DevTools muestra versión, origen (`remote`/`packaged`), versión pendiente y si hace falta reinstalar.
- **Qué NO se puede actualizar solo**: el loader (lista de arriba) y las claves públicas. Cambiarlos exige reinstalar y, si cambia su contrato, subir `LOADER_API`.
