# Draftsage — Especificación de UX/UI y plan técnico

**Versión:** 1.0
**Estado:** Propuesta de rediseño (aportada por el usuario el 2026-11-08)
**Ámbito:** Champion Select, recomendaciones de campeones, análisis de composición, builds, runas y experiencia durante la partida.

> Documento de referencia (transcripción condensada de la propuesta original: se conservan todos los requisitos, reglas y criterios; se acortan ejemplos y listas repetidas). El estado real de cada punto frente al código está en `docs/UX-AUDIT.md` (Fase 0); el estado del proyecto, en
> `docs/HANDOFF.md`. Las cifras de los ejemplos son ilustrativas, no estadísticas reales.

---

# 1. Visión del producto

## 1.1. Objetivo

Draftsage debe ser un asistente de decisión para Champion Select, no solamente un visor de builds o una lista de counters.

Su propósito es ayudar al jugador a responder cuatro preguntas:

1. ¿Qué campeón debería elegir en esta situación?
2. ¿Por qué ese campeón es una buena elección?
3. ¿Qué configuración debería utilizar?
4. ¿Qué alternativas tengo si no quiero o no puedo jugar la recomendación principal?

La interfaz debe responder estas preguntas teniendo en cuenta el contexto real del draft: rol, campeón propio, rivales revelados, aliados, lado del mapa, orden de selección, rango, parche, estadísticas disponibles y preferencias del jugador.

## 1.2. Principios de diseño

- **P1. Decisión antes que información.** La primera pantalla muestra lo necesario para decidir; explicaciones, estadísticas secundarias y filtros avanzados, bajo demanda.
- **P2. Contexto antes que rankings genéricos.** No es lo mismo ganar la línea que completar una composición.
- **P3. Explicabilidad.** Cada recomendación responde: qué ventaja ofrece, contra qué campeón o elemento funciona, qué necesidad del equipo cubre, qué sacrificio introduce. No basta una puntuación.
- **P4. Transparencia estadística.** Separar siempre datos observados, predicciones del modelo, heurísticas del sistema e inferencias de Draftsage. No mostrar una predicción como estadística real.
- **P5. Tiempo de selección como restricción.** Identificar una recomendación principal y dos alternativas en ~2 s sin abrir varias ventanas.
- **P6. Progresividad.** Nivel 1 — Decisión (recomendación, ventajas, localizar) · Nivel 2 — Comparación (matchup, sinergias, composición, estadísticas) · Nivel 3 — Análisis (runas alternativas, datos, filtros, explicaciones).
- **P7. No interferir con el cliente.** No bloquear la cuadrícula, ocultar controles, seleccionar campeones ni cambiar el loadout sin consentimiento explícito.

---

# 2. Usuarios y necesidades

## 2.1. Toplaner: ganar o sobrevivir al matchup
Preguntas: mejor matchup contra mi rival; cuánto mejor que el rendimiento habitual del campeón; ganar o solo no perder la línea; si el counter funciona toda la partida o en una fase; runas/objetos contra ese rival; alternativas.
Prioridad: (1) WR del matchup, (2) diferencia respecto al WR habitual del candidato en la línea, (3) muestra, (4) dificultad, (5) ventaja por fase, (6) sinergia con aliados, (7) impacto sobre la composición enemiga.

> **Opción principal: Campeón A** — +3,2 pp respecto a su media en Top · buen enfrentamiento contra el rival revelado · mantiene utilidad en peleas · muestra: 1.240 partidas. *(ilustrativo)*

Evitar confundir un WR elevado con una ventaja específica del matchup.

## 2.2. Jungla: completar la composición y controlar el mapa
El valor depende de: capacidad de gank con los aliados, prioridad de líneas, control de objetivos, iniciar peleas, seguimiento del engage, daño físico/mágico, eliminar carries, proteger carries, escalado, presión temprana, jugar desde atrás.
Preguntas: mayor sinergia con aliados; castigar a los rivales; rivales vulnerables a nuestro equipo; ¿falta engage, frontline, daño mágico, herramientas de objetivos?; ¿podemos ejecutar las peleas de nuestra composición?

> **Opción principal: Campeón B** — Sinergia: buena con el engage de tu Support · Presión: facilita ganks en Mid · Composición: frontline y engage · Rival: acceso a carries · Riesgo: necesita coordinación.

