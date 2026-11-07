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

```
node dev/tools/release.mjs 1.0.1            # añade --require-tests para bloquear si fallan las pruebas
git add -A
git commit -m "release v1.0.1"
git tag v1.0.1
git push origin main --tags
```

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

## Antes de distribuir públicamente

- Excluye `dev/` y `.git` del paquete que instalan los usuarios; `dist/` y `src/` sí van.
- Pengu Loader y Riot tienen políticas sobre plugins y automatización: revisa que un plugin que **se autoactualiza** las cumple (es nuevo respecto a la revisión de «Aplicar») y comunica el comportamiento a los usuarios; el interruptor *Solo incluida* existe para quien no lo quiera.
- Revisa los términos de uso de Coachless/iTero/Lolalytics y el registro en el Developer Portal de Riot (pendiente ya en `docs/HANDOFF.md`).
- Prueba el loader en una versión de Pengu distinta de 1.1.6 y en un cliente recién instalado (sin DataStore ni IndexedDB previos).
