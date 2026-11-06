# Lolalytics — análisis para integrarlo como segunda fuente de datos

Estado de la implementación (2026-11-05): **integrado** como fuente elegible y como estadísticas de Champion Select (ver «Lolalytics integrado» en `docs/HANDOFF.md`); probado con datos sintéticos, **❓ pendiente de verificar contra la web real y desde el cliente**. Corrección: el árbol de una runa no es siempre `floor(id/100)·100` (las 9xxx y la 8299 son excepciones): usar `treeOfRune` de `domain/runes.js`.

Análisis previo: **investigado el 2026-11-05 en un navegador real** (parche 16.22, Ezreal, `emerald_plus`, `1trick`). Todo lo marcado ✅ se comprobó; lo marcado ❓ es deducción o no se pudo comprobar desde aquí y **hay que verificarlo** con `dev/api-probes/test-lolalytics-html.mjs` (ver §10) antes de apoyarse en ello.

> **Actualización (misma fecha):** la afirmación «no hay endpoint» de este documento es cierta **para los datos principales** (build, runas, ítems, counters: solo en el HTML), pero **las sinergias sí tienen endpoint JSON público** (`ep=build-team`). Detalle, counters, sinergias y lista de tier: `docs/lolalytics-counters-synergy.md`. El probe `test-lolalytics-html.mjs` ya se ejecutó en el equipo del usuario: HTTP 200, 384 KB, estado Qwik de 5 435 objetos, esquema válido ✅.

## 1. Conclusión

- **No hay endpoint JSON para los datos principales.** La web (Qwik + Qwik City, renderizada en servidor) no los pide desde el navegador: viajan **dentro del HTML** de la página, en `<script type="qwik/json">` (≈ 280–320 KB de JSON por página). Solo algunas pestañas se cargan después por JSON (sinergias: `build-team`).
- La vía de integración es: **`GET` de la página de build → extraer y decodificar el estado Qwik → leer el objeto raíz** (sección 5). Lo del CORS no es problema (el proyecto ya trabaja con `DisableWebSecurity=1`).
- No hace falta cuenta ni autenticación: es contenido público. No hay equivalente a «premium/free» ni a `patchAdditions`; los filtros son parámetros de URL.
- Lolalytics aporta lo que Coachless no da con los endpoints conocidos: **tabla de counters** (matchups por línea), build completa con ítems y habilidades por matchup, y datos gratuitos de matchup (en Coachless el matchup es premium). No aporta filtro por aliados.

## 2. Qué se probó para encontrar un endpoint (todo ✅ negativo)

| Prueba | Resultado |
|---|---|
| Tráfico de red al cargar `…/ezreal/build/` y `…/ezreal/vs/jinx/build/` (298 peticiones) | Solo imágenes (`cdn5.lolalytics.com/champx92/*.webp`), scripts `build/q-*.js`, `assets/*-bundle-graph.json`, `manifest.json` y publicidad. **Ninguna petición de datos.** |
| Buscar `mega`, `a1.lolalytics`, `ep=`, `endpoint` en los 117 bundles JS del cliente | Sin resultados útiles: las URLs de API no están en el código del navegador (se llaman desde el servidor). |
| `https://a1.lolalytics.com/mega/?ep=build&v=1&patch=16.22&c=ezreal&lane=bottom&tier=1trick&queue=420&region=all` | Responde texto plano `invalid end point`. |
| `https://a1.lolalytics.com/mega/?ep=champion&p=d&v=1&patch=16.22&cid=81&lane=default&tier=emerald_plus&queue=420&region=all` | Igual: `invalid end point`. |

Pista: el estado de la página trae `api: { front:'a1', tierlist:'a1', build:'a1', vs:'a3', arena:'a1', item:'a2', keystone:'a3' }`, es decir, existen backends `a1/a2/a3` consultados **por el servidor** de Lolalytics. Los nombres de `ep` actuales son desconocidos (los antiguos, `champion`/`build`, se rechazan). **No merece la pena seguir buscándolos**: no son públicos ni estables; si algún día se descubre uno, bastará con sustituir el origen de datos en `infrastructure/lolalytics/`.

## 3. URLs de las páginas

Base: `https://lolalytics.com/{lang}/lol/{slug}/…` (`lang` = `es`; sin prefijo = inglés ❓ mismos datos, los ids son numéricos).

