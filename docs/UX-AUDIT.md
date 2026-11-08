# Draftsage — Auditoría de UX/UI (Fase 0 del rediseño)

**Fecha:** 2026-11-08 · **Rama:** `claude/ecstatic-meitner-i0e98v` · **Referencia:** `docs/UX-SPEC.md` (especificación v1.0)

Fase 0 de la especificación: conocer el comportamiento actual **antes** de modificarlo. Este documento no cambia código ni el
algoritmo de recomendaciones. Leyenda: ✅ comprobado en el código o en las pruebas · ❓ desconocido / requiere el cliente real · ⚠ hueco
respecto a la especificación.

---

## 0. Estado tras el rediseño (2026-11-08, misma rama)

Hecho después de la auditoría, por fases, sin tocar el loader ni la lógica de recomendación de runas. Decisiones tomadas por defecto (el usuario
pidió seguir sin parar): se adopta la especificación (texto visible); la Fase 4 se limita a los datos que ya existen (opción c del §6.2);
«principal + alternativas» sin pesos (propuesta del §6.3).

| Fase | Qué se hizo | Dónde | Pruebas |
|---|---|---|---|
| Línea base | Corregidas las 2 pruebas desfasadas (modo `auto` por defecto; login opcional) | `dev/tests/lolalytics.test.mjs`, `dev/tests/ui/ui.test.cjs` | unitarias 176/176, ui 120/120 |
| Integridad | Las listas MATCHUP y DRAFT excluyen baneados y campeones ya elegidos por otros (regla 8); la ventaja `edge` se ve bajo cada % | `domain/pick-filters.js: unavailableIds`, `application/pick-filters.js` (`getContext`), `presentation/panel.js` | `draft-summary.test.mjs`, advisor UI |
| 1 · Sistema visual | Tokens comunes (`--ds-*`) en lugar de colores literales en las 5 hojas; foco visible (`:focus-visible`); `prefers-reduced-motion`; nada por debajo de 10 px; piezas compartidas extraídas de `panel.js` | `presentation/theme.js`, `presentation/components/common.js` | todas las suites UI sin cambios de comportamiento |
| 2 · Build | Página de runas legible: cabecera por árbol, nombre y descripción de la runa clave, nombres de las 3 + 2 runas, de los 3 fragmentos y de los hechizos (con tecla); origen de la página (recomendada / elegida por ti con «volver» / fijada) y alcance (contra X / general); leyenda de las alternativas (% = uso, orden por WPA). En partida, resumen de runas en texto | `presentation/components/build.js` (`runePage`, `runeSummary`), `infrastructure/lcu/game-data.js` (`desc` de runas y hechizos) | ui 124/124 |
| 3 · Draft | Recomendación principal + 2–3 alternativas con su porqué; motivos con signo (+/−/·) y evidencia («dato», «modelo», «regla»); confianza separada de la puntuación; perspectivas Auto / Línea / Equipo (se guarda); «Localizar» (no elige); contexto 5 + 5 por línea con el origen de cada línea (tú / cliente / elegida / deducida); la tira de la cabecera sigue la perspectiva y marca la principal | `domain/draft-summary.js`, `domain/team-context.js`, `presentation/components/draft.js`, `presentation/native.js` | `draft-summary.test.mjs` 7/7, advisor UI 47/47 |
| 4 · Composición | Solo con datos reales: sinergia y counter por línea (iTero), escalado, reparto de daño y debilidades como desventajas del candidato («si lo eliges»). **Bloqueado**: frontline, engage, peel, amenazas del rival… (ninguna fuente actual los da; ver §3) | motivos de `domain/draft-summary.js` | — |
| 5 · Ajustes | Cinco categorías (General, Datos, Consejero, Aplicación, Avanzado plegado) con descripción breve visible por categoría y por control clave; atajos documentados en la propia pantalla; consentimientos intactos | `presentation/settings.js` | ui 124/124 |
| 6 · Validación | **Pendiente del usuario**: requiere el cliente real (lista en `docs/HANDOFF.md`) | — | — |

