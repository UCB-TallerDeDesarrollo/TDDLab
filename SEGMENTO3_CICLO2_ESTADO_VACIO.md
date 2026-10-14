# Segmento 3 — Ciclo 2: explicar la ausencia de ejecuciones (GREEN)

## Objetivo

Hacer pasar la prueba del ciclo 1 sin crear ejecuciones que no existen en el
log. La rama de trabajo es `UCM-Segmento3-CorregirPruebas` y este ciclo parte
del merge `968a1003`, que integra los cambios de `UCM-Sprint2`.

El problema observado en `ventasIS` no demuestra que nunca se ejecutaron
pruebas: el archivo consultado para esta gráfica contiene commits, pero no
registros de ejecución. Las métricas por commit son una fuente distinta.

## Orden del trabajo (TDD)

1. Se revisó la rama y se confirmó que no había cambios pendientes.
2. Se leyeron `AGENTS.md`, `harness/architecture.md` y los componentes cercanos.
3. Se conservaron las expectativas del ciclo 1 y se añadieron comprobaciones
   para el log vacío, la ausencia de ejes vacíos y la actualización del
   componente cuando cambian sus datos.
4. Antes de cambiar producción, la suite del componente dio **3 pruebas
   fallidas y 4 correctas**. Los fallos correspondían al aviso todavía ausente.
5. Se implementó el estado vacío en `TDDCycleChart.tsx`.
6. Se repitieron las cinco suites focalizadas: **5 suites y 20 pruebas
   correctas**, con código de salida 0.

## Cambio en producción

El componente ya agrupa únicamente registros que contienen `numPassedTests`.
Cuando ese procesamiento no produce ejecuciones, ahora devuelve un aviso en
lugar del SVG vacío, su leyenda y su resumen.

- Conserva el título `Ciclo de Ejecución de Pruebas TDD`.
- Muestra `No hay ejecuciones de pruebas registradas`.
- Si hay commits, explica que existen commits, pero no registros de ejecución.
- Si el log está vacío, indica que no contiene registros para esta gráfica.
- Señala `script/tdd_log.json` como el archivo donde registrar y publicar los
  resultados de ejecución.
- Utiliza `role="status"` para que el aviso sea accesible.

La condición se evalúa después de los hooks de React. Así, cambiar los datos
no altera el orden de ejecución de los hooks.

Cuando sí hay ejecuciones se conserva el gráfico existente, con sus símbolos,
leyenda y tooltip. La comprobación `numPassedTests !== undefined` sigue
aceptando **cero pruebas exitosas**: una ejecución con todas las pruebas
fallidas no se confunde con ausencia de ejecuciones.

## Arquitectura hexagonal

El cambio corresponde a **Presentation**, porque decide cómo explicar al
usuario los datos recibidos. No cambia reglas del dominio, casos de uso,
puertos, adaptadores de GitHub, backend ni archivos del repositorio analizado.

No se transforma una métrica por commit en una supuesta ejecución. Se respeta
la información entregada por el flujo existente.

## Pruebas cubiertas

1. Log de `ventasIS` con solo commits: aviso explicativo, sin puntos ni SVG.
2. Log vacío: aviso sin afirmar que existen commits.
3. Cambio de datos: el aviso desaparece al llegar ejecuciones y reaparece si
   los registros se vacían.
4. Ejecución con cero pruebas exitosas: símbolo de ejecución con fallos.
5. Símbolos, leyenda y tooltip de ejecuciones existentes: sin regresiones.
6. Suites existentes de página, selector y adaptador: continúan pasando.

Para repetir la validación focalizada desde `Web Ui`:

```powershell
npm.cmd test -- --runTestsByPath test/presentation/tdd-visualization/TDDCycleChart.test.tsx test/presentation/tdd-visualization/TDDCharts.test.tsx test/presentation/tdd-visualization/TDDChartPage.test.tsx test/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter.test.ts test/modules/TDDCycles-Visualization/CommitHistoryAdapter.spec.ts --runInBand --coverage=false
```

## Alcance pendiente

Se ejecutó `node harness/check.mjs web`, como indica `AGENTS.md`. Tras más de
seis minutos no había terminado ni mostrado resultados. El harness ejecuta
`npm test` con cobertura y oculta su salida mediante `stdio: "ignore"`.
Se detuvo únicamente el proceso de esa validación y sus hijos; por tanto,
la **suite general no queda validada** y no se atribuye su demora a esta
corrección. No se cambiaron el harness ni la configuración de Jest para
forzar un resultado favorable.

También se ejecutó `node ./node_modules/typescript/bin/tsc --noEmit` desde
`Web Ui`. Terminó con código 1 por declaraciones de `firebase/app` y
`firebase/auth` no encontradas, un parámetro implícitamente `any` en el
servicio de invitaciones y props incompatibles de `DatePicker`. Los
diagnósticos no señalan los archivos modificados en este ciclo. No se
instalaron dependencias ni se corrigieron estos problemas fuera del alcance;
la comprobación global de tipos no se considera aprobada.

Este ciclo verifica el componente mediante pruebas automatizadas; no acredita
una prueba manual en navegador ni la validación completa de la funcionalidad.
La integración con el selector, dashboard y mensajes generales de la página
se revisará en el siguiente ciclo. En particular, el selector todavía filtra
opciones según la longitud del log, no según su contenido.

No se realizaron commits, push ni cambios de dependencias.

## Commit sugerido

```text
fix(segmento3): explicar ausencia de ejecuciones en la gráfica TDD
```
