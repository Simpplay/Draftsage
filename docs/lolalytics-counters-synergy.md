# Lolalytics — counters, sinergias y estadísticas por campeón (para el overlay de Champion Select)

Complementa a `docs/lolalytics.md` (formato del HTML/estado Qwik). Investigado el 2026-11-05 en un navegador real (parche 16.22, Ezreal bottom, `emerald_plus`). ✅ = comprobado; ❓ = deducido o sin comprobar.

**Objetivo de la futura función:** en Champion Select, mostrar sobre cada campeón (aliado y rival, y el tuyo) sus estadísticas útiles: cómo le va **tu** campeón contra cada rival (counters) y con cada aliado (sinergia), y las cifras generales del campeón (win rate, pick/ban, tier).

## 1. Corrección importante a `docs/lolalytics.md`: SÍ hay endpoint JSON (parcial)

Las sinergias **no vienen en el HTML**: el estado de la página trae la señal `team = { data:{}, loading:{} }` vacía, y se **rellena al pulsar la pestaña de sinergias** con una petición del navegador ✅:

```
GET https://a1.lolalytics.com/mega/?ep=build-team&v=1&patch=16.22&c=ezreal&lane=bottom&tier=emerald_plus&queue=ranked&region=all
→ 200 application/json (~18 KB), sin cookies ni cabeceras especiales
```

Mis pruebas anteriores fallaban por parámetros erróneos (`queue=420` y `c=` con id) **y** porque `ep=build` no es público: `ep=build` y `ep=champion` siguen respondiendo `invalid end point` aun con los parámetros buenos ✅ (los datos principales solo se sirven en el HTML renderizado). Los `ep` públicos que usa el código del cliente (lectura de los bundles) ✅:

| `ep` | Contenido | Estado |
|---|---|---|
| `build-team` | **Sinergias** (aliados por línea) | ✅ analizado (§3) |
| `build-earlyset` → `earlySet` | Ítems tempranos | ✅ existe; formato ❓ no analizado |
| `build-itemset` → `itemSets` | Conjuntos de ítems con botas | ✅ existe; formato ❓ (en HTML ya viene `itemSets`) |
| `arena-itemset` | Arena | ✅ existe; ❓ no analizado |

**Construcción de la URL** (copiada del código de la web) ✅:
- Página de build: `https://{api.build}.lolalytics.com/mega/?ep={ep}&v=1&patch={patch}&c={slug}&lane={lane}&tier={tier}&queue={mode}&region={region}` (+ `&keystone=`/`&item=` si hay filtro).
- Página de matchup: `…/mega/?ep={ep}&v=1&patch={patch}&c={slug}&lane={lane}&vs={slugRival}&vslane={laneRival}&tier={tier}&queue={mode}`.
- Host: `api[...]` del estado (`build`→`a1`, `vs`→`a3`, `item`→`a2`, `keystone`→`a3`, `arena`/`front`/`tierlist`→`a1`). Para `build-team` es `a1` ✅.
- Valores: `v=1`, `patch` = `header.patch` ("16.22"), `c` = **slug** del campeón (no el id), `queue` = **`ranked`** (no 420), `region=all`, `lane` ∈ `top|jungle|middle|bottom|support`, `tier` = `emerald_plus`, `all`, etc.

⚠ Es un backend interno sin documentar: puede cambiar o limitarse. Tratarlo igual que el HTML (validar, caché, degradar). CORS: sin problema según el proyecto (`DisableWebSecurity=1`); el probe lo comprueba desde Node.

## 2. Counters (cómo te va contra cada rival)

**Fuente: HTML de la página de build** → raíz del estado Qwik (`docs/lolalytics.md` §5), clave `enemy` ✅.