No afirmar que un campeón «counterea a todo el equipo rival» por tener buenos enfrentamientos individuales. Diferenciar: counter individual, ventaja frente a una clase, interacción favorable con una habilidad/mecánica, ventaja de composición, sinergia con aliados.

## 2.3. Midlaner
Matchup, roaming, sinergia con el jungla, control de oleadas, daño necesario, respuesta a amenazas, escalado y control de peleas. Destacar la pareja Mid-Jungle cuando ambos están revelados.

## 2.4. ADC
Matchup de botlane, sinergia con Support, amenazas de engage/dive, peel, daño sostenido, tipo de daño, escalado, frontline aliada. No recomendar solo por WR contra el ADC enemigo.

## 2.5. Support
Sinergia con ADC, engage, peel, visión y zonas, respuesta al engage enemigo, compatibilidad con el jungla, necesidades de la composición. Distinguir Support que gana la línea, que facilita el engage y que protege a los carries.

## 2.6. Jugador que quiere jugar su campeón favorito
Considerar maestría, familiaridad, preferencias, campeones fijados y dificultad. La maestría es un factor, no una imposición.

## 2.7. Jugador que necesita una elección segura
First pick, matchup desconocido, rival oculto, composición incompleta, poca experiencia con los counters. Categoría de **elecciones seguras**: matchups estables, rendimiento poco dependiente del rival, flexibilidad, menor dependencia de una fase, capacidad de jugar desde atrás.

---

# 3. Modelo mental de la interfaz

Tres espacios: **Draft** (elegir campeón), **Build** (runas, hechizos, objetos), **Partida** (build y seguimiento de objetos). Durante Champion Select, Draft y Build se consultan sin salir del contexto. No convertir el plugin en una ventana con cinco pestañas permanentes; la navegación va ligada a las tareas.

```text
DRAFTSAGE
├── DRAFT     Recomendación principal · Alternativas · Matchup · Sinergia · Composición · Filtros · Rivales y aliados
├── BUILD     Runas principales · Secundarias · Fragmentos · Hechizos · Objetos · Alternativas
├── GAME      Objetos adquiridos · Siguiente objeto · Oro disponible · Build completa
└── SETTINGS  General · Datos y filtros · Consejero · Aplicación · Avanzado
```

---

# 4. Experiencia principal: Draft

## 4.1. Vista compacta integrada
La tira de la cabecera de la cuadrícula prioriza lo visual: retrato, posición, indicador de principal, indicador de matchup o sinergia, disponibilidad. No poner toda la explicación en la cabecera; al seleccionar un candidato, el popover presenta su análisis. La barra de runas sigue siendo acceso rápido a la build sin competir con las recomendaciones de campeones.

## 4.2. Vista principal de Draft
- **Cabecera:** campeón propio, rol, lado, tiempo restante (si es fiable), estado de actualización de los datos.
- **Contexto del draft:** 5 + 5 huecos compactos, distinguiendo confirmado, seleccionado sin confirmar, rol conocido / inferido / desconocido, hueco vacío. Las inferencias se distinguen visualmente; no asignar un rol con certeza cuando solo es inferencia.
- **Recomendación principal:** retrato, nombre, posición, motivo principal, 2–3 razones secundarias, confianza, acción para localizar.

```text
RECOMENDACIÓN PRINCIPAL
[Retrato] CAMPEÓN A
MATCHUP FAVORABLE · COMPOSICIÓN MUY BUENA · MAESTRÍA ALTA
+ Buen matchup contra el rival de línea
+ Aporta engage que necesita tu equipo
+ Buena sinergia con tu jungla
[Localizar campeón]
```

No mostrar precisión falsa (93,7/100) si el motor no está calibrado.

- **Alternativas:** 2–3, cada una con por qué elegirla en lugar de la principal (mejor matchup, sinergia, seguridad, escalado, menor dificultad, mejor respuesta a una amenaza). No simplemente los puestos 2–4.

## 4.3. Modos de recomendación (perspectivas, no filtros que oculten información)
- **A. Counter de línea:** estadísticas del matchup, diferencia respecto al rendimiento habitual, muestra, fase, dificultad.
- **B. Sinergia de composición:** sinergias, engage, follow-up, peel, frontline, daño, escalado, condiciones de victoria.
- **C. Counter de composición:** amenazas enemigas, acceso a carries, resistencia/vulnerabilidad frente a clases, control de zonas, disengage, protección, teamfight.

