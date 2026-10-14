# BL-05: limpieza de archivos y codigo no utilizado

## Alcance y decisiones

Se eliminaron los siguientes elementos confirmados como obsoletos:

- `Web Ui/build/index.html`: artefacto antiguo sin referencias. El build de Vite y el hosting de Firebase utilizan `dist`. Eliminado en el commit `b43c1001`.
- `server/src/.DS_Store` y `server/src/controllers/.DS_Store`: metadatos de Finder versionados; no son entradas ni dependencias de la aplicacion.
- Bloque CORS/`express.json()` comentado en `server/src/app.ts`: configuracion antigua duplicada; la configuracion activa se conserva.
- Marcadores `NO SE USA` de `TDDCyclesController.ts`: eran incorrectos. Los metodos estan conectados a rutas o usados por el flujo de carga del log; se conservaron.
- Dos instrucciones `console` comentadas en `assignmentController.ts` y `createGroupUseCase.ts`.

## Candidato conservado

`server/src/modules/Users/Application/getUsersByGroupidUseCase.ts` no se invoca desde produccion: el controlador consulta directamente al repositorio. Sin embargo, su prueba unitaria lo importa. Se conserva hasta decidir si se elimina junto con esa prueba o se integra en el flujo de produccion. La ruta de usuarios por grupo permanece activa.

## Verificacion

- `npm run tsc` en `server`: PASS antes de esta limpieza.
- Harness `server` despues de retirar comentarios: FAIL. El harness oculta la salida detallada y la ejecucion directa de Jest no se completo, por lo que no se atribuye el fallo a estos cambios.
- Diagnosticos del editor para los archivos TypeScript editados: sin errores.

Repetir `npm test` en `server` y revisar el motivo del fallo del harness antes de considerar cerrada la validacion de regresiones.
