# Publicar versiones de Draftsage

Las versiones se publican en GitHub (`Simpplay/Draftsage`), las sirve jsDelivr y las verifica el plugin con una firma ECDSA P-256. Arquitectura: `docs/ARCHITECTURE.md` («Actualizaciones firmadas»).

## Una sola vez

1. **Dependencias de desarrollo** (solo esbuild): `cd dev && npm install` (en un disco local, no en una unidad que no admita enlaces simbólicos).
2. **Claves de firma**: `node dev/tools/keygen.mjs`
   - La privada queda en `~/.draftsage/signing-key.pem` (Windows: `C:\Users\<tú>\.draftsage\signing-key.pem`), fuera del repositorio. **Haz copia de seguridad** (gestor de contraseñas o disco cifrado). Si la pierdes no podrás publicar actualizaciones: tendrás que sacar una versión nueva del plugin con otra clave y pedir a todos que reinstalen.
   - La pública se añade a `src/infrastructure/update/config.js`.
3. **Haz commit de `config.js` y reinstala el plugin** en tu equipo (y en el de cualquier usuario): las claves forman parte del loader. Mientras `PUBLIC_KEYS` esté vacío, las actualizaciones remotas están apagadas y solo corre el código incluido.
4. Mira que el repositorio sea **público** (jsDelivr no sirve repos privados).

## Cada versión

**Con un solo comando** (PowerShell, desde la raíz del plugin):

```
powershell -ExecutionPolicy Bypass -File .\dev\tools\publish.ps1            # siguiente versión patch (1.0.0 -> 1.0.1)
powershell -ExecutionPolicy Bypass -File .\dev\tools\publish.ps1 -Bump minor   # 1.0.1 -> 1.1.0
powershell -ExecutionPolicy Bypass -File .\dev\tools\publish.ps1 -Version 2.0.0 -NoPush
```

`publish.ps1` comprueba el entorno (rama `main`, árbol limpio, nada pendiente de bajar de origin, etiqueta libre), instala esbuild si falta, ejecuta `release.mjs`, te enseña los cambios y pide confirmación, hace `git add -A`, commit `release vX.Y.Z` y etiqueta anotada, comprueba el zip con `package.mjs` (si falla deshace commit y etiqueta) y hace `git push --atomic origin main vX.Y.Z`. Opciones: `-Key <ruta.pem>`, `-RequireTests`, `-NoPush` (todo menos el push), `-Yes` (sin confirmación). No pide ni imprime la clave privada.

**A mano** (lo que hace el script):

```
node dev/tools/release.mjs 1.0.1            # añade --require-tests para bloquear si fallan las pruebas
git add -A
git commit -m "release v1.0.1"
git tag v1.0.1
git push origin main --tags
```

Al subir la etiqueta, el workflow `.github/workflows/release.yml` crea solo el **Release de GitHub** con `Draftsage-X.Y.Z.zip` y su `.sha256` (notas automáticas). Ese zip es lo que se reparte a los usuarios (ver «Distribución»). El workflow **no firma nada y no usa secretos**: solo comprueba (`check.mjs`, pruebas de actualizaciones, `dev/tools/package.mjs`) y publica. Si falla, no se crea el Release; corrige, borra la etiqueta (`git push origin :refs/tags/vX.Y.Z`) y vuelve a etiquetar.

`release.mjs` hace, por este orden: valida que la versión sea mayor que la actual y que la clave privada corresponda a una pública del loader → `check.mjs` (+ pruebas) → escribe `src/shared/version.js` → empaqueta `bootstrap.js` en un solo archivo con esbuild → crea y firma `dist/manifest.json` → **se verifica a sí mismo como lo hará el loader** (firma, hash, tamaño, sintaxis) → solo entonces escribe `dist/`. Si algo falla restaura `version.js` y no toca `dist/`. No hace commit, ni etiqueta, ni sube nada.

- **Etiqueta `vX.Y.Z`**: el loader pide `app.js` a `…@vX.Y.Z/dist/app.js`; sin etiqueta no lo encuentra. Etiqueta siempre el mismo commit que contiene `dist/`.
- **Retraso de la CDN**: el loader pide el manifiesto de «la última» (`/gh/Simpplay/Draftsage/dist/manifest.json`); jsDelivr puede tardar hasta ~12 h en resolverla. Para acelerarlo: abre `https://purge.jsdelivr.net/gh/Simpplay/Draftsage/dist/manifest.json`. Aunque la CDN sirva un manifiesto antiguo, es inofensivo: el loader nunca baja una versión menor que la que ya tiene.
- **Comprobar**: en el cliente, `draftsage.build()` → `{ version, source: 'remote', … }` tras reiniciar. Si `source` es `packaged`, mira los logs `[draftsage]` (el motivo del descarte sale como aviso).