## 4.4. Modo automático (predeterminado)
Pondera matchup, composición, sinergia y preferencias según la información disponible: rival revelado → más matchup; sin rival → más composición; varios aliados → más sinergia; maestría conocida → comodidad; faltan datos → menos confianza y menos categórico. No mostrar los pesos internos como verdades; mostrar los factores que explican la decisión.

---

# 5. Análisis de composición

## 5.1. Dimensiones
- **Daño:** físico, mágico, mixto, sostenido, burst, contra frontline.
- **Estructura:** frontline, backline, engage, disengage, peel, pick, iniciación, contraataque.
- **Control de mapa:** prioridad de líneas, presión temprana, objetivos, rotación, visión y zonas.
- **Escalado:** early/mid/late, condiciones de victoria, dependencia de recursos.
- **Interacciones:** sinergias de habilidades, follow-up de CC, protección de carries, acceso a vulnerables, respuesta a amenazas, compatibilidad de rangos y estilos.

## 5.2. Presentación
Resumen, no una tabla de diez indicadores:

```text
TU COMPOSICIÓN
Daño: Físico predominante · Frontline: Insuficiente · Engage: Bueno · Peel: Limitado · Escalado: Fuerte en late
NECESIDAD PRINCIPAL: frontline y una herramienta fiable de iniciación.
```

Al abrirlo: qué campeones generan cada característica, qué necesidad está cubierta y cuál pendiente, cómo cambia al añadir un candidato.

## 5.3. Equipo rival
Amenazas relevantes (p. ej. burst contra carries, acceso a backline, engage fiable, objetivos) y respuesta recomendada. Cada amenaza con relación verificable con los campeones y habilidades que la originan.

## 5.4. Evaluación incremental de un candidato
Comparar composición antes/después, respuesta contra enemigos, nuevas fortalezas, debilidades que siguen («+ Añades engage … − Sigues teniendo poco peel»).

---

# 6. Sistema de recomendación y explicabilidad

## 6.1. Evaluación multidimensional (no ranking opaco)
`laneMatchup`, `enemyTeamResponse`, `allySynergy`, `teamCoverage`, `playerComfort`, `executionRisk`, `confidence`. Cada dimensión: valor normalizado (si hay modelo calibrado), fuente, muestra, disponibilidad, razones legibles. No todos los factores existen para todos los roles.

## 6.2. Adaptación por rol

| Rol | Factores de mayor importancia |
|---|---|
| Top | Matchup, estabilidad de línea, frontline, side lane |
| Jungle | Sinergia, presión, engage, objetivos, respuesta al equipo rival |
| Mid | Matchup, roaming, sinergia con jungla, daño y control |
| ADC | Matchup de botlane, peel, escalado, daño sostenido |
| Support | Sinergia con ADC, engage, peel, control y respuesta enemiga |

Los pesos se calibran con datos históricos y se validan por rol. Sin porcentajes arbitrarios en producción.

## 6.3. Motivos estructurados (contrato conceptual)

```js
{ candidateId: 123, reasons: [
  { type: 'lane-matchup', polarity: 'positive', importance: 'high', evidence: 'statistical', summary: 'Buen enfrentamiento contra el rival', detail: 'Rendimiento superior a su media en esta línea' },
  { type: 'team-synergy', polarity: 'positive', importance: 'medium', evidence: 'model', summary: 'Buena sinergia con tu jungla' },
  { type: 'team-coverage', polarity: 'negative', importance: 'medium', evidence: 'heuristic', summary: 'No resuelve la falta de daño mágico' } ] }
```

## 6.4. Confianza estadística
Independiente de la puntuación. Mostrar: muestra suficiente / limitada / insuficiente, datos de fallback, predicción del modelo, fuente y parche. No confundir WR alto con confianza alta; no usar solo el número de partidas (también distribución, antigüedad, parche, representatividad).

## 6.5. Reglas de integridad
1. No presentar `result_pred` de iTero como win rate absoluto.
2. Las predicciones relativas de iTero solo se comparan dentro de la misma respuesta y contexto.
3. No mezclar parches sin identificarlo.
4. No comparar métricas de fuentes distintas sin normalización.
5. Una posición inferida no es confirmada.
6. No mostrar counters con muestras insuficientes como recomendaciones fuertes.
7. No presentar una heurística como resultado estadístico.
8. No recomendar un campeón bloqueado, baneado o no disponible como si se pudiera seleccionar.
9. No ocultar las desventajas de una recomendación.
10. Si no hay información suficiente, decirlo explícitamente.