| Página | URL | Estado |
|---|---|---|
| Build del campeón | `/es/lol/ezreal/build/?tier=emerald_plus&lane=bottom` | ✅ |
| Matchup (build vs rival) | `/es/lol/ezreal/vs/jinx/build/?tier=emerald_plus` | ✅ (la línea del rival sale en `header.vsLane`) |
| Matchup con línea explícita | `…&lane=bottom` (y del rival `vslane=…`) | ❓ el estado trae `lane` y `vsLane` pero el nombre del parámetro del rival no se probó |
| Parche concreto | `&patch=16.22` | ❓ el estado trae `patch` y `currentPatch`; sin parámetro se sirve el actual |

Parámetros vistos en el estado de la página (`page`, `lane`, `vsLane`, `mode:'ranked'`, `patch`, `tier`, `region:'all'`, `view:'list'`, `keystone:-1`, `item:'-1'`): clave de caché interna `ezreal_all_ranked_list_emerald_plus_16.22_all_jinx_all`.

- **Líneas** ✅ (enlaces de la web): `top`, `jungle`, `middle`, `bottom`, `support`. Mapeo desde el LCU: `TOP→top`, `JUNGLE→jungle`, `MIDDLE→middle`, `BOTTOM→bottom`, `UTILITY→support`.
- **Rango (`tier`)**: ✅ `emerald_plus`, `all`, `challenger`, `grandmaster`, `master`, `1trick` (la URL del usuario); ✅ por las series de la gráfica existen `diamond_plus`, `emerald`, `platinum`, `gold`, `silver`, `bronze`, `iron`. ❓ El resto (`master_plus`, `platinum_plus`, `gold_plus`, `d2_plus`…) no se comprobó; el selector de la web no se llegó a abrir.
- **Cola**: `header.queue = 420` (ranked solo/dúo) ✅; otros modos (ARAM, Arena) tienen rutas propias ❓ no analizadas.
- **Slug del campeón** ✅: nombre interno en minúsculas sin símbolos. Mapa id → slug (173 campeones, en el estado de cada página): `20 nunu`, `31 chogath`, `36 drmundo`, `62 wukong` (Riot: `MonkeyKing`), `136 aurelionsol`, `200 belveth`, `888 renata`, `799 ambessa`, `804 yunara`… Regla propuesta: `alias` del LCU en minúsculas sin `'`, `.`, espacios, con la excepción `MonkeyKing → wukong`. Reutilizar/ampliar `domain/web.js` (ya tiene ese slug para coachless.gg; **comprobar** que coincide para todos).

## 4. Obtención del HTML

- Un `GET` normal devuelve el HTML con el estado ya incrustado (no hace falta ejecutar JS) ✅. **Confirmado desde el equipo del usuario con Node (2026-11-05):** `HTTP 200` en 623 ms, 384 KB, `server=cloudflare`, estado Qwik de 5 435 objetos y esquema válido, sin cabeceras especiales. Falta repetirlo desde el cliente del LoL (CEF) ❓.
- Cloudflare está delante ✅ (`server: cloudflare`, `cf-ray`; el `robots.txt` es «Cloudflare Managed content»): puede devolver un reto anti-bot (403/503 con HTML de verificación) en otras condiciones (más frecuencia, otra IP). Hay que **detectar** que el HTML devuelto no contiene `qwik/json` y tratarlo como «fuente no disponible».
- `robots.txt` ✅: `User-agent: *` → `Allow: /`; `Content-Signal: search=yes, ai-train=no, use=reference`; `AmazonAdBot` pide `Crawl-delay: 1`. Bloquea rastreadores de entrenamiento de IA (no es el caso de un plugin del usuario, pero indica postura sobre uso automatizado).
- Respetar: **caché agresiva** (por parche + campeón + línea + rango + rival; los datos cambian por parche y se recalculan a diario), **una petición por consulta**, nada de precargar todos los matchups.

## 5. Formato del estado Qwik

`<script type="qwik/json">` contiene `{ refs, ctx, objs, subs }`. Solo importa **`objs`** (5 436 entradas en una página de build). Es un grafo serializado:

