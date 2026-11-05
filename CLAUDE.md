# Easy Coachless — instrucciones para Claude

## Propósito
Plugin de **Pengu Loader 1.1.6** (no 1.2 beta) que, durante Champion Select, muestra en el cliente de League las runas y hechizos de Coachless según **matchup y rango de la lobby**. Solo funciona con la cuenta propia de cada usuario (premium para matchup y rangos de parche). Objetivo a medio plazo: distribución pública, así que importan la seguridad, la resiliencia y la compatibilidad, no solo que funcione en local.

## Antes de empezar cualquier tarea
1. Lee `docs/HANDOFF.md` (estado, hallazgos, pendientes). Es la fuente de verdad del estado; actualízalo al terminar si cambia algo.
2. Para la API: `docs/coachless-api.md` y `docs/coachless-auth.md`. Para la estructura: `docs/ARCHITECTURE.md`.
3. Si la tarea toca algo que HANDOFF lista como «desconocido», no lo supongas: dilo, sondéalo con un script de `dev/api-probes/` o pide al usuario el dato (p. ej. el body de DevTools > Network sin la cabecera Authorization).

## Arquitectura (resumen; detalle en docs/ARCHITECTURE.md)
JavaScript plano con módulos ES, **sin build**. Pengu solo ejecuta `index.js`; este solo delega en `src/application/bootstrap.js`.
- `domain/` tipos y reglas puras. `application/` flujos y casos de uso. `infrastructure/` Coachless, Pengu, LCU, storage. `presentation/` UI. `shared/` logger y utilidades.
- Dependencias: presentation → application → domain; infrastructure implementa lo que application necesita. Presentation **no** hace `fetch`: pide datos a application (p. ej. `application/session.js`).
- Cada módulo nuevo va en su capa; no añadas capas ni carpetas vacías por anticipado. No añadas dependencias, bundler, TypeScript, React ni gestor de estado sin que exista una necesidad concreta y el usuario lo apruebe.
- Todo acceso al cliente (socket/LCU) va tras una interfaz de proveedor (`getCurrentContext()`, `subscribeToChanges()`), porque la API del LCU no es oficial y puede cambiar.

## Restricciones de Pengu 1.1.6
- Usa solo APIs disponibles en 1.1.6. `context.fs`, plugins con espacio de nombres (`@autor/plugin`) y las entradas `init`/`load` de la documentación actual son de 1.2+: **no las uses** sin comprobarlo.
- `DataStore` es compartido entre plugins y no está cifrado: solo se guarda el refresh token, nunca la contraseña ni el access token.
- La web security está desactivada (`DisableWebSecurity=1`) para llamar a la API; el plugin no puede escribir la config de Pengu y solo guía al usuario.

## Reglas de seguridad y estilo (no negociables)
- Sin `innerHTML`: DOM con `h()` de `presentation/ui.js`.
- La contraseña nunca se guarda ni se registra. No imprimas tokens ni los pongas en mensajes de error o logs. Sin claves ni credenciales en el código.
- Todos los logs con `log` de `shared/logger.js` (prefijo `[easy-coachless]`); depuración con `log.debug`.
- Los scripts de prueba piden credenciales por prompt. Solo se usan las cuentas de pruebas desechables que el usuario autorizó (premium y gratuita); nunca otras.
- Comportamiento de API ya verificado (no lo contradigas): `Auth/login` devuelve 200 siempre → mirar `actionResult` (0 = OK); premium = claim `isSubscribed === "1"`; 403 en filtros premium **no** es error de sesión → reintentar con `patchAdditions: 0` y avisar; `leagueTiers` mínimo 3; `GetRecommendedBuilds` ignora el matchup.
- Comentarios y textos de UI en español, como el resto del proyecto.

## Políticas de Riot / Pengu (riesgo crítico)
**Mostrar** runas y hechizos es el alcance seguro. **Aplicarlos automáticamente** (modificar páginas de runas o hechizos por LCU) puede violar las políticas de Riot/Pengu sobre automatización: no lo implementes ni lo actives por defecto sin que el usuario haya validado las políticas. Si se llega ahí, hazlo tras una interfaz `ConfigurationApplier` con `canApply()` desactivado de inicio, y que el usuario confirme cada aplicación. Antes de distribuir públicamente, recuerda al usuario revisar los términos de Coachless y el registro en el Developer Portal de Riot.

## Cómo trabajar con los archivos (importante)
El proyecto vive en el equipo del usuario: `C:\Program Files\Pengu Loader\plugins\easy-coachless`. Mis herramientas Read/Write/Edit/Bash **no** actúan ahí.
- Con shell en el equipo (`device_bash`), edita directamente. Sin ella: `device_stage_files` para leer → trabajar en la copia local → `device_commit_files` para escribir, usando `expectedMtimeMs` para no pisar cambios del usuario.
- **Tras cada escritura, verifica**: vuelve a listar/stage y compara el tamaño en bytes (ya se dejó una versión antigua en disco varias veces).
- Sin `device_bash` no se pueden borrar ni mover archivos: dilo y da el comando de PowerShell exacto, no dejes duplicados sin avisar.
- Antes de entregar, comprueba que todos los imports relativos resuelven y que `node --check` pasa en cada `.js`.
- No toques `.git` ni hagas commits salvo que el usuario lo pida.
- `dev/` (probes y herramientas) **no se distribuye**; no importes nada de `dev/` desde `src/`.

## Forma de trabajar
- Cambios pequeños y verificables; no mezcles refactor con funcionalidad nueva. Mantén el comportamiento existente salvo que se pida lo contrario.
- Avanza por el prototipo vertical: `Pengu → Champion Select → MatchContext → Coachless → UI`. Orden de pendientes en HANDOFF (cerrar `GetRunesForKeystoneAndTree`, capa de datos con caché, detección de champ select, UI, acceso desde el cliente).
- Capa de datos: elegir parche con `GetPatches` (el último con muestra suficiente), clamp de rango ≥ 3, caché por parche/campeón/filtros, cancelar peticiones obsoletas, timeouts; Coachless caído no debe bloquear el cliente.
- Funcionalidad crítica (auth, caché, clamp, mapeo de respuestas) → pruebas automatizadas cuando se añada tooling de tests (previsto: Vitest en `tests/`); hasta entonces, probes en `dev/`.
- Cuando algo requiera probar en el cliente real (z-index, teclado, `restartClient()`), pide al usuario que lo haga y reporte los logs `[easy-coachless]`.
- Al terminar: actualiza `docs/HANDOFF.md` (hecho / hallazgos / pendiente) y documenta en `docs/coachless-api.md` cualquier endpoint o formato descubierto.