Lo que sigue sin hacer de la especificación: nombres visibles de los ítems (siguen en tooltip y `aria-label`), alternativas de runas menores, de
árbol secundario y de fragmentos (la fuente no las ofrece de forma directa), «elecciones seguras» (§2.7, falta definir la métrica con datos),
tiempo restante del turno y campeones no poseídos (❓ LCU), análisis de amenazas del rival (sin fuente), pruebas con jugadores (§17.1).

---

## 1. Línea base de pruebas (2026-11-08, sin cambios de código)

| Suite | Resultado | Nota |
|---|---|---|
| `node dev/tests/run.mjs` (unitarias, `node:test`) | 175 / 176 | ⚠ falla `dominio: fuentes y orden` (`dev/tests/lolalytics.test.mjs:35`): espera que un modo inválido se normalice a `coachless`, pero desde que el modo por defecto es `auto` (`src/domain/sources.js`, `DEFAULT_SOURCE_MODE`) devuelve `auto`. **La prueba está desfasada; el código es el comportamiento deseado.** |
| `node dev/tools/check.mjs` | 70 archivos, 0 problemas | sintaxis, imports relativos, reglas del proyecto |
| `dev/tests/ui/native.test.cjs` | 45 / 45 | DOM real recortado |
| `dev/tests/ui/advisor.test.cjs` | 35 / 35 | |
| `dev/tests/ui/overlay.test.cjs` | 14 / 14 | |
| `dev/tests/ui/ui.test.cjs` | ⚠ 1 / 2 y se aborta | Espera que sin sesión se abra el login (`.ec-modal`) al arrancar; con la fuente `auto` iniciar sesión es opcional y ya no se abre. **Prueba desfasada**: el resto de sus ~112 comprobaciones no se ejecutan, así que hoy no protegen el panel flotante. |

**Consecuencia para el rediseño:** antes de la Fase 1 hay que actualizar ambas pruebas (sin tocar el código), porque `ui.test.cjs` es la
red de seguridad principal de `panel.js`.

No hay capturas del cliente real ni medidas de rendimiento en el cliente: ❓ las tiene que aportar el usuario (ver §8).

---

## 2. Mapa de componentes (presentation/)

| Archivo | Líneas | Qué contiene hoy | Piezas (funciones) |
|---|---:|---|---|
| `panel.js` | 923 | Panel flotante o popover anclado: cabecera, runas, hechizos, ítems, aplicar, avisos, fiabilidad, picks (matchup + draft), filtros, rivales | `runesBlock`, `keystoneAlts`, `spellAlts`, `itemsBlock`/`itemRow`/`itemCell`, `applyBlock`, `tagsBlock`, `confidenceTag`, `titleNode`, `rivalsBlock`, `advisorBlock`, `reasonChip`, `pickTip`, `matchupBlock`, `filtersBlock`, `skeleton`, `bodyOf`, `mountPanel` |
| `native.js` | 307 | Integración en el DOM del cliente: botón de runa clave + ⚡ en la barra de loadout, tira de 5 picks en la cabecera de la cuadrícula, botón DS fijo | `findAnchors`, `probeNative`, `flashTile`, `picksModel`, `mountNative` |
| `overlay.js` | 178 | Etiquetas de win rate / counter sobre las fichas `.grid-champion[data-id]` | `findGrid`, `nativeTiles`, `badgeOf`, `mountOverlay` |
| `settings.js` | 248 | Ajustes gráficos: Aplicar, destino, Destello, fuente, Elo, parches, regiones, consejero, maestría; lo raro plegado en «Más» | `openSettings` |
| `menus.js` | 204 | CORS, login, simulación, avisos de consentimiento (Aplicar, consejero, maestría) | `corsSetupMenu`, `loginMenu`, `simulateMenu`, `enable*Flow`, `mainMenu` |
| `ui.js` | 375 | Motor DOM `h()`, diálogos, formularios, menús, toasts, `richText` | `h`, `openDialog`, `confirm`, `openForm`, `openMenu`, `notify` |
| `icons.js` | — | Iconos SVG de trazo | `icon` |

Correspondencia con los componentes de la especificación (§10.3):

