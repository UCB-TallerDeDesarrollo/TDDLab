# Segmento 3 — Ciclo 1: reproducir la ausencia de ejecuciones (RED)

## Punto de partida

Rama: `UCM-Segmento3-CorregirPruebas`.
Commit del ciclo 0: `d2e3e8be`.

La muestra `ventasISCommitOnlyLogs` reproduce el archivo que contiene registros
de commits, pero no de ejecuciones. El componente actualmente dibuja ejes vacíos
sin explicar la ausencia de datos.

## Comportamiento requerido

Cuando el log contiene solo commits, la gráfica debe:

- No dibujar símbolos de ejecuciones inexistentes.
- Mostrar el mensaje `No hay ejecuciones de pruebas registradas`.
- Explicar que el repositorio contiene registros de commits, pero no registros
  de ejecución.
- Indicar `script/tdd_log.json` como el archivo donde deben publicarse las
  ejecuciones para visualizarlas.

Esto no afirma que el estudiante nunca ejecutó pruebas; explica qué registros
están disponibles para esta gráfica.

## Cambios de este ciclo

Se agregaron dos casos en
`Web Ui/test/presentation/tdd-visualization/TDDCycleChart.test.tsx`:

1. **Caso RED:** renderizar la muestra de `ventasIS` y esperar la explicación.
   Falla porque el mensaje todavía no existe.
2. **Regresión:** renderizar una ejecución con `numPassedTests: 0`, tres pruebas
   fallidas y `success: false`. Debe aparecer el símbolo de ejecución con fallos,
   sin el mensaje de ausencia de registros. Este caso pasa con el código actual
   y protege contra una futura comprobación incorrecta basada en valores truthy.

No se modificó código de producción ni se omitió la prueba fallida.

## Validación

Se ejecutaron las mismas cinco suites focalizadas del ciclo 0:

```text
Test Suites: 1 failed, 4 passed, 5 total
Tests:       1 failed, 17 passed, 18 total
```

Fallo observado:

```text
Unable to find an element with the text: No hay ejecuciones de pruebas registradas.
```

Para ejecutar solo la suite modificada:

```powershell
cd "D:\TORREZ\Escritorio\TallerTDD\TDDLab\Web Ui"
npm.cmd test -- --runTestsByPath test/presentation/tdd-visualization/TDDCycleChart.test.tsx --runInBand --coverage=false
```

El comando devuelve un código de salida distinto de cero: es el fallo esperado
de esta etapa de TDD. El ciclo 2 implementará el comportamiento requerido hasta
que esta prueba y las existentes pasen (GREEN).

## Commit sugerido

```text
test(segmento3): reproducir ausencia de ejecuciones en logs de ventasIS
```
