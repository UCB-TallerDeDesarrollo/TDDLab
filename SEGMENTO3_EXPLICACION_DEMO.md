# Segmento 3 — Explicación para el demo

## 1. ¿Cuál era la tarea?

Investigar por qué TDDLab no mostraba información en la sección **Ciclo de
Ejecución de Pruebas TDD** al analizar el repositorio `shalure10lure/ventasIS`,
y corregir el comportamiento si correspondía.

Al principio, las métricas superiores mostraban datos, pero la gráfica del
ciclo presentaba únicamente ejes vacíos. Esto daba la impresión de que la
aplicación había fallado o perdido las ejecuciones.

La pregunta inicial fue: **¿la gráfica no dibuja los datos o no existen los
registros que necesita para dibujarlos?**

## 2. ¿Qué descubrimos?

### Las gráficas no utilizan exactamente la misma información

| Información | Fuente | Qué permite mostrar |
| --- | --- | --- |
| Métricas por commit | `script/commit-history.json`, procesado por el backend | Número de tests, cobertura y cambios de código por commit. |
| Registros de ejecución | `script/tdd_log.json`, consultado por el adaptador del frontend | Ejecuciones exitosas o fallidas del ciclo de pruebas. |

Durante la investigación, `tdd_log.json` respondió correctamente con HTTP 200.
Contenía **75 registros de commits y ningún registro de ejecución de pruebas**.
Estos números corresponden al archivo observado durante el diagnóstico, no
a una garantía sobre futuras modificaciones del repositorio.

El contrato del proyecto distingue dos tipos de entradas:

- Un commit contiene campos como `commitId`, `commitName` y `commitTimestamp`.
- Una ejecución contiene `numPassedTests`, `failedTests`, `numTotalTests`,
  `timestamp` y `success`.

Por eso un archivo puede tener muchas entradas sin contener una sola
ejecución que esta gráfica pueda representar.

### Tener métricas de pruebas no equivale a tener su historial de ejecuciones

Que un commit indique cuántos tests tiene o qué cobertura alcanzó no permite
reconstruir todas las ejecuciones realizadas durante el desarrollo.

Por ejemplo, esa métrica no revela por sí sola cuántos intentos fallaron antes
de alcanzar una ejecución exitosa. Convertir cada commit en una ejecución
habría generado información que no estaba registrada.

**No concluimos que el estudiante nunca ejecutó pruebas. Concluimos que la
fuente usada por la gráfica no tenía registros de esas ejecuciones.**

## 3. ¿Cuál era el problema de TDDLab?

La ausencia de datos era una condición válida, pero la interfaz no la
comunicaba de forma clara:

1. `TDDCycleChart` no encontraba ejecuciones y dibujaba ejes vacíos sin explicar
   el motivo.
2. El selector trataba de forma diferente un log vacío y uno con solo commits:
   ocultaba Dashboard y Ciclo si el array estaba vacío, pero los conservaba
   cuando había commits, aunque tampoco hubiera ejecuciones.
3. Una selección del ciclo guardada en `localStorage` podía quedar sin una
   opción visible en el selector al abrir un repositorio con el log vacío.
4. Para logs vacíos, la página mostraba un mensaje que sugería que no se
   habían ejecutado pruebas, algo que los datos no permitían afirmar.

Por tanto, la corrección realizada en TDDLab fue **gestionar y explicar la
ausencia de registros**, no reparar un dibujo que estuviera descartando
ejecuciones existentes.

## 4. ¿Cómo lo corregimos?

### Paso 1: reproducir el caso antes de cambiar producción

Preparamos una muestra local reducida de los commits de `ventasIS` y otra
con ejecuciones exitosas y fallidas. Esto permitió comprobar el comportamiento
sin depender de cambios en GitHub ni de la disponibilidad del backend.

### Paso 2: sustituir los ejes vacíos por una explicación

En `TDDCycleChart.tsx`, cuando el procesamiento no produce ejecuciones,
ahora se muestra:

> No hay ejecuciones de pruebas registradas

El mensaje distingue dos casos:

- Si existen commits, explica que el log contiene registros de commits, pero
  no registros de ejecución de pruebas.
- Si no existen registros, indica que el log no contiene registros para esa
  gráfica.

Además, señala `script/tdd_log.json` como el archivo en el que deben registrarse
y publicarse los resultados de ejecución para poder visualizarlos.