| Componente de la especificación | Existe hoy como | Estado |
|---|---|---|
| ChampionPortrait | `pic()` + clases `ecp-por`/`ecx-*` (en panel.js y native.js por separado) | ⚠ duplicado, sin componente común |
| ChampionRecommendation | retrato + % en `matchupBlock` / `advisorBlock` / `picksModel` | ⚠ no hay «principal + alternativas», son dos listas planas |
| RecommendationReason | `reasonChip` (chips iTero: `syn`, `ctr`, `weak`, `scale`, `dmg`) | parcial: icono + tooltip, sin texto visible ni tipo de evidencia |
| ConfidenceIndicator | `confidenceTag` (3 barras + partidas) para la build | parcial: solo la build; los picks no llevan confianza propia |
| TeamComposition / TeamSlot | `rivalsBlock` (solo rivales, con selector de línea) | ⚠ no hay vista de los 5 + 5 ni del rol inferido frente al confirmado de forma sistemática |
| ThreatSummary / SynergySummary | — | ⚠ no existe |
| MatchupSummary | `matchupBlock` (lista de counters) | parcial |
| RuneTree / RunePage / RuneOption | `runesBlock` (iconos), `keystoneAlts` | parcial: solo hay alternativas de la runa clave |
| SpellSelector | `spellAlts` | ✅ alternativas del hechizo intercambiable; nombre solo en tooltip |
| ShardSelector | 3 iconos en `runesBlock` (panel.js:292) | ⚠ sin nombre visible ni alternativas |
| ItemBuild / ItemRow | `itemsBlock`, `itemRow`, `itemCell` | ✅ inicio, botas, núcleo, siguientes; partida completa |
| FilterChip | `filtersBlock` | ✅ |
| DataSourceLabel | etiquetas en `tagsBlock` (`meta.source`) | parcial |
| StatusIndicator | estados `data-state` en native.js y esqueletos en panel.js | parcial (ver §5) |

`panel.js` concentra casi todas las piezas en un solo archivo de 923 líneas con su CSS embebido: es el primer candidato a dividir en
`presentation/components/` (Fase 1), **sin cambiar comportamiento**.

---

## 3. Mapa de datos (qué llega a la interfaz y de dónde)

| Dato | Origen | Dónde se calcula | Tipo de evidencia (spec §6.5) |
|---|---|---|---|
| Página de runas (runa clave, 3 + 2 runas, árbol secundario, 3 fragmentos), hechizos, ítems | Coachless (o LoLalytics como fuente alternativa) | `application/recommendation.js` → `Recommendation` (`keystone`, `primaryTree`, `primaryPicks[3]`, `secondaryTree`, `secondaryPicks[2]`, `shards[3]`, `spells`, `items`, `alternatives.{keystones,autoKeystone,spells}`, `custom`, `meta.{notices,source,…}`) | **observada** (WPA y ocurrencia) |
| Alternativas de runa clave (% de uso) y de hechizo | Coachless | `rankKeystones`, `rankBest` (`domain/selection.js`) | observada |
| Fiabilidad de la build | partidas totales | `domain/confidence.js` (< 10 k baja · < 50 k media · resto alta; < 500 runa poco fiable) | heurística sobre datos observados |
| Lista de MATCHUP (counters) | LoLalytics (sin cuenta) | `domain/overlay-stats.js` (`matchupsVs`, `topCounters`) + `application/pick-filters.js: matchupPicks()` | observada (`wr`, `edge` = wr − media del candidato, `n`, `low` si < 200) |
| Lista de DRAFT | iTero (opt-in) | `domain/itero.js` (normalización) + `domain/pick-advice.js: rankPicks` (Δ = pred − mediana) | **predicción del modelo**, solo relativa ✅ (nunca se muestra `pred` absoluto) |
| Motivos de un pick de draft | iTero (`syn`/`ctr` por línea, escalado por fase, `adRatio`) | `pick-advice.js: chipsOf` | modelo |
| Acuerdo/discrepancia entre fuentes (✓/⚠) | iTero + LoLalytics | `rankPicks` | heurística |
| Línea de cada rival | LCU → manual → deducida por cuota de línea | `domain/enemy-roles.js`, `pick-advice.js: assignLanes` | dato del cliente / elección del jugador / **inferencia** |
| Maestría | iTero `basic-info` (opt-in) | `application/mastery.js` | observada |
| Clase del campeón (filtros) | catálogo del cliente (`champion-summary.json`) | `catalog` | dato del cliente |
| Oro e ítems en partida | Live Client Data API | `application/live-game.js`, `domain/live.js` | observada |

