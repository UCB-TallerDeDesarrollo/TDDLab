# Segmento 3 — Ciclo 4: validación final y pendientes de cierre

Fecha: 14 de octubre de 2026.
Rama: `UCM-Segmento3-CorregirPruebas`.
Punto de partida: `5d94ec06`, integración del ciclo 3.

## Resultado y límites

La corrección supera las pruebas automatizadas del segmento y la suite
completa del frontend. El harness también terminó con PASS en esta ejecución.
Sin embargo, **no se declara una aprobación integral para producción**:
la compilación continúa fallando y la revisión visual no pudo completarse.

No se modificó código de producción en este ciclo. Se añadieron únicamente
una página de QA local y este registro de validación.

## 1. Pruebas focalizadas con cobertura

Se ejecutaron las seis suites de componente, integración, página y adaptador:

```text
Test Suites: 6 passed, 6 total
Tests:       30 passed, 30 total
```

La cobertura se limitó explícitamente a estos tres archivos, no a todo el
proyecto:

| Archivo | Líneas | Ramas |
| --- | --- | --- |
| TDDCycleChart.tsx | 98,18 % | 92,30 % |
| TDDChart.tsx | 95,45 % | 66,66 % |
| TDDChartPage.tsx | 81,81 % | 76,92 % |
| Total de esos tres archivos | 95,45 % | 81,96 % |

Desde `Web Ui`, para repetir:

```powershell
npm.cmd test -- --runTestsByPath test/presentation/tdd-visualization/TDDCycleChart.test.tsx test/presentation/tdd-visualization/TDDCharts.test.tsx test/presentation/tdd-visualization/TDDCharts.integration.test.tsx test/presentation/tdd-visualization/TDDChartPage.test.tsx test/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter.test.ts test/modules/TDDCycles-Visualization/CommitHistoryAdapter.spec.ts --runInBand --collectCoverageFrom=src/presentation/tdd-visualization/components/TDDCycleChart.tsx --collectCoverageFrom=src/presentation/tdd-visualization/components/TDDChart.tsx --collectCoverageFrom=src/presentation/tdd-visualization/pages/TDDChartPage.tsx
```

## 2. Suite completa del frontend

Se ejecutó Jest secuencialmente, con salida visible y sin cobertura para
diagnosticar la suite completa. El proceso terminó normalmente, antes del
límite de seguridad de tres minutos:

```text
Test Suites: 65 passed, 65 total
Tests:       306 passed, 306 total
Time:        124.125 s
```

Comando equivalente desde `Web Ui`:

```powershell
npm.cmd test -- --runInBand --coverage=false
```

También se ejecutó `node harness/check.mjs web` desde la raíz, con un límite
de tres minutos. En esta ocasión terminó y mostró `Tests: PASS`. A diferencia
de los ciclos anteriores, no fue necesario detenerlo por tiempo excedido.
No se cambió el harness ni la configuración de Jest para obtener ese resultado.

## 3. Compilación de producción: pendiente

`npm.cmd run build` terminó con código 1 durante TypeScript, antes de Vite.
Se reprodujeron los diagnósticos observados en el ciclo 2:

- Declaraciones no encontradas de `firebase/app` y `firebase/auth`.
- Props incompatibles en `src/presentation/assignments/components/DatePicker.tsx`.
- Parámetro `authUser` implícitamente `any` en el servicio de invitaciones.

Los diagnósticos señalan archivos fuera del código de producción modificado
en el Segmento 3. No se ejecutó una comparación completa de compilación con
otra rama para atribuir su origen a un commit específico.

`npm ls firebase @mui/x-date-pickers --depth=0` mostró `firebase@10.14.1` y
`@mui/x-date-pickers@5.0.20`, coincidentes con las versiones declaradas. Esto
no demuestra que todos sus archivos o declaraciones estén completos.