```
enemy_h = ["id","wr","d1","d2","pr","n"]                         // cabecera (leída: id, wr, d1…; resto por valores y por la web)
enemy   = { top:[…], jungle:[…], middle:[…], bottom:[…], support:[…] }   // una lista por LÍNEA DEL RIVAL
fila    = [ cidRival, wr, d1, d2, pr, n ]                          // p. ej. [145, 47.44, -1.95, -0.73, 17.03, 6381]
```

- **Cobertura cruzada ✅**: las 5 líneas, no solo la tuya. Ezreal bottom: `bottom` 140 filas (rivales en su línea), y también `support`, `top`, `jungle`, `middle`. Para el overlay: el rival de otra línea (p. ej. el support enemigo) se busca en `enemy.support`.
- Filas **ordenadas por `n` descendente** ✅ (140 filas; la última tiene `n = 1`, ruido).
- `wr` = win rate **del campeón de la página** contra ese rival (no del rival). La relación inversa se obtiene mirando la página del rival (`wr ≈ 100 − wr_rival`).
- `pr` = % de las partidas del campeón en que apareció ese rival ✅ (`n / header.n`: 6381 / 37461 = 17,03 %).
- **`d1` (Delta 1)** ✅ texto oficial de la web: `wr − (100 − winRateMedioDelRival)`; positivo = el campeón gana a ese rival más de lo que lo hace el campeón medio. Comprobado numéricamente: Kai'Sa `wr 47,44`, `d1 −1,95` ⇒ win rate medio de Kai'Sa 50,6 % (lista de tier: 50,58 %) ✅.
- **`d2` (Delta 2)** ✅ texto oficial: `wr − winRateNormalizadoEnElMatchup`; positivo = gana más de lo que sugerirían los win rates normalizados. La «normalización» no está publicada: usar `d2` tal cual, sin recalcularlo.
- **Cabecera `header.counters = { strong:[cid×3], weak:[cid×3] }`** (solo página de build) ✅ regla reconstruida contra los datos: los 3 de **la misma línea** con **más / menos `wr`** entre los de **`n ≥ 200`** (strong: 22, 51, 21; weak: 112, 157, 115). Es un atajo para «mejores/peores 3» sin ordenar la tabla.
- **Pestañas de la web** (Common Matchup · Strong Against · Weak Against · Delta): ordenaciones de esta misma tabla; el criterio exacto de cada una ❓ no se pudo confirmar (el renderizador del navegador de pruebas dejó de responder). Reglas propuestas, propias y razonables: Común = `pr` desc (el orden original) · Fuerte = `wr` desc · Débil = `wr` asc · Delta = `d1` desc, todas con `n ≥ 200` (mismo umbral que la web usa en `header.counters`).
- Rival con poca muestra (`n < 200` ≈ < 0,5 % de las partidas): mostrarlo atenuado o sin cifra; el `wr` de muestras de 1–20 partidas es ruido (aparecen 0 % y 100 %).

## 3. Sinergias (cómo te va con cada aliado)

**Fuente: JSON `ep=build-team`** (§1) ✅.

```json
{ "team_h": ["id","wr","d1","d2","pr","n"],
  "team": { "top":[…], "jungle":[…], "middle":[…], "support":[…] },   // las líneas DISTINTAS de la tuya (para bottom no hay "bottom")
  "cache": "cached", "response": { "valid": true, "duration": "1" } }
fila = [ cidAliado, wr, d1, d2, pr, n ]        // p. ej. support: [43, 47.24, -1.37, 1.32, 12.9, 4833]  (Karma)
```