**Datos que la especificación necesita y hoy NO tiene ninguna fuente** (no se pueden suponer; spec Fase 4 paso 1):
- Características de composición por campeón: frontline, engage, disengage, peel, pick, control de objetivos, prioridad de línea,
  roaming, tipo de daño más allá de `adRatio`. ❓ No hay endpoint conocido en Coachless, LoLalytics ni iTero. Codificarlas a mano sería una
  heurística mantenida por nosotros (y se quedaría obsoleta con cada rework); hay que decidir la fuente antes de la Fase 4.
- Sinergias de LoLalytics (`ep=build-team`, ver `docs/lolalytics-counters-synergy.md`): el endpoint está analizado pero **no integrado**.
- Win rate por fase de partida del matchup (spec §2.1 «ventaja por fase»): ❓ sin fuente para matchups (iTero solo da escalado del candidato).
- Tiempo restante del Champion Select: ❓ `timer` de `/lol-champ-select/v1/session` no se lee ni se ha verificado.
- Campeones que el jugador posee: ❓ no se lee (`/lol-champions/v1/owned-champions-minimal` sin verificar).

---

## 4. Inventario de funcionalidades frente a la especificación

### 4.1. Build (spec §7–8, Fase 2, P0)

| Requisito | Hoy | Hueco |
|---|---|---|
| Las 9 elecciones de runas identificables | ✅ los 9 iconos se pintan | ⚠ el nombre solo está en `title` (spec §7.3 y regla 8 de §18) |
| Fragmentos con nombre y descripción | 3 iconos de 28 px | ⚠ sin nombre visible, sin alternativas |
| Alternativas de runa clave con estadísticas | ✅ % de uso; tooltip con WR/partidas (`statTip`) | ⚠ uso/WR/partidas no visibles a la vez; sin explicación de cada métrica ni del criterio (WPA) |
| Cambiar una runa y volver a la recomendada | ✅ runa clave y hechizos (`custom`, botón `refresh`), y «Fijar» (pin) | ⚠ no hay alternativas de runas menores, árbol secundario ni fragmentos; spec §7.4 distingue automática / temporal / fijada: hoy existen las tres de facto, pero no se rotulan |
| Hechizos con nombre y tecla | ✅ tecla D/F visible; nombre en tooltip | ⚠ nombre no visible |
| Ítems por fases | ✅ inicio, botas, núcleo → siguientes; en partida primera vuelta, alternativas, situacionales, ✓ y barra de oro | nombre solo en tooltip |
| Aplicar explícito y con consentimiento | ✅ `ConfigurationApplier`, desactivado de inicio, clic o Ctrl+Shift+A | — (no tocar) |
| Runas específicas de matchup frente a generales | ✅ con premium y ≥ 3000 partidas; aviso `matchup-low-sample` | se indica con icono; ⚠ no se rotula «específica de matchup» frente a «general» |

### 4.2. Draft (spec §4–6, Fase 3, P0/P1)

