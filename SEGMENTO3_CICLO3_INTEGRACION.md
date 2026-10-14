# Segmento 3 — Ciclo 3: integrar el estado vacío en las vistas

## Punto de partida y objetivo

Rama: `UCM-Segmento3-CorregirPruebas`.
Commit anterior: `e2bd3c2b` (ciclo 2).

El componente `TDDCycleChart` ya explica cuándo no existen ejecuciones. Sin
embargo, el selector ocultaba las opciones Dashboard y Ciclo cuando el log
era vacío o nulo. La vista podía estar guardada en `localStorage` y seguir
renderizada, pero el selector quedaba sin una opción válida que mostrar.
Además, la página mostraba un error que sugería que el usuario no había
ejecutado pruebas: un log vacío no permite llegar a esa conclusión.

El objetivo de este ciclo es integrar la explicación existente sin ocultar
las métricas por commit ni fabricar ejecuciones.

## Orden seguido con TDD

1. Se revisaron la rama, las instrucciones del repositorio y los componentes
   de presentación relacionados.
2. Se escribieron pruebas de integración antes de modificar producción.
3. La primera ejecución se detuvo durante la carga de dependencias. Se aisló
   la ruta Lista de commits, que no se recorre en estos casos, además del
   dibujo de Chart.js que requiere canvas. No se simularon el selector,
   `TDDLineCharts`, `TDDBoard` ni `TDDCycleChart` en la suite de integración.
4. **RED:** las dos suites nuevas/modificadas dieron 7 pruebas fallidas y
   10 correctas. Fallaron las expectativas de opciones visibles, selección
   persistida y ausencia del mensaje ambiguo de la página.
5. Se aplicó la corrección mínima y se simplificó el paso de registros.
6. **GREEN:** las seis suites focalizadas dieron 30 pruebas correctas y
   ninguna fallida, con código de salida 0.

## Cambios en producción

### 1. Selector (`TDDChart.tsx`)

Se eliminó el filtro basado en `tddLogs.length` que ocultaba Dashboard y
Ciclo de ejecución de pruebas. La ausencia de registros no elimina las
vistas: el componente del ciclo es responsable de explicar esa ausencia.

Se mantiene el filtro existente por tipo de gráficas. No se modifica el
comportamiento de las opciones adicionales.

Esto también permite mostrar correctamente una selección del ciclo guardada
en `localStorage`, aunque el siguiente repositorio no tenga ejecuciones.

### 2. Página (`TDDChartPage.tsx`)

Se retiró el mensaje que asociaba un log vacío con una versión anterior del
repositorio o con no haber ejecutado pruebas. El dashboard y la vista del
ciclo ya muestran el aviso específico del ciclo 2.

La condición existente para mostrar el error cuando no hay información de
commits se conserva. No se cambia la carga de datos ni el tratamiento de
errores de red.

### 3. Vista individual (`TDDLineChart.tsx`)

Se sustituyó el mapeo que copiaba cada campo del log por:

```tsx
return <TDDCycleChart data={tddLogs ?? []} />;
```

Los tipos existentes son compatibles con las props del componente. Se
entregan los registros sin modificarlos y se normaliza `null` a un array
vacío. También se retiró el `console.log` de estos registros.

`TDDBoard` ya reutilizaba `TDDCycleChart`; no fue necesario modificarlo.
Ambas vistas conservan así la decisión de dibujar ejecuciones o mostrar el
aviso en un solo componente, sin duplicar reglas ni textos.

## Arquitectura hexagonal

Los tres archivos de producción pertenecen a **Presentation**. Sus
responsabilidades son mostrar las vistas, permitir navegar entre ellas y
presentar los datos recibidos.

No se modificaron Domain, Application, puertos ni adaptadores. Tampoco el
backend, dependencias ni los archivos de `ventasIS`. El puerto continúa
entregando los mismos registros y las métricas por commit siguen siendo
una fuente distinta de las ejecuciones de `tdd_log.json`.

## Pruebas añadidas y alcance de los mocks

`TDDCharts.integration.test.tsx` conserva el flujo real:

```text
TDDCharts -> TDDLineCharts -> TDDBoard / TDDCycleChart
```

Solo simula el renderizado externo de `react-chartjs-2` y la ruta de Lista
de commits, ajena a estas pruebas. Los gráficos simulados exponen los datos
recibidos: se comprueba que la cobertura de 91 y los 3 tests por commit se
conservan aunque no haya registros de ejecución.

Los ocho casos cubren:

- Log nulo, vacío y con solo commits: métricas presentes y navegación de
  Dashboard a Ciclo y de regreso.
- Esos mismos tres escenarios con la vista Ciclo guardada en `localStorage`.
- Ejecuciones exitosas y fallidas al cambiar de Dashboard a Ciclo y luego a
  la gráfica de cobertura.
- Actualización de los registros con la vista del ciclo seleccionada, sin
  mantener símbolos de ejecuciones del repositorio anterior.

`TDDChartPage.test.tsx` añade dos casos, para estudiante y administrador,
que conservan la carga real del hook con un puerto simulado. Verifican que
se mantenga el componente de gráficas sin el error ambiguo. Esta suite
mantiene su mock de gráficas; la integración real se verifica en la suite
anterior.

No se consulta GitHub ni se escribe en la base de datos durante estas pruebas.

## Validación focalizada

Desde `Web Ui`:

```powershell
npm.cmd test -- --runTestsByPath test/presentation/tdd-visualization/TDDCycleChart.test.tsx test/presentation/tdd-visualization/TDDCharts.test.tsx test/presentation/tdd-visualization/TDDCharts.integration.test.tsx test/presentation/tdd-visualization/TDDChartPage.test.tsx test/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter.test.ts test/modules/TDDCycles-Visualization/CommitHistoryAdapter.spec.ts --runInBand --coverage=false
```

Resultado:

```text
Test Suites: 6 passed, 6 total
Tests:       30 passed, 30 total
```

La ejecución focalizada no sustituye una validación completa del frontend.

## Verificación general y limitaciones

Se ejecutó `node harness/check.mjs web`, conforme a `AGENTS.md`, mediante
un proceso supervisor con límite de 180 segundos. Se alcanzó ese límite
sin que el harness entregara su resumen. El supervisor detuvo únicamente
esa validación y sus procesos hijos.

El harness usa `npm test` con cobertura y oculta la salida interna de Jest.
Por ello, esta ejecución no permite identificar qué prueba impidió terminar
ni atribuirlo a los cambios de este ciclo. La **suite general no se considera
aprobada**. No se modificaron el harness, las dependencias ni la configuración
de Jest para omitir fallos o forzar un cierre exitoso.

`git diff --check` terminó sin problemas. No se ejecutó una compilación
completa en este ciclo; los errores globales de tipos observados en el
ciclo 2 quedan documentados allí y no se corrigieron como parte de esta
integración.

## Pendiente para el siguiente ciclo

Queda la validación final, incluida la comprobación manual en navegador.
Estas pruebas no acreditan una validación visual de Chart.js ni solucionan
la falta de registros históricos en un repositorio externo.

No se realizaron commits, push ni cambios de dependencias.

## Commit sugerido

```text
fix(segmento3): integrar estado vacío en dashboard y selector TDD
```