---

# 7. Sistema de runas

- **7.1.** Cinco árboles (Precisión, Dominación, Brujería, Valor, Inspiración) contemplados dinámicamente; las runas salen del catálogo de la versión del juego, no codificadas en la UI.
- **7.2.** Página: árbol principal, runa clave, 3 menores, árbol secundario, 2 menores, 3 fragmentos (las nueve elecciones visibles, fragmentos incluidos), respetando las reglas de la versión.
- **7.3.** Vista: árbol principal con keystone y filas; secundario; fragmentos (ofensivo, flexible, defensivo). Cada runa: icono, nombre, estado seleccionado, descripción breve accesible, motivo si existe. No depender del tooltip para el nombre.
- **7.4.** Cambiar una runa sin reconstruir la página: al elegir otra runa clave, actualizar árbol, menores compatibles, secundario, fragmentos y objetos asociados; poder volver a la recomendación. Distinguir recomendación automática, selección manual temporal y selección fijada.
- **7.5.** Alternativas con estadísticas (uso, WR, partidas), explicando cada métrica. No ordenar por WR si la recomendación usa otro criterio (WPA); identificar fuente y método.
- **7.6.** Runas adaptadas al matchup solo con información suficiente, diferenciadas de las generales; no inventar adaptaciones.
- **7.7.** Hechizos: nombre, tecla, motivo, alternativas compatibles; restricciones por modo y rol en el dominio; Aplastar evidente en jungla, sin combinaciones inválidas.
- **7.8.** Fragmentos independientes con nombres y descripciones, del catálogo de la versión.

---

# 8. Objetos y build
Responder «¿qué compro y en qué orden?»: inicio, primera vuelta, botas, principales, situacionales, alternativas. Nombre visible al seleccionar o consultar. En Champion Select, versión compacta (inicio y núcleo); en partida, completa (adquiridos, siguiente, oro disponible y faltante, progreso, situacionales). Objetos ligados a la runa clave y al contexto cuando los datos lo permitan.

---

# 9. Gestión del tiempo de Champion Select
- **Consulta rápida (1–2 s):** principal, dos alternativas, ventaja principal, localizar. **Normal (3–6 s):** matchup, sinergia, composición, confianza. **Profunda:** estadísticas, filtros, alternativas, runas, detalles. Nunca exigir la profunda para ejecutar una recomendación válida.
- **Actualización incremental:** actualizar lo afectado, mantener lo que no cambia, sin parpadeos, mostrar «pendiente de actualización». Conservar la cancelación, debounce y estado anterior de `champ-select.js`.
- **Prioridad de acciones:** localizar, consultar alternativa, abrir análisis, abrir build. Nunca bloquear la selección nativa ni seleccionar automáticamente.

---

# 10. Diseño visual y sistema de componentes
- **Identidad:** fondo azul oscuro, superficies diferenciadas, dorado para selección y énfasis, turquesa para confirmación y aplicación, rojo para amenazas y errores, gris para metadatos. El color no es el único medio de comunicar estados.
- **Tipografía:** título de vista 15–16 px · nombre de campeón 14–15 · encabezado de sección 12–13 · texto 12–13 · metadatos 10–11. Nada importante en 9 px.
- **Componentes:** ChampionPortrait, ChampionRecommendation, RecommendationReason, ConfidenceIndicator, TeamComposition, TeamSlot, ThreatSummary, SynergySummary, MatchupSummary, RuneTree, RuneOption, RunePage, SpellSelector, ShardSelector, ItemBuild, ItemRow, FilterChip, DataSourceLabel, StatusIndicator. Reciben datos preparados; no consultan el LCU ni servicios externos.
- **Interacciones:** etiqueta accesible, estado seleccionado y deshabilitado, área suficiente, foco visible, comportamiento consistente; no depender solo de `title`; reducción de movimiento; contraste.

---

# 11. Estados de interfaz