| Requisito | Hoy | Hueco |
|---|---|---|
| Recomendación principal + 2–3 alternativas con su porqué | Dos listas independientes de hasta 5 (MATCHUP y DRAFT) | ⚠ no hay principal ni «por qué esta alternativa»; el jugador combina dos listas |
| Modos counter de línea / sinergia / counter de composición / automático | Counter de línea = lista MATCHUP; DRAFT de iTero mezcla sinergia y counter | ⚠ no existen como perspectivas; no hay modo automático que pondere según el contexto |
| No confundir WR alto con ventaja de matchup (spec §2.1) | `edge` se calcula | **Corregido el 2026-11-08 (ver §0):** la lista ordena por win rate **del matchup** (no el general), que es la prioridad 1 de la spec; el hueco real era que `edge` no se veía. Ahora se ve bajo cada % y la recomendación principal distingue «ventaja de matchup» de «fuerza general» |
| Regla 8: no recomendar baneados / no disponibles | ✅ iTero recibe los bans (`pick-advisor.js:74`) | ⚠ **la lista MATCHUP no excluye baneados ni ya elegidos** (ni aliados ni rivales); ❓ campeones no poseídos no se tienen en cuenta en ninguna lista |
| Regla 1–2: `result_pred` nunca absoluto, solo relativo | ✅ Δ frente a la mediana | — |
| Regla 5: posición inferida ≠ confirmada | ✅ se guarda el origen (`rivalSource`, manual/cliente/deducida) | parcial: se distingue en el selector de línea, no en todas las vistas |
| Regla 6: counters con poca muestra | ✅ `low` (< 200) no cuenta como counter; < 30 no se enseña | — |
| Confianza separada de la puntuación (spec §6.4) | Build: sí. Picks: `n` en tooltip | ⚠ los picks no muestran nivel de confianza |
| Motivos con polaridad y evidencia (spec §6.3) | `chipsOf`: `syn`, `ctr`, `weak` (negativo), `scale`, `dmg` | ⚠ sin `evidence`, sin `importance`, sin texto breve visible, sin `tradeoffs`; solo para la lista DRAFT |
| Localizar el campeón sin elegirlo | ✅ `flashTile` desde la tira | — (no tocar) |
| Contexto 5 + 5 | rivales con su línea; aliados solo implícitos | ⚠ falta la vista compacta de los 10 huecos |
| Maestría como factor, no imposición | ✅ opt-in, peso bajo/normal/alto en iTero; filtro de maestría | — |
| Elecciones seguras (spec §2.7) | — | ⚠ no existe; ❓ requiere definir «estabilidad de matchups» con datos (p. ej. dispersión del WR contra la línea rival) |

### 4.3. Composición (spec §5, Fase 4, P1/P2)
Solo existe el chip `dmg` (AD/AP/mixto por `adRatio` del candidato). ⚠ No hay análisis del equipo propio ni del rival, ni comparación
«antes/después de elegir». Bloqueado por la falta de fuente de datos (§3).

### 4.4. Estados (spec §11)

| Estado de la spec | Hoy (`application/champ-select.js` y presentación) |
|---|---|
| Idle / Waiting / Loading / Ready / Needs login / Error / Game | ✅ todos (`status`: `idle`, `waiting`, `loading` con `stale`, `ready`, `needs-login`, `error` con `reason`, `context.phase === 'game'`) |
| Low confidence / Partial data | parcial: avisos (`notices`) con icono y tooltip; runas < 500 partidas atenuadas |
| Stale data | parcial: `stale` se usa para no parpadear, pero ⚠ no se rotula como «datos del contexto anterior» |
| Errores accionables | parcial: hay botón de login/reintento según el caso; ⚠ no hay «continuar con información general» ni «cambiar fuente» desde el error |
| «No usar esqueletos como única explicación» | ⚠ el diseño actual es deliberadamente sin texto («los estados se ven con esqueletos, giros y marcas, no con párrafos», cabecera de `panel.js`). **Choca con la especificación: decisión del usuario** |

### 4.5. Ajustes (spec §13, Fase 5)
Hoy: interruptores principales a la vista (Aplicar, destino, Destello, fuente, Elo, parches, regiones, consejero, maestría) y «Más» plegado
(simular, panel, conexión, idioma, actualizaciones). Las explicaciones están en `title` (⚠ spec: descripción breve **visible**).
Las 5 categorías de la spec se pueden formar con los ajustes existentes sin añadir ninguno; los consentimientos ya son explícitos (✅).

### 4.6. Accesibilidad y visual (spec §10)

