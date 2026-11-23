# Clash: scouting y recomendación de bans — investigación y especificación por fases

Estado (2026-11-23): **fases 0–3 implementadas** (ver `docs/HANDOFF.md`; sin probar en el cliente real); fases 4 y 5 pendientes. Lo demás de este documento sigue siendo la especificación. Este documento reúne lo descubierto y deja cada fase lista para implementarse por separado.
Todo lo marcado ✅ se **verificó en el cliente real** (LeagueClient 16.23, Pengu 1.1.6) con `dev/api-probes/clash-devtools-probe.js` y consultas manuales; ❓ = sin verificar.
Las capturas originales contenían nombres, puuids y summonerIds reales de terceros: **no se copian aquí ni en los fixtures** (anonimizar siempre).

Documentos relacionados: `docs/HANDOFF.md` (estado general), `docs/ARCHITECTURE.md` (capas), `docs/champ-select-dom.md` (DOM de Champion Select), `docs/lolalytics.md`, `docs/ITERO-INTEGRATION.md`, `docs/IDEAS-EXTERNAS.md` (ideas de otros sitios, sin decidir).

## 0. Cómo usar este documento
- Cada fase del §5 es **independiente**: declara entradas, salidas, archivos, pruebas y criterio de aceptación. Orden recomendado: 0 → 1 → 2 → 3 → 4 (→ 5 opcional). Dependencias: 3 necesita 1 y 2; 4 necesita 0, 1 y 3; 0 y 1 no dependen de nada.
- Reglas del proyecto que aplican a TODAS (resumen de `CLAUDE.md`): sin `innerHTML` (usar `h()` de `presentation/ui.js`); logs solo con `log` (`shared/logger.js`, prefijo `[draftsage]`); textos en español **y en inglés** (`t()` + `shared/strings.js`; hay prueba que exige las mismas claves); presentación sin `fetch`; acceso al cliente tras interfaz de proveedor; solo APIs de Pengu 1.1.6; nada de `dev/` dentro de `src/`; sin dependencias nuevas; **solo mostrar, nunca banear/elegir por el usuario ni hacer clics sintéticos**; no tokens ni datos personales en logs.
- Antes de cerrar cada fase: `node dev/tests/run.mjs`, `node dev/tools/check.mjs`, `node --check` en cada `.js` tocado, actualizar `docs/HANDOFF.md`.
- Pruebas de interfaz que dependen del cliente real (posición, z-index, foco): pedir al usuario que las pruebe y pegue los logs `[draftsage]`.

## 1. Objetivo
Durante la fase de análisis de Clash (estado `SCOUTING`) y durante el draft de Clash, ayudar a decidir **qué banear**: analizar a los 5 rivales (rango, pool, campeones más peligrosos, línea probable), el equipo en conjunto y el meta, y explicar cada recomendación con la evidencia. Extensión opcional: predecir qué te banearán a ti.

## 2. Descubrimientos verificados