- `objs[i]` es un valor: número, booleano, `null`, **cadena**, **array** u **objeto**.
- Dentro de arrays y objetos, **cada elemento es una referencia**: una cadena en **base 36** con el índice en `objs` (`"2dz"` → `objs[parseInt('2dz',36)]`). Los números reales (p. ej. `46.36`) viven como entradas propias de `objs` y se apuntan igual.
- Una cadena de `objs` que empieza por carácter de control (`\u0001`…`\u0013`) es un tipo interno de Qwik (referencias, funciones, URLs, subscripciones…); **no son datos**. Las cadenas de datos son normales (`"QEW"`, `"4_21"`).
- Los **índices cambian en cada despliegue y por página**. Nunca fijar índices: localizar el objeto raíz **por sus claves** (la raíz es el único objeto con la clave `skillEarly`).
- Hay ciclos (los contextos de componentes se referencian entre sí): el decodificador debe memorizar lo ya resuelto.

### Decodificador de referencia (probado ✅ contra el estado real, ~0 ms)

```js
// infrastructure/lolalytics/qwik.js — solo lectura, sin dependencias
export function parseQwikState(html) {
  const m = /<script type="qwik\/json">([\s\S]*?)<\/script>/.exec(html);
  if (!m) throw new Error('sin-estado-qwik');
  return JSON.parse(m[1]);
}

export function makeResolver(state) {
  const objs = state.objs, memo = new Map();
  function at(i) {
    if (memo.has(i)) return memo.get(i);
    const o = objs[i];
    if (o === null || typeof o !== 'object') { memo.set(i, o); return o; }
    const out = Array.isArray(o) ? [] : {};
    memo.set(i, out);                                   // permite ciclos
    const val = (v) => (typeof v === 'string' ? at(parseInt(v, 36)) : v);
    if (Array.isArray(o)) o.forEach((v) => out.push(val(v)));
    else for (const k in o) out[k] = val(o[k]);
    return out;
  }
  return { at, objs };
}

export function findRoot(state, key = 'skillEarly') {
  const i = state.objs.findIndex((o) => o && typeof o === 'object' && !Array.isArray(o) && key in o);
  return i < 0 ? null : i;
}

// Uso: const st = parseQwikState(html); const root = makeResolver(st).at(findRoot(st));
```

Nota: resolver solo desde la raíz (no todo `objs`) mantiene el coste mínimo. Validar la forma de lo leído (sección 8) antes de usarlo.

## 6. Esquema del objeto raíz

Claves de la raíz (página de build, 33): `header, summary, graph, nav, analysed, avgWr, n, runes, sidebar, skillEarly, builtBootSet3, spells, startItem, skill6, skill10, skill15, itemSets, boots, supportItem, popularItem, winningItem, item, item1…item5, skillOrder, earlyItem, startSet, enemy_h, enemy, cache, response`.
La página de **matchup** tiene casi las mismas, **sin** `graph`, `itemSets`, `supportItem`, `enemy`, `enemy_h` ✅.

Convenciones: `wr` = % de victorias, `pr` = % de uso, `n` = partidas. Ids = ids de Riot (campeones, ítems, runas, hechizos).

### `header` ✅
`patch` ("16.22"), `defaultLane`, `cid` (id del campeón), `lane`, `queue` (420), `wr`, `avgWr`, `avgWrDelta`, `pr`, `n` (partidas), `br` (ban rate), `rank`/`rankTotal`, `tier` (nota de nivel: "C-"…), `topWin`/`topElo` (mejores jugadores).
- Solo en **build**: `counters: { strong:[cid…], weak:[cid…] }`, `damage: { physical, magic, true }`.
- Solo en **matchup**: `vs` (cid rival), `vsLane`, `defaultVsLane`, `usualWinRate` (win rate habitual del campeón), `vsWinRate`, `delta1`, `delta2`. ✅ `vsWinRate` es el win rate medio del **rival** y `delta1 = wr − (100 − vsWinRate)` (Ezreal vs Jinx: 46,26 − (100 − 52,11) = −1,63, coincide con el tooltip «Delta 1» de la web). ❓ `delta2` sin fórmula verificada.
- En matchup, `wr`/`n` son los del duelo (Ezreal vs Jinx emerald+: `n` = 1 740) y **la muestra es pequeña**: aplicar umbral como `MIN_MATCHUP_SAMPLE`.