- Mismo formato de fila que los counters ✅ (cabecera `team_h` = `id, wr, d1, d2, pr, n`). Longitudes en Ezreal bottom: top 165, jungle 117, middle 159, support 159; **ordenadas por `n` y por `pr` desc** ✅.
- `wr` = win rate **de tu campeón cuando ese aliado juega en esa línea** (el dúo). `pr` = % de las partidas de tu campeón con ese aliado en esa línea ✅ (Karma 12,9 % = 4833 / 37 461).
- **`d1` = Synergy Delta** ✅ texto oficial: `wrJuntos − (wrTuCampeón + wrAliado) / 2`. Positivo = la pareja rinde mejor que la media de sus win rates. Comprobado: Ezreal 47,49 y Karma ≈ 49,7 ⇒ media 48,6; `wr` 47,24 ⇒ `d1 = −1,37` ✅.
- **`d2` = Normalised Synergy Delta** ✅ texto oficial: `wrJuntos − winRateEsperadoNormalizadoJuntos`. Misma idea con la normalización interna de Lolalytics; usar tal cual.
- Pestañas de la web: Common Teammates / Good Synergy / Bad Synergy / Synergy Delta / Normalised Synergy Delta. Equivalentes propios: Común = `pr` desc · Buena = `wr` desc · Mala = `wr` asc · Delta = `d1` desc · Normalizada = `d2` desc, con el mismo umbral `n ≥ 200` ❓ (el de la web para sinergias no se verificó).
- **No existe** sinergia «de tu campeón con un aliado cuando tú aún no has elegido»: la tabla es siempre desde el campeón de la página. Si no has elegido, no hay overlay de sinergia/counter personalizado (usa solo la lista de tier, §4).
- Coste: una petición pequeña (~18 KB) por campeón/línea/rango/parche.

## 4. Estadísticas generales de cada campeón: la lista de tier

**Fuente: HTML `https://lolalytics.com/es/lol/tierlist/?lane={lane}&tier={tier}`** ✅ (estado Qwik de ~140 KB, una página por línea). No hay objeto raíz con clave estable: cada fila es un objeto suelto con claves `cid` y `row` (`{ $$nav, cid, row, $$fields, placeholder }`); extraer **todos los objetos que tengan `cid` y `row`** (53 filas en bottom ✅):

```json
{ "cid": 81, "row": { "rank":47, "tier":12, "lane":"bottom", "defaultLane":"bottom", "pctLane":95.03,
    "wr":47.55, "avgWrDelta":1, "pr":14.01, "br":4.3, "pbi":-55, "games":38101,
    "topRank":86, "topWr":"55.72", "topGames":2432, "topDelta":8.17, "topElo":798 } }
```

- `rank` posición en la lista de esa línea; `tier` índice de nota **1…15** ✅: 1 S+, 2 S, 3 S−, 4 A+, 5 A, 6 A−, 7 B+, 8 B, 9 B−, 10 C+, 11 C, 12 C−; 13 D+, 14 D, 15 D− ❓ (12 = «C−» comprobado con Ezreal; el resto por orden y por las 15 posiciones vistas).
- `wr`, `pr`, `br` (ban), `games`, `pctLane` (% de las partidas del campeón en esa línea), `pbi` (índice pick-ban), `avgWrDelta`; `top*` = mejores jugadores del campeón (`topWr` es **cadena**).
- Solo aparecen campeones con muestra suficiente en esa línea (53 en bottom): un campeón sin fila = «sin datos en esa línea».
- Para un overlay completo: **5 páginas** (una por línea) por parche/rango → mapa `lane → cid → row`; cachear por horas.

