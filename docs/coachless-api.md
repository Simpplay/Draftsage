# Coachless.gg – API de `/builds` (documentación de ingeniería inversa)

> Documento generado a partir del tráfico real que hace la página `https://coachless.gg/builds/{champion}`
> observado con Claude in Chrome el 2026-11-04 (parche 16.22).
> **No es documentación oficial.** La API puede cambiar sin aviso y conviene revisar los términos de uso del sitio antes de consumirla fuera de su web.

**Leyenda de confianza:** ✅ observado directamente · 🔶 inferido (deducido de la UI o de los datos) · ❓ desconocido / no verificado

---

## 1. Visión general

| Aspecto | Detalle |
|---|---|
| Tipo de app | SPA (JS en `main-*.js` + `chunk-*.js`), sin SSR de datos ✅ |
| API de estadísticas | `https://api.coachless.gg/api/...` ✅ |
| CDN estático | `https://cdn.coachless.gg/...` ✅ |
| Analítica | `https://ingest.coachless.gg/...` (estilo PostHog) ✅ – irrelevante para los datos |
| Pagos | `profitwell` ✅ – irrelevante |
| Datos externos de Riot | `https://ddragon.leagueoflegends.com/api/versions.json` ✅ |
| Estilo de API | RPC con **POST + JSON**, sin parámetros en la URL ✅ |
| Latencia típica | 350–700 ms por llamada ✅ |

### Rutas del front

| Ruta | Descripción |
|---|---|
| `/builds` | Redirige a `/builds/all?role=support` ✅ |
| `/builds/all?role={rol}` | Vista general: parrilla de campeones por rol ✅ (no dispara llamadas de datos al cargar) |
| `/builds/{slug}` | Build de un campeón, p. ej. `/builds/kaisa`, `/builds/thresh` ✅ |

Otras secciones del menú (no analizadas): Items, Runes, Abilities, Spells, Review, Worlds.

---

## 2. Autenticación

- Las llamadas a `api.coachless.gg` envían `Authorization` (valor redactado aquí) ✅, junto con `Content-Type: application/json` y `Accept: application/json, text/plain, */*` ✅.
- Se llama a `POST /api/Auth/refresh` con `{"refreshToken": "..."}` al cargar la página ✅ (detalle del login/refresh en `coachless-auth.md`).
- `GET /api/User/GetSavedBuilds` devuelve las builds guardadas del usuario ✅ (endpoint de sesión, no analizado).
- ✅ Sin token, las rutas de estadísticas devuelven **403**. Con el token de una cuenta gratuita devuelven 200 con `patchAdditions: 0` y 403 con rangos de parches; ver `coachless-auth.md` §5.

---

## 3. Parámetros comunes: `commonFilters`

Todos los endpoints de estadísticas reciben este objeto. ✅ Es el conjunto completo de filtros de la web (revisado en su código el 2026-11-05): **no existe filtro por campeones aliados**.

```json
{
  "commonFilters": {
    "patch": { "major": 16, "patch": 22, "patchAdditions": 2 },
    "championIds": [145],
    "matchupChampionIds": null,
    "leagueTiers": [4, 5, 6, 7],
    "regions": null,
    "role": 5
  }
}
```

