# DOM de Champion Select (cliente 16.22) y anclas de la interfaz integrada

Fuente: captura del `<body>` del cliente en pleno Champion Select (2026-11-06, Pengu 1.1.6, ranked, jugador en TOP). La captura es **solo HTML, sin el CSS del cliente**: las posiciones y los `display` de los contenedores NO están verificados (ver «Pendiente de verificar»).
Fixture anonimizado y recortado para las pruebas: `dev/tests/fixtures/champ-select-dom.html`.

## Estructura relevante
`section#rcp-fe-viewport-root` → `div.screen-root[data-screen-name="rcp-fe-lol-champ-select"]` (el cliente deja otras pantallas montadas con `opacity:0`: `rcp-fe-lol-activity-center`, `rcp-fe-lol-navigation-screen`…, de ahí que se compruebe que el ancla **se ve**) → `.champion-select` →

| Zona | Selector | Contenido |
|---|---|---|
| Equipo aliado / enemigo | `.summoner-array.your-party` / `.enemy-party` → `.summoner-object.slot-id-N` | `.portrait-icon` (`background-image: …/champion-icons/{id}.png`), `.summoner-primary-text` (campeón), `.summoner-secondary-text` (rol/estado), `.summoner-spells img.spell1/2`. Slots 0–4 aliados, 5–9 rivales. |
| Baneos | `.team-bans.left/.right .team-bans-champion-icon` | |
| Cuadrícula | `.champion-grid` → `.champion-grid-header` + `.champions` → `.champion-container` | **Virtualizada**: solo se pintan las fichas visibles, cada una en un `div` con `transform: matrix3d(…)`; ember las recicla. |
| Cabecera de la cuadrícula | `.champion-grid-header` | `.filter-icons` (5 `.filter.top/jungle/middle/bottom/support`), `.spacer`, `lol-uikit-framed-dropdown.champ-select-sort-dropdown` (Favorito/Nombre/Maestría), `lol-uikit-flat-input` > `input.champion-input`. |
| Ficha | `.grid-champion[data-id]` | `data-id` = id del campeón (**-2** = ficha «ninguno»). Clases: `grid-champion-favorite`, `grid-champion-free-to-play`, `grid-champion-banned` (+ atributo `disabled`). Hijos: `.grid-champion-hitbox` > `img.champion-background-image[src=…/champion-icons/{id}.png]`, `.champion-name`, `.grid-champion-overlay`. |
| Barra de loadout | `.loadouts-edit-wrapper.visible` > `.loadouts-edit-component` | `.loadout-edit-controls` (`.rune-recommender-button-component` —el recomendador nativo—, botón editar runas, `.perks-page-dropdown` con las páginas, incluida la `[DS] …` del plugin), luego **hermanos**: `.summoner-spell-container` (2 `.flyout-selector-trigger-button`), `.loadoutsSpacer`, `.ward-skin-select-component`, `.emotes-visibility-wrapper`. |
| Chat | `.pregame-chat-box` | |
| Botones inferiores derechos | `.bottom-right-buttons` | `.quit-button`, `lol-social-chat-toggle-button`, `.missions-tracker-button-component`, `.champ-select-voice-button-wrapper`. |
| Skins | `.skin-select` … `.skin-carousel` | |

## Anclas que usa `presentation/native.js` (`findAnchors`)
| Pieza del plugin | Contenedor | Se inserta |
|---|---|---|
| Botón de la build (runa clave + árbol secundario + ⚡ aplicar) | `.loadouts-edit-component` | antes de `.loadoutsSpacer` (si no existe, antes de `.ward-skin-select-component`) |
| Tira de picks + botón de filtros | `.champion-grid-header` | antes de `.spacer` |
| Botón DS (ajustes) | `.bottom-right-buttons` | como primer hijo |
| Marcadores de win rate | `.grid-champion[data-id]` (id > 0, sin `grid-champion-banned`) | capa fija propia (`presentation/overlay.js`); si no hay fichas nativas se usa la heurística de imágenes |

Reglas: solo se integra con una selección en curso del LCU (`phase != game`, contexto real, no simulación) y si el ancla **se ve** (tamaño > 0, sin `visibility:hidden`). Si no hay ninguna ancla se mantiene el panel flotante y se avisa en el log una vez (`draftsage.nativeProbe()` da el diagnóstico). Las piezas se reponen si Ember las borra (vigilancia por `MutationObserver` + sondeo cada 1,5 s) y la reconciliación es idempotente.

## Decisiones de diseño
- Nada de clics sintéticos sobre el cliente: «localizar» una ficha solo la desplaza a la vista y la hace parpadear; elegir sigue siendo del jugador. Aplicar runas/hechizos sigue siendo un clic explícito (botón ⚡ o Ctrl+Shift+A) tras el aviso de políticas.
- El popover cuelga del **contenedor** (estable) y no de los botones, que se regeneran al repintar. Su posición se recalcula cada fotograma mientras está abierto (el cliente anima y escala) y se compensa el zoom con una sonda fija de 100 px.
- Los widgets sólo se repintan si cambia su firma (evita perder clics por reemplazar el botón bajo el ratón).

## Pendiente de verificar en el cliente real
1. Que `.loadouts-edit-component`, `.champion-grid-header` y `.bottom-right-buttons` sean contenedores **flex** (las piezas son `inline-flex`, así que degradan bien, pero el espacio depende del CSS del cliente). Si la tira de picks no cabe en la cabecera, se recorta (overflow oculto); el popover «picks» sigue teniendo todo.
2. Que Ember no purgue los nodos añadidos (se reponen en ≤ 1,5 s; si hay parpadeo, avisar).
3. Que el cliente no aplique zoom propio distinto del que compensa la sonda (prueba con zoom 0,8 en Chromium).
4. Que las ranuras de rivales (`.enemy-party .summoner-object`) muestren el campeón (`.portrait-icon` con `champion-icons/{id}.png`) para, en una fase posterior, poner la línea de cada rival sobre su propio retrato.