### Utilidades que trae el propio estado de cada página ✅
- **Mapa `cid → slug`** (173 campeones): objeto de `objs` con las claves `'81'`, `'62'`… (y >150 entradas): `81 ezreal`, `62 wukong`, `20 nunu`, `31 chogath`, `36 drmundo`, `136 aurelionsol`, `200 belveth`, `888 renata`, `804 yunara`… Localizarlo por forma (claves `'81'` y `'62'`), no por índice. Evita depender de `alias` del LCU: los counters/sinergias traen **ids** (`cid`), que coinciden con los ids de Riot (`championId` del LCU).
- Mapa `slug → nombre` localizado (obj con claves `aatrox, ahri…` y valores como «bardo», «bel'veth»).

## 5. Cómo cruzarlo con el Champion Select (diseño propuesto)

Entradas del `MatchContext` (ya existen): tu campeón (`cid`), tu línea, aliados (`allies`, con su línea si el LCU la da) y rivales (`enemies`/`theirTeam`, línea `assignedPosition` si la hay).

1. **Datos por consulta** (todo cacheable por `parche|rango|campeón|línea`):
   - `A` = HTML de la build de tu campeón en tu línea → `enemy` (counters) + `header` (+ `header.counters`).
   - `B` = JSON `build-team` de tu campeón en tu línea → `team` (sinergias).
   - `C` = lista de tier de las 5 líneas (una vez por parche/rango) → estadísticas generales.
   Total en frío: 2 peticiones por campeón elegido (+5 la primera vez); al cambiar de campeón en hover, 2 más (reutilizar la caché de peticiones compartidas y el *debounce* de 350 ms que ya hay).
2. **Para cada rival `r` con línea `L_r`**: fila = `enemy[L_r].find(cid == r)` → mostrar `wr` (tu campeón vs `r`), `d1` como flecha ▲/▼, `n` como fiabilidad. Si el LCU no informa la línea del rival: probar en las 5 listas y quedarse con la de mayor `n`.
3. **Para cada aliado `a` con línea `L_a`**: fila = `team[L_a].find(cid == a)` → `wr` del dúo, `d1` (Synergy Delta), `n`.
4. **Sobre cada campeón (aliado o rival)**: fila de la lista de tier de su línea → nota (`tier` 1–15 → S+…D−), `wr`, `pr`, `br`.
5. **Sin campeón elegido aún**: solo (4). Para sugerir picks («qué campeón va bien contra los rivales ya revelados») hace falta una consulta por candidato (1 HTML cada uno): empezar con tu pool favorito, no con todos.
6. **Estructura de capas** (reglas del proyecto): `infrastructure/lolalytics/{qwik.js, client.js}` (HTML, JSON `build-team`, lista de tier, caché, timeouts, `AbortController`) → `domain/lolalytics-stats.js` (validar filas, umbrales, notas, buscar por `cid`, ordenaciones) → `application/overlay-stats.js` (contexto → estadísticas por campeón) → presentación (iconos/chips, sin `fetch`). Nada de `innerHTML`: solo números e ids.
7. **Fiabilidad**: usar el medidor de `domain/confidence.js` con `n`; ocultar o atenuar filas con `n < 200`; no mostrar `wr` de `n < 30`.
8. **Presentación sobre los retratos de Champion Select**: el DOM del cliente para la selección no está documentado en Pengu 1.1.6 ❓. Primero explorar en el cliente real (selectores de los retratos, posición, z-index) o empezar con un panel propio (como el actual) con una fila por campeón.

## 6. Qué hay que verificar con el probe

`node dev/api-probes/test-lolalytics-matchups.mjs ezreal bottom emerald_plus` (sin credenciales): descarga el HTML de la build (counters), el JSON `build-team` y la lista de tier, valida los esquemas de §2–§4, comprueba que `n / header.n ≈ pr` y que el mapa `cid → slug` existe, e imprime los mejores/peores counters y sinergias por línea.

Pendiente de aclarar (❓):
1. `fetch` del JSON `build-team` desde Node/CEF (CORS, Cloudflare, límites de uso) — el HTML ya se confirmó desde el equipo del usuario.
2. Criterios exactos de las pestañas de la web y umbral de sinergias; valores de `tier` 13–15 en la lista de tier.
3. Formato de `build-earlyset`, `build-itemset`, `arena-itemset`.
4. Qué devuelve `build-team` / la página con una línea sin datos (¿listas vacías, error, `valid:false`?).
5. Lista de tier con `lane=all`/sin línea y con otros `tier`; comportamiento con rangos bajos (`gold`, `iron`).
6. Frecuencia razonable de peticiones y términos de uso (ver §9 de `docs/lolalytics.md`).