### `summary` ✅ → `{ pick, win }`
- `pick` = la **build más común**; `win` = la **de mayor win rate** (pestañas «Most Common Build» / «Highest Win Build»).
- Cada una: `{ skillpriority:{id:"QEW",n,wr}, skillorder:{id:132114131343322,n,wr}, sums:{ids:[4,21],n,wr}, runes:{wr,n,page:{pri,sec},set:{pri:[4 ids],sec:[2 ids],mod:[3 ids]}}, items:{ start:{n,wr,set:[ids],setUnique:[ids],count:[…]}, item1:{id,n,wr}, item2:{id,n,wr}, item3:{id,n,wr}, item4:[{id,n,wr}…], item5:[…], item6:[…] } }`.
- **Runas**: `set.pri` = keystone + 3 filas (`[8008,8009,9103,8014]`), `set.sec` = 2 runas del árbol secundario, `set.mod` = 3 fragmentos (`[5005,5008,5001]`) → **9 ids**, exactamente la página que ya construye `domain/configuration.js`. `page.pri/sec` es un índice de árbol propio (0 y 4 para Precisión e Inspiración) ❓ **ignorarlo y derivar el árbol del id**: `floor(id/100)*100` → 8000 Precisión, 8100 Dominación, 8200 Brujería, 8300 Inspiración, 8400 Valor.
- **Hechizos**: `sums.ids = [4,21]` (Riot: Destello=4, Barrera=21, …).
- `skillorder.id` = dígitos 1=Q 2=W 3=E 4=R hasta nivel 15 (`132114131343322` = Q E W Q Q R …) ✅ (coincide con `skillpriority` QEW).

### Tablas planas (cada fila es un array posicional) ✅
| Clave | Fila | Notas |
|---|---|---|
| `spells` | `[ "4_21", wr, pr, n ]` | pareja de hechizos; ids unidos por `_` |
| `startSet` | `[ "1086_2003_2003", wr, pr, n ]` | conjunto inicial (con repetidos) |
| `startItem` | `[ itemId, wr, pr, n ]` | `pr` puede pasar de 100 (cuenta unidades) |
| `boots`, `popularItem`, `winningItem`, `item`, `item1…item5`, `supportItem` | `[ itemId, wr, pr, n, t ]` | `t` ≈ minuto medio de compra ❓ |
| `earlyItem` | `[ itemId, wr, pr, n ]` | ítems a los 10 min ❓ |
| `skillOrder` | `[ "QEW", wr, pr, n ]` | prioridad de máximo |
| `skill6`, `skill10`, `skill15` | `[ "132114", wr, pr, n ]` | orden hasta niv. 6 / 10 / 15 |
| `skillEarly` | `[nivel 1..6][Q,W,E,R] = [wr, pr, n]` | qué se sube en cada nivel |

Las filas vienen ordenadas por uso; `winningItem` por win rate con muestra pequeña (filtrar por `n`).

### `runes.stats` ✅ forma / ❓ significado
Objeto `{ "<idRuna>": [[pr, wr, n], …] }` (71 claves; ¡ojo: aquí el orden es **`pr, wr, n`**, distinto de las tablas de arriba!). Ejemplo: `8008: [[86.8, 46.1, 1510]]` (keystone usado 86,8 %, 46,1 % de victorias). Las runas que valen en dos posiciones traen **dos** entradas, p. ej. `8304: [[0.1,100,1],[56.9,45.7,990]]` ❓ lo más probable es `[como primaria, como secundaria]`, pero las runas con una sola entrada no indican cuál es; **verificar con el probe** antes de usar estas cifras. Las claves con sufijo `f` (`5008f`, `5010f`, `5001f`) ❓ distinguen fila de fragmentos. Para runas basta con `summary.pick/win`; `runes.stats` solo sería para alternativas.

