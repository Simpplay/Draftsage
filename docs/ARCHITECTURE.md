# Arquitectura

Módulos ES (JavaScript plano, sin bundler) cargados por Pengu Loader 1.1.6 desde `index.js`.
Capas con dependencias hacia dentro: `presentation → application → domain`; `infrastructure` implementa lo que
`application` necesita.

```
easy-coachless/
├── index.js                      Entrada de Pengu: solo exporta load() y delega en bootstrap
├── src/
│   ├── domain/                   Tipos y reglas puras (sin DOM, sin fetch, sin Pengu)
│   │   └── match-context.js      MatchContext, RecommendationKey, AuthState (JSDoc)
│   ├── application/              Casos de uso y flujos
│   │   ├── bootstrap.js          Arranque: acceso API → sesión → login
│   │   ├── ensure-api-access.js  Comprueba CORS y avisa al usuario
│   │   └── session.js            Fachada de sesión (login/logout/api/premium)
│   ├── infrastructure/           Detalles externos
│   │   ├── coachless/auth.js     Login, refresh, api() contra api.coachless.gg
│   │   └── pengu/api-probe.js    Sonda de CORS
│   ├── presentation/             Interfaz
│   │   ├── ui.js                 Motor DOM (diálogos, formularios, menús, toasts)
│   │   └── menus.js              Pantallas concretas (CORS, login, menú principal)
│   └── shared/logger.js          Logger transversal con prefijo [easy-coachless]
├── dev/api-probes/               Scripts Node que sondean la API real (NO distribuir)
└── docs/                         HANDOFF, coachless-api, coachless-auth, este archivo
```

## Dónde irá lo pendiente (ver HANDOFF.md)
| Pendiente | Ubicación prevista |
|---|---|
| Cliente HTTP de datos (runas, hechizos, parches) y caché | `infrastructure/coachless/` (`client.js`, `cache.js`) |
| Elección de parche, clamp de rango ≥ 3, reintento 403 | `application/` (`get-recommendation.js`) |
| Detección de Champion Select (socket/LCU) | `infrastructure/lcu/` + puerto `MatchContextProvider` |
| Mostrar runas y hechizos | `presentation/` |
| Aplicar configuración (LCU) | `infrastructure/lcu/` tras validar políticas de Riot/Pengu |

## Decisiones y desviaciones respecto a la propuesta inicial
- **JavaScript, no TypeScript/Vite**: el proyecto se edita directamente dentro de `plugins/` y Pengu 1.1.6 carga módulos ES
  tal cual. Se podrá añadir un build más adelante sin cambiar la estructura de `src/`.
- **Logger en `shared/`** (no en infrastructure): lo usan todas las capas.
- **`application` importa `presentation`** en `ensure-api-access.js` y `bootstrap.js`, porque esos flujos abren diálogos.
  Si crece, extraer un puerto `Prompter`.
- Directorios de la propuesta sin contenido todavía (`use-cases/`, `lcu/`, `storage/`, `tests/`) no se crean hasta que
  haya código; git no versiona carpetas vacías.
- Pengu solo carga `index.js` de la carpeta del plugin: los subdirectorios no se ejecutan por sí solos.