### 2.1 Torneo, bracket y roster (`/lol-clash/v1/…`)
| Endpoint | Forma / uso | Estado |
|---|---|---|
| `GET tournament-summary` | `[{bracketId, rosterId, state, tournamentId}]`. Mi roster y el estado: `SCOUTING` en la fase de análisis, **`IN_GAME` durante el champ select**. | ✅ |
| `GET tournament/{tournamentId}` | Torneo: `queueId: 700`, `bracketSize`, `rosterSize`, `scoutingDurationMs`, `phases[]` (`scoutingStartTime`, `lockinStartTime`, `capacityStatus`), `tierConfigs`, recompensas. Útil para una cuenta atrás de scouting. | ✅ |
| `GET tournament-state-info` | `[{currentPhaseId, nextPhaseId, nextStateChangeTime, numRemainingPeriods, state, tournamentId}]` (aquí vi `IN_GAME`). | ✅ |
| `GET bracket/{bracketId}` | `{id, isComplete, period, size, version, tournamentId, matches[], rosters[]}`. `matches[]`: `{id, round, order, loserBracket, status (UPCOMING/COMPLETED/…❓ otros), rosterId1, rosterId2, winnerId (0 = sin ganador), resultHistory ("WWL"), gameId, gameStartTime, forfeitRosterId, highestPossiblePosition, lowestPossiblePosition}`. `rosters[]`: `{rosterId, name, shortName, logo, logoColor}` (16 en un bracket de 16). **El rival = el otro `rosterId` de la partida donde aparece mi roster y `status` no es COMPLETED / `winnerId == 0`.** Rival aún indeterminado: ❓ valor del id (¿`-1`/`0`?). | ✅ (rival en curso ❓) |
| `GET roster/{rosterId}` | Roster: `name`, `shortName`, `tier` (**-1 en rosters rivales sin datos**), `wins/losses`, `members[5]` con `summonerId`, `position`, `state`, `tier`. **En rosters rivales todos los miembros llegan con `position: "FILL"` y `tier: -1`** (no hay líneas). En el roster propio sí hay posiciones (JUNGLE…). | ✅ |
| `GET roster/{rosterId}/stats` | Con mi roster: `{periodStats[].matchStats[], playerStats{summonerId→{rawStatsSum,rawStatsMax}}, rosterShortName, tier, …}`. Cada `matchStats[]`: `{gameId, round, win, kills, opponentKills, opponentShortName, opponentIconId, durationMs, loserBracket, **playerChampionIds{summonerId→championId} con los 10 jugadores (los dos equipos)**}`. `rawStats*`: ASSISTS, CHAMPIONS_KILLED, NUM_DEATHS, MINIONS_KILLED, NEUTRAL_MINIONS_KILLED, VISION_SCORE, GOLD_EARNED, TIME_PLAYED, `PLAYER_POSITION`, `PLAYER_ROLE`. **Con un roster rival no verificado** (mi llamada sobrescribió la clave en el informe; ❓ si es accesible y qué devuelve si no ha jugado). `PLAYER_POSITION`/`PLAYER_ROLE` son ambiguos (jungla y ADC salieron ambos `3/0`): **no usarlos para la línea; deducirla por CS de jungla/CS/visión** (❓). | ✅ (propio) ❓ (rival) |
| `GET player` | Yo: `{primaryPos, secondaryPos, tier, tickets, isClashBanned, lft}`. | ✅ |
| `GET enabled`, `visible`, `playmode-restricted`, `time` | booleanos / epoch. | ✅ |
| `GET historyandwinners` | 210 torneos pasados + ganadores. Sin uso previsto. | ✅ |
| `GET scouting/champions?puuids=[…]` | Ver §2.2. | ✅ |
| `GET scouting/matchhistory` | **Existe**. Pide `summonerIds` como **colección** (`?summonerIds=[1,2,3]`). Argumentos `puuid`, `summonerId`, `playerId`, `rosterId`, `puuids`, `queueId`, `count`, `tournamentId` → 400 `Unknown argument`. Con `summonerIds=[…]` de un roster rival: **403 `RBAC: access denied`** (❓ ¿solo se permite para tu rival actual / tu bracket? ¿con tu propio roster?). Es la fuente probable de la pestaña **History** del modal. | ❓ |
| `GET tournament/{id}/get-player-tiers`, `tournament/getAllPlayerTiers` | Existen (400): piden `summonerIds` (colección) y `tournamentId` (int64). Sin uso previsto. | ✅ (existen) |
| No existen (404) | `tournament-state`, `tournaments`, `tournament/{id}/bracket`, `ready-check`, `thirdparty-team-data`, `player-history`, `tournament/{id}/state-info`, `tournament/{id}/getPlayerTiers`, `champion-mastery/{puuid}/champion-mastery-score`, `champion-mastery/{puuid}/top`. | ✅ |

`/help` devuelve `{events, functions, types}` (≈260 KB). `functions` lista los nombres (p. ej. `GetLolClashV1RosterByRosterIdStats`); no trae rutas. Hay además POST candidatos **sin probar**: `PostLolChampionMasteryV1Scouting`, `PostLolChampionMasteryV1ByPuuidChampionMasteryTop`. El swagger (`/swagger/v3/openapi.json`) da 404.

