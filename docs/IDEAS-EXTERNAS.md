# Ideas de otros sitios y herramientas (investigación, sin decidir)

Fecha: 2026-11-22. **Este documento no recomienda ni descarta nada**: son hallazgos para que el usuario indague su viabilidad y decida. Solo se recoge lo que las páginas dicen de sí mismas; casi todo es marketing de cada producto y **no está verificado de forma independiente** (se marca «no indicado» cuando la página no lo dice).
Origen: búsquedas web y lectura de páginas el 2026-11-22. Dos fuentes no se pudieron leer (marcadas). Las funciones que ya tiene Draftsage no se repiten aquí (ver `docs/HANDOFF.md`).

Cómo leer cada ficha: **Qué dice que hace** · **Qué aportaría a Draftsage (si encajara)** · **Qué indagar**.

## A. Herramientas de scouting y bans (las más cercanas a la función de Clash)

### A1. ProComps — «Ban Suggestions» (Clash/Tournament Mode)
- Enlace: https://hub.procomps.gg/2023/09/ban-suggestions-feature/ (publicado 24-09-2023; leído).
- **Qué dice que hace:** sugerencias de ban con dos modos, *Tournament/Clash* y *Solo/Duo*; hasta 5 sugerencias por pantalla, por línea y «All Lanes». En la fase 2 de baneos usa las 3 primeras picks de cada equipo. Parámetros que enumera: *prepick counters*, tier por línea, *enemy ban counters*, *enemy synergy* (solo fase 2) y *Complements Team On* (solo fase 2). Clash: fase 1 con 3 baneos por equipo antes de elegir, fase 2 con 2 más (coincide con lo medido en el LCU).
- **Aportaría:** una lista de qué variables consideran los demás para los baneos de la fase 2 (comparar con el modelo de `docs/CLASH-BANS.md` §4).
- **Indagar:** datos y algoritmo **no indicados** en la página; si la app es Overwolf/web y su modelo de precio: no indicado.

### A2. WeDraft (Overwolf)
- Enlace: https://www.overwolf.com/app/wedraft-wedraft (v3.0.7, 30-10-2026; leído).
- **Qué dice que hace:** preparación de drafts para equipos: simulación (estándar, Fearless, personalizado), escenarios por rival, historial de drafts (importable desde enlaces de espectador), pools de campeones («auto-generated pools from Riot accounts», integración con ProComps), overlays tácticos en directo. Scouting con «Likely bans», «Priority picks» y «Draft tendencies». Cita Clash explícitamente. Gratis con anuncios.
- **Aportaría:** ideas de «tendencias de draft» y «bans probables» del rival; simulación de draft previa.
- **Indagar:** cómo calcula «likely bans» (no indicado); fuentes de datos (no indicado); no es de código abierto según la página (no indicado).

### A3. lolvvv.com — scouting de Clash
- Enlaces: https://win.gg/news/lolvvvs-new-clash-tool-is-the-ultimate-weapon-in-league-of-legends-clash-events/ · https://devtrackers.gg/leagueoflegends/p/5768e62e-lolvvv-com-presents-advanced-scouting-for-clash · https://hardcoregamer.com/news/heres-a-tool-to-help-your-clash-journey/296449/ (solo títulos/resúmenes de búsqueda; **no leídos a fondo**). El artículo de GosuGamers (…/51960-lolvvv-com-upgraded-their-clash-scouting-feature-based-on-feedback-from-the-reddit-community) **devolvió 404**.
- **Qué dice la búsqueda:** herramienta web de scouting de Clash de 2020: se introduce un invocador del equipo rival; basada sobre todo en partidas de **jugadores profesionales**; permite hacer scouting del propio equipo.
- **Indagar:** si sigue activa (las fuentes son de 2020); qué muestra hoy.

### A4. Ban Teemo (código abierto)
- Enlace: https://github.com/wuTims/ban-teemo (README leído).
- **Qué dice que hace:** asistente de draft con simulador contra equipos IA y recomendaciones de pick y ban en vivo, **sobre partidas profesionales** (68 529 acciones de draft, ventana móvil de 18 semanas). Datos: gol.gg (modo simulador) y GRID Open Access API (replay); Data Dragon para imágenes. Puntuación de pick multifactor con pesos publicados (prioridad de torneo 25 %, rendimiento 20 %, matchup 25 %, arquetipo 15 %, proficiency 15 %, sinergia como multiplicador 0,75–1,25×). Baneos por niveles T1–T3 en fase 1 (poder de firma, poder de meta, comfort pick) y en fase 2 (counter+pool, arquetipo+pool, solo counter). Web local (FastAPI + React), insights con LLM opcional (clave de Nebius).
- **Aportaría:** una taxonomía de baneos por niveles y una referencia de cómo ponderar factores.
- **Indagar:** **licencia AGPL-3.0** (copiar código afectaría a la licencia del plugin; las ideas sí son libres); sus datos son de pro play, no de Clash; detalle del algoritmo en `docs/mvp-design-decisions.md` del repo (no leído).

