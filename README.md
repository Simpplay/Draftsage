# Draftsage

Repositorio: <https://github.com/Simpplay/Draftsage>

Plugin de [Pengu Loader](https://pengu.dev) **1.1.6** para el cliente de League of Legends. Usa la API de Coachless
(cada usuario con su propia cuenta; premium para matchup y rangos de parche) y, en Champion Select, muestra en un panel
las **runas, fragmentos y hechizos** recomendados según tu campeón, el rival de tu línea y el rango de la lobby.
Con un botón **Aplicar** (desactivado hasta que aceptes un aviso) escribe esa recomendación en tu cliente: página de runas y hechizos. Nunca aplica nada por sí solo.

> Estado: prototipo funcional pendiente de probar en el cliente real. Ver `docs/HANDOFF.md` y `docs/ARCHITECTURE.md`.

## Instalación (desarrollo)
Copia esta carpeta en `<Pengu Loader>/plugins/draftsage` y reinicia el cliente.
Requiere `DisableWebSecurity=1` en el archivo `config` de Pengu (el plugin guía el proceso).

## Uso
- Inicia sesión con tu cuenta de coachless.gg cuando el plugin lo pida (la contraseña no se guarda).
- En Champion Select aparece el panel a la derecha (se arrastra, se pliega con – y se cierra con ×).
- Botón **DS** (abajo a la izquierda) o **Ctrl+Shift+E**: menú con inicio/cierre de sesión, «Ver runas de un matchup»
  (simula una selección sin estar en partida) y mostrar/ocultar el panel.
- **Aplicar** (panel o **Ctrl+Shift+A**): «Aplicar todo», «Runas» o «Hechizos». La primera vez pide aceptar un aviso sobre las políticas de Riot/Pengu.
  Por defecto escribe en una página propia «[DS] …» (no toca las tuyas); en el menú puedes elegir reemplazar la página activa y la tecla de Destello.
- **Alternativas**: bajo la runa clave verás las otras runas clave con su % de uso; un clic y la página cambia. Junto a los hechizos, los sustitutos del hechizo intercambiable.
- **Fiabilidad**: el medidor de barras del pie indica cuántas partidas respaldan la recomendación; lo poco fiable se ve atenuado.
- **Fijar** (📌): recuerda tu runa clave y hechizos para ese campeón y rol; el resto sigue los datos del parche.
- **Enlace** (icono de la cabecera): abre la misma build en coachless.gg (`/builds/caitlyn?role=adc&matchup=jinx`).
- Los hechizos se ajustan al modo y al rol (Aplastar en jungla, ninguno en Arena, sin Aplastar en ARAM…).
- **Idioma**: español o inglés (automático según el cliente; cambiable en Ajustes → Más → ES/EN).
- **Fuente de datos** (Ajustes): Coachless (por defecto), **LoLalytics** (gratis, sin cuenta, parche actual) o Auto. Con LoLalytics no hace falta iniciar sesión.
- **Estadísticas en la selección** (Ajustes → Más → Estadísticas): etiqueta sobre cada campeón con su win rate en tu línea o, con rival, contra él; los mejores counters, resaltados (datos de LoLalytics, sin cuenta). `draftsage.overlayProbe()` / `.overlaySelector('css')` si no aparecen.
- Cuenta gratuita: datos del campeón y rango, sin matchup ni rango de parches. Premium: matchup y dos parches.
- Desde DevTools: `draftsage.state()`, `draftsage.simulate({championId:145, opponentChampionId:222, role:3, lobbyTier:5})`, `draftsage.debug(true)`.

## Actualizaciones
El plugin puede actualizarse solo desde GitHub: descarga versiones **firmadas** (se verifican con una clave pública incluida en el plugin; sin firma válida no se ejecuta nada) y las aplica **al reiniciar el cliente**. En Ajustes → Más → Actualizaciones eliges *Auto* (por defecto) o *Solo incluida* (no busca ni descarga nada). `draftsage.build()` en DevTools muestra la versión y de dónde sale. Si una versión nueva exige reinstalar el plugin, se avisa. Detalles para quien publica versiones: `docs/RELEASING.md`.

## Estructura y pruebas
Ver `docs/ARCHITECTURE.md`. No hay paso de compilación: son módulos ES cargados directamente por Pengu.
`dev/` contiene herramientas de desarrollo y **no debe incluirse en las releases**:
`node dev/tests/run.mjs` (pruebas), `node dev/tools/check.mjs` (sintaxis e imports), `dev/api-probes/` (sondas de la API).