### 2.2 Datos por jugador
| Endpoint | Qué da | Notas | Estado |
|---|---|---|---|
| `GET /lol-summoner/v2/summoners?ids=[…]` | `puuid`, `gameName`, `tagLine`, nivel, `privacy` | Convierte `summonerId`→`puuid`. 5 ids en ~4 ms. | ✅ |
| `GET /lol-ranked/v2/tiers?summonerIds=[…]&queueTypes=["RANKED_SOLO_5x5","RANKED_FLEX_SR"]` | `[{summonerId, achievedTiers:[{queueType, tier, division(numérico)}]}]` | **`achievedTiers` = rango ACTUAL** (coincidió con `ranked-stats`: DIAMOND IV). Una llamada para los 5 (~190 ms). Usar este y no `ranked-stats` por jugador. | ✅ |
| `GET /lol-ranked/v1/ranked-stats/{puuid}` | `queueMap.{RANKED_SOLO_5x5,RANKED_FLEX_SR,…}` con tier, división, LP, wins/losses, máximos | ~230 ms y 8,6 KB por jugador. | ✅ |
| `GET /lol-clash/v1/scouting/champions?puuids=["…",…]` | `[{playerId(=summonerId), topMasteries[5]{championId, championLevel, championPoints}, topSeasonChampions[≤5]{championId, gameCount, winCount, winRate(%), kda("6.7"), kdaClassification(LOW/AVERAGE/HIGH)}, totalMasteryScore}]` | **No respeta el orden de `puuids`: casar por `playerId`.** Muestras de 1 a 41 partidas (jugador inactivo: 3 campeones con 2/1/1). Funciona con rosters propios y rivales. ~190 ms. Es lo que enseñan las pestañas Ranked y Mastery. | ✅ |
| `GET /lol-champion-mastery/v1/{puuid}/champion-mastery` | Pool completo (193 campeones): `championId, championLevel, championPoints, championPointsSinceLastLevel, lastPlayTime (ms), highestGrade, tokensEarned, milestone…` | Funciona con puuid ajeno. 89 KB y ~210 ms por jugador. `lastPlayTime` permite filtrar por recencia (en la muestra, 112 de 193 jugados en 30 días). | ✅ |
| `GET /lol-match-history/v1/products/lol/{puuid}/matches?begIndex=0&endIndex=N` | `games.games[]`: `queueId, gameMode, gameCreationDate, participants[0] (un solo participante: el jugador) {championId, stats{kills,deaths,assists,…}, timeline{lane, role}}, teams[]` | Funciona con puuid ajeno. **Lento: 5,8 s (21 partidas) y 10 s (61 partidas)**. Muestra real: solo flex (440) y ARAM Mayhem (2400), 61 partidas = 4 días. En ARAM `lane` = `NONE` (no sirve). En rankeadas `lane/role` sí vienen. `endIndex` es inclusivo (+1 partida). | ✅ |

### 2.3 Historial de partidas de Clash (cola 700)
- Tus partidas de Clash aparecen en el historial como `gameType: CUSTOM_GAME`, `queueId: 700`, `gameMode: CLASSIC`, con `teams[].bans[]` = `{championId, pickTurn}`: **5 baneos por equipo**. `pickTurn` (orden de ban): equipo 100 → 1,3,5,8,10; equipo 200 → 2,4,6,7,9. ✅
- Otras colas vistas en tu historial: 420, 440, 700, 710, 1750, 3100, 3270 (significado de 710/1750/3100/3270 ❓).
- Las partidas de Clash **de otros jugadores** aparecen en su `match-history` solo si el jugador las jugó (❓ no comprobado): serviría para leer **tendencias de baneo del rival** (siempre que `teams[].bans` venga completo).