| Campo | Tipo | Significado |
|---|---|---|
| `patch.major` | int | Temporada/versión mayor (16 → 16.x) ✅ |
| `patch.patch` | int | Parche más reciente del rango (22 → 16.22) ✅ |
| `patch.patchAdditions` | int | **Los rangos (≥ 1) son solo para cuentas premium; con una gratuita solo se acepta `0` y ≥ 1 da 403** ✅ (ver `coachless-auth.md` §5). Nº de parches anteriores incluidos. La UI mostraba "Patches 16.20–16.22" y se enviaba `2` 🔶 |
| `championIds` | int[] | IDs de campeón de Riot (Kai'Sa = 145, Thresh = 412) ✅. Siempre 1 elemento en esta página |
| `matchupChampionIds` | int[] \| null | Filtro "vs {campeón}" (la UI mostraba "vs All Champions" → `null`) ✅/🔶 **Solo premium** (403 en cuenta gratuita); solo actúa en `GetKeystoneData` y `GetGlobalSummonerSpellStatistics`: `GetRecommendedBuilds` lo ignora ✅ |
| `leagueTiers` | int[] \| null | Rangos incluidos (ver tabla) |
| `regions` | int[] \| null | Regiones incluidas; `null` = todas ✅ |
| `role` | int | Rol solicitado. La página siempre envió `5` (ver §3.3) |

### 3.1 `leagueTiers`

| Valor | Rango | Confianza |
|---|---|---|
| 3 | Gold | 🔶 nombre (casilla en la UI); ✅ devuelve datos con muestra grande (n≈343–358 k) |
| 4 | Platinum | ✅ (al marcar Platinum se añadió el 4) |
| 5 | Emerald | ✅ |
| 6 | Diamond | ✅ |
| 7 | Master+ | ✅ |
| 0, 1, 2 | ❓ | ✅ `GetKeystoneData` devuelve un array vacío (sin datos por debajo de 3) |
| 8 | ❓ | ✅ devuelve datos (poca muestra, n≈7,5 k); significado desconocido |

Por defecto (Emerald+, Diamond, Master+) se enviaba `[5, 6, 7]`; con Platinum, `[4, 5, 6, 7]`. El filtro de rango **se persiste en el navegador** entre sesiones ✅.

### 3.2 `regions`

| Valor | Región | Confianza |
|---|---|---|
| 4 | Korea | ✅ (única región verificada) |
| otros | Brazil, Europe Nordic & East, Europe West, Japan, LAN, LAS, Middle East, North America, Oceania, Southeast Asia… | ❓ La UI lista estas regiones, pero solo se verificó el ID de Korea. Orden alfabético y 0-based es una hipótesis (Korea sería la 5.ª) |

### 3.3 `role`

- ✅ **Verificado (2026-11-05, GetRecommendedBuilds con `role` 0–4 y campeones de cada rol):** 0 Top (Darius) · 1 Jungla (Lee Sin) · 2 Mid (Ahri) · 3 ADC (Kai'Sa) · 4 Support (Thresh); `role: 5` devuelve el rol principal del campeón.
- La petición envía **`role: 5`** tanto para Kai'Sa como para Thresh ✅ → `5` actúa como "sin rol / el que decida el servidor" 🔶.
- La respuesta de `GetRecommendedBuilds` incluye el **rol resuelto**: Kai'Sa → `3`, Thresh → `4` ✅.
- Mapeo consistente con el orden de iconos de la UI (fill, top, jungle, mid, adc, support) 🔶:

| Valor | Rol |
|---|---|
| 0 | Top ✅ |
| 1 | Jungle ✅ |
| 2 | Mid ✅ |
| 3 | ADC ✅ |
| 4 | Support ✅ |
| 5 | Fill / rol principal del campeón ✅ |

---

## 4. Endpoints de estadísticas

Base: `https://api.coachless.gg` · Método: **POST** · Body: JSON · Respuesta: JSON · Estado observado: `200`.

### 4.1 `POST /api/ChampionWinprob/GetRecommendedBuilds`

Builds completas recomendadas (tarjetas "Recommended": S-Tier, A-Tier, B-Tier…).

> ✅ El resultado **no cambia con `matchupChampionIds`** (se ignora, incluso con un id inexistente). `role: 5` se resuelve al rol principal (Kai'Sa → 3); `role: 2` devuelve `builds: []`.

**Request**
```json
{ "commonFilters": { ... } }
```

**Response** (≈ 15 KB)
```ts
{
  role: number,                 // rol resuelto (ver §3.3)
  builds: Build[],              // 2–3 elementos observados
  spellDuos: SpellDuo[]         // 3 elementos observados
}

type Build = {
  keystone: number,             // ID de runa (p. ej. 8008 = Lethal Tempo)
  starterIds: number[],         // 1–2 IDs de ítem inicial
  firstItemId: number,          // primer ítem completo
  secondItemId: number,         // segundo ítem completo
  tier: number,                 // 0 = S, 1 = A, 2 = B 🔶
  winrate: number,              // % (p. ej. 50.65)
  occurrence: number,           // nº de partidas
  mostPopular: boolean,         // badge "MOST POPULAR"
  runes: {
    primaryTree: number,        // ID de árbol (8000 Precision, 8300 Inspiration…)
    secondaryTree: number,
    selectedRunes: number[6],   // 4 primarias + 2 secundarias (orden de la UI)
    selectedShards: number[3],
    runeStats: { rune: number, wpa: number, occurrence: number }[],      // 23 elementos
    shardStats: { rune: number, wpa: number, occurrence: number }[][]    // 3 filas × 3 opciones
  },
  itemBlocks: ItemBlock[]       // 5 bloques
}

type ItemBlock = {
  type: number,                 // ver tabla abajo
  items: { itemId: number, wpa: number, occurrence: number,
           chooseOne: boolean,  // "PICK ONE" en la UI
           highlighted: boolean }[]
}

type SpellDuo = { spellIds: number[2], wpa: number, occurrence: number }
```

**`itemBlocks[].type`** (🔶 deducido del contenido observado; el plugin lo usa para clasificar filas — `domain/items.js`; verificar con `dev/api-probes/test-coachless-items.mjs`):

| type | Contenido observado | Sección de la UI |
|---|---|---|
| 0 | Doran's Bow\* + Health Potion | Starter |
| 1 | Cull + Dark Seal + Boots | Early Game (first back) |
| 2 | Componentes + legendario + botas | Core Build |
| 3 | Lista de opciones con `chooseOne` | 2nd item / alternativas |
| 4 | Lista larga de ítems (Dusk and Dawn, Zhonya's, Terminus…) con algunos `highlighted` | Situacionales |

**Ejemplo recortado (Kai'Sa, rango Platinum+)**
```json
{
  "role": 3,
  "builds": [{
    "keystone": 8008, "starterIds": [1055], "firstItemId": 3087, "secondItemId": 3124,
    "tier": 0, "winrate": 51.28, "occurrence": 67479, "mostPopular": false,
    "runes": { "primaryTree": 8000, "secondaryTree": 8300, "selectedRunes": [ "..." ], "selectedShards": [ "..." ] },
    "itemBlocks": [ { "type": 0, "items": [ { "itemId": 1055, "wpa": 0.0, "occurrence": 0, "chooseOne": true, "highlighted": false } ] } ]
  }],
  "spellDuos": [ { "spellIds": [4, 7], "wpa": 1.447, "occurrence": 19892 } ]
}
```
> Los IDs concretos del ejemplo son ilustrativos de la forma; los valores reales cambian con parche y filtros.

**Cómo lo usa el plugin** (2026-11-05): se elige la build con `keystone` igual a la runa clave mostrada (mejor `tier`, luego más `occurrence`); `starterIds`/`firstItemId`/`secondItemId` son los datos ciertos (inicio y núcleo); los bloques 1, 3 y 4 alimentan «primera vuelta», «alternativas» y «situacionales» (ordenados por partidas; los `highlighted` primero); el bloque 2 solo sirve para localizar botas si faltan las de `GetGlobalItemStatistics`. ⚠ Un ítem con `occurrence: 0` trae `wpa: 0` de relleno (se trata como «sin dato»). 🔶 `tier` 0/1/2 = S/A/B (por la UI). Los ítems de la build **no** dependen del matchup (§4.1: lo ignora).

---

### 4.2 `POST /api/ChampionWinprob/GetGlobalItemStatistics`

Estadísticas de ítems. **La página lo llama 6 veces** (una por sección) con distintos `itemType`/`itemSlots`.

**Request**
```json
{
  "commonFilters": { ... },
  "itemSlots": [1],
  "itemType": 1,
  "keystone": null,
  "starterId": null,
  "firstPurchaseId": null,
  "firstLegendaryId": null,
  "secondLegendaryId": null,
  "loadFirstEpicPurchase": false,
  "includeSupportItems": true
}
```

| Campo | Tipo | Significado |
|---|---|---|
| `itemSlots` | int[] \| null | Posiciones de compra: `[1]` primer ítem, `[2]` segundo, `[3]` tercero, `[4,5,6]` resto ✅. `null` para botas/starters |
| `itemType` | int | `1` = ítems completos por slot, `2` = botas, `6` = starter/early (Long Sword, Dagger, Doran's…) ✅/🔶 |
| `keystone` | int \| null | Condiciona estadísticas a una runa clave 🔶 |
| `starterId` | int \| null | Condiciona al ítem inicial elegido 🔶 |
| `firstPurchaseId` | int \| null | Condiciona a la primera compra 🔶 |
| `firstLegendaryId` | int \| null | Condiciona al primer legendario (para pedir el 2.º) 🔶 |
| `secondLegendaryId` | int \| null | Idem para el 3.º 🔶 |
| `loadFirstEpicPurchase` | bool | Siempre `false` en lo observado ❓ |
| `includeSupportItems` | bool | `true` solo en la llamada de slot `[1]` ✅ |

Los 6 patrones observados para Kai'Sa:

| # | `itemType` | `itemSlots` | `includeSupportItems` | Resultados |
|---|---|---|---|---|
| 1 | 1 | `[1]` | `true` | 12 (observado en una de las sesiones) |
| 2 | 2 | `null` | `false` | botas (Berserker's Greaves, Gluttonous Greaves, Boots of Swiftness…) |
| 3 | 6 | `null` | `false` | Long Sword, Dagger, Doran's Shield… |
| 4 | 1 | `[2]` | `false` | — |
| 5 | 1 | `[3]` | `false` | — |
| 6 | 1 | `[4,5,6]` | `false` | — |

> Para Thresh (support): `type=6` → 2 resultados, `type=2` → 4, `type=1 slots=[3]` → 17.

**Response**: array
```ts
{
  itemId: number,
  wpaOverall: number,          // Win Probability Added, en puntos porcentuales (p. ej. +1.26 / -0.70)
  occurrence: number,          // partidas con ese ítem
  occurrenceRelative: number,  // % relativo (p. ej. 0.15)
  winrateExpected: number,     // % esperado
  winrateObserved: number      // % observado
}[]
```
```json
{ "itemId": 2523, "wpaOverall": -0.7, "occurrence": 2708, "occurrenceRelative": 0.15,
  "winrateExpected": 50.35, "winrateObserved": 49.65 }
```
El orden del array **no está ordenado por WPA** (se vio orden por `itemId`) ✅; ordena en cliente.

**Uso en el plugin** (`client.items`, 2.ª tanda de cada recomendación; ❓ sin verificar contra la API real): botas = `itemType 2`, `itemSlots null`; 3.er ítem = `itemType 1`, `itemSlots [3]`, `firstLegendaryId` = `firstItemId` de la build y `secondLegendaryId` = `secondItemId`. Se ordenan por WPA con muestra mínima (botas ≥ 10 %, 3.er ítem ≥ 5 % de las partidas del grupo). Se envían los mismos `commonFilters` que el resto (incluye el matchup en premium); si la petición falla se omite la fila. Pendiente de comprobar con `dev/api-probes/test-coachless-items.mjs`: que el encadenado condicione de verdad el resultado y si el matchup se respeta aquí.

---

### 4.3 `POST /api/ChampionWinprob/GetGlobalSummonerSpellStatistics`

**Request**
```json
{ "commonFilters": { ... }, "pairedSpell": null }
```
`pairedSpell` (int \| null) 🔶: fija un hechizo y devuelve estadísticas del otro.

**Response**: array (9 elementos para Kai'Sa)
```json
{ "summonerSpell": 3, "wpaOverall": 0.82, "occurrence": 275246,
  "occurrenceRelative": 7.41, "winrateExpected": 50.09, "winrateObserved": 50.91 }
```
`summonerSpell` = ID de Riot (1 = Cleanse, 3 = Exhaust, 4 = Flash, 6 = Ghost, 7 = Heal, 11 = Smite, 12 = Teleport, 14 = Ignite, 21 = Barrier) 🔶.
✅ Con `pairedSpell: 4` la lista **excluye** el hechizo fijado (8 elementos en vez de 9) y los WPA cambian ligeramente: sirve para elegir el segundo hechizo dado el primero. El plugin elige el 1.º por WPA (con ≥ 10 % de las partidas) y consulta `pairedSpell` para el 2.º.

---

### 4.4 `POST /api/Rune/GetKeystoneData`

**Request**
```json
{ "commonFilters": { ... } }
```

**Response**: array (13 elementos para Kai'Sa)
```ts
{
  rune: number,                 // ID de runa (8005 Press the Attack, 8008 Lethal Tempo, 8010 Conqueror, 8021 Fleet Footwork…)
  runeType: number,             // 0 en todos los keystones observados ❓
  wpaOverall: number,
  occurrence: number,
  runeEffects: { type: number, value: string }[]   // type 0 y 3 observados; value = número como string ❓
}[]
```
```json
{ "rune": 8008, "runeType": 0, "wpaOverall": -0.027, "occurrence": 424849,
  "runeEffects": [ { "type": 0, "value": "513" } ] }
```
`runeEffects` parece ser el valor del efecto de la runa (daño, curación… acumulado) 🔶; el significado de `type` no se pudo confirmar.

### 4.4b `POST /api/Rune/GetRunesForKeystoneAndTree` 🔶

Filas de runas de **un árbol** (las de la página `/runes/tree/{champ}/{principal}/{secundario}` del sitio). Verificado con sondas el 2026-11-05 (`dev/api-probes/test-coachless-runes.mjs`).

**Request**
```json
{ "commonFilters": { ... }, "mainTree": 8000, "treeToLoad": 8100, "keystone": 8008 }
```
- `mainTree`, `treeToLoad`: **ids Riot numéricos** de árbol (8000 Precisión, 8100 Dominación, 8200 Brujería, 8300 Inspiración, 8400 Valor). Strings («Precision», «precision») → 400 (`could not be converted to ...RuneTreeSelection`); 0/1 → 500.
- `keystone` (opcional): **sí se aplica y filtra las filas de ambos árboles** (principal y secundario). Kai'Sa, Precisión, sin keystone: 404746 ocurrencias en 8009; con 8008: 380817; con 8005: 22943; con 8010: 119. Con 8021 (sin datos) todo vacío. **`keystoneId` se ignora** (resultado idéntico a no enviar nada): usar siempre `keystone`.
- `commonFilters` se respeta (campeón, matchup premium: con Jinx baja la muestra y desaparecen runas).

**Response**: `{ rowOnes, rowTwos, rowThrees }`, cada una `{ rune, runeType, wpaOverall, occurrence, runeEffects }[]` (mismo formato que 4.4).
- Devuelve las filas del árbol `treeToLoad` (no el keystone). Con `treeToLoad == mainTree` salen las filas del árbol principal (p. ej. 8000: 8009/9101/9111, 9103/9104/9105, 8014/8017/8299); con otro `treeToLoad`, las del secundario.
- Una fila puede traer 2 o 3 runas, o ninguna (sin datos para esos filtros).
- ⚠ `rowTwos` vino **vacío para Dominación (8100)** con la cuenta gratuita (parche 16.21, `patchAdditions: 0`) en todas las pruebas, pero ✅ **con datos con premium** (`patchAdditions: 1`); con 8200, 8300, 8400 y 8000 siempre trae datos. Causa desconocida. Tratar una fila vacía como «sin dato» (el plugin ya lo hace). `rowOnes/Twos/Threes` = filas 1–3 del árbol **sin** la fila del keystone (ver tabla en §6b).
- ✅ **Selección en el plugin:** el árbol secundario se elige entre los 4 restantes tomando, por árbol, la mejor runa (por WPA) de cada fila y quedándose con las 2 mejores de filas distintas; solo compiten los árboles con ≥ 10 % de las partidas del más usado como secundario (sin ese filtro ganaba Valor con 465 partidas, WPA +4, frente a Inspiración con 300 000).
- ⚠ Escala de `wpaOverall` ❓: aquí salen valores de ±0.1 a ±5 (en 4.4 son fracciones pequeñas, p. ej. -0.027). Posiblemente puntos porcentuales de winrate, sin confirmar. Sirve para ordenar/comparar dentro de una fila; no mostrarlo como cifra hasta aclarar su significado. Con poca muestra (<~300) salta mucho (p. ej. 8010: ±3).
- Cuenta gratuita: funciona con `patchAdditions: 0` y sin matchup (verificado en la ronda 3).

---

### 4.5 `GET /api/ChampionWinprob/GetPatches` ✅

Sin cuerpo. **`POST` devuelve 405.** Probado con `Authorization` de una cuenta gratuita (❓ sin token no se probó).

**Response**: array (19 elementos en la prueba: de 16.4 a 16.22)
```json
{ "label": "16.4", "major": 16, "patch": 4, "matchCount": 6255794 }
```
`matchCount` = partidas analizadas en ese parche. ✅ Medido el 2026-11-05: 16.19–16.21 ≈ 6,8 M cada uno; 16.22 solo 243 k (3,6 %). El plugin usa el último parche cuya muestra sea ≥ 30 % de la mayor de los 3 anteriores (`domain/patch.js`). Sirve para elegir un parche con muestra suficiente: el más reciente puede tener poca (16.22 devolvió solo 3 runas en `GetKeystoneData`, frente a 13 en 16.21).

---

## 5. Cuándo se dispara cada llamada ✅

| Acción del usuario | Llamadas |
|---|---|
| Carga de `/builds/{slug}` | `Auth/refresh`, `GetPatches`, `GetSavedBuilds`, `GetKeystoneData`, `GetGlobalSummonerSpellStatistics`, `GetGlobalItemStatistics` ×6, `GetRecommendedBuilds` |
| Cambiar un filtro (rango/región) | `GetKeystoneData` y `GetGlobalSummonerSpellStatistics` **al instante**; ítems y builds recomendadas **al cerrar el panel de filtros** (debounce) |
| Cambiar de campeón (SPA, sin recargar) | Repite el conjunto de estadísticas con el nuevo `championIds` |
| Navegar a `/builds/all` | Ninguna llamada de datos (solo imágenes del CDN) |

Los toggles **"Hide low pick rate"** y **"Hide low occurrence"** del panel de filtros **no aparecen en el cuerpo** de las peticiones → se aplican en el cliente 🔶.

---

## 6. CDN estático (`cdn.coachless.gg`) ✅

| Recurso | URL |
|---|---|
| Ítems (bundle completo) | `/item-base-v2/items-bundled.json` |
| Campeones (Data Dragon) | `/static-files/{ver}/{ver}/data/en_US/champion.json` (p. ej. `16.22.1`) |
| Hechizos de invocador | `/static-files/{ver}/{ver}/data/en_US/summoner.json` |
| Splash de carga | `/static-files/{ver}/img/champion/loading/{Champion}_0.webp` |
| Iconos de rol | `/extra/role_{fill,top,jungle,mid,adc,support_teal}.png` |

### `items-bundled.json`

Objeto indexado por `Id` (string/número):
```json
{
  "1001": {
    "Id": 1001, "Name": "Boots", "GoldCost": 300, "GoldCombineCost": 300,
    "ItemType": 4,
    "Changelog": [],
    "Stats": [ { "Value": 25, "IsPercent": false, "StatType": 1 } ],
    "BuildComponents": []
  }
}
```

`ItemType` (🔶 por ejemplos): `0` placeholder/recall · `1` legendario · `2` botas mejoradas · `3` ítem especial (Celestial Opposition, Dream Maker…) · `4` básico (Boots, Faerie Charm) · `5` épico (Giant's Belt…) · `6` starter (Doran's…).

---

## 6b. Runas: ids por árbol y fila (Data Dragon, temporada 2026) ✅

Las filas 1–3 de `GetRunesForKeystoneAndTree` corresponden a las filas 2–4 de esta tabla (la fila 1 son los keystones).

| Árbol (id) | Keystones | Fila 1 | Fila 2 | Fila 3 |
|---|---|---|---|---|
| Dominación 8100 | 8112 Electrocute · 8128 Dark Harvest · 9923 Hail of Blades | 8126 Cheap Shot · 8139 Taste of Blood · 8143 Sudden Impact | 8137 Sixth Sense · 8140 Grisly Mementos · 8141 Deep Ward | 8135 Treasure Hunter · 8105 Relentless Hunter · 8106 Ultimate Hunter |
| Inspiración 8300 | 8351 Glacial Augment · 8360 Unsealed Spellbook · 8369 First Strike | 8306 Hextech Flashtraption · 8304 Magical Footwear · 8321 Cash Back | 8313 Perfect Timing · 8352 Time Warp Tonic · 8345 Biscuit Delivery | 8347 Cosmic Insight · 8410 Approach Velocity · 8316 Jack of All Trades |
| Precisión 8000 | 8005 Press the Attack · 8008 Lethal Tempo · 8021 Fleet Footwork · 8010 Conqueror | 9101 Absorb Life · 9111 Triumph · 8009 Presence of Mind | 9104 Legend: Alacrity · 9105 Legend: Haste · 9103 Legend: Bloodline | 8014 Coup de Grace · 8017 Cut Down · 8299 Last Stand |
| Valor 8400 | 8437 Grasp · 8439 Aftershock · 8465 Guardian | 8446 Demolish · 8463 Font of Life · 8401 Shield Bash | 8429 Conditioning · 8444 Second Wind · 8473 Bone Plating | 8451 Overgrowth · 8453 Revitalize · 8242 Unflinching |
| Brujería 8200 | 8214 Summon Aery · 8229 Arcane Comet · 8230 Phase Rush · 8992 Deathfire Touch | 8224 Nullifying Orb · 8226 Manaflow Band · 8275 Nimbus Cloak | 8210 Transcendence · 8234 Celerity · 8233 Absolute Focus | 8237 Scorch · 8232 Waterwalking · 8236 Gathering Storm |

Fragmentos (`selectedShards` de `GetRecommendedBuilds`, no dependen del matchup): ids 5001–5013 (5005 vel. de ataque, 5008 adaptativo, 5011 vida…). El plugin muestra los de la build cuyo keystone coincide con el elegido.

---

## 7. Métricas: qué significa cada número

| Campo | Interpretación |
|---|---|
| `wpa` / `wpaOverall` | **Win Probability Added**: cuánto cambia la probabilidad de victoria (en puntos %) al elegir esa opción frente a lo esperado. Positivo = mejor ✅ |
| `occurrence` | Nº de partidas en la muestra ✅ |
| `occurrenceRelative` | % que representa dentro de su grupo ✅ |
| `winrateExpected` | Winrate esperado según el modelo ✅ |
| `winrateObserved` | Winrate real ✅ |
| `tier` | Clasificación de la build (S/A/B) ✅/🔶 |

La UI declara datos de **Diamond+ por defecto** y permite ampliar a Emerald/Platinum/Gold ✅.

---

## 8. Ejemplo de uso (plantilla)

> Requiere un `Authorization` válido que **no se incluye** aquí. No se probó si es obligatorio.

```bash
curl -X POST 'https://api.coachless.gg/api/ChampionWinprob/GetRecommendedBuilds' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: <TOKEN>' \
  -d '{
    "commonFilters": {
      "patch": {"major": 16, "patch": 22, "patchAdditions": 2},
      "championIds": [145],
      "matchupChampionIds": null,
      "leagueTiers": [5, 6, 7],
      "regions": null,
      "role": 5
    }
  }'
```

```python
import requests

BASE = "https://api.coachless.gg/api"
HEADERS = {"Content-Type": "application/json", "Authorization": "<TOKEN>"}

def common(champion_id, tiers=(5, 6, 7), regions=None, role=5, patch=(16, 22, 2)):
    return {
        "patch": {"major": patch[0], "patch": patch[1], "patchAdditions": patch[2]},
        "championIds": [champion_id],
        "matchupChampionIds": None,
        "leagueTiers": list(tiers),
        "regions": regions,
        "role": role,
    }

def items(champion_id, item_type=1, slots=None, **kw):
    body = {
        "commonFilters": common(champion_id, **kw),
        "itemSlots": slots, "itemType": item_type, "keystone": None,
        "starterId": None, "firstPurchaseId": None,
        "firstLegendaryId": None, "secondLegendaryId": None,
        "loadFirstEpicPurchase": False, "includeSupportItems": False,
    }
    r = requests.post(f"{BASE}/ChampionWinprob/GetGlobalItemStatistics", json=body, headers=HEADERS)
    r.raise_for_status()
    return sorted(r.json(), key=lambda x: x["wpaOverall"], reverse=True)
```

---

## 9. Lo que falta por verificar

1. ✅ Resuelto: requieren `Authorization: Bearer <accessToken>` (JWT). Con cuenta gratuita funcionan con `patchAdditions: 0` (≥ 1 da 403); con premium (`isSubscribed: "1"`) funcionan también los rangos ✅.
2. ✅ `Auth/refresh` es `POST` con `{refreshToken}`; `GetPatches` es `GET` sin cuerpo.
2b. ✅ Medido (cuenta gratuita, 2026-11-05): una recomendación completa del plugin son ≈ 10 peticiones (GetPatches + 3 + 6) y tarda 0,4–0,6 s con la caché de parches caliente (hasta ~3 s en frío). ❓ Límites de tasa: sin señales de 429 con ~100 peticiones, pero solo se ha probado con la gratuita (ver `dev/api-probes/test-coachless-premium.mjs`).
3. ❓ IDs de todas las regiones (solo Korea = 4 verificado) y el ID de Gold.
4. ❓ Significado de `runeType` (siempre 0), `runeEffects.type` (observados: 0, 3, 7, 12, 14, 15, 20) y `loadFirstEpicPurchase`.
5. ❓ Valores de `itemType` distintos de 1, 2 y 6 en `GetGlobalItemStatistics` (probe de ítems: `dev/api-probes/test-coachless-items.mjs`), y de `keystone`/`starterId`/`firstPurchaseId` encadenados (la UI los usa al elegir una build concreta).
6. ✅ `matchupChampionIds` es solo premium y solo filtra runas y hechizos; `role: 5` = rol principal. ❓ `role` con campeones multi-rol y significado de `leagueTiers: 8`.
7. ❓ Límites de tasa (rate limit) y política de caché.
8. ❓ Otras secciones del sitio (Items, Runes, Abilities, Spells, Review, Worlds) con endpoints propios.

> Cómo completarlo: en Chrome, abrir DevTools → pestaña Network → filtrar por `api.coachless.gg`, aplicar el filtro correspondiente en la UI y revisar *Payload*/*Response* de cada petición.


## Live Client Data API de Riot (no es Coachless) — verificado con capturas reales (2026-11-05)
`https://127.0.0.1:2999/liveclientdata/…` · solo lectura · solo responde durante una partida (si no, el `fetch` falla) · certificado autofirmado (funciona desde la consola del cliente) · sin credenciales.
- `activeplayer`: `riotId`, `summonerName`, `currentGold` (decimal), `level`, `championStats`, `abilities`, `fullRunes` (`keystone`, árboles, `generalRunes`, `statRunes`).
- `playeritems?riotId=Nombre#TAG`: lista de `{itemID, count, slot, price, …}`.
- `allgamedata` (la que usa el plugin, una sola petición): `activePlayer` (como arriba) · `allPlayers[]` con `championName` (localizado), `rawChampionName` (`game_character_displayname_<Alias>`), `position` (`TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY`, vacío en modos sin puestos), `team` (`ORDER/CHAOS`), `riotId`, `summonerName`, `items[]` · `gameData` (`gameMode`, `gameTime`) · `events.Events[]`.
- El jugador activo se identifica por `riotId` o `summonerName` en `allPlayers`. 🔶 No expone el rango de la lobby.