| Comprobación | Resultado |
|---|---|
| Atributos `title` / `aria-*` | panel.js 58 / 6 · native.js 5 / 2 · settings.js 15 / 25 → la información depende sobre todo de `title` ⚠ |
| Textos de 9 px | panel.js y native.js tienen al menos uno ⚠ (spec: metadatos ≥ 10 px) |
| `prefers-reduced-motion` | ningún archivo ⚠ (hay animaciones: `ecp-in`, `ecx-pulse`, parpadeo de la ficha, «pop») |
| Tokens de color | colores repetidos en literal en cada CSS (`#c8aa6e`, `#785a28`, `#010a13`, `#a8404f`…) ⚠ sin variables comunes |
| Color como único indicador | parcial: el borde rojo del rival y la fiabilidad (barras) ya tienen forma además de color |
| Foco visible | ⚠ `.ecx button{outline:none}` en native.js elimina el foco |

---

## 5. Restricciones que el rediseño debe conservar (no negociables del proyecto)
- Sin `innerHTML` (`h()`); presentation no hace `fetch`; logs con `log`; textos en español con `t()` (es/en en `shared/strings.js`).
- Aplicar runas/hechizos: siempre acción explícita, `canApply()` desactivado de inicio. Nunca seleccionar un campeón.
- Pengu 1.1.6 sin build en runtime: `presentation/components/` debe ser JS plano con módulos ES; nada de React (spec §18.2 coincide).
- Los archivos del loader (`index.js`, `loader/updater/update-prefs`, `infrastructure/update/*`…) no se tocan en el rediseño.
- La cancelación, debounce y estado anterior de `champ-select.js` se conservan (spec §9.2 coincide).

---

## 6. Decisiones que necesita el usuario antes de seguir
1. **Texto frente a iconos.** El diseño actual es «casi sin texto» a propósito; la especificación pide nombres visibles de runas, hechizos,
   fragmentos y objetos. Afecta al ancho del popover (340 px) y a la tira de la cabecera. ¿Se adopta la especificación?
2. **Fuente de las características de composición** (frontline, engage, peel…). Opciones: (a) tabla propia mantenida a mano y rotulada como
   heurística, (b) buscar una fuente externa (habría que revisar sus términos), (c) dejar la Fase 4 limitada a lo que dan iTero y LoLalytics
   (sinergia/counter por línea, escalado, daño). Sin esta decisión la Fase 4 no puede empezar sin inventar datos.
3. **Recomendación principal única.** Fusionar MATCHUP y DRAFT en «principal + alternativas» exige un criterio de agregación; la spec prohíbe
   pesos arbitrarios sin calibrar (§6.2, §14.5). Propuesta mínima sin pesos: principal = mejor de la perspectiva activa; alternativas = la mejor
   de cada otra perspectiva, cada una con su etiqueta («mejor matchup», «mejor sinergia»). ¿Vale como paso intermedio?
4. Integrar sinergias de LoLalytics (`ep=build-team`): ya analizado; revisar términos de uso de LoLalytics antes de distribuir.

## 7. Siguientes pasos propuestos (orden)
1. Corregir las dos pruebas desfasadas (§1), sin tocar código.
2. Correcciones de integridad ya confirmadas, pequeñas y con prueba: la lista MATCHUP debe (a) excluir baneados y ya elegidos y (b) decidir el
   orden por `edge` o mostrarlo junto al WR (regla «no confundir WR con ventaja»). Esto cambia lo que ve el usuario: pedir confirmación.
3. Fase 1: tokens visuales comunes (variables CSS), foco visible, `prefers-reduced-motion`, mínimo 10 px; extraer componentes de `panel.js`
   sin cambiar comportamiento (las suites de UI deben seguir igual).
4. Fase 2 (Build): nombres visibles, fragmentos rotulados, alternativas de runa clave con uso/WR/partidas a la vista.
5. Fases 3–4 tras las decisiones del §6.

## 8. Qué debe aportar el usuario (no se puede obtener fuera del cliente)
- Capturas del Champion Select real con Draftsage activo (tira de la cabecera, botón de runas, popovers «build» y «picks»), a 100 % y a otro zoom.
- Resultado de `draftsage.nativeProbe()` y los logs `[draftsage]` de una selección completa.
- ❓ Si `/lol-champ-select/v1/session` trae `timer` (para el tiempo restante) y si se puede leer la lista de campeones poseídos.