### 2.4 Champion select de Clash (`/lol-champ-select/v1/session`, cola 700, `type: CLASH`)
- ✅ **`session.bans` viene VACÍO en Clash** (`myTeamBans: []`, `theirTeamBans: []`, `numBans: 0`) aunque los baneos ya se hayan hecho. **Los baneos solo están en `actions`**: grupos de 1 acción, `{id, type ("ban"|"pick"|marcador de 16 caracteres), championId, actorCellId (-1 en marcadores), isAllyAction, isInProgress, completed, pickTurn, duration}`. 24 grupos en total.
- ✅ **Secuencia** (con tu equipo = `team 2`, rojo): `[marcador] E A E A E A  [marcador] pE pA pA pE pE pA  [marcador] A E A E  [marcador] pA pE pE pA`, donde E = rival (equipo 1, azul), A = tu equipo. Es decir: **3 baneos por equipo alternando (el azul/`team 1` primero) → 6 picks (azul, rojo, rojo, azul, azul, rojo) → 2 baneos por equipo (empieza el rojo) → 4 picks (rojo, azul, azul, rojo)**. Total 5 baneos por equipo. Coincide con el historial (§2.3). Los marcadores `actorCellId: -1` revelan los baneos de cada fase.
- ✅ `timer.phase` = `BAN_PICK` durante todo el draft (no hay fase BAN aparte); `adjustedTimeLeftInPhase`.
- ✅ `myTeam[].team`: 1 = azul, 2 = rojo (confirma el ❓ de `champ-select-provider.js`). El equipo azul banea y pica primero.
- ✅ **`theirTeam` está oculto**: `summonerId: 0`, `puuid: ""`, `gameName: ""`, `nameVisibilityType: HIDDEN`, `assignedPosition: ""`; solo `championId` cuando pican, y `cellId`. **La identidad del rival debe venir del scouting/bracket, nunca de la sesión.** `myTeam` sí trae `puuid`, `summonerId`, `assignedPosition`.
- `localPlayerCellId` (aquí 8: las celdas del equipo 2 van 5–9).
- `/lol-gameflow/v1/session`: `gameData.queue.type = "CLASH"`, `id = 700`, `isRanked: true`, `areFreeChampionsAllowed: true`; **`gameTypeConfig` inútil** (`banMode ""`, `maxAllowableBans 0`); `teamOne/teamTwo` vacíos. `gameflow-phase` = `CheckedIntoTournament` durante el scouting, `ChampSelect` en el draft.
- Consecuencia ya presente en el plugin: `champ-select-provider.js` (línea ~83) construye `bans` solo con `session.bans` → **en Clash `bans: []` siempre**, y eso desactiva el filtro de baneados del consejero de iTero (`pick-advisor.js:74`) y de las listas (`domain/pick-filters.js:100`). Ver Fase 0.

### 2.5 DOM del modal de scouting (cliente 16.23)
Fuente: HTML pegado por el usuario (pantalla Clash → Bracket y modal de scouting). Selectores verificados con el sondeo:
| Qué | Selector |
|---|---|
| Modal | `lol-uikit-full-page-modal` → `.tournament-scouting` (clase del componente Ember `tournament-scouting`) |
| Cabecera (logo, tag, nombre, tier, lado de pick) | `.tournament-scouting-header` > `.clash-roster-details-visual`: `.clash-roster-details-team-tag`, `.clash-roster-details-team-name`, `.clash-roster-details-team-tier`, `.clash-roster-details-pick-side-image` (`src` termina en `pick-first.svg` / `pick-second.svg`) |
| Pestañas | `.tournament-scouting-nav-container` > `.tournament-scouting-nav-button`: **Ranked · Mastery · History** |
| Jugadores | `.tournament-scouting-members` > `.util-tournament-scouting-member` (×5): `.player-name__game-name`, rango (`.tournament-scouting-member-ranked-rank`, `lol-regalia-emblem-element[ranked-tier]`), `.util-tournament-scouting-subitem` (×5: `img.util-tournament-scouting-subitem-champion-icon[src=…/champion-icons/{id}.png]`, `.tournament-scouting-top-champion-stat-wins-percentage`, `…-games-played`, `…-kda`) |
| Bracket | `.clash-tab-bracket`, partidas `.clash-bracket-match` (`.is-local` = la mía), `[roster-id]` en cada `.roster-determined` con `.tag` (el tag) |
- ✅ El modal **no expone ids** (sin atributos `roster/puuid/summoner`). Se resuelve el roster por el **`shortName`/tag** contra `bracket.rosters[]` (LCU) o contra los nodos `[roster-id]` (DOM); en el bracket probado **no hay tags duplicados** (comparar sin distinguir mayúsculas: el DOM muestra `zzz`/`ZZZ` según el sitio).
- ✅ **El lado de pick solo sale en el DOM** (`pick-first`/`pick-second`); no vi un campo equivalente en el LCU. Equivale a quién banea/pica primero (azul = primero).
- ❓ Clases/CSS reales del modal (la captura trae HTML sin CSS): posición y z-index del bloque propio dentro del modal se prueban en el cliente.

### 2.6 Rendimiento medido (Bogotá/LA1, cliente local)
| Llamada | Tiempo |
|---|---|
| `tournament-summary`, `bracket`, `roster`, `summoners` | 4–20 ms |
| `ranked/v2/tiers` (5 jugadores) | ~190 ms |
| `scouting/champions` (5 jugadores) | ~190 ms |
| `champion-mastery/{puuid}` (×5, 89 KB c/u) | ~210 ms c/u (≈450 KB en total) |
| `roster/{id}/stats` | ~190 ms |
| `match-history` 21 / 61 partidas | 5,8 s / 10 s (**opcional, diferido, con caché**) |
| Núcleo del scouting en paralelo | ≈ 0,6–1 s |

