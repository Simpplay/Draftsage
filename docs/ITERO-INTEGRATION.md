# iTero (itero.gg) — análisis y plan de integración para el consejero de picks

Estado: **fases 0–3 implementadas el 2026-11-05** (sonda, dominio, infraestructura, aplicación, interfaz; ver `docs/HANDOFF.md`). Pendientes: prueba en el cliente real, fase 4 (modo sombra) y fase 5 (extras). Decisiones tomadas: consejero desactivado hasta aceptar un aviso, mostrado en el panel, peso fijo 0,5 (ajustable por `configure`), maestría con peso 0. El resto del documento es el análisis original.
Leyenda: ✅ verificado con una petición real en esta sesión · ❓ deducido o sin verificar (hay que probarlo) · ⚠ riesgo.

Relacionado: `docs/lolalytics.md` y `docs/lolalytics-counters-synergy.md` (la otra fuente), `docs/ARCHITECTURE.md`, `docs/HANDOFF.md`.

---

## 1. Resumen ejecutivo

- iTero (https://www.itero.gg) es una app compañera de League (también existe un cliente de escritorio para Windows) cuyo **Simulador de draft** recomienda picks usando un modelo («IA») que **evalúa la composición completa**: tus aliados, los rivales ya revelados, tu línea, el rango y el lado (azul/rojo).
- La web **no oculta nada tras una cuenta**: el simulador llama a un endpoint JSON público, **`POST https://www.itero.gg/api/draft-picks`**, sin autenticación, sin cookies y sin cabeceras especiales ✅. Devuelve **todos los campeones candidatos** para tu línea (~164–173), ya ordenados por probabilidad de victoria prevista, y para cada uno unas ~150 cifras (sinergia con cada línea aliada, counter contra cada línea rival, escalado early/mid/late, reparto de daño AD/AP, daño recibido, oro, etc.).
- Complementa a Lolalytics (que ya está integrado): Lolalytics sabe **cómo le va a un campeón contra otro concreto en la línea** (con tamaño de muestra y datos de build); iTero sabe **cómo encaja un campeón en la composición completa**. Son señales distintas, con solapamiento parcial en el «counter de línea».
- Recomendación: fuente principal de ranking = iTero (composición), ajustada con la ventaja de matchup de Lolalytics (con encogimiento por muestra y peso moderado para no contar dos veces el counter de línea), y explicación basada en los componentes de iTero. Detalle en §7.
- Lo más importante que hay que saber antes de implementar:
  1. **Los nombres de campeón se envían en inglés y con la grafía exacta; un nombre desconocido NO da error: se trata en silencio como «hueco vacío»** ✅ (p. ej. `MonkeyKing`, `Nunu`, `malzahar` se ignoran). Hay que validar el mapeo ID→nombre en el cliente.
  2. Cada respuesta pesa **~1,6–1,7 MB** y tarda 0,3–2,7 s ✅. Hay que recortar, cachear y limitar las llamadas.
  3. La API **no es oficial ni está documentada** y no hemos encontrado términos de uso ❓⚠. Antes de distribuir: contactar con iTero / revisar sus términos (es además un producto que compite con parte del plugin).
  4. El campo de maestría del modelo (`masteryData`/`userModelWeightings`) tiene un comportamiento extraño (ver §4.3, punto 9); hasta entenderlo, usar peso 0.

## 2. Alcance y método de esta investigación

- Navegador integrado (Claude) en `https://www.itero.gg/es/drafting-simulator`; se rechazaron las cookies no esenciales. Se rellenó un draft aleatorio, se pulsó «Recibe recomendaciones», se capturó la petición y la respuesta real (fetch interceptado) y se leyeron los bundles JS de la página para sacar enumeraciones y flujos.
- Después se enviaron ~35 peticiones de prueba al mismo endpoint (variantes de rango, región, lado, línea, bans, nombres, pesos, drafts parciales). Ninguna dio 429; 5 dieron 500 (entradas inválidas, §4.3).
- **No se hizo**: iniciar sesión, usar «Usa mi cuenta» (envía un Riot ID a `/api/basic-info`; no se probó con ningún ID real), instalar la app de escritorio, ni leer términos de uso (no hay enlace a ellos en la página; ❓ puede existir en otra ruta). No se midió la calidad predictiva del modelo.
- Páginas vistas: simulador (a fondo), tabla de estadísticas (texto), constructor de pool (solo el asistente inicial). ARAM builds, quiz y artículos **no se exploraron**.

## 3. Mapa del sitio

| Ruta | Qué es | Datos útiles | Estado |
|---|---|---|---|
| `/es/drafting-simulator` | Simulador de draft: azul/rojo, 10 casillas (5 líneas × 2 equipos), «Selección aleatoria», «Borrador limpio», «Recibe recomendaciones», panel «Personalización de modelos», selector de región, «Usa el sistema de clasificación Elo» (rango manual) o «Usa mi cuenta» (Riot ID) | `POST /api/draft-picks` | ✅ a fondo |
| `/es/champion-statistics-table` | Tabla por campeón/función: índice de selección, KDA, placas de torreta, monstruos épicos, diferencia de oro en línea (<14 min); filtro por Elo y por pick rate | Renderizada en el servidor (HTML), **sin API JSON** (no hubo `/api/` al cargarla) | ✅ texto leído |
| `/es/champion-pool-builder` | «Creador de plantillas de campeones de IA» (asistente: pide Riot ID, usa `basic-info`) | `/api/basic-info` (maestría) | ❓ solo la portada |
| `/es/aram-builds` | Builds de ARAM | — | ❓ no explorado |
| `/es/quiz`, `/es/articles` | Test de personalidad, artículos | — | sin interés |
| `/es/iTeroTheApp` | App de escritorio (descarga `The iTero Companion App.exe`) | — | por los nombres de imagen de la portada la app ofrece: sugerencias y análisis de draft, coach de IA, temporizadores (minimapa, monstruos, cooldowns), seguidor de oro y de daño, subida de habilidades ❓ (deducido de nombres de archivo) |

`robots.txt`: `Allow: /`, `Disallow: /private/`, `/studio`. `/api/` no está prohibido ahí (no es una autorización de uso).
Tecnología: Next.js (Turbopack) detrás de CloudFront. Los nombres de los *chunks* JS cambian en cada despliegue: **no se deben parsear bundles desde el plugin**; solo se usa la API.

## 4. La API

### 4.1 `POST https://www.itero.gg/api/draft-picks` ✅

Petición (JSON en el cuerpo; el sitio ni siquiera pone `Content-Type`; no hay `Authorization` ni cookies):

```json
{
  "region": "euw1",
  "rankClass": "GOLD",
  "side": "Blue",
  "lane": "TOP",
  "masteryData": {},
  "teamComp": {
    "t1_TOP_champion": "Yorick",   "t1_JUNGLE_champion": "Viego",  "t1_MIDDLE_champion": "Diana",
    "t1_BOTTOM_champion": "Jinx",  "t1_UTILITY_champion": "Bard",
    "t2_TOP_champion": "Malzahar", "t2_JUNGLE_champion": "Shaco",  "t2_MIDDLE_champion": "Sylas",
    "t2_BOTTOM_champion": "Lucian","t2_UTILITY_champion": "Milio"
  },
  "bans": [],
  "userModelWeightings": { "t1_TOP_mastery": 0.3 }
}
```

| Campo | Significado | Valores |
|---|---|---|
| `region` | Región del jugador | `euw1`, `kr` aceptados ✅. **No cambia las cifras del ranking** (misma respuesta con `kr` y `euw1`) ✅; probablemente solo importa en `basic-info`. Otros valores de plataforma Riot (`na1`, `eun1`, `la1`, `la2`, `br1`, `jp1`, `oc1`, `tr1`, `ru`…) ❓ sin probar. |
| `rankClass` | Franja de Elo de los datos | `IRON`, `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`, `EMERALD`, `DIAMOND`, `MASTER+` ✅ (lista tomada del bundle y comprobada con IRON/GOLD/EMERALD/MASTER+). Cualquier otro valor → **HTTP 500** ✅. Es **una sola franja**, no un rango; los datos cambian bastante entre franjas (p. ej. Top: Singed 65,4 % en IRON, Warwick 60,9 % en MASTER+). |
| `side` | Lado de tu equipo | `Blue` / `Red` ✅. Rojo baja la predicción ~2 puntos (Lissandra 60,1 → 57,9 %). |
| `lane` | Tu línea | `TOP`, `JUNGLE`, `MIDDLE`, `BOTTOM`, `UTILITY` ✅ |
| `teamComp` | Campeones ya elegidos. `t1_*` = **tu equipo**, `t2_*` = rival. **Puede ser parcial o `{}`** ✅ (las líneas ausentes se tratan como «medias»/a ciegas). El hueco de `lane` en `t1_*` puede llevar tu campeón actual o ir vacío. | Nombres en inglés, exactos (§4.3, punto 7) |
| `bans` | Lista de nombres | **Solo filtra candidatos**: los baneados desaparecen del resultado y el resto de cifras no cambia ✅. El sitio siempre envía `[]`. |
| `masteryData` | Maestría del jugador | Formato ❓ (§4.3, punto 9). `{}` válido. Objetos anidados → 500. |
| `userModelWeightings` | Peso de la maestría: clave `t1_{LANE}_mastery` | 0..1 (el slider va de 0 a 1; por defecto 0,3). Ver §4.3, punto 9. |

Respuesta: **array** de ~164–173 objetos (uno por campeón candidato), **ya ordenado de mayor a menor `result_pred`** ✅. Incluye campeones fuera de línea (en TOP salen Vi, Blitzcrank, Leona al final con ~47 %); el sitio los oculta en el cliente con el filtro de pick rate (§4.5). El campeón que ya ocupa tu hueco `t1_{lane}` **sí aparece** en la lista (sirve para evaluar tu pick actual) ✅; los demás campeones ya elegidos no (164 = 173 − 9) ✅.

Esquema de cada elemento:

```
champion            string   nombre en inglés ("Kai'Sa", "Nunu & Willump", "Renata Glasc", "Dr. Mundo"…)
lane                string   siempre = la línea pedida
result_pred         string   "60.1%"  = probabilidad de victoria prevista de TU equipo con este campeón (== t1_LANE_pred_prob × 100, 0 discrepancias ✅)
result_pred_rating  number   0–5 (valoración relativa, la que pinta la estrella/el color en la web) ❓ escala exacta
laning_pred_rating  number   0–5 (fase de líneas) ❓
team_comps          object   la composición con el candidato puesto en su hueco (los 10 campeones)
champ_count         number   partidas del campeón en esa línea y franja (355 … 214 000+)
pick_perc           number   fracción 0–1 (0,0205 = 2,05 %) ❓ definición exacta (champ_count/pick_perc no es constante: 10,5–12,1 M)
stats               { t1:{damage,scaling}, t2:{damage,scaling}, player:{…} }   cifras en texto con unidad ("1.08x", "+366 G", "6.0%", "23126")
ratings             misma estructura que stats pero con números 0–5 (valoración de cada cifra)
```

### 4.2 Familias de cifras (qué hay en `stats` / `ratings`) ✅

**Importante:** `LANE` es literal (la línea del candidato); `{L}` ∈ TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY.

| Familia | Claves | Qué es / uso |
|---|---|---|
| **Predicción** | `player.t1_LANE_pred_prob` (`"0.60x"`), `t1_LANE_pred_gold` (`"+365 G"`), `t1_LANE_gold_ratio` (`"105.9%"`), `t1_LANE_gold_multiplier` (`"1.38x"`) | Probabilidad prevista y ventaja de oro esperada en línea |
| **Base del campeón** | `t1_LANE_champ_wr` (`"52.4%"`), `t1_LANE_champ_gold` (`"+366 G"`), `t1_LANE_champ_count` | Win rate medio y oro medio a 14 min del campeón en esa línea y franja (sin contexto) |
| **Counter por línea rival** | `t1_counter_LANE_{L}_wr` (`"1.08x"`) y `_gold` (`"-12 G"`) para las 5 líneas rivales | Efecto del candidato contra el campeón rival de cada línea (1.00x = sin dato/neutro: ocurre con rivales aún no revelados) |
| **Sinergia por línea aliada** | `t1_syn_LANE_{L}_wr` y `_gold` para las 4 líneas aliadas (sin la propia) | Efecto de jugar junto al aliado de cada línea |
| **Medias** | `t1_LANE_counter_avg`, `t1_LANE_syn_avg` (`"1.02x"`) | Resumen de lo anterior |
| **Estilo de línea** | `t1_LANE_eco`, `t1_LANE_even`, `t1_LANE_snowball` | Perfil del campeón: economía/igualdad/bola de nieve ❓ interpretación |
| **Maestría** | `t1_LANE_mastery` (`"2k"`) | Maestría usada por el modelo ❓ (§4.3, punto 9) |
| **Escalado por campeón** | `t1_{L}_{early\|mid\|late}_wr_adj` (`"1.08x"`) para los 5 aliados; `t2_…` para los 5 rivales | Multiplicador de win rate por fase de la partida |
| **Escalado del equipo** | `t1_{early\|mid\|late}_wr_adj`, `…_diff` (cambio por añadir el candidato), `…_without_player`, `…_without_player_var`, `…_diff_without_player`; `t2_{early\|mid\|late}_wr_adj` | Cómo de fuerte es cada equipo en cada fase y **cuánto aporta el candidato** |
| **Daño** | `t1_{L}_ad_ratio`, `_champ_ap_dmg`, `_champ_ad_dmg`, `_champ_total_damage`, `_champ_dmg_taken`; totales `t1_ad_ratio`, `t1_champ_ad_dmg`, `t1_champ_ap_dmg`, `t1_champ_total_damage`, `t1_champ_dmg_taken`; sus variantes `*_without_player` y `*_without_player_var`; lo mismo para `t2_` (sin *without_player*) | Reparto AD/AP, daño total y daño recibido (resistencia) por jugador y equipo; el delta `*_var` es el efecto marginal del candidato |
| **Valoraciones** | `ratings.*` | Misma clave en número 0–5; algunas `*_gold` vienen `null` o como objeto vacío cuando no hay dato (hay que tolerarlo) |

Ejemplo real (Top, rango GOLD, azul, draft del §4.1, candidatos de cabeza):

| Candidato | pred | win rate base | counter_avg | syn_avg | gold_mult | pred_gold | laning (0–5) | partidas |
|---|---|---|---|---|---|---|---|---|
| Lissandra | 60,1 % | 52,4 % | 1,02x | 1,02x | 1,38x | +365 G | 3,7 | 8 475 |
| Garen | 60,0 % | 52,0 % | 1,01x | 1,02x | 1,63x | +371 G | 4,1 | 213 998 |
| Nasus | 59,7 % | 51,2 % | 1,02x | 1,01x | 1,23x | +359 G | 3,1 | 133 431 |
| Warwick | 58,7 % | 51,9 % | 1,00x | 1,02x | 1,46x | +367 G | 3,8 | 34 009 |
| Yorick | 58,7 % | 50,2 % | 1,01x | 1,00x | 1,76x | +376 G | 4,4 | 110 329 |

Observación: `result_pred` **no** es el producto de win rate × counter × sinergia (52,4 × 1,02 × 1,02 ≈ 54,5 ≠ 60,1). Es la salida de un modelo; no se puede reconstruir a mano ❓. Las predicciones absolutas están «infladas» (~60 % para el equipo azul en este draft): **úsalas solo de forma relativa dentro de una misma respuesta** (§4.6).

### 4.3 Comportamientos verificados ✅

1. **Draft parcial o vacío funciona.** Con solo `t2_TOP_champion` → 172 candidatos (Nasus 55,9 % arriba); con `{}` → 173 y todas las cifras cerca de 50 % (Zilean 49,6 %…): sin contexto el modelo no discrimina mucho.
2. **Cada revelación cambia el ranking** (el modelo es sensible a la composición). Es lo que lo hace útil durante el pick, y obliga a re-consultar cuando se revela un campeón nuevo.
3. **Rango**: cambia el ranking y las cifras (IRON: Singed 65,4 %, Yorick 63,5 %; EMERALD: Lissandra 62,1 %, Brand 60,8 %; MASTER+: Warwick 60,9 %). Un 500 si el valor no está en la lista.
4. **Región**: sin efecto visible en `draft-picks` (kr = euw1) ✅.
5. **Lado**: rojo resta ~2 puntos al equipo.
6. **Bans**: solo recortan candidatos (162 con 2 bans) y no alteran las cifras de los demás.
7. **Nombres** (**crítico**): comparación **exacta y sensible a mayúsculas**; un nombre no reconocido (`Zzzz`, `malzahar`, `MonkeyKing`, `Nunu`, `""`) **no da error**: devuelve 200 y el hueco se trata como vacío (165 candidatos en vez de 164). Los nombres son los de visualización en inglés: `Wukong`, `Nunu & Willump`, `Renata Glasc`, `Dr. Mundo`, `Cho'Gath`, `Kai'Sa`, `Vel'Koz`, `Bel'Veth`, `Kha'Zix`, `Kog'Maw`, `Rek'Sai`, `K'Sante`, `LeBlanc`, `Lee Sin`, `Jarvan IV`, `Twisted Fate`, `Master Yi`, `Miss Fortune`, `Xin Zhao`, `Aurelion Sol`, `Tahm Kench`, `Fiddlesticks`. Campeones nuevos presentes: `Ambessa`, `Aurora`, `Hwei`, `Mel`, `Smolder`, `Yunara`, `Zaahen`, `Locke`, `Naafiri`, `Briar`.
8. **Vista del enemigo (petición simétrica)**: intercambiando `t1`↔`t2`, `side` y `lane` se obtiene el ranking de picks para el **rival** dado tu equipo (Diana en vista azul 56,7 %; Sylas en vista roja 40,0 %; la suma no da 100 → **no es simétrico, sirve para ordenar, no como probabilidad**) ❓ utilidad real por validar.
9. **Peso de maestría**: con `masteryData` vacío el peso **desplaza todas las predicciones**: peso 0 → Lissandra 60,6 %; 0,3 → 60,1 %; 0,6 → 58,5 %; **1 → 29,8 %** (todo colapsa) ✅. El orden casi no cambia hasta 0,6; con 1 sí. Pasar `masteryData: {"Garen":200000,"avg":20000}` **no cambió nada** (`t1_LANE_mastery` seguía en `2k`), así que el formato real es otro ❓.
10. **Errores**: entradas inválidas → `500 {"error":"Server Error"}` (cuerpo de 24 bytes), tarda ~0,3 s.
11. **Rendimiento**: 0,3–2,7 s por petición (mediana ~1 s desde Bogotá, borde CloudFront `BOG50`); respuesta **1,64–1,73 MB**; `x-cache: Miss from cloudfront` siempre (POST, sin `Cache-Control`): **no hay caché del lado del servidor**.
12. **Cabeceras**: no se ven `Access-Control-*` (misma origen en la web). Desde el cliente de League habrá que depender de `DisableWebSecurity=1` (ya requerido para Coachless) ❓ sin probar; tampoco sabemos si un WAF rechaza peticiones sin `Origin`/`User-Agent` de navegador.

### 4.4 `POST /api/basic-info` (cuenta del jugador) ❓

- Petición (del bundle): `{ "gameName": "...", "tagLine": "...", "region": "euw1" }`. Con un ID inexistente → 500. **No se probó con un Riot ID real** (dato personal; pedir al usuario que use el suyo en la sesión de pruebas).
- Petición real verificada por el usuario (2026-11-06): `{ "gameName": "Simpplay", "tagLine": "UwU", "region": "LA1" }` (región en mayúsculas ✅ en el ejemplo; ❓ desde el cliente).
- Respuesta real ✅: `info` (datos de la cuenta: puuid, nivel, región… **no se usa ni se guarda**), `current_rank` (`tier`, `rank`, LP…) y `mastery`: objeto **indexado por id numérico de campeón** `{ "<championId>": puntos, …, "avg": número }` (puntos de maestría; `avg` = media). Se envía tal cual como `masteryData` de `draft-picks`. El plugin la normaliza en `domain/itero.js#normalizeBasicInfo` (solo claves numéricas + `avg`).
- Privacidad: enviar un Riot ID a un tercero exige consentimiento explícito y opción desactivada por defecto. El plugin ya conoce el `puuid` y las maestrías por el LCU (`/lol-champion-mastery/v1/local-player/champion-mastery` ❓ sin verificar): si se llega a usar maestría, valorar construir `masteryData` desde el LCU **sin enviar el Riot ID a iTero** (depende de entender el formato).

### 4.5 Filtros del lado cliente en la web (replicables) ✅

La web filtra y ordena **después** de recibir los 164+ candidatos, con estos ajustes («Personalización de modelos»; estado por defecto en el bundle):

| Ajuste | Por defecto | Efecto |
|---|---|---|
| «Dominio de campeones» (`championMastery`) | 0,3 (slider 0–1) | Peso de maestría enviado en `userModelWeightings` |
| «Índice mínimo de selección» (`pickRateFilterValue`) | 0,0025 (0,25 %) (slider 1–5, por defecto 3) | Oculta candidatos con `pick_perc < valor` → elimina los fuera de línea y los raros |
| «Mostrar puntuación de la fase de carriles» (`showLaneScore`) | desactivado | Pinta `laning_pred_rating` junto a cada campeón |
| «Ordenar por puntuación de fase de carriles» (`sortByLaneScore`) | desactivado | Reordena por `laning_pred_rating` en vez de `result_pred` |
| «Puntuación mínima en la línea» (`minimumLaneScore`) | 0 (slider 0–5) | Oculta candidatos con `laning_pred_rating` menor |

Otras opciones de la pantalla: región (`euw1` por defecto), modo de Elo `elo-bracket` (franja `GOLD` por defecto) o `my-elo` (por Riot ID).

## 5. Qué aporta cada fuente (para decidir la fusión)

| Pregunta | iTero | Lolalytics (ya integrado) |
|---|---|---|
| ¿Cómo encaja en **mi composición** (sinergias, daño AD/AP, escalado)? | ✅ lo modela | ❌ solo sinergia por línea aliada (`ep=build-team`), sin composición completa |
| ¿Cómo le va contra **el rival de mi línea**? | Parcial: `counter_LANE_{L}_wr` (modelado) | ✅ dato directo, con muestra (`n`) y 100 − wr del rival |
| ¿Cómo le va contra **todos los rivales revelados**? | ✅ una cifra por línea rival | ❌ habría que pedir una página por rival |
| Tamaño de muestra por cifra | Solo `champ_count` global del campeón | ✅ `n` por fila |
| Builds, runas, hechizos, habilidades | ❌ | ✅ |
| Rango | Una franja (`IRON`…`MASTER+`), incluye Iron–Silver | Rango continuo (`tier`), el plugin limita a Gold+ |
| Parche / frescura | ❓ desconocido (no se indica) | ✅ conocido (parche en la URL) |
| Coste | Una petición de ~1,7 MB (~1 s) | Páginas HTML ~300–400 KB (más cacheables) |
| Cuenta | No | No |
| Estabilidad | API privada sin documentar ❓⚠ | Scraping de HTML Qwik ⚠ (ya soportado) |

## 6. Catálogo de posibilidades

Prioridad: P0 imprescindible · P1 aporta mucho valor, coste bajo · P2 valor medio o más coste · P3 exploratorio.
«Peticiones» = peticiones nuevas a iTero respecto a la consulta base del ranking (que ya devuelve todo lo necesario para F1, F3–F6, F8).

| # | Función | Datos | Peticiones | Notas | Prio |
|---|---|---|---|---|---|
| F1 | **Ranking de picks por composición completa**: top N con `result_pred` relativo a la media («+1,8 pts») | `result_pred`, `champ_count`, `pick_perc` | 1 por cambio de composición | Núcleo. Filtrar por pick rate/línea (§4.5), bans y campeones ya elegidos | P0 |
| F2 | **Fusión con Lolalytics**: añadir la ventaja de matchup directa contra el rival de línea y los counters, con encogimiento por muestra | `matchupsVs` (ya existe en `domain/overlay-stats.js`) | 0 (reutiliza `ChampionStats`) | Fórmula en §7 | P0 |
| F3 | **Explicación del pick** (chips): sinergia con X, counter vs Y, escalado, equilibrio AD/AP | `syn_LANE_*`, `counter_LANE_*`, `*_wr_adj`, `*_var` | 0 | Una frase por candidato; iconos, poco texto (regla de la UI) | P1 |
| F4 | **Valoración de tu draft actual y de su evolución**: probabilidad prevista de tu equipo (entrada de tu campeón en la lista) y cómo cambió con cada revelación | `result_pred` de tu campeón | 0 (se guarda cada respuesta) | Mostrar siempre relativo; ver anomalías | P1 |
| F5 | **«¿Y si…?» al pasar el cursor**: cada candidato trae el resumen de equipo con él puesto (`team_comps`, `stats.t1/t2`) | toda la fila | 0 | Se resuelve en memoria sin red | P1 |
| F6 | **Alertas de composición**: falta daño AP/AD, poco tanqueo, ventaja/desventaja early/mid/late de tu equipo frente al rival | `t1_ad_ratio`, `t1_champ_dmg_taken`, `t1/t2_{fase}_wr_adj` | 0 | Umbrales por definir con datos reales ❓ | P1 |
| F7 | **Fase de líneas**: nota de línea, oro previsto, perfil eco/even/snowball y amenaza de cada línea rival (counter por línea, p. ej. «fuerte contra su jungla») | `laning_pred_rating`, `pred_gold`, `counter_LANE_*_gold` | 0 | Opcional: ordenar por línea como hace la web | P2 |
| F8 | **Rango de Elo de la lobby**: mapear el rango del plugin al `rankClass` (§8.2); dos consultas (franja inferior/superior) si cae entre medias, promediando | `rankClass` | 0–1 extra | La web usa una sola franja | P1 |
| F9 | **Qué banear / amenazas probables** con la vista del enemigo (§4.3.8) o con Lolalytics `enemy[lane]` de tu campeón | `result_pred` de la vista roja | 1 por línea enemiga (≤5, en paralelo, bajo demanda) | No simétrico; validar primero ❓ | P2 |
| F10 | **Intercambios con aliados** (¿te conviene cambiar de línea/campeón con alguien?) | llamadas con `lane` = línea del aliado | ≤4 | Muy experimental | P3 |
| F11 | **Maestría personal** (tu pool pesa más) | `masteryData`, `userModelWeightings` | 0 | Bloqueado por el formato ❓ (§4.4 y §4.3 punto 9) | P2 |
| F12 | **Pool de campeones**: reutilizar el análisis del «Creador de plantillas» | `/api/basic-info` + página | ? | No explorado; requiere Riot ID | P3 |
| F13 | **Datos de la tabla de estadísticas** (KDA, placas, épicos, oro <14 min por campeón/función) | HTML del servidor | 1 página (~?) | Solo HTML, frágil; para tarjetas «ricas» | P3 |
| F14 | **ARAM** (página `/aram-builds`) | ❓ | ❓ | No explorado; el plugin ya distingue ARAM | P3 |
| F15 | **Modo sombra / telemetría local**: guardar (sin datos personales) top-5 de cada fuente, la mezcla, el pick real y el resultado para evaluar la fusión | respuestas + LCU fin de partida | 0 | Ver §9, fase 4 | P1 |

No aplicable: iTero no sirve para ARAM/Arena como recomendador de composición (el modelo es de 5 líneas); en esos modos el consejero se desactiva.

## 7. Diseño de la puntuación combinada (propuesta, a validar con datos)

**Entradas por candidato `c`** (línea `L` = tu línea):
- `I(c)`: `result_pred` de iTero (en puntos porcentuales, comp-aware).
- `B(c)`: win rate medio de `c` en `L` (lista de tier de Lolalytics, ya cacheada en `ChampionStats`).
- `V(c)`, `n(c)`: win rate de `c` contra el rival de línea y su muestra (Lolalytics, `matchupsVs`), solo si hay rival conocido.
- `K(c)`: factor `t1_counter_LANE_{Lrival}_wr` de iTero (counter modelado contra ese mismo rival).

**Paso 1 – normalizar iTero dentro de la respuesta.** `Δi(c) = I(c) − mediana(I sobre los candidatos que pasan los filtros)`. Así se elimina el sesgo absoluto (lado, rango, peso de maestría, ~60 % inflado).

**Paso 2 – ventaja de matchup de Lolalytics, encogida.** `E(c) = V(c) − B(c)`; `Es(c) = E(c) · n/(n + n0)` con `n0 ≈ 300` (la tabla de Lolalytics usa `MIN_ROW_GAMES = 200`; ya hay `low` por debajo de 200 y no se enseña por debajo de 30). Si no hay rival o `n < 30`, `Es = 0`.

**Paso 3 – puntuación.** `S(c) = Δi(c) + w · Es(c)` con `w` por defecto **0,5** (ajustable). Motivo del peso moderado: iTero ya incluye parte del counter de línea (`K`), así que sumar Lolalytics entero lo contaría dos veces.

**Alternativa «sin doble conteo» (si la prueba lo justifica):** restar de `Δi` la parte de iTero atribuible al rival de línea y sustituirla por `Es`. Requiere conocer la escala de `K` (`1.08x` ¿sobre el win rate?) ❓. Prueba previa en §9, fase 0 (correlación entre `K` y `E` entre candidatos; si ρ > ~0,6 son casi la misma señal → `w` bajo o solo modo «sustituir»).

**Filtros (antes de puntuar):** excluir bans y ya elegidos (iTero ya quita los elegidos); `pick_perc ≥ 0,0025` (configurable, como en la web); `champ_count ≥ 1000` ❓; en Lolalytics, cuota de línea `pctLane ≥ 30` (como `MIN_LANE_SHARE`) para descartar candidatos fuera de línea; sin dato de Lolalytics, el candidato se mantiene solo con `Δi`.

**Veto opcional:** descartar o marcar candidatos con `V < 47 %` y `n ≥ 500` aunque `Δi` sea alto («iTero lo ve bien por la comp, pero el matchup es malo»).

**Etiquetas de acuerdo:** ✓ ambas fuentes lo ponen en su top 10; ⚠ discrepancia (solo una lo ve bien). La discrepancia se **muestra**, no se esconde.

**Presentación:** top 5 con `S` en puntos relativos («+1,8»), chips (matchup, sinergia, escalado, daño), insignia de fuente (`iTero`, `Lolalytics`), y la fiabilidad (partidas) con el mismo medidor de `domain/confidence.js`. Nunca mostrar `result_pred` como «% de victoria» absoluto.

## 8. Arquitectura propuesta (encaja en las capas actuales)

Reglas del proyecto que aplican: sin `innerHTML`; logs con `log` de `shared/logger.js`; textos en español **y en inglés** (`t()` + `shared/strings.js`; hay prueba que exige las mismas claves); presentación sin `fetch`; nada de `dev/` en `src/`; sin dependencias nuevas; Pengu 1.1.6; el consejero **solo muestra**, no aplica nada.

```
src/domain/
  itero.js            constantes (RANK_CLASSES, LANES, SIDE), buildRequest(ctx, nameOf), normalizeResponse(raw) → Candidate[] recortado,
                      validación de forma (array, campos mínimos), parse de "1.08x"/"+365 G"/"60.1%", name key
  pick-advice.js      reglas puras: filtros, Δi, Es, S, etiquetas de acuerdo, explicación (chips), alertas de composición, asignación de líneas enemigas
src/infrastructure/itero/
  client.js           POST /api/draft-picks con timeout (10 s), AbortSignal, caché por clave (TTL ~10 min) + petición compartida,
                      backoff 1/5/30 min ante 429/5xx (como lolalytics/client.js), recorta la respuesta al parsear (descarta ~95 % de los bytes),
                      nunca lanza → {ok, data} | {ok:false, reason}
src/application/
  pick-advisor.js     createPickAdvisor({ itero, stats, catalog, getFilters, getPrefs, log }).advise(ctx) → {ok, data}; unifica con ChampionStats (Lolalytics)
                      createPickAdvisorController(...): como createOverlayController (estado {status,data,key}, debounce, cancelación, caché por composición)
  preferences.js      (ampliar) 'draftsage/pickAdvisor': { enabled, useItero, useLolalytics, blendWeight, minPickRate, masteryWeight }
src/presentation/
  panel.js            sección «Picks sugeridos» (top 5 + chips + hover what-if); etiquetas en la cuadrícula (reutiliza overlay.js) opcional
  settings.js         interruptores y pesos (en «Más»)
dev/api-probes/ dev/tests/  ver §9
```

### 8.1 Cambios en `MatchContext` / proveedor LCU (`champ-select-provider.js`)

Hoy el contexto trae `championId`, `role`, `opponentChampionId`, `lobbyTier`, `mode`, `enemies[{championId, position}]`, `allies[{championId, position}]`. Para iTero hace falta además (todo ❓ en el LCU real, verificar con `draftsage.state()`/logs):
- `side`: `myTeam[].team` (1 = azul, 2 = rojo; ❓ comprobar) → `Blue`/`Red`.
- `bans`: `session.bans.myTeamBans` + `theirTeamBans` (ids) ❓.
- `allies[].position` fiable: en ranked `assignedPosition` viene en tu equipo; **en el rival normalmente no** (el código actual ya lo asume). Hay que **asignar líneas a los rivales revelados**: resolver la asignación 1–a–1 que maximice la cuota de línea (`pctLane` de Lolalytics: 5 listas de tier, cacheadas 2 h; con ≤5 rivales basta la fuerza bruta de ≤120 permutaciones). Empates/dudas → dejar ese rival **fuera** (se trata como hueco; mejor «medias» que un dato equivocado).
- `isMyTurn`/fase (`session.timer.phase`, `actions[].isInProgress`) para refrescar al empezar tu turno ❓.
- Modo: solo `CLASSIC`/ranked/normal draft. Desactivar en ARAM (`ARAM`, `KIWI`), Arena (`CHERRY`).

### 8.2 Mapeos necesarios

| Qué | De → a | Cómo | Riesgo |
|---|---|---|---|
| Campeón | id LCU → nombre inglés exacto de iTero | `champion-summary.json` da `name` en el **idioma del cliente** y `alias` (`MonkeyKing`, `Nunu`, `Renata`…): **no sirven tal cual**. Opciones: (a) tabla de excepciones + normalización (`Wukong`↔`MonkeyKing`, `Nunu & Willump`↔`Nunu`, `Renata Glasc`↔`Renata`, `Dr. Mundo`↔`DrMundo`, `Fiddlesticks`, `LeBlanc`, `Kha'Zix`…); (b) cargar los nombres en inglés (Data Dragon / `en_US` del LCU ❓) una vez y cachear. **Validación obligatoria**: tras la primera respuesta, comprobar que cada nombre enviado aparece entre los `champion` devueltos o entre los de `team_comps`; si uno no se reconoce, **no confiar en el resultado**, registrar `log.warn` y mostrar aviso (porque el servidor no avisa). | ⚠ silencioso |
| Línea | LCU `assignedPosition` / rol del plugin → `TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY` | `top`, `jungle`, `middle`, `bottom`, `utility` → mayúsculas; rol 0–4 → mismo orden | Bajo |
| Rango | `lobbyTier` del plugin (3 Gold … 7 Master+) → `rankClass` | 3 `GOLD`, 4 `PLATINUM`, 5 `EMERALD`, 6 `DIAMOND`, 7 `MASTER+`. iTero admite además `IRON/BRONZE/SILVER`: el plugin acota a ≥3 por Coachless; para iTero se podría usar la escala cruda de `domain/lobby.js` (`RAW_TIER` 0–7). Rango elegido a mano (filtros) tiene prioridad. | Bajo |
| Región | región del cliente → plataforma Riot (`euw1`…) | Sin efecto aparente en `draft-picks`: enviar `euw1` si no se conoce ❓ | Bajo |
| Lado | `Blue`/`Red` | ver §8.1 | Medio |
| Respuesta | textos con unidad → números | parseo defensivo (`"1.08x"`, `"+365 G"`, `"60.1%"`, `"2k"`); campos ausentes → `null`, nunca excepción | Medio |

### 8.3 Caché y resiliencia (iguales a las reglas del proyecto)

- Clave: `rankClass | side | lane | bans | composición ordenada | maestría/peso`; TTL ~10 min (el draft dura minutos; datos del modelo cambian por parche); reutilizar la respuesta al volver a una composición ya vista; guardar **solo los campos recortados** (~300 B por candidato ≈ 50 KB) y soltar los 1,7 MB.
- Una consulta **solo cuando cambia la composición** (nuevo revelado/pick/ban), nunca por pasar el cursor (las vistas «¿y si…?» salen de la respuesta ya recibida); debounce ~600 ms; cancelar la anterior; máximo ~12 consultas por Champion Select.
- Timeout 10 s; 429/5xx → backoff 1/5/30 min y **degradar** a «solo Lolalytics» (el overlay actual sigue funcionando); iTero caído **nunca** bloquea el cliente ni el panel.
- Validar forma: array no vacío con `champion`, `result_pred`; si falta algo, `reason:'shape'` y no pintar.
- Sin credenciales ni Riot ID en el envío por defecto; sin cookies (`credentials: 'omit'`).

## 9. Plan por fases (cada fase deja el proyecto en verde: `node dev/tests/run.mjs`, `node dev/tools/check.mjs`, `node --check` en cada `.js`)

**Fase 0 – Sondas (sin tocar `src/`)** — 1 sesión corta
- Crear `dev/api-probes/test-itero-draft.mjs` (sin credenciales; ejecutar en el equipo del usuario con Node): replica la petición, valida el esquema (§4.1/§4.2), mide tiempo/tamaño, comprueba que `fetch` desde Node funciona sin cabeceras de navegador y guarda una **fixture recortada** en `dev/tests/fixtures/itero-fixture.mjs` (10–15 candidatos reales).
- Crear `dev/api-probes/test-itero-vs-lolalytics.mjs`: para un draft real con rival de línea, correlación de Spearman entre `K(c)` (iTero) y `E(c)` (Lolalytics) y solapamiento de top 10 → decide `w` y el modo «sustituir».
- Resolver con el usuario: (1) ¿Riot ID propio para probar `basic-info`? (2) rango real de pruebas.
- Pruebas manuales en el cliente: `fetch` POST a `itero.gg` desde la consola del cliente con `DisableWebSecurity=1`.

**Fase 1 – Dominio + infraestructura (con pruebas)**
- `domain/itero.js` (`buildRequest`, `normalizeResponse`, parseo, validación de nombres) y `infrastructure/itero/client.js` (timeout, backoff, caché, recorte). Pruebas `dev/tests/itero.test.mjs` con la fixture (forma, parseo de unidades, 500, nombre no reconocido, aborto, backoff, caché).

**Fase 2 – Aplicación**
- Ampliar `champ-select-provider.js` (`side`, `bans`, líneas de los rivales) detrás de `MatchContextProvider`; `domain/pick-advice.js` (filtros, Δi, `Es`, S, acuerdo, asignación de líneas); `application/pick-advisor.js` (+ controlador con debounce/cancelación). Pruebas: asignación de líneas (casos con empate), fusión con/sin rival, degradación a una fuente, bans.

**Fase 3 – Interfaz**
- Sección «Picks sugeridos» en el panel (top 5, chips, insignias, fiabilidad), hover «¿y si…?», ajustes en «Más» (activar, fuentes, peso, pick rate mínimo). Textos es/en. Pruebas de UI (Playwright, `ui.test.cjs`): orden, atenuado en carga, estados de error, poco texto.

**Fase 4 – Modo sombra y evaluación**
- Registrar localmente (DataStore, tope ~50 entradas, sin datos personales) por Champion Select: top 5 de iTero, top 5 de Lolalytics, mezcla, pick real y resultado (LCU, fin de partida ❓). Script de análisis en `dev/tools/`. Criterio: la mezcla debe igualar o superar a cada fuente por separado en «el pick real estaba en el top 5» y no empeorar el win rate de los picks seguidos (con muestra pequeña, solo orientativo).

**Fase 5 – Extras (F6–F13)** según prioridad y tiempo.

Criterios de aceptación mínimos de las fases 1–3: sin internet o con iTero caído el cliente y el panel siguen funcionando; ningún nombre sin mapear llega a la API sin aviso; nunca se muestra un % absoluto de iTero; ninguna petición a iTero por pasar el cursor; `check.mjs` limpio.

## 10. Lo que está sin saber (para sondear o preguntar)

1. ⚠ **Términos de uso / permiso de iTero** para consumir su API desde un plugin público; no hay enlace visible a términos. Considerar escribirles. Citar y enlazar la fuente en la UI.
2. Límites de uso (≈35 peticiones sin 429; con el cliente real habrá ≤12 por selección).
3. Frescura del modelo: parche y fecha de datos (no se publican) ❓.
4. Significado exacto de `*_wr_adj` («1.08x»), `*_wr` de counter/sinergia (¿multiplicador sobre qué?), `eco/even/snowball`, `ratings` 0–5, `pick_perc`.
5. `masteryData`/`userModelWeightings`: formato real y por qué el peso desplaza todo (peso 1 → 29 %). **Hasta resolverlo, enviar `masteryData: {}` y peso 0** (peso 0 da 60,6 % vs 60,1 % con 0,3: el ranking apenas cambia).
6. Valores de `region` válidos distintos de `euw1`/`kr` y si afectan a algo.
7. Si el servidor rechaza peticiones sin cabeceras de navegador (Origin/User-Agent) o desde el CEF del cliente.
8. Estabilidad del esquema (API privada: puede cambiar sin aviso → la validación de forma y la degradación son obligatorias).
9. Si la vista del enemigo (§4.3.8) sirve de verdad para banear/predecir.
10. Anomalía por aclarar: con la **misma** composición pero `lane: JUNGLE` (y `t1_TOP` rellenado), los mejores candidatos salieron en 32–39 %, muy por debajo de 56–60 % en otras líneas/peticiones. Puede ser una consecuencia de pedir una línea con comp inconsistente (dos aliados que el modelo considera fuera de línea) o un sesgo por línea ❓. Conclusión de diseño: **comparar solo dentro de la misma respuesta** y no entre líneas/peticiones.
11. ARAM builds, constructor de pool y la app de escritorio no se exploraron.
12. Riot: revisar la política de herramientas de Champion Select para sugerencias de pick (solo se usa información visible: campeones revelados y bans) antes de distribuir.

## 11. Reproducir la consulta (consola del navegador en itero.gg o Node 18+)

```js
const r = await fetch('https://www.itero.gg/api/draft-picks', {
  method: 'POST',
  body: JSON.stringify({
    region: 'euw1', rankClass: 'GOLD', side: 'Blue', lane: 'TOP', masteryData: {},
    teamComp: { t1_JUNGLE_champion: 'Viego', t1_MIDDLE_champion: 'Diana', t1_BOTTOM_champion: 'Jinx', t1_UTILITY_champion: 'Bard',
                t2_TOP_champion: 'Malzahar', t2_JUNGLE_champion: 'Shaco', t2_MIDDLE_champion: 'Sylas', t2_BOTTOM_champion: 'Lucian', t2_UTILITY_champion: 'Milio' },
    bans: [], userModelWeightings: { t1_TOP_mastery: 0 },
  }),
})
const j = await r.json()   // array ordenado por result_pred; ~1,7 MB
console.table(j.slice(0, 5).map(x => ({ champion: x.champion, pred: x.result_pred, wr: x.stats.player.t1_LANE_champ_wr, syn: x.stats.player.t1_LANE_syn_avg, counter: x.stats.player.t1_LANE_counter_avg, laning: x.laning_pred_rating })))
```

## 12. Riesgos y decisiones abiertas para el usuario

- **Dependencia de una API privada** (cambios sin aviso, bloqueo, límites): mitigado con validación, caché, degradación a Lolalytics y un interruptor para desactivar iTero.
- **Legal/producto**: iTero tiene su propio cliente con sugerencias de draft; usar su API desde un plugin competidor y distribuirlo requiere su visto bueno; Lolalytics ya tenía una advertencia similar (`docs/HANDOFF.md`).
- **Privacidad**: la composición del draft se envía a iTero; el Riot ID, solo con consentimiento explícito (F11/F12); documentarlo en el README.
- **Calidad del modelo no medida**: el valor real de la fusión se decide con la fase 4 (modo sombra), no con suposiciones; mientras tanto, mostrar «relativo» y marcar discrepancias.
- Decisiones que conviene confirmar con el usuario antes de la fase 2: (1) ¿consejero activado por defecto o desactivado hasta aceptar un aviso (como «Aplicar»)?; (2) ¿mostrarlo en el panel, en las etiquetas de la cuadrícula o en ambos?; (3) ¿peso de la fusión fijo (0,5) o ajustable?; (4) ¿probar la maestría con el Riot ID propio?