El aviso utiliza `role="status"` y un estilo visual definido. Reemplaza el
gráfico vacío, pero no elimina las métricas superiores.

### Paso 3: mantener las vistas accesibles

En `TDDChart.tsx` eliminamos el filtro que ocultaba Dashboard y Ciclo de
ejecución de pruebas según la longitud del log.

Ahora el usuario puede entrar a ambas vistas y recibir la explicación
correspondiente. También se mantiene visible una selección válida guardada
en `localStorage`.

### Paso 4: unificar el comportamiento sin duplicar lógica

`TDDBoard` ya reutilizaba `TDDCycleChart`. En `TDDLineChart.tsx` simplificamos
la vista individual para entregarle los mismos registros directamente:

```tsx
return <TDDCycleChart data={tddLogs ?? []} />;
```

Retiramos un mapeo redundante que copiaba los campos del log y un
`console.log`. El componente del ciclo conserva la responsabilidad de
decidir entre mostrar ejecuciones o mostrar el aviso.

### Paso 5: retirar el mensaje ambiguo de la página

En `TDDChartPage.tsx` eliminamos el mensaje que asociaba un log vacío con
no haber ejecutado pruebas o con usar una versión anterior del repositorio.

El aviso específico del componente reemplaza esa explicación imprecisa.
Se conserva el tratamiento existente para la ausencia de información de commits.

### Paso 6: proteger las ejecuciones válidas

Conservamos la comprobación `numPassedTests !== undefined`. No se utiliza
una comprobación basada simplemente en que el valor sea verdadero, porque
**cero pruebas exitosas también puede ser una ejecución válida con fallos**.

Cuando sí existen ejecuciones, se mantienen los símbolos de éxito/fallo,
la leyenda y el detalle al pasar el cursor.

## 5. Antes y después

| Situación | Antes | Ahora |
| --- | --- | --- |
| Log con solo commits | Ejes vacíos, sin explicación. | Aviso específico, sin inventar puntos. |
| Log vacío o no disponible en la vista | Opciones ocultas y mensaje ambiguo. | Vistas accesibles y aviso de ausencia de registros. |
| Métrica del ciclo guardada | El selector podía quedar sin texto. | La opción continúa disponible. |
| Métricas por commit disponibles | Se mostraban en el dashboard. | Se conservan. |
| Ejecuciones exitosas o fallidas registradas | Se representaban mediante símbolos. | Se mantienen los símbolos, leyenda y detalle. |

## 6. ¿En qué parte de la arquitectura hexagonal trabajamos?

La corrección de producción se concentró en **Presentation**, porque el
problema corregido era cómo mostrar y explicar la información disponible.

| Capa o responsabilidad | Elementos relacionados | Papel en este trabajo |
| --- | --- | --- |
| Domain | `TDDLogEntry`, `CommitLog`, `TestExecutionLog` y el puerto `CommitHistoryRepository` | Definen los datos y el contrato. No se modificaron. |
| Application | Caso de uso `GetTDDLogs` | Solicita los logs mediante el puerto. No se modificó. |
| Adaptador externo | `CommitHistoryAdapter`, en la carpeta `repository` | Consulta el archivo de GitHub. No se modificó. |
| Presentation | `TDDCycleChart`, `TDDChart`, `TDDLineChart` y `TDDChartPage` | Gestionan el aviso, las vistas y la navegación. Aquí se implementó la corrección. |

Aunque el adaptador esté dentro del frontend, su responsabilidad sigue
siendo comunicarse con un sistema externo; no es responsabilidad del
componente visual decidir cómo realizar esa consulta.

Respetamos esta separación: no mezclamos peticiones a GitHub con el mensaje
visual ni cambiamos el backend para fabricar información que la fuente no
proporcionaba.

## 7. ¿Cómo aplicamos TDD?

| Ciclo | Trabajo realizado |
| --- | --- |
| 0 — Base de pruebas | Diagnóstico, muestras locales y aislamiento de consultas externas. |
| 1 — RED | Prueba que esperaba una explicación para el caso de solo commits; falló porque el aviso no existía. |
| 2 — GREEN | Implementación mínima del aviso y pruebas de log vacío, cambio de datos y ejecuciones con cero éxitos. |
| 3 — Integración y refactorización | Pruebas del selector y las vistas; corrección de opciones y mensaje, y simplificación del paso de registros. |
| 4 — Validación | Pruebas focalizadas con cobertura, suite general, harness, revisión de compilación y preparación de QA manual. |