| Estado | Comportamiento |
|---|---|
| Idle | No mostrar el panel de selección |
| Waiting | Explicar que se espera una selección |
| Loading | Mantener datos anteriores si siguen siendo válidos |
| Ready | Mostrar recomendaciones |
| Needs login | Explicar qué requiere autenticación |
| Error | Mostrar causa y acción de recuperación |
| Low confidence | Recomendación con advertencia |
| Partial data | Indicar qué información falta |
| Stale data | Identificar que los datos son de un contexto anterior |
| Game | Build completa y seguimiento de objetos |

No usar esqueletos animados como única explicación de una espera. Errores accionables: reintentar, iniciar sesión, cambiar fuente, consultar datos disponibles, continuar con información general.

---

# 12. Filtros y personalización
Avanzados plegados de inicio. Principales: rol, perspectiva, rango, parche, región, fuente. Avanzados: clase, daño, maestría, dificultad, escalado, tipo de matchup, sinergia. Actualizan sin reiniciar el panel; restaurar predeterminados rápido; no ocupar más que las recomendaciones.

---

# 13. Ajustes
Cinco categorías: **General** (activar, mostrar panel, idioma, posición) · **Datos** (fuente, rango, parches, regiones, actualización de datos) · **Consejero** (iTero, maestría y su peso, consentimiento y privacidad) · **Aplicación** (runas, hechizos, destino, tecla de Destello, atajos) · **Avanzado** (simulación, diagnóstico, actualizaciones, restaurar, depuración). Descripción breve y visible en cada ajuste. Consentimientos explícitos; nunca activar por defecto el envío de datos a servicios externos.

---

# 14. Arquitectura técnica propuesta
- **14.1.** No reescribir dominio ni infraestructura. El rediseño se concentra en presentación y en ampliar de forma controlada la evaluación de candidatos. Se conserva `presentation → application → domain` e `infrastructure → application`.
- **14.2.** Estructura objetivo (lógica, no obligación de crear todos los archivos): `domain/recommendation/{candidate-evaluation,role-profile,matchup,synergy,team-coverage,threat-analysis,confidence,explanations}.js`; `application/{draft-analysis,candidate-recommendations,build-recommendation}.js`; `presentation/components/{champion,draft,build,runes,shared}/` y `presentation/views/{draft,build,game,settings}-view.js`.
- **14.3.** Domain: reglas puras (sin DOM, LCU, APIs ni preferencias). Application: contexto, fuentes, cachés, cancelación, carga, actualización incremental. Presentation: transforma datos en componentes; no calcula estadísticas ni elige fuente. Infrastructure: APIs, catálogo, LCU.
- **14.4.** Contrato conceptual de recomendaciones: `context` (rol, campeón, rival, aliados, enemigos, lado, parche) y `candidates[]` con `evaluation` (todas las dimensiones admiten `null`), `confidence`, `reasons`, `tradeoffs` y `data` (fuente, parche, muestra). **No sustituir un dato desconocido por cero.**
- **14.5.** Separar recuperación de datos, evaluación y presentación de la explicación; cada dimensión comprobable por separado; agregación calibrada con validación histórica, sin pesos arbitrarios.

---

# 15. Plan de implementación
- **Fase 0 — Auditoría y línea base:** mapa de componentes, mapa de datos, inventario, línea base de rendimiento y errores, capturas del cliente real. No modificar el algoritmo. → `docs/UX-AUDIT.md`.
- **Fase 1 — Sistema visual y componentes:** tokens, tipografía y espaciado, componentes reutilizables, estados accesibles, etiquetas, separar el panel (`ui.js`, `panel.js`, `native.js`, `presentation/components/`). Componentes probables sin el LCU.
- **Fase 2 — Build:** `BuildView`; runas principales/secundarias separadas; fragmentos; hechizos con nombre; selector de runas alternativas; estadísticas y fuentes; objetos; aplicación explícita; estados. Criterios: nueve elecciones identificables; se entiende qué se aplicará; modificar y recuperar; sin opciones incompatibles; aplicar con acción y consentimiento.
- **Fase 3 — Draft:** `DraftView`; cabecera; principal y alternativas; matchup; sinergias; razones; confianza; aliados y rivales; localizar. Criterios: se entiende sin abrir detalles; comparar candidatos; razones con evidencia; disponibilidad correcta.
- **Fase 4 — Motor de composición:** características de campeones, sinergias, interacciones, cobertura, perfiles por rol, iTero, normalización de fuentes, explicaciones, calibración, validación con drafts históricos.
- **Fase 5 — Ajustes y personalización.**
- **Fase 6 — Validación en el cliente real:** todos los roles, first/last pick, rival revelado/oculto, aliados parciales, baneado, no disponible, red, autenticación, fuente alternativa, cambio de parche, runas manuales, aplicación parcial, inicio de partida, zoom y resoluciones. Una prueba solo con DOM simulado no basta.