## Qué va en la actualización y qué no

| Se actualiza solo (`dist/app.js`) | Exige reinstalar (loader) |
|---|---|
| `bootstrap.js` y todo lo que importa: dominio, casos de uso, infraestructura de Coachless/Lolalytics/iTero/LCU, interfaz, textos | `index.js`, `application/{loader,updater,update-prefs}.js`, `infrastructure/update/*` (incluidas las claves públicas), `domain/update.js`, `shared/{version,logger}.js` |

Si un cambio necesita tocar el loader: súbelo en un plugin nuevo para reinstalar, y si el nuevo `app.js` solo funciona con ese loader, sube `LOADER_API` en `config.js`. Los manifiestos con `minLoader` mayor se ignoran en los loaders antiguos y el usuario ve el aviso «exige reinstalar».

## Volver atrás y versiones malas

- **No se puede bajar de versión**: el loader rechaza versiones menores que la guardada. Para retirar una versión mala, publica una **mayor** (p. ej. 1.0.3 con el contenido de 1.0.1).
- Un usuario con una versión mala puede ir a Ajustes → Más → Actualizaciones → *Solo incluida* y reiniciar el cliente.
- Si una versión descargada falla al cargar o al arrancar, el loader la marca como defectuosa y vuelve al código incluido sin intervención.

## Rotar o perder la clave

- **Rotar** (por sospecha o por higiene): `node dev/tools/keygen.mjs --out <otra ruta>` **añade** una clave pública. Publica una versión del plugin con ambas claves, espera a que los usuarios reinstalen, firma con la nueva y quita la antigua de `config.js` en un plugin posterior.
- **Clave privada filtrada**: quien la tenga puede ejecutar código en los clientes de los usuarios. Retira la clave de `config.js`, genera otra y publica un plugin nuevo; hasta que los usuarios reinstalen el riesgo sigue. Por eso la privada no sale de tu equipo, no va en CI ni se pega en chats.

## Modelo de amenazas (resumen)

| Amenaza | Resultado |
|---|---|
| Cuenta de GitHub comprometida, o CDN/DNS manipulados | Sin la clave privada no hay firma válida → no se ejecuta nada (el loader registra `manifiesto remoto rechazado` o `paquete remoto rechazado`). |
| Paquete alterado con un manifiesto legítimo | El hash/tamaño firmado no coincide → descartado. |
| Repetir un manifiesto antiguo con firma válida | Anti-rollback: versión menor que la guardada → ignorada. |
| IndexedDB manipulada en el equipo | La versión guardada se re-verifica en cada lectura → se borra y se usa el código incluido. (Quien ya puede escribir en el perfil del cliente puede, de todas formas, modificar el plugin local.) |
| Clave privada robada | **No se mitiga con el código**: rotar la clave y reinstalar (ver arriba). Es el punto único de confianza. |
| Servidor/CDN caído o sin red | Sin efecto: se usa el código incluido; el cliente no se bloquea. |

## Distribución (el .zip)

`node dev/tools/package.mjs [--tag vX.Y.Z] [--out carpeta]` genera `Draftsage-X.Y.Z.zip` (+ `.sha256`) con `git archive` de lo **commiteado**: `draftsage/{index.js, README.md, src/**}` y nada más (sin `dev/`, `docs/`, `dist/`, `.git`, `CLAUDE.md`). Se niega a crearlo si: la etiqueta no es `v<VERSION>`; el loader no tiene claves públicas; `dist/manifest.json` no está firmado por esas claves, no es de esta versión o `dist/app.js` no coincide con su hash; hay cambios sin commitear en lo empaquetado; o hay un `.pem`/`.key` versionado. El workflow lo ejecuta en cada etiqueta; también puedes ejecutarlo a mano para probar. El usuario instala descomprimiendo la carpeta `draftsage` en `<Pengu Loader>/plugins/`.

## Antes de distribuir públicamente

- Excluye `dev/` y `.git` del paquete que instalan los usuarios; `dist/` y `src/` sí van.
- Pengu Loader y Riot tienen políticas sobre plugins y automatización: revisa que un plugin que **se autoactualiza** las cumple (es nuevo respecto a la revisión de «Aplicar») y comunica el comportamiento a los usuarios; el interruptor *Solo incluida* existe para quien no lo quiera.
- Revisa los términos de uso de Coachless/iTero/Lolalytics y el registro en el Developer Portal de Riot (pendiente ya en `docs/HANDOFF.md`).
- Prueba el loader en una versión de Pengu distinta de 1.1.6 y en un cliente recién instalado (sin DataStore ni IndexedDB previos).