### 2.7 Hallazgos sobre los datos
- Las muestras de temporada son pequeñas (1–41 partidas) y a veces degeneradas (100 % / 0 % con 1 partida): **encoger hacia el win rate medio** del campeón y usar la maestría cuando hay pocas partidas.
- Hay *one-tricks* claros (p. ej. un jugador con 750 k de puntos, nivel 71 y 12 partidas esta temporada).
- Un mismo campeón puede estar en el pool de varios jugadores del equipo (solapamiento): banearlo hace menos daño relativo.
- Las líneas rivales **no se conocen** (`FILL`): deducir con (a) `roster/stats` de partidas ya jugadas en este Clash, (b) cuotas de línea de Lolalytics (`pctLane`) sobre el pool, (c) en el draft, los picks reveladas (`domain/enemy-roles.js` ya hace una asignación así), (d) opcional: `match-history` con `lane/role` en rankeadas.
- Las cifras de esta sección salen de 2 rosters y 1 bracket; pueden variar con otros torneos/temporadas.

## 3. Incógnitas abiertas (cómo resolverlas)
| # | Pregunta | Cómo resolverla |
|---|---|---|
| 1 | ¿Qué devuelve `roster/{id}/stats` para un roster rival (sin partidas/con partidas)? ¿Es accesible? | Sondeo: `await g('/lol-clash/v1/roster/<rival>/stats')`. Si 403/vacío → degradar sin esa señal. |
| 2 | ¿`scouting/matchhistory?summonerIds=[…]` funciona con mi roster? ¿con mi rival actual? ¿qué devuelve (¿partidas de Clash con baneos?)? | Sondeo con `summonerIds` de mi roster, del rival directo y de otro roster. |
| 3 | ¿Cómo se ve **mi partida actual** en el bracket durante `IN_GAME` (status, `gameId`) y qué valor tiene el rival no definido? | Mirar `bracket/{id}` en champ select y antes de que se defina el rival. |
| 4 | ¿Los baneos de `actions` traen `championId` de ambos equipos y cuándo? ¿Hay `championId` provisional (hover) en acciones en curso? | Instantánea durante la fase de baneos (`DS_PROBE.watch(300)`). |
| 5 | ¿El orden/lado de la secuencia cambia si eres el equipo azul (`team 1`)? | Capturar una sesión como azul. |
| 6 | ¿Qué significan `PLAYER_POSITION`/`PLAYER_ROLE`? | Comparar con partidas de línea conocida. Hasta entonces, no usarlos. |
| 7 | ¿Fórmula de tier→`tier` de Lolalytics para rosters de Clash (rango medio del roster)? | Decisión de diseño; probar con rosters reales. |
| 8 | ¿Los POST `…/champion-mastery/scouting` y `…/top` son lecturas puras y qué cuerpo piden? | Opcional; si no aporta sobre `champion-mastery/{puuid}` se descarta. |
| 9 | Valores de `status` de las partidas del bracket (`UPCOMING`, `COMPLETED`, ¿`IN_PROGRESS`?) | Observar el bracket en distintos momentos. |

## 4. Modelo de decisión de bans (diseño propuesto; constantes a validar)
Principios: **explicable**, sin pesos inventados presentados como hechos (cada constante se declara como parámetro con su origen y se ajusta con datos), evidencia visible por chip (`dato` / `modelo` / `regla`, igual que `domain/draft-summary.js`), y siempre solo **mostrar**.

**Entradas por jugador rival `p` y campeón `c`:**
- `M(p,c)`: maestría (puntos, nivel, `lastPlayTime`) del pool completo; solo cuentan campeones jugados en los últimos N días (N parámetro, p. ej. 30–60) y con puntos mínimos.
- `S(p,c)`: partidas y win rate de temporada (`topSeasonChampions`), solo para los 5 primeros.
- `T(p,c)`: picks ya jugadas por `p` en este Clash (`roster/stats` → `playerChampionIds`), con resultado.
- `B(c, línea)`: fuerza base del meta (win rate, pick/ban rate, nota) de Lolalytics en el rango medio del roster rival.