# 16. Pruebas y calidad
Domain (matchup, sinergias, cobertura, amenazas, confianza, explicaciones, runas, alternativas) · Application (cambios de contexto, cancelación, debounce, caché, incremental, datos obsoletos, errores parciales) · Presentation (renderizado, selección, estados, accesibilidad, tooltips, navegación, aplicación, controles nativos) · Integración (la UI no hace peticiones, el dominio no conoce el DOM, fuentes no mezcladas, catálogo del parche correcto, sin duplicados cuando Ember repinta).

# 17. Métricas de éxito

| Métrica | Objetivo |
|---|---|
| Tiempo hasta identificar una recomendación | < 2 s |
| Tiempo para consultar una razón principal | < 4 s |
| Acceso a Build / a alternativas | Un clic |
| Acciones principales con etiqueta visible | 100 % |
| Recomendaciones con fuente identificable | 100 % |
| Recomendaciones estadísticas con muestra disponible | 100 % |
| Estados de error con recuperación | 100 % |
| Selecciones automáticas de campeón | 0 |
| Aplicaciones de loadout sin consentimiento | 0 |

Validar con pruebas con jugadores (al menos uno por rol; escenarios: counter en Top, completar composición en Jungle, sinergia Mid-Jungle, compatibilidad ADC-Support, engage/peel en Support, comparar dos páginas de runas, localizar antes de terminar el turno), registrando tiempo, clics, errores de interpretación, elementos ignorados e información buscada y no encontrada.

# 18. Decisiones que no se recomiendan
1. Reescribir toda la arquitectura. 2. Migrar a React u otro framework por modernizar. 3. Convertir cada información en una tarjeta. 4. Puntuación única sin explicación. 5. Cinco o diez razones por candidato en la vista compacta. 6. Presentar counters individuales como análisis de composición. 7. Colores como único indicador. 8. Esconder nombres de runas y objetos tras tooltips. 9. Llenar Champion Select de filtros avanzados. 10. Una petición de red adicional por interacción. 11. Mostrar muestras insuficientes como certezas. 12. Alterar el comportamiento seguro de aplicación de runas y hechizos.

# 19. Priorización

| Prioridad | Trabajo |
|---|---|
| P0 | Build clara y legible · Recomendación principal y alternativas · Razones y confianza visibles · Optimización para el tiempo de selección |
| P1 | Análisis de matchup · Sinergia entre aliados · Cobertura de composición · Sistema completo de runas alternativas |
| P2 | Análisis avanzado de amenazas · Personalización por maestría · Filtros avanzados |
| P3 | Analítica de preferencias y comportamiento (futuro) |

# 20. Referencias
Internas: `README.md`, `docs/ARCHITECTURE.md`, `docs/champ-select-dom.md`, `src/application/champ-select.js`, `src/domain/overlay-stats.js`, `src/domain/itero.js`, `src/presentation/{panel,native,settings}.js`.
Externas: [Riot — Matchmaking and Champion Select](https://www.leagueoflegends.com/en-us/news/dev/matchmaking-and-champion-select-fall-2022/) · [Riot Support — Choosing the Right Champion](https://support-leagueoflegends.riotgames.com/hc/en-us/articles/201752864-Choosing-the-Right-Champion) · [LoL Wiki — Team Drafting](https://wiki.leagueoflegends.com/en-us/Team_drafting) · [Draft Builder — metodología](https://draftbuilder.lol/about) · [Counterpicker — análisis de composición](https://counterpicker.com/en/about).

# 21. Decisión de producto
Draftsage como **asistente de draft contextual, explicable y rápido**: transformar información dispersa en una decisión útil. Flujo ideal: entrar en Champion Select → detectar rol y revelados → principal + dos alternativas → ventajas y desventajas breves → profundizar en matchup, sinergia o composición → localizar sin seleccionar → build completa y comprensible → modificar runas y aplicar explícitamente.

**Regla fundamental: la interfaz debe hacer evidente qué elegir, por qué elegirlo y qué hacer después, sin obligar al jugador a convertirse en analista mientras el reloj de Champion Select está corriendo.**