Las pruebas no se omitieron ni se modificó la configuración para ocultar
fallos. Primero verificamos fallos de comportamiento y después implementamos
lo necesario para hacerlos pasar.

## 8. ¿Cómo comprobamos el resultado?

### Validación automatizada

En el ciclo 4 se obtuvieron:

- **6 suites focalizadas y 30 pruebas correctas** del segmento.
- **65 suites y 306 pruebas correctas** en la ejecución secuencial completa
  del frontend.
- **PASS** en el harness del frontend.

Se comprobó que no se dibujen ejecuciones inexistentes, que se conserven las
reales, que el aviso cambie al actualizar los datos y que la navegación no
oculte las métricas por commit.

En la suite de integración se mantuvieron reales el selector, las vistas y
el componente de ejecuciones. Se simuló el dibujo externo de Chart.js para
no depender del canvas de JSDOM y se aisló la ruta Lista de commits, que no
formaba parte de los casos recorridos.

### Validación manual reportada por el usuario

Se creó una práctica con el repositorio original `shalure10lure/ventasIS`.
La captura compartida muestra las métricas superiores y, debajo, el aviso
que explica la ausencia de registros de ejecución, en lugar de los ejes
vacíos. Posteriormente, el usuario confirmó que el comportamiento era el
esperado.

Esta evidencia manual fue aportada por el usuario; no se presenta como una
validación visual automatizada realizada por el agente.

## 9. Dificultades y límites del trabajo

- **Distinguir las fuentes de datos.** El hecho de ver métricas de tests
  podía llevar a asumir que también existía un historial de ejecuciones.
- **Probar sin depender de servicios externos.** Se utilizaron muestras
  locales y mocks con responsabilidades delimitadas.
- **Coste de la suite general.** Algunas ejecuciones iniciales del harness
  no terminaron dentro del tiempo de revisión; la validación final sí pasó.
- **Compilación independiente de esta corrección.** Se detectaron archivos
  de declaraciones ausentes en la instalación local de Firebase y MUI.
  No se repararon ni reinstalaron las dependencias como parte de este
  segmento. La prueba funcional no demuestra que el build esté aprobado.

No modificamos los scripts ni los datos del repositorio de `ventasIS`.
Tampoco recuperamos intentos de prueba que no estaban registrados. Hacer
que futuras ejecuciones queden almacenadas en ese repositorio sería un
trabajo adicional sobre su mecanismo de registro.

## 10. Orden sugerido para la demostración

1. Abrir la práctica creada con `ventasIS`.
2. Mostrar que el dashboard conserva las métricas de commits.
3. Bajar hasta el ciclo y explicar el aviso de ausencia de registros.
4. Cambiar a la vista Ciclo y regresar al Dashboard para mostrar la
   consistencia del mensaje y de la navegación.
5. Si se dispone de un repositorio con registros de ejecución, mostrarlo
   para contrastar los símbolos de éxito/fallo y sus detalles.
6. Cerrar indicando las pruebas ejecutadas y el límite de la solución:
   informar con precisión, no inventar ejecuciones.

## 11. Guion breve para exponer

> En el Segmento 3 investigamos por qué el repositorio ventasIS mostraba
> métricas de pruebas, pero la gráfica del ciclo quedaba vacía. Descubrimos
> que esas secciones usan fuentes diferentes: existían métricas por commit,
> pero el log del ciclo solo contenía commits y no registros de ejecución.
>
> El problema que corregimos en TDDLab fue la falta de una explicación para
> ese caso. Reemplazamos los ejes vacíos por un aviso, mantuvimos disponibles
> el Dashboard y el Ciclo, y conservamos las métricas existentes. No inventamos
> ejecuciones a partir de los commits.
>
> Trabajamos principalmente en Presentation, respetando la arquitectura
> hexagonal y sin modificar el backend ni los adaptadores. Aplicamos TDD:
> primero escribimos pruebas que fallaban y después implementamos la
> corrección. El segmento terminó con 30 pruebas focalizadas correctas y la
> suite general con 306. También comprobamos manualmente el repositorio que
> originó el problema.