No se instalaron dependencias, añadieron declaraciones ficticias ni
desactivaron comprobaciones de tipos. Resolver estos problemas requiere
una tarea separada o autorización para ampliar el alcance.

## 4. Página de QA local

Archivos añadidos:

- `Web Ui/test/manual/tdd-visualization.html`.
- `Web Ui/test/manual/tdd-visualization.tsx`.

La página reutiliza `TDDCharts`, sus componentes reales y Chart.js, junto con
las muestras de pruebas existentes. Permite elegir entre solo commits de
`ventasIS` (muestra reducida), log vacío, log no disponible y ejecuciones
exitosas/fallidas.

No altera la ruta protegida `/graph`, la sesión, el backend ni los adaptadores.
No representa resultados actuales de GitHub y no sustituye una prueba
integral contra staging. No se añadió una ruta de QA a `App.tsx` ni una
entrada adicional a la compilación de producción.

Se inició temporalmente Vite en `127.0.0.1:5173`. El HTML y el módulo TSX
respondieron HTTP 200 y Vite transformó el módulo. Esta comprobación acredita
que se sirven los archivos, **no que la página se haya dibujado correctamente**.

### Limitación de la revisión visual

El control del navegador integrado falló con `Transport closed` y el
reintento produjo el mismo error. La alternativa de control de interfaz
de Windows se detuvo porque no pudo determinar con suficiente certeza la
URL actual de Chrome para aplicar sus controles de seguridad.

Se detuvieron las acciones de interfaz. No se eludió el bloqueo y no se
registran capturas ni escenarios visuales como aprobados. Tampoco se
automatizó el inicio de sesión.

### Cómo repetir la revisión local

Desde `Web Ui`:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Abrir:

```text
http://127.0.0.1:5173/test/manual/tdd-visualization.html
```

Lista de comprobación **pendiente de revisión humana**:

- [ ] Solo commits: aparecen métricas por commit y el aviso explicativo,
  sin ejes vacíos ni puntos de ejecuciones inexistentes.
- [ ] Log vacío/no disponible: aparece el aviso correspondiente sin afirmar
  que se ejecutaron o dejaron de ejecutar pruebas.
- [ ] Desde el selector se puede ir de Dashboard a Ciclo y volver.
- [ ] Con ejecuciones aparecen los símbolos de éxito/fallo, leyenda y tooltip.
- [ ] Al cambiar de escenario no quedan símbolos de la muestra anterior.
- [ ] Al recargar se conserva una selección válida de la métrica.

La revisión se limita a Dashboard, Ciclo y las métricas por commit. Las
acciones de Lista de commits y los diálogos que consultan APIs quedan fuera
de esta prueba local.

### Comprobación integral con sesión real

Además de la página de QA, falta probar la aplicación normal con el backend
configurado y una sesión válida iniciada por el usuario:

```text
http://localhost:5173/graph?repoOwner=shalure10lure&repoName=ventasIS&submissionId=583
```

Comprobar el aviso con `ventasIS` y contrastar con una entrega autorizada
cuyo `script/tdd_log.json` contenga registros reales de ejecución. No basta
con que tenga valores de `test_count` en `commit-history.json`.

No publicar comentarios ni modificar entregas para realizar estas comprobaciones.

## 5. Arquitectura y conclusión

La corrección de los ciclos 2 y 3 pertenece a Presentation: informa sobre
los registros disponibles y conserva la navegación. No reconstruye
ejecuciones inexistentes a partir de commits ni modifica reglas de dominio,
casos de uso, puertos o adaptadores.

La página de QA pertenece al soporte de pruebas y reutiliza las muestras
locales, sin introducir lógica de prueba en la aplicación de producción.

Estado final: automatización del segmento y suite general aprobadas;
compilación y aceptación visual/integral pendientes. Este documento no
equivale a afirmar que el proyecto está listo para desplegarse.

## Commit sugerido

```text
test(segmento3): documentar validación final y añadir página de QA local
```

No se realizaron commits ni push.