### A5. Otros proyectos de draft (solo títulos de búsqueda, no leídos)
- Draft Assistant (Devpost): https://devpost.com/software/draft-assistant — sugerencias de pick/ban en vivo (proyecto de concurso).
- Yalvon (Devpost): sugiere bans óptimos para el equipo local y **predice los baneos del rival** (orientado a equipos profesionales). No se encontró enlace directo.
- C9 Draft Assistant: https://devpost.com/software/c9-draft-assistant
- vsdraft: https://github.com/MGSimard/vsdraft (simulador de drafts).
- Referencia de reglas: https://wiki.leagueoflegends.com/en-us/Tournament_draft
- **Indagar:** ideas de «predecir los baneos del rival» (cf. Fase 5 de `CLASH-BANS.md`) y de simulación previa.

## B. Aplicaciones «companion» / overlays

### B1. Mobalytics (Live Companion, Overwolf)
- Enlaces: https://mobalytics.gg/lol-overlay/ · https://mobalytics.gg/blog/lol-how-to-use-mobalytics-live-companion/ · https://mobalytics.overwolf.com/
- **Qué dicen sus páginas:** *Live Companion* en champion select (recomendaciones de pick y ban, scouting de jugadores, consejos de matchup, builds, oportunidades de gank, estadísticas de sesión); scouting previo a la partida con **insignias de estilo de juego** y estadísticas; overlay en partida con notificaciones de *power spike*, ventaja de oro en vivo y temporizadores de jungla. Se declara conforme a los términos de Riot (afirmación propia, no verificada). Clash: no indicado.
- **Aportaría:** ideas de «insignias de estilo» por jugador y de avisos de *power spike* en partida.
- **Indagar:** de dónde salen los datos de las insignias; si funciona en Clash.

### B2. Porofessor (Overwolf)
- Enlaces: https://www.overwolf.com/app/trebonius-porofessor.gg · https://porofessorgg.overwolf.com/
- **Qué dicen:** scouting de tu equipo y del rival con win rate, partidas y KDA de **cada jugador con su campeón actual**; temporizadores de objetivos/jungla; builds según matchup; consejos por rol. Gratis. Clash: no indicado.
- **Aportaría:** comparar con el scouting por jugador de Clash (§2.2).

### B3. Blitz
- Enlaces: https://blitz.gg/lol/overlays · https://www.wombocombo.gg/blog/game-analytics/blitz-gg-overlay-review
- **Qué dicen:** overlay en selección de campeón (pick recomendado, información del rival, runas), «ban & pick suggestions» (changelog 1.16.11), aplicación automática de runas/hechizos, builds, *ARAM Mayhem augments overlay*, drafting desde el móvil (app iOS). Clash: no indicado.
- **Indagar:** cómo hacen la aplicación automática frente a las políticas de Riot (Draftsage la deja tras confirmación del usuario).

### B4. OP.GG Desktop
- Enlaces: https://op.gg/desktop/en/games/lol · https://op.gg/desktop/en/patch-notes · https://www.overwolf.com/app/opgg-electron-app
- **Qué dicen:** «OP Tier» (qué campeón conviene en el meta actual), builds de runas/ítems, consejos de línea contra el pick rival, comparación de win/pick/ban rate y matchups por región, rango y parche, overlay de ruta de jungla, estadísticas en tiempo real, comparación de oro e ítems, recomendación de habilidades. Scouting de Clash / multibúsqueda: **no confirmado**.
- **Aportaría:** el «OP Tier» como señal de meta alternativa; comparación por región/parche.

### B5. Facecheck (Overwolf, Convex Apps)
- Enlace: https://facecheck.overwolf.com/ (v1.9.56, 01-11-2026; leído).
- **Qué dice:** companion de LoL y TFT con «Scout Your Lobby» mediante **etiquetas personalizadas**, «Summoner's Insights» para predecir movimientos enemigos, recomendaciones de pick y ban según composición, counters y meta. Gratis con anuncios; Premium opcional.
- **Aportaría:** etiquetas personalizadas por jugador (p. ej. notas propias sobre rivales recurrentes).
- **Indagar:** método de las recomendaciones (no indicado).

### B6. LoLTheory.gg (Overwolf)
- Enlace: https://overwolf.com/app/LoLTheory.gg-LoLTheory (solo resumen de búsqueda; no leído).
- **Qué dice la búsqueda:** sugerencias estratégicas de ban orientadas a las amenazas clave para tu composición.

