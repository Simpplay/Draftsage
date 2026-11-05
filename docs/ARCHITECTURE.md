# Arquitectura

Módulos ES (JavaScript plano, sin bundler ni dependencias) cargados por Pengu Loader 1.1.6 desde `index.js`.
Capas con dependencias hacia dentro: `presentation → application → domain`; `infrastructure` implementa lo que
`application` necesita. `application/app.js` es el único sitio que conecta las piezas (composición).

```
easy-coachless/
├── index.js                         Entrada de Pengu: solo exporta load() y delega en bootstrap
├── src/
│   ├── domain/                      Reglas puras (sin DOM, sin fetch, sin Pengu): se prueban con node --test
│   │   ├── match-context.js         Tipos: MatchContext, MatchContextProvider, AuthState (JSDoc)
│   │   ├── lobby.js                 Roles (LCU → Coachless), rangos (media de la lobby, mínimo Gold), parseRole/parseTier
│   │   ├── patch.js                 choosePatch: último parche con muestra suficiente
│   │   ├── runes.js                 Árboles y keystones (ids Riot) y keystone → árbol
│   │   ├── selection.js             Qué runa/hechizo/árbol secundario elegir (umbral de muestra, WPA)
│   │   └── configuration.js         Recomendación → página de runas (9 ids) y pareja de hechizos; nombre «[EC] …»
│   ├── application/                 Casos de uso y flujos
│   │   ├── bootstrap.js             Arranque: acceso API → panel → sesión → vigilar Champion Select
│   │   ├── app.js                   Composición: cliente, cachés, proveedor LCU, controlador
│   │   ├── recommendation.js        Caso de uso: contexto → página de runas + hechizos (reglas premium/403/matchup)
│   │   ├── champ-select.js          Controlador: proveedor → recomendación → estado para la UI (cancelación, debounce)
│   │   ├── configuration.js         ConfigurationApplier: aplicar runas/hechizos (canApply desactivado de inicio)
│   │   ├── catalog.js               Nombres e iconos de campeones/runas/hechizos (fachada de lcu/game-data)
│   │   ├── preferences.js           Ajustes de interfaz (DataStore): panel visible, plegado, posición
│   │   ├── ensure-api-access.js     Comprueba CORS y avisa al usuario
│   │   └── session.js               Fachada de sesión (login/logout/api/apiGet/premium)
│   ├── infrastructure/              Detalles externos
│   │   ├── coachless/auth.js        Login, refresh, api()/apiGet() contra api.coachless.gg (con tiempo máximo)
│   │   ├── coachless/client.js      Endpoints de datos normalizados (wpa, occurrence) con caché
│   │   ├── coachless/cache.js       Caché en memoria con caducidad y peticiones compartidas
│   │   ├── lcu/lcu-client.js        GET al LCU desde el cliente (nunca lanza)
│   │   ├── lcu/champ-select-provider.js   MatchContextProvider por sondeo (fase, sesión, rangos del equipo)
│   │   ├── lcu/loadout-gateway.js   ÚNICO escritor del LCU: páginas de runas y hechizos (solo desde ConfigurationApplier)
│   │   ├── lcu/game-data.js        Nombres/iconos del cliente y keystone → árbol
│   │   └── pengu/api-probe.js       Sonda de CORS
│   ├── presentation/                Interfaz (solo DOM con h(); sin fetch)
│   │   ├── ui.js                    Motor DOM (diálogos, formularios, menús, toasts)
│   │   ├── menus.js                 Pantallas: CORS, login, simular matchup, aviso de Aplicar; mainMenu → settings.js
│   │   ├── settings.js              Ajustes gráficos: Aplicar, destino de runas, tecla de Destello; lo raro, plegado en «Más»
│   │   ├── icons.js                 Iconos SVG de trazo (createElementNS, sin innerHTML)
│   │   └── panel.js                 Panel flotante en Champion Select + botón EC + atajo Ctrl+Shift+E
│   └── shared/logger.js             Logger transversal con prefijo [easy-coachless]
├── dev/                             NO se distribuye
│   ├── api-probes/                  Scripts Node que sondean la API real (piden credenciales por prompt)
│   ├── tests/                       node dev/tests/run.mjs  (node:test, sin dependencias) + ui/ (Playwright, opcional)
│   └── tools/check.mjs              node --check + imports relativos + reglas del proyecto
└── docs/                            HANDOFF, coachless-api, coachless-auth, este archivo
```

## Flujo (prototipo vertical)
`LCU (sondeo) → MatchContextProvider → ChampSelectController → RecommendationService → CoachlessClient (+caché) → panel`

1. `champ-select-provider` sondea `gameflow-phase` y, en `ChampSelect`, la sesión: campeón (elegido, en hover o intención),
   rol (`assignedPosition`), rival (mismo puesto en el equipo contrario) y rango de la lobby (media de los rangos de tu equipo).
2. El controlador espera 350 ms (debounce), cancela la consulta anterior y llama al servicio.
3. El servicio elige parche (`GetPatches`), rangos (lobby ±1, mínimo Gold) y filtros según la cuenta; consulta keystones,
   hechizos y builds (tanda 1) y después las filas de runas del árbol principal y de los 4 candidatos a secundario más el 2.º hechizo (tanda 2).
4. Lo elegido (`domain/selection.js`) se entrega al panel con `meta` (parche, rangos, muestra, avisos).

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
  (ajuste en DataStore `easy-coachless/apply`, también en el menú). Nunca hay aplicación automática. Por defecto solo se sobrescribe la página propia
  «[EC] …»; «reemplazar la página activa» es opcional. Nunca se envía una página incompleta. El riesgo con las políticas de Riot/Pengu
  sigue abierto: el usuario debe validarlas antes de distribuir.
- Pengu solo carga `index.js` de la carpeta del plugin: los subdirectorios no se ejecutan por sí solos.