**Fuerza** `f(p,c)`: win rate encogido `(wins + k·B_wr) / (games + k)` (k = parámetro, p. ej. 10) combinado con una señal de familiaridad derivada de la maestría (puntos relativos al jugador, no absolutos). Sin partidas de temporada, solo maestría+meta, marcado como baja fiabilidad.

**Coste de reemplazo (valor de banear `c` a `p`):**
`drop(p,c) = max(0, f(p,c) − f_alt(p, c))`, con `f_alt` = mejor `f` de `p` entre los campeones NO baneados y NO ya elegidos, de su pool reciente (la «siguiente mejor opción»). Un one-trick tiene `drop` alto; un jugador con pool ancho, bajo.
**Probabilidad de uso** `u(p,c)`: la probabilidad de que `p` juegue `c` dado el pool (softmax o cuota de maestría reciente) y la línea que le queda libre.
**Valor de ban** `V(c) = Σ_p u(p,c) · drop(p,c)` (o el máximo, a decidir tras probar con datos). Ordenar por `V`; empates por ban rate de Lolalytics; mostrar el desglose por jugador.

**Líneas rivales:** asignar jugadores a líneas por (1) `roster/stats` previo, (2) maestría + cuotas de línea (`pctLane`, ya existe `MIN_LANE_SHARE`), (3) en el draft, picks reveladas (condicionar: un jugador cuya línea ya está cubierta por un pick revelado deja de ser candidato para los demás campeones).

**Por fase del draft:**
- *Baneos 1 (3 por equipo, antes de picks)*: ranking global del scouting.
- *Baneos 2 (2 por equipo, tras 6 picks)*: condicionar por los 3 picks rivales ya revelados (líneas libres, `u` recalculada), por los baneos ya hechos y por la composición propia (opcional: counters de Lolalytics `enemy[lane]` contra los campeones aliados ya elegidos; iTero vista enemiga).
- Orden de turnos: calcular cuántos baneos quedan a cada lado desde `actions`.

**Predicción de lo que te banearán** (opcional, Fase 5): el mismo modelo aplicado a tu roster (`scouting/champions` funciona con tus puuids).

## 5. Fases (independientes)

### Fase 0 — Corregir los baneos de Clash (bug existente, pequeño)
- **Problema:** `session.bans` está vacío en Clash (§2.4); `champ-select-provider.js` (~línea 83) y `application/champ-select.js` (`extrasKey`, ~línea 33; ~124) usan solo `session.bans`.
- **Cambio:** función pura en `domain/` (p. ej. `domain/draft-actions.js`: `parseDraftActions(session)` → `{ bans:{ally[],enemy[]}, picks:{ally[],enemy[]}, phase:'ban1'|'pick1'|'ban2'|'pick2'|'done', banSlotsLeft:{ally,enemy}, turn:{ type, isAlly, cellId }|null }`) y usarla en el proveedor cuando `session.bans` esté vacío o ausente (mantener `session.bans` si trae datos: ranked normal). Ignorar `championId` 0/-1 y acciones no completadas (hovers).
- **Archivos:** `src/domain/draft-actions.js` (nuevo), `src/infrastructure/lcu/champ-select-provider.js`, `dev/tests/champ-select.test.mjs` (ampliar) + fixture anonimizado de la sesión de Clash (`dev/tests/fixtures/clash-session.mjs`: sin nombres ni puuids; secuencia real de 24 grupos).
- **Pruebas:** secuencia completa de Clash (ban1/pick1/ban2/pick2), sesión en curso (acciones sin completar), ranked normal (usa `session.bans`), sesión sin `actions`; que `bans` salga igual en ambos orígenes cuando coinciden.
- **Aceptación:** en un draft de Clash real el log `contexto` muestra los `bans` ya hechos y el consejero de iTero deja de recomendar baneados.
- **Riesgos:** ❓ aparición de `championId` en acciones en curso (hover); verificar con el vigilante.

