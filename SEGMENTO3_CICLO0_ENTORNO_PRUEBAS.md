# Segmento 3 — Ciclo 0: base de pruebas

## Objetivo

Preparar una base reproducible para investigar la gráfica de ejecución de pruebas
de `shalure10lure/ventasIS`, antes de modificar el comportamiento de TDDLab.

Rama: `UCM-Segmento3-CorregirPruebas`.
Commit inicial: `9d7353db`.

## Diagnóstico que origina el trabajo

- La gráfica obtiene los registros de
  `https://raw.githubusercontent.com/shalure10lure/ventasIS/main/script/tdd_log.json`.
- Durante la investigación, el archivo respondió HTTP 200 y contenía 75 entradas
  de commits, sin entradas de ejecución de pruebas.
- `script/commit-history.json` es otra fuente y sí contiene métricas de pruebas
  por commit. Esto explica que las gráficas superiores tengan información.
- La ausencia de ejecuciones en el log no demuestra que no se ejecutaron pruebas;
  demuestra que esas ejecuciones no están registradas en esta fuente.
- El componente `TDDCycleChart` dibuja ejecuciones cuando encuentra
  `numPassedTests`, y el selector de métricas solo comprueba la longitud del log.
  Un log con commits solamente pasa esa comprobación, pero no produce puntos.

Este ciclo no modifica los scripts del repositorio del estudiante, no reconstruye
ejecuciones desde métricas por commit y no implementa todavía el mensaje de ausencia
de registros. Ese comportamiento se probará primero en el ciclo 1 (RED).

## Muestras locales

Archivo: `Web Ui/test/presentation/tdd-visualization/fixtures/tddLogFixtures.ts`.

- `ventasISCommitOnlyLogs`: muestra reducida de tres registros reales, incluido
  el marcador `HEAD`, sin ejecuciones. Permite reproducir el caso sin consultas
  de red ni depender de cambios futuros en el repositorio externo.
- `mixedTDDLogs`: los datos sintéticos que ya utilizaban las pruebas de la
  gráfica, con una ejecución exitosa y una fallida. Conserva la cobertura de
  símbolos, leyenda y tooltip.

Las muestras están tipadas con el contrato existente `TDDLogEntry` / `CommitLog`.
No se agregan datos a los archivos de producción.

## Aislamiento del entorno

- Las pruebas de `TDDChartPage` sustituyen el repositorio de comentarios por un
  mock que devuelve una lista vacía, evitando peticiones HTTP al backend.
- Esa misma suite sustituye el componente de gráficas: comprueba la página,
  sus estados y títulos, mientras otras suites verifican la visualización.
- Las pruebas de `TDDCharts` sustituyen el componente de gráficas de línea para
  comprobar el selector sin cargar Chart.js ni depender del canvas de JSDOM.
- Se mantienen los mocks existentes de Axios en las suites del adaptador.

## Ejecutar la validación focalizada

Desde PowerShell:

```powershell
cd "D:\TORREZ\Escritorio\TallerTDD\TDDLab\Web Ui"
npm.cmd test -- --runTestsByPath test/presentation/tdd-visualization/TDDCycleChart.test.tsx test/presentation/tdd-visualization/TDDCharts.test.tsx test/presentation/tdd-visualization/TDDChartPage.test.tsx test/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter.test.ts test/modules/TDDCycles-Visualization/CommitHistoryAdapter.spec.ts --runInBand --coverage=false
```

Este comando usa Jest instalado en el proyecto. `--runInBand` ejecuta las suites
en un solo proceso y `--coverage=false` evita calcular cobertura global durante
este ciclo. No se cambia la configuración de CI ni las reglas de SonarCloud.

La validación focalizada no necesita levantar servicios ni conectarse a staging.

## Alcance de la validación

Resultado tras preparar las muestras y aislar las suites:

```text
Test Suites: 5 passed, 5 total
Tests:       16 passed, 16 total
```

Las cinco suites cubren los símbolos y el tooltip de ejecución, el componente
selector, la página con estados de carga/error y el adaptador que obtiene los
logs y las métricas. Su resultado sirve como línea base, no como demostración
de que el caso sin ejecuciones ya está corregido.

## Próximo ciclo: RED

Usar `ventasISCommitOnlyLogs` para escribir una prueba que espere una explicación
visible de que faltan registros de ejecución, sin inventar puntos exitosos o
fallidos. Con el comportamiento actual esa prueba debe fallar por falta del mensaje.
Luego se implementará la corrección mínima en el ciclo GREEN.

Commit sugerido para este ciclo:

```text
test(segmento3): preparar base de pruebas y muestras de logs TDD
```
