# Easy Coachless

Plugin de [Pengu Loader](https://pengu.dev) **1.1.6** para el cliente de League of Legends. Usa la API de Coachless
(cada usuario con su propia cuenta; premium para matchup y rangos de parche) y, en Champion Select, muestra en un panel
las **runas, fragmentos y hechizos** recomendados según tu campeón, el rival de tu línea y el rango de la lobby.
Con un botón **Aplicar** (desactivado hasta que aceptes un aviso) escribe esa recomendación en tu cliente: página de runas y hechizos. Nunca aplica nada por sí solo.

> Estado: prototipo funcional pendiente de probar en el cliente real. Ver `docs/HANDOFF.md` y `docs/ARCHITECTURE.md`.

## Instalación (desarrollo)
Copia esta carpeta en `<Pengu Loader>/plugins/easy-coachless` y reinicia el cliente.
Requiere `DisableWebSecurity=1` en el archivo `config` de Pengu (el plugin guía el proceso).

## Uso
- Inicia sesión con tu cuenta de coachless.gg cuando el plugin lo pida (la contraseña no se guarda).
- En Champion Select aparece el panel a la derecha (se arrastra, se pliega con – y se cierra con ×).
- Botón **EC** (abajo a la izquierda) o **Ctrl+Shift+E**: menú con inicio/cierre de sesión, «Ver runas de un matchup»
  (simula una selección sin estar en partida) y mostrar/ocultar el panel.
- **Aplicar** (panel o **Ctrl+Shift+A**): «Aplicar todo», «Runas» o «Hechizos». La primera vez pide aceptar un aviso sobre las políticas de Riot/Pengu.
  Por defecto escribe en una página propia «[EC] …» (no toca las tuyas); en el menú puedes elegir reemplazar la página activa y la tecla de Destello.
- Cuenta gratuita: datos del campeón y rango, sin matchup ni rango de parches. Premium: matchup y dos parches.
- Desde DevTools: `easyCoachless.state()`, `easyCoachless.simulate({championId:145, opponentChampionId:222, role:3, lobbyTier:5})`, `easyCoachless.debug(true)`.

## Estructura y pruebas
Ver `docs/ARCHITECTURE.md`. No hay paso de compilación: son módulos ES cargados directamente por Pengu.
`dev/` contiene herramientas de desarrollo y **no debe incluirse en las releases**:
`node dev/tests/run.mjs` (pruebas), `node dev/tools/check.mjs` (sintaxis e imports), `dev/api-probes/` (sondas de la API).