### Fase 1 — Dominio de Clash y modelo de bans (puro, sin red)
- **Entradas:** estructuras ya normalizadas (ver tipos abajo). **Salidas:** `rankBans(ctx)` → `[{championId, value, perPlayer:[{playerIdx, drop, usage, strength, evidence[]}], reliability, tags[]}]`.
- **Archivos:** `src/domain/clash.js` (tipos, `findOpponent(bracket, myRosterId)`, `shortName` → roster, normalizadores de `scouting/champions`, `champion-mastery`, `ranked/v2/tiers`, `roster/stats`), `src/domain/ban-advice.js` (fuerza, `drop`, `u`, `V`, asignación de líneas, condicionamiento por fase), constantes del modelo (k, ventana de recencia, mínimos) en un solo objeto exportado.
- **Pruebas** (`dev/tests/clash.test.mjs`, `ban-advice.test.mjs`): `findOpponent` (partida en curso / completada / rival no definido / bracket sin mi roster), casado por `playerId` con orden distinto, one-trick vs pool ancho (`drop`), muestra de 1 partida (encogimiento), jugador inactivo (solo maestría), solapamiento de pool, líneas deducidas, condicionamiento por picks reveladas, baneados excluidos, desempates, determinismo.
- **Aceptación:** pruebas verdes con fixtures anonimizados; sin dependencias de red ni DOM.
- **Decisión pendiente del usuario:** `Σ` vs máximo en `V`; valores de k y ventana (proponer tras ver datos).

### Fase 2 — Proveedor del LCU (`getScoutingContext`)
- **Interfaz:** `getScoutingContext({ rosterId? })` → `{ ok, data:{ tournament, myRoster, opponent:{rosterId, shortName, name, side?}, players:[{summonerId, puuid, gameName?, rank:{solo,flex}, topMasteries[], pool[], seasonChamps[], totalMasteryScore, clashPicks[]}], fetchedAt }|{ ok:false, reason }` y `subscribeToChanges()`; nunca lanza, nunca registra puuids/nombres (solo contadores).
- **Flujo:** `tournament-summary` → `bracket/{id}` → rival (o roster elegido por el modal: Fase 3) → `roster/{id}` → `summoners` → en paralelo `ranked/v2/tiers`, `scouting/champions`, `champion-mastery/{puuid}` ×5 (limitar concurrencia a 5), `roster/{id}/stats` (tolerar 403/vacío).
- **Caché** por `rosterId` en memoria con caducidad (el scouting dura minutos; p. ej. 10 min), petición compartida, cancelación al cambiar de rival, timeouts (LCU local 4 s; maestría 8 s), degradar por partes (si falla maestría → solo temporada).
- **Archivos:** `src/infrastructure/lcu/clash-provider.js` (usa `lcuGet`), `dev/tests/clash-provider.test.mjs` (LCU simulado con fixtures: éxito, 403 en stats, 404, timeout, orden distinto, rival no definido).
- **Aceptación:** con el LCU real, `draftsage` registra `clash: rival definido / 5 jugadores / ms` sin datos personales.
- **Riesgos:** endpoints no oficiales (aislados tras la interfaz); coste ≈450 KB de maestría (caché fuerte); RBAC en roster ajeno ❓.

### Fase 3 — Aplicación y UI en el modal de scouting
- **Aplicación:** `src/application/ban-advisor.js` (`createBanAdvisor({ clash, stats, catalog, getFilters, log })`, `advise()`), controlador con debounce/cancelación como `createOverlayController`; reutiliza `ChampionStats` de Lolalytics (`B(c, línea)`, nota, ban rate). Estado `{status, data}`.
- **UI** (`src/presentation/components/scouting.js`, anclas en `presentation/native.js`): bloque propio dentro de `.tournament-scouting` (detectar el modal con `lol-uikit-full-page-modal .tournament-scouting`; reposicionar si Ember lo borra, como las demás piezas): (1) ficha por jugador (rango, one-trick, fiabilidad, top 3 campeones con evidencia), (2) lista de bans recomendados con chips y desglose por jugador, (3) aviso de fiabilidad y de datos ausentes. Resolver qué roster se está viendo por `shortName` (§2.5). Sin `innerHTML`, `h()`, textos es/en, mínimo texto.
- **Ajuste** nuevo en Ajustes (apagado/encendido; por defecto encendido solo en Clash). **No** envía nada a terceros (solo LCU + Lolalytics ya integrado).
- **Pruebas:** fixture DOM del modal **anonimizado** (`dev/tests/fixtures/clash-scouting-dom.html`, recortado) + `dev/tests/ui/clash.test.cjs` (Playwright, como `native.test.cjs`); claves i18n; que no haya `innerHTML`.
- **Pedir al usuario probar en el cliente real:** (a) ¿se ve el bloque dentro del modal y no tapa nada?; (b) ¿qué pasa al cambiar de pestaña Ranked/Mastery/History?; (c) cambio de rival escrutado; (d) logs `[draftsage]`.
- **Aceptación:** abrir el modal de scouting de un rival y ver ficha + lista de bans con evidencia en <2 s tras caché, sin bloquear el cliente si algún endpoint falla.