### `enemy` / `enemy_h` — counters (solo página de build) ✅
`enemy = { top:[…], jungle:[…], middle:[…], bottom:[…], support:[…] }`. Fila: `[ cidRival, wr, delta1, delta2, pr, n ]` (ordenadas por `n`; Ezreal bottom: 140 filas, la primera Kai'Sa `[145, 47.44, -1.95, -0.73, 17.03, 6381]`). `enemy_h` es la cabecera de columnas (`id, wr, d1, …`); el resto de nombres está inferido por los valores y por la tabla de la web (Win Rate, Delta 1, Delta 2, Pick Rate, Games). `wr` = victorias **del campeón de la página** contra ese rival. Las listas «Strong/Weak Against» de la web son ordenaciones de esta misma tabla por `delta`. Las pestañas de **sinergia** (aliados) no se analizaron ❓ (el estado de la página contiene `Common Teammates`; revisar si se quiere filtrar por aliado, algo que Coachless no permite).

### Otros ✅
- `analysed` (partidas totales analizadas del filtro), `avgWr`, `n`.
- `graph` (solo build): `dates[35]` y series `wr`, `n`, `pr`, `br`, `wrs` por `all, diamond_plus, emerald, platinum, gold, silver, bronze, iron` (tendencia por día).
- `sidebar`: `topList` (jugadores top con región y rango), `topStats`, `stats`, `time` (partidas por duración), `objective` (win rate según objetivos), `depth`.
- `itemSets`: `{ itemBootSet1..3: { "<itemId>": [x, y] } }` ❓ significado de los pares sin determinar.
- `cache` ("cached"), `response`: metadatos del servidor.

## 7. Cómo encaja en Easy Coachless

Objetivo: que Lolalytics sea **otra fuente** de recomendación, sin tocar la UI ni el resto de la aplicación.

```
application/recommendation.js            (hoy: solo Coachless)
   └─ RecommendationSource (interfaz)    getRecommendation(ctx, filters, signal) → Recommendation | null
        ├─ Coachless (existente)
        └─ Lolalytics (nuevo)
infrastructure/lolalytics/qwik.js        parseQwikState, makeResolver, findRoot (sección 5)
infrastructure/lolalytics/client.js      fetch de la página con timeout/abort, caché, detección de bloqueo
domain/lolalytics.js                     reglas puras: validar raíz, normalizar filas, elegir build (pick/win), mapear ids y slugs
```

1. **Mismo contrato de salida** que ya consume el panel (`runes` de 9 ids, `spells`, `items`, `meta` con parche, rangos y muestra, `confidence`). Antes de implementar, leer `application/recommendation.js` y `domain/selection.js` para copiar la forma exacta; el trabajo de Lolalytics es **mapear** `summary.pick` (o `win`) a esa forma, no rehacerla.
2. **Elección de fuente** (ajuste de usuario, DataStore, valores sugeridos): `auto` (Coachless si hay sesión; Lolalytics si no hay cuenta, la cuenta es gratuita y se pide matchup, o Coachless falla), `coachless`, `lolalytics`. Mostrar en `meta.source` cuál se usó (icono, poco texto).
3. **Contexto → URL**: `MatchContext` ya trae campeón, rol, rival y rango de lobby. Rol → `lane` (sección 3). Rango de lobby → `tier` más parecido (`emerald_plus` por defecto; los rangos de Coachless 3..7 no equivalen 1:1: definir tabla en `domain/lolalytics.js`). Matchup: ruta `/vs/{rival}/`; **si `n` < umbral, recurrir a la página sin rival** y avisar (como ya hace Coachless).
4. **Hechizos y reglas de modo** (`domain/spells.js`) siguen aplicándose encima: Lolalytics trae parejas de `spells`; elegir la mejor que cumpla las reglas (jungla → Aplastar, ARAM/Arena…).
5. **Runas**: usar `summary.pick.runes.set` (+`win` como alternativa). No hace falta la lógica de «secundario ponderado» de Coachless: Lolalytics ya entrega la página completa más usada, con `n`.
6. **Ítems**: `summary.*.items` (inicio, `item1..3`, `item4..6` con opciones) y las tablas `boots`/`startSet`; el panel ya sabe pintar inicio/botas/núcleo/siguientes. Las cifras de ítems del matchup sí reflejan el rival (a diferencia de `GetRecommendedBuilds` de Coachless).
7. **Counters** (desbloquea la «sugerencia de pick por matchup» de HANDOFF 6b): `enemy[lane]` de la página de build del **aliado/campeón candidato**; para sugerir pick contra un rival, pedir la build de cada candidato es caro → empezar con **«este campeón contra el rival»** (`header.vsWinRate`/`delta1`) y con la lista `enemy` del campeón elegido.
8. **Caché** (`infrastructure/coachless/cache.js` es reutilizable): clave `lang|champ|lane|tier|patch|vs`, caducidad larga (horas), petición compartida, cancelación con `AbortController`, **tiempo máximo corto** (p. ej. 6 s). Lolalytics caído o bloqueado → sin bloquear el cliente.
9. **Seguridad/estilo** (reglas del proyecto): nada de `innerHTML` con datos de la web (todo pasa por `h()` y son ids/números); el HTML descargado **no se inserta en el DOM** (usar regex sobre el texto, no `DOMParser`+`innerHTML`); logs con `log`, sin imprimir el HTML.

## 8. Resiliencia (es scraping: hay que asumir que se rompe)

- **Validar antes de usar** (`validateRoot(root)` en `domain/lolalytics.js`): comprobar que existen `header.cid`, `header.patch`, `summary.pick.runes.set.{pri,sec,mod}` con longitudes 4/2/3, `summary.pick.sums.ids` de 2 enteros, `spells` y `item1` como arrays no vacíos y números finitos. Si algo falla → `null` + `log.warn('lolalytics: esquema inesperado')`, y el servicio cae a Coachless o muestra «fuente no disponible».
- **No fijar índices** de `objs`; localizar por claves (`skillEarly`). Si desaparece la clave → el mismo `null`.
- **Cambios de nombre** de claves son el riesgo principal: aislar todo el acceso a campos en `domain/lolalytics.js` (un solo sitio que arreglar) y cubrirlo con pruebas sobre un **fixture reducido** guardado en `dev/tests/fixtures/` (no subir HTML completo de Lolalytics al repositorio: contenido de terceros; guardar solo el subárbol numérico necesario).
- **Parche**: comparar `header.patch` con el pedido; si la muestra del parche más nuevo es pobre (pasa en los primeros días), ofrecer el anterior. Sin parámetro, Lolalytics sirve el actual.
- **Contenido bloqueado** (reto de Cloudflare, 403/429/5xx, HTML sin `qwik/json`): tratarlo como «no disponible» con *backoff* (1 min, 5 min, 30 min) y sin reintentos en bucle.
- Sondeo periódico del esquema en `dev/` (el probe) para detectar cambios entre parches.

## 9. Riesgos y aviso antes de distribuir

- **Términos de uso de Lolalytics**: no revisados ❓. El `robots.txt` permite el acceso general (`Allow: /`) pero reserva derechos de minería para IA (`ai-train=no`, `use=reference`). Es *scraping* de contenido de terceros: **antes de distribuir públicamente** revisar sus términos y valorar pedir permiso o usar una vía oficial; no redistribuir sus datos (solo los muestra al usuario, con atribución/enlace a Lolalytics) y no martillear el servicio (caché, una petición por consulta).
- **Políticas de Riot/Pengu** (ya recogidas en CLAUDE.md): mostrar es el alcance seguro; **aplicar** runas/hechizos sigue tras `ConfigurationApplier` con confirmación, sea cual sea la fuente.
- **Atribución**: mostrar la fuente y enlazar a la página original (ya existe el botón web para coachless.gg; añadir el de Lolalytics con `…/{slug}/build/?lane=…`, o `/vs/{rival}/` si hay matchup).
- **Estabilidad**: el estado de Qwik no es una API pública: puede cambiar con cualquier despliegue del sitio.
- **Dependencias externas por usuario**: el plugin ya exige `DisableWebSecurity=1` por Coachless; la nueva fuente no añade requisitos.

## 10. Verificación pendiente (con el probe)

Ejecutar en el equipo del usuario (Node ≥ 18, sin credenciales ni dependencias):

```
node dev/api-probes/test-lolalytics-html.mjs ezreal bottom emerald_plus
node dev/api-probes/test-lolalytics-html.mjs ezreal bottom emerald_plus jinx
```

Comprueba y escribe un informe de: estado HTTP y cabeceras (Cloudflare), tamaño del HTML y del JSON de Qwik, que la raíz se localiza, **que el esquema de la sección 6 se cumple** (mismas comprobaciones que `validateRoot`) y los datos clave (runas, hechizos, ítems, primer counter). Después, probar en el cliente real que `fetch` desde el plugin (CEF) recibe el mismo HTML.

Pendiente de aclarar con ese probe y capturas:
1. ¿El `fetch` crudo devuelve el `qwik/json`, y desde el cliente de LoL (cabeceras, Cloudflare)? 
2. Nombre del parámetro de línea del rival y de parche en la URL; valores completos de `tier`; rutas de ARAM/Arena.
3. Significado de `runes.stats` (orden de entradas), del sufijo `f`, del último valor de las filas de ítems y de `itemSets`.
4. Fórmula de `delta2`.
5. Comportamiento sin datos (matchup inexistente, línea sin partidas): ¿404, estado vacío o raíz con `n = 0`?
6. Términos de uso de Lolalytics.
