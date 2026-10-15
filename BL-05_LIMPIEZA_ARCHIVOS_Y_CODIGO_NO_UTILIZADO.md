# BL-05: eliminacion de archivos y codigo no utilizados

## Objetivo

Identificar archivos y fragmentos sin uso, contrastarlos con imports, rutas, entradas, configuracion y pruebas, eliminar solo los casos confirmados y registrar las verificaciones. Los usos inciertos se conservan como candidatos pendientes; esta documentacion no afirma que se haya completado una auditoria automatica de todo el repositorio.

## Etapa 1: Web Ui

Se revisaron 280 archivos versionados bajo `Web Ui/src`, junto con pruebas, rutas, configuracion, HTML de entrada y assets publicos. La busqueda de nombres no es una prueba formal de alcanzabilidad, por lo que los elementos sin referencias se clasifican como candidatos y no se eliminaron en bloque.

### Eliminado

- `Web Ui/build/index.html`: unico archivo en ese directorio, sin referencias en el codigo. Vite genera `dist` y Firebase publica `dist`; `build` no participa en el build ni en el despliegue actual. Eliminado en `b43c1001`.

### Eliminados tras confirmar referencias

- Componentes sin consumidores: `src/app/navigation/components/TDDLabLogo.tsx`, `src/presentation/ai-assistant/components/AIResultSection.tsx`, `src/presentation/users/components/UsersDivider.tsx`, `src/presentation/users/components/dialogs/RemoveUserDialog.tsx` y `src/presentation/users/components/dialogs/UsersFeedbackDialog.tsx`. `UserPage` conserva sus usos directos de `ConfirmationDialog` y `ValidationDialog`.
- Adaptadores/reexports sin consumidores: `src/presentation/my-practices/hooks/usePracticeDetailData.ts`, `src/presentation/my-practices/components/detail/PracticeOverviewCard.tsx` y `src/presentation/my-practices/components/MyPracticesListLayout.tsx`.
- `src/presentation/assignments/components/AssignmentsListLayout.tsx` y su exportacion desde `components/index.ts`.
- `src/modules/TDDCycles-Visualization/application/GetTDDLogUseCase.ts`, que exportaba `GetTDDLogsUseCase` sin consumidores; el servicio activo usa `GetTDDLogs` desde `GetTDDLogs.ts`.
- Utilidades sin referencias: `src/utils/adaptarDatos.ts` y `src/utils/localStorageService.ts`.
- `src/presentation/users/types/users.types.ts`, archivo vacio.
- Assets sin referencias detectadas en codigo, pruebas, HTML o entre assets: `public/config.png`, `public/landing/landing.jpeg` y `public/landing/landing.svg`.

### Elementos conservados

- `public/vite.svg` se conserva porque `index.html` lo referencia como favicon.
- `src/vite-env.d.ts` se conserva: las declaraciones ambientales de Vite no requieren imports directos.
- Los componentes reales de grupo y practica, `FeatureItemsLayout` y la implementacion original `usePracticeDetail`/`PracticeOverviewCard` tienen usos activos.

## Etapa 2: server/src

Se revisaron los puntos de entrada, rutas, configuracion, pruebas y 124 archivos TypeScript/TSX. El typecheck tiene `noUnusedLocals` y `noUnusedParameters` habilitados. La busqueda no encontro carga dinamica basada en archivos ni modulos obvios sin menciones; no se genero un grafo AST exhaustivo.

### Eliminado o limpiado

- `server/src/.DS_Store` y `server/src/controllers/.DS_Store`: metadatos de Finder versionados, sin funcion de runtime.
- Bloque comentado CORS/`express.json()` de `server/src/app.ts`: configuracion antigua duplicada; se mantiene el middleware activo.
- Dos instrucciones `console` comentadas en `assignmentController.ts` y `createGroupUseCase.ts`.
- Marcadores `NO SE USA` del `TDDCyclesController`: eran falsos. No se eliminaron los metodos; estan conectados a rutas o forman parte del flujo de carga de TDD log.

### Candidato conservado

`server/src/modules/Users/Application/getUsersByGroupidUseCase.ts` tiene una prueba unitaria, pero no se invoca desde el endpoint de produccion: la ruta llama al controlador y este consulta directamente `UserRepository`. Se conserva hasta decidir si se elimina junto con su prueba o se integra en el flujo del servidor. El caso de uso homonimo del frontend es distinto y si tiene usos activos.

En la revision del flujo tambien se observo que el endpoint permite los roles `admin`, `teacher` y `student` sin comprobar que el grupo solicitado pertenezca al usuario autenticado. Esta observacion de autorizacion no se cambio como parte de BL-05.

## Etapa 3: pruebas del servidor

La primera ejecucion completa encontro 18 tests fallidos y 680 aprobados. Las siete suites fallidas estaban bajo `server/build/test`; las versiones fuente bajo `server/test` pasaban.

La causa fue que `npm run tsc` emite tambien pruebas compiladas a `build/test`, mientras Jest aceptaba archivos `.js` y no excluia `build`. Las copias compiladas no recibian el transform de `ts-jest` que prepara los mocks, por lo que fallaban llamadas como `mockReturnValue` y `mockResolvedValueOnce`. La ejecucion con `build` excluido paso 56 suites y 349 tests.

En `server/jest.config.js` se excluyo `build` de `testPathIgnorePatterns` y `modulePathIgnorePatterns`. La ejecucion posterior de `npm run test -- --runInBand` paso **56/56 suites y 349/349 tests**, sin mocks duplicados. Permanecen avisos `TS151002` de `ts-jest` acerca de `isolatedModules`; no causaron fallos.

## Etapa 4: validaciones de Web Ui

- `npm run build` despues de eliminar los candidatos fuente y assets de esta etapa: PASS. Vite mostro el aviso existente de bundle mayor a 500 kB.
- Tests de Web Ui: la ejecucion solicitada despues de esta etapa fue omitida por la terminal; la validacion de tests para este conjunto de eliminaciones queda pendiente. El PASS anterior del harness fue antes de estas eliminaciones.
- `npm run lint`: FAIL con 95 errores y 6 warnings preexistentes distribuidos en archivos ajenos a esa eliminacion. No se corrigieron como parte de BL-05.

## Commits relacionados

- `b43c1001` - `chore: remove unused web build artifact`.
- `9eda562d` - `chore: clean unused server artifacts`.
- `84822bef` - `test: ignore compiled server tests`.

## Estado de la HU

- Candidatos confirmados revisados antes de eliminar: completado para los archivos retirados.
- Eliminar solo codigo confirmado: completado para los candidatos enumerados en esta documentacion.
- Verificar regresiones: server tests y typecheck pasan. El lint de Web Ui permanece fallido por issues preexistentes.
- Documentar cambios y verificaciones: completado en este archivo.

La auditoria se baso en referencias estaticas, configuracion y pruebas; no constituye una prueba formal de alcanzabilidad para cada ruta dinamica posible. Repetir tests, build y lint de Web Ui despues de esta etapa antes de cerrar la HU.

## Resumen breve para Gamma

En BL-05 se auditaron `server/src` y Web Ui y se eliminaron artefactos, componentes, utilidades, reexports y assets sin referencias confirmadas, conservando los elementos activos o dudosos. Se corrigio Jest para ignorar pruebas compiladas duplicadas: el servidor queda con 56 suites y 349 tests aprobados. El build de Web Ui pasa; sus tests deben repetirse despues de esta ultima limpieza y el lint aun reporta errores preexistentes.
