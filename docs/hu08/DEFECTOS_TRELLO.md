# Defectos preparados para Trello

Publicación diferida por decisión del usuario. Estas fichas no son tarjetas ya creadas. Todas las correcciones se encuentran en el árbol de trabajo de esta rama; el cierre global necesita enlazar las tarjetas reales después de publicarlas.

## D01 La vista sigue leyendo los archivos remotos después de registrar en la base

**Prioridad:** bloqueante. **Estado local:** corregido.

**Reproducir:** registrar resultados en PostgreSQL y abrir la vista; `commits-history`, `commit-cycles` y `test-log` obtenían sus datos de GitHub. Los datos registrados no eran la fuente de la vista.

**Corrección:** contrato `ITDDResultsRepository`, adaptadores de archivo, falso y PostgreSQL, y selección central en `createTDDCyclesDependencies`. Los casos de uso conservan su lógica; se inyecta el repositorio elegido. Los tres endpoints leen ese repositorio.

**Verificación:** `migration.integration.test.ts`, `migration.cy.js`, capturas de los tres casos y muestras reales. **Cierre en Trello:** añadir enlaces a estas evidencias.

## D02 Consultar jobs depende de una tabla ajena al registro

**Prioridad:** bloqueante. **Estado local:** corregido.

**Reproducir:** aplicar el esquema mínimo de jobs, registrar por POST y consultar por GET. `repositoryExists` consultaba `repository`; la consulta fallaba aunque `jobstable` contuviera el dato.

**Corrección:** consultar la identidad en `jobstable` y desactivar la importación de Actions para la consulta de registros explícitos mediante la inyección. Normalizar IDs numéricos y campos opcionales en la respuesta.

**Verificación:** escritura, lectura y comparación con el falso en PostgreSQL real; prueba de registro concurrente y de conflicto.

## D03 Se descarta la rama enviada al registrar

**Prioridad:** alta. **Estado local:** corregido.

**Reproducir:** enviar `branch: feature/hu08` por POST jobs y consultar el resultado. El caso de uso no pasaba ese campo al repositorio.

**Corrección:** validar y conservar `branch`; el falso y la BD actualizan la rama ante duplicado compatible sin duplicar la identidad.

**Verificación:** `registrationBranch.test.ts` y registro real con rama en `migration.integration.test.ts`.

## D04 El falso devuelve datos de otros repositorios

**Prioridad:** alta. **Estado local:** corregido.

**Reproducir:** registrar el mismo SHA para dos propietarios o repositorios y consultar uno. El falso devolvía todas sus filas, y sus consultas de existencia ignoraban la identidad solicitada.

**Corrección:** filtrar `getJobs`, `jobExists` y `repositoryExists` por propietario y repositorio; actualizar expectativas que codificaban el comportamiento incorrecto.

**Verificación:** pruebas de aislamiento del falso, rutas de registro y `registrationBranch.test.ts`.

## D05 Cero de cobertura y ausencia de tests se muestran incorrectamente

**Prioridad:** alta. **Estado local:** corregido.

**Reproducir:** visualizar cobertura 0 o un commit con cero tests. La cobertura figuraba como ausente y el commit sin tests aparecía como fallido.

**Corrección:** distinguir cero de un valor ausente y mostrar `Resultado: Sin tests`, conservando la información de las tarjetas.

**Verificación:** `MigrationBlocks.integration.test.tsx`, fixture con 0 y capturas de fallidos y sin tests.

## D06 El gráfico modifica los datos originales de commits grandes

**Prioridad:** alta. **Estado local:** corregido.

**Reproducir:** pasar un commit con `stats.total > 100` a `TDDCharts`. El componente escribía 50 dentro del objeto recibido.

**Corrección:** crear una copia para la escala de la gráfica y conservar los datos originales de la lista.

**Verificación:** objeto congelado de 200 modificaciones en la prueba de regresión; muestras reales de 6384 y 29187 modificaciones comparadas en los bloques.

## D07 La lista de bloques omite la rama seleccionada

**Prioridad:** alta. **Estado local:** corregido.

**Reproducir:** seleccionar una rama distinta de `main` y abrir Lista de Commits. `TDDList` volvía a consultar sin pasar la rama.

**Corrección:** leer `branch` de la URL, pasarla al caso de uso y recargar al cambiarla.

**Verificación:** prueba de regresión con `feature/hu08` y aislamiento de ramas en los tres adaptadores.

## D08 La prueba de caída de la base puede usar el entorno local del desarrollador

**Prioridad:** media. **Estado local:** corregido.

**Reproducir:** ejecutar la suite con `TDDLAB_DATABASE_URL` configurada. La prueba sobrescribía solo `DATABASE_URL`, que tiene menor prioridad, y podía agotar su tiempo.

**Corrección:** sobrescribir y restaurar también `TDDLAB_DATABASE_URL`; usar un puerto local sin servicio, limitar el tiempo de conexión y aislar el router de IA ajeno a la prueba.

**Verificación:** suite de registro en la aplicación y `databaseUnavailable.test.ts`, que comprueba 500 controlado y que el servidor sigue atendiendo.

## D09 El reporte no podía incluirse normalmente en Git

**Prioridad:** media. **Estado local:** corregido.

**Reproducir:** crear un reporte en `docs/`; la regla global ignoraba la carpeta completa.

**Corrección:** permitir solo `docs/hu08/` y mantener excluidos los demás documentos locales y el entorno temporal de QA.

**Verificación:** `git status --short` y revisión de archivos entregables.

## D10 La página de desarrollo falla al inicializar Material UI

**Prioridad:** bloqueante para la prueba visual local. **Estado local:** corregido.

**Reproducir:** iniciar Vite y abrir la página de QA; se producía `createTheme_default is not a function` antes de mostrar los bloques. Reiniciar con `--force` por sí solo no resolvió la ejecución.

**Corrección:** usar importaciones consistentes desde el paquete de Material UI en `TDDChart` y declarar las entradas de la aplicación y QA y sus dependencias en la preoptimización de Vite.

**Verificación:** ocho escenarios finales de Cypress aprobados, compilación frontend y repetición de 39 tests de visualización en nueve suites.

## Incidencias del entorno de ejecución

La compilación inicial de Vite fue bloqueada por `spawn EPERM` en el sandbox; se repitió con permisos y compiló. La primera ejecución del emisor de QA heredó opciones de Node de Cypress; se eliminan para iniciar Jest de forma independiente. El renderizador DOCX estándar no dispone de LibreOffice en este equipo; la revisión del documento se hace con exportación de Word y páginas PNG de Poppler. Estas incidencias no se presentan como defectos funcionales pendientes de la migración.

## Observaciones de las fuentes

Fizzbuzz y TennisPlay no tienen `script/tdd_log.json` en los SHA consultados. Sus pruebas cubren el historial real y una lista de logs vacía; no acreditan un log inexistente. Los SHA y hashes de descarga están en `evidence/references/reference-check.json`.