### Fase 4 — Draft real de Clash
- **Entradas:** Fase 0 (`parseDraftActions`), Fase 1 (condicionamiento), Fase 2 (scouting en caché del rival; si el cliente se reinició, volver a pedirlo con `tournament-summary` → bracket), Fase 3 (UI).
- **Comportamiento:** al detectar sesión con `queueId 700` (o `gameflow queue.type === 'CLASH'`), mostrar la lista de bans en el panel/popover durante la fase de baneos; recalcular al cambiar `actions` (baneos hechos, picks reveladas, turno); marcar los campeones recomendados con «Localizar» en la cuadrícula (**nunca banear por el usuario ni hacer clic**); mostrar cuántos baneos quedan y de quién es el turno; tras los picks, condicionar en baneos 2.
- **Resolver el rival en el draft:** `theirTeam` está oculto (§2.4): usar el scouting guardado y confirmar con `bracket` (partida propia no completada) ❓ por verificar (§3 #3).
- **Pruebas:** secuencia de `actions` por turnos (tabla de transiciones), recálculo ante baneos nuevos, equipo azul vs rojo ❓ (capturar una sesión como azul), reinicio del cliente en medio del draft.
- **Aceptación:** durante un draft de Clash real, la lista cambia al hacerse baneos y refleja los 3 picks rivales en la fase 2.

### Fase 5 — Extras opcionales (ninguna decidida)
- Predicción de lo que te banearán (mismo modelo sobre tu roster).
- Historial profundo del rival con `match-history` (líneas reales; **5–10 s por jugador**: solo opt-in, en segundo plano, con caché y límite de partidas; ❓ privacidad/políticas de consultar perfiles ajenos).
- Tendencias de baneo del rival si `scouting/matchhistory` (§2.1) o el historial de Clash lo permiten.
- iTero vista enemiga (F9 de `docs/ITERO-INTEGRATION.md`) en baneos 2, con la composición ya revelada.
- Modo sombra: guardar localmente (sin datos personales) la lista recomendada, los baneos reales y el resultado, para ajustar las constantes del modelo.

## 6. Fixtures y datos de prueba
- Construir fixtures **solo con formas** (los informes del sondeo ya son solo forma) y datos inventados; **nunca** nombres, puuids o summonerIds reales (cambiar por ids sintéticos pequeños).
- Pendientes de crear: `clash-session.mjs` (24 grupos de `actions`), `clash-bracket.mjs` (16 rosters, 32 partidas, estados mixtos), `clash-roster.mjs`, `clash-scouting.mjs` (champions/mastery/tiers/stats con orden distinto), `clash-scouting-dom.html` (modal recortado).
- Los sondeos reales se hicieron con `dev/api-probes/clash-devtools-probe.js` (solo lectura; pega todo en la consola de DevTools del cliente; `DS_PROBE.run()`, `DS_PROBE.watch(300)` durante el draft, `DS_PROBE.session()`). Notas de uso: `copy()` no existe tras un `await` dentro de funciones; hay que ejecutar `copy(...)` en otra entrada de la consola; las rutas de `/help` están en `help.functions`.

## 7. Seguridad, privacidad y políticas
- Solo se **muestra** información que el cliente ya expone al usuario (scouting) más estadísticas públicas de Lolalytics. Nada se banea ni se elige automáticamente.
- No se envían Riot IDs, puuids ni maestrías a terceros. No se guarda nada personal (ni en DataStore ni en logs). Consultar `match-history`/`champion-mastery` de jugadores ajenos usa el LCU local; el historial profundo es opt-in.
- Antes de distribuir (recordatorio de `CLAUDE.md`): revisar las políticas de Riot/Pengu sobre overlays y herramientas de draft, los términos de Lolalytics y el registro en el Developer Portal.
- Los endpoints `lol-clash` no son oficiales y cambian entre versiones: aislarlos en `infrastructure/lcu/clash-provider.js` y que el fallo de cualquiera degrade en lugar de romper.
