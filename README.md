# Easy Coachless

Plugin de [Pengu Loader](https://pengu.dev) **1.1.6** para el cliente de League of Legends. Usa la API de Coachless
(cada usuario con su propia cuenta; premium para matchup y rangos de parche) para mostrar runas y hechizos según
el matchup y el rango de la lobby.

> Estado: en desarrollo. Ver `docs/HANDOFF.md` para el estado actual y `docs/ARCHITECTURE.md` para la estructura.

## Instalación (desarrollo)
Copia esta carpeta en `<Pengu Loader>/plugins/easy-coachless` y reinicia el cliente.
Requiere `DisableWebSecurity=1` en el archivo `config` de Pengu (el plugin guía el proceso).

## Estructura
Ver `docs/ARCHITECTURE.md`. No hay paso de compilación: son módulos ES cargados directamente por Pengu.
`dev/` contiene herramientas de desarrollo y **no debe incluirse en las releases**.