## C. Ecosistema de Pengu Loader (compatibilidad y posibles ideas)
- Lista: https://github.com/PenguLoader/awesome-pengu (leída; 32 estrellas).
  - **Auto ban pick** (`controlado/auto-champion-select`): pick y ban automáticos con alternativas. Muestra que hay plugins que **actúan** por el usuario (en Draftsage está fuera de alcance por políticas).
  - **TeamInsightX** (deprecado): buscaba información de compañeros en champion select.
- Otros plugins vistos en búsquedas: `shop-champion-select` (comprar campeones desde champion select, https://npmjs.com/package/shop-champion-select), `random-champion` (pick/ban aleatorio, https://npmjs.com/package/random-champion), plugin ARAM con auto-aceptar y pre-pick (https://www.github.com/Kennn-dev/aram-pengu-loader-plugin), `balance-buff-viewer-plugin` (**cambios de balance del parche** en el cliente; https://unpkg.com/balance-buff-viewer-plugin@16.11.3/README.md), `league-client-friends-button` (https://www.github.com/ufukbakan/league-client-friends-button). Tema: https://github.com/topics/lol-plugin (auto-aplicar runas, tier list de meta, enlaces a op.gg al terminar la partida).
- **Qué indagar:** avisos de cambios de parche relevantes para un campeón (p. ej. «este campeón fue nerfeado/buffeado» junto a las recomendaciones); campeones no poseídos (ya anotado como ❓ en el HANDOFF; `shop-champion-select` muestra que el cliente lo permite); compatibilidad de convivir con otros plugins (DataStore compartido).

## D. Fuentes de datos mencionadas
- **GRID Open Access API** y **gol.gg** (datos de competitivo, usados por Ban Teemo): no evaluadas.
- **Política de la API de Riot** para desarrolladores: https://support-developer.riotgames.com/hc/en-us/articles/22698698001939-League-of-Legends (aparece en los resultados; **no se leyó**). Relevante para el registro en el Developer Portal que el `CLAUDE.md` pide revisar antes de distribuir.
- **API pública de Clash de Riot** (`/lol/clash/v1/…`: jugadores por invocador, equipos, torneos): https://www.riotgames.com/en/DevRel/clash-apis · requiere clave de desarrollador; el LCU ya cubre lo necesario sin clave (ver `CLASH-BANS.md` §2).

## E. Resumen de ideas, para que el usuario elija qué investigar (sin orden de prioridad)
| # | Idea | De dónde sale | Relación con lo existente |
|---|---|---|---|
| 1 | Bans de fase 2 condicionados por los 3 picks rivales (counters, sinergia, «complementa a tu equipo») | ProComps (A1) | Fases 1 y 4 de `CLASH-BANS.md` |
| 2 | Predecir los baneos del rival (tendencias) | WeDraft, Yalvon (A2, A5) | Fase 5 de `CLASH-BANS.md` |
| 3 | Simulador de draft previo / escenarios por rival | WeDraft, Ban Teemo, vsdraft (A2, A4, A5) | Nuevo |
| 4 | Baneos por niveles (poder de firma / meta / comfort pick / counter+pool) | Ban Teemo (A4) | Modelo de `CLASH-BANS.md` §4 |
| 5 | Insignias de estilo de juego por jugador | Mobalytics (B1) | Ficha por jugador (Fase 3) |
| 6 | Etiquetas/notas personalizadas sobre jugadores | Facecheck (B5) | Nuevo (almacén local) |
| 7 | Avisos de *power spike* y oro en vivo | Mobalytics, OP.GG (B1, B4) | Vista de partida existente (`live-game`) |
| 8 | Win rate/KDA del rival con su campeón actual en champion select | Porofessor (B2) | Estadísticas existentes |
| 9 | Meta alternativo «OP Tier» y comparación por región/parche | OP.GG (B4) | Fuente de datos adicional |
| 10 | Cambios de balance del parche junto a las recomendaciones | `balance-buff-viewer-plugin` (C) | Nuevo |
| 11 | Campeones no poseídos en las listas | `shop-champion-select` (C) | ❓ ya anotado en HANDOFF |
| 12 | Auto-aplicar / auto-ban | Blitz, Auto ban pick (B3, C) | **Fuera de alcance por políticas** salvo decisión explícita del usuario |

Límites de esta investigación: búsquedas de nivel estándar y lectura de seis páginas; los sitios cambian rápido; la mayoría de las afirmaciones son de los propios fabricantes. Antes de basar una decisión en alguna, confirmar en la app o la documentación oficial del producto.
