# Limpieza del código residual de «Ver Gráficas Adicionales»

## 1. Objetivo y alcance

Identificar y retirar los restos del antiguo botón «Ver Gráficas Adicionales» en TDDLab, manteniendo las gráficas vigentes y la arquitectura del proyecto. El número de tarea no fue proporcionado: no se reutiliza el 404 de la documentación de ejemplo.

Repositorio: https://github.com/UCB-TallerDeDesarrollo/TDDLab

Base inspeccionada: `main`, commit `9d7353db1fa57ba65952095d1b8c4c6cc235afa0`. La consulta `git ls-remote origin refs/heads/main` confirmó el mismo hash. El árbol de trabajo estaba limpio antes de iniciar.

Rama de trabajo: `codex/limpiar-graficas-adicionales`.

## 2. Hallazgos y evidencia

El texto del botón ya no aparece en el código actual. El historial contiene el commit `e548b096` («delete: Codigo adicional de graficas adicionales eliminado»), que retiró `TDDBarCycle.tsx`, `TDDPie.tsx` y sus conexiones con `TDDLineChart.tsx`.

Sin embargo, permanecen los siguientes residuos en la base:

| Ubicación | Hallazgo | Clasificación |
| --- | --- | --- |
| `Web Ui/src/App.tsx` | Registra `/aditionalgraph` y pasa `graphs="aditionalgraph"` a `TDDChartPage`. | Ruta obsoleta accesible por URL; no es código estrictamente inalcanzable. |
| `TDDChart.tsx` | Ofrece `Complejidad` y `Pie` exclusivamente en el modo antiguo. | Opciones huérfanas: `TDDLineChart` ya no tiene casos que las rendericen. |
| `useTDDChartPage.ts` | Elige entre `Dashboard` y `Complejidad` al navegar entre estudiantes. | Rama condicional heredada del modo retirado. |
| `tddVisualization.types.ts` y `TDDChartPage.tsx` | Propagan `graphs` y `typegraphs`. | Contratos y cableado exclusivos de la distinción entre ambos modos. |
| `useAssignmentDetailData.ts` | `redirectAdmin` admite ruta y métrica, incluida `Complejidad`, pero su único llamador pasa `/graph` y `Dashboard`. | Generalización sin consumidor para el modo adicional. |
| `Web Ui/README.md` | Publicita `/aditionalgraph`. | Documentación desactualizada al retirar la ruta. |

Se buscaron referencias en todo el repositorio, incluidos frontend, backend, extensión, Cypress y configuración. Se inspeccionaron las importaciones dinámicas de `App.tsx` y los consumidores reales; el nombre `aditionalgraph` conserva la ortografía del código original.

### Comportamiento que se conserva

- `/graph` y su protección de acceso.
- Dashboard, número de tests, cobertura, líneas modificadas, lista de commits y ciclo de ejecución de pruebas.
- La condición que oculta dashboard y ciclos cuando no hay logs.
- La selección de métricas y su sincronización mediante `localStorage` y el evento `storage`.
- Comentarios docentes, navegación entre entregas y flujos de tareas y prácticas.
- API, repositorios, dominio, arquitectura hexagonal, dependencias y archivos de bloqueo.

La retirada de `/aditionalgraph` sí cambia el acceso directo a esa URL: deja de montar `TDDChartPage`. No se añade redirección ni página 404; se conserva el comportamiento existente del router para rutas sin coincidencia.

## 3. Coordinación con el equipo

La referencia local `origin/ucm-bl-01-eliminar-graficos-adicionales` contiene `ae5d12b8`, una limpieza muy parecida. `git merge-base --is-ancestor ae5d12b8 HEAD` devolvió 1: ese commit no está integrado en la base inspeccionada. Esto describe las referencias locales, no afirma el estado actual de un PR remoto.

El usuario indicó continuar de forma independiente desde `main`. Antes de integrar conviene coordinar con el autor de aquella rama para evitar duplicar cambios o resolver el mismo conflicto dos veces. No se copiaron sus commits ni se atribuyeron como propios.

La documentación de la tarea 404 sirvió como modelo de estructura; sus cantidades, hashes y resultados de pruebas no se utilizan como resultados de esta tarea. No se repite la eliminación general de archivos que corresponde a ese trabajo.

## 4. Método de pruebas

La retirada de la ruta tiene un efecto observable y permite una prueba Red/Green real: comprobar que `/graph` monta la vista actual y que `/aditionalgraph` deja de hacerlo. La prueba usa el router real de `App`, con autenticación y contenido de la página aislados para no depender de Firebase, red o canvas. No pretende validar la autenticación.

Para el selector se añaden pruebas de caracterización del comportamiento vigente antes de limpiar los contratos. Quitar parámetros y ramas sin consumidores es refactorización bajo pruebas; no se inventa una fase roja para cada línea borrada.

También se caracteriza la navegación entre entregas: anterior/siguiente deben conservar `repoOwner`, `repoName`, `submissionId` y el conjunto de entregas, actualizar el índice y guardar `Dashboard` como métrica inicial.

### Línea base ejecutada

| Comprobación | Resultado antes de editar producción |
| --- | --- |
| Instalación con `npm ci --no-audit --no-fund` | 989 paquetes instalados; navegador de Cypress omitido. |
| `tsc --noEmit -p .` | Aprobado, salida 0. |
| ESLint sobre `.`, extensiones `ts,tsx` | 95 errores y 6 advertencias preexistentes. |
| Jest completo con `--runInBand` | Incompleto: se detuvo tras más de ocho minutos, con 19 suites registradas como PASS y sin resumen final. No equivale a suite aprobada. |

Se guardaron los informes originales de la línea base. No se conoce la causa definitiva de la demora de la suite completa; no se afirma que sea un fallo del código ni se atribuye a la limpieza. La primera ejecución de los tests nuevos también se interrumpió al demorarse la carga de la prueba de rutas. Se aisló el catálogo de iconos en esa prueba antes de repetirla; este ajuste pertenece al montaje del test, no a producción.

### Red → Green → Refactor: resultados reales

| Etapa | Resultado |
| --- | --- |
| Red, antes de editar producción | 3 suites; 5 pruebas aprobadas y 1 fallida. El fallo fue la aserción que exige no montar la vista en `/aditionalgraph`: encontró `tdd-chart-page`. |
| Green, después de retirar ruta y referencia del README | 3 suites, 6 pruebas aprobadas. |
| Refactor de contratos y opciones | 3 suites, 6 pruebas aprobadas; TypeScript aprobado. |
| Regresión final de las áreas afectadas | 10 suites, 48 pruebas aprobadas, 0 fallidas. Duración: 2468,851 segundos (aproximadamente 41 minutos). |
| TypeScript final | Aprobado, salida 0. |
| ESLint final | 95 errores y 6 advertencias: idénticos mensajes por archivo, regla y severidad respecto de la línea base, ignorando el desplazamiento de líneas. Sin incidencias nuevas. |
| Referencias de producción | Sin coincidencias de `aditionalgraph`, `typegraphs`, `graphs`, `Complejidad`, `TDDPie` ni `TDDBarCycle` en `Web Ui/src` y `Web Ui/README.md`. La prueba negativa conserva deliberadamente la URL retirada. |
| `git diff --check` | Sin errores de whitespace. |

La regresión final cubrió `assignmentDetail`, `practiceDetailPage`, `TDDChartPage`, `TDDCycleChart`, `TDDCycleCard`, `TDDCycleList`, `TDDCharts` y las tres suites nuevas. No se eliminaron pruebas para conseguir resultados verdes; dos archivos de pruebas existentes se ajustaron únicamente al retiro de props.

Comando exacto de la regresión final, ejecutado desde `Web Ui` con el Jest local:

```powershell
node node_modules/jest/bin/jest.js --runInBand test/presentation/tdd-visualization test/presentation/assignments/assignmentDetail.test.tsx test/presentation/my-practices/practiceDetailPage.test.tsx
```

Se añadieron `--json --outputFile=...` y redirección a logs para guardar evidencia. Los informes originales están en `C:\Users\Jorge Vargas\Documents\ChatGPT\taller de desarrollo de software\.task-evidence`: `baseline-jest.log`, `baseline-types.log`, `baseline-lint.json`, `red-jest.json`, `green-route.json`, `green-contracts.json`, `final-jest.json`, `final-types.log` y `final-lint.json`. Son evidencia local; no se versionaron informes voluminosos ni dependencias.

### Commits pequeños

| Commit | Propósito | Tamaño |
| --- | --- | --- |
| `8a2880a0` — `test: cubrir retiro de ruta y conservar metricas TDD` | Punto Red y pruebas de caracterización. Es deliberadamente rojo para la ruta antigua. | 3 archivos nuevos; 156 líneas añadidas. |
| `dec132b2` — `refactor: retirar ruta de graficas adicionales` | Punto Green: ruta retirada y README actualizado. | 2 archivos; 15 líneas eliminadas. |
| `d35f45e2` — `refactor: eliminar contratos del modo de graficas adicionales` | Quita props, opciones y condicionales antiguos; adapta consumidores y pruebas. | 9 archivos; 9 líneas añadidas, 29 eliminadas. |
| `f8228d21` — `refactor: simplificar navegacion a la grafica docente` | Retira argumentos redundantes del único consumidor. | 1 archivo; 4 líneas añadidas, 6 eliminadas. |
| `docs: documentar limpieza de graficas adicionales para Notion` | Este informe y los pasos de entrega. | Documento independiente del código. |

No se eliminaron archivos completos. El cambio afecta seis archivos de producción, el README, dos tests existentes, tres suites nuevas y este documento. No se cambiaron paquetes ni lockfiles.

### Límites de la verificación y comportamiento pendiente

- La suite completa del frontend no quedó aprobada: se interrumpió la ejecución de línea base. La aprobación final corresponde únicamente a las 10 suites indicadas.
- No se ejecutaron build de Vite, Cypress, pruebas de backend/extensión ni SonarCloud. TypeScript comprueba tipos, pero no sustituye a build, pruebas de navegador o despliegue. No se atribuye la omisión del build a variables de entorno sin comprobarlo.
- No se realizó una validación manual en navegador ni se desplegó. La autenticación de las pruebas de rutas está simulada; el componente de protección real no fue modificado.
- No se migran valores históricos de `localStorage`. Una preferencia antigua como `Complejidad` o `Pie` puede seguir almacenada; el código conserva su lectura previa. Los flujos normales de apertura y navegación seleccionan `Dashboard`. Una migración de preferencias sería trabajo adicional.
- El lint global continúa fallando por sus incidencias preexistentes. No se afirma que todo el repositorio esté libre de errores.

## 5. Cómo revisar y entregar desde VS Code

Abrir la carpeta original del proyecto y una terminal PowerShell:

```powershell
Set-Location 'C:\Users\Jorge Vargas\Desktop\CARRERA\TALLER DE DESARROLLO DE SOFTWARE\proyecto_sprint2\TDDLab'
git branch --show-current
git status --short
git log --oneline main..HEAD
git diff --stat main...HEAD
git diff main...HEAD
```

La rama esperada es `codex/limpiar-graficas-adicionales`. Los cambios quedan confirmados localmente en commits pequeños, con la identidad de Git ya configurada en el equipo. Para publicarlos, cuando el equipo haya coordinado el solapamiento:

```powershell
git push -u origin codex/limpiar-graficas-adicionales
```

Luego crear un pull request en GitHub con base `main` y comparación `codex/limpiar-graficas-adicionales`. Título sugerido: **Limpiar residuos de Ver Gráficas Adicionales**. Copiar las secciones de hallazgos, pruebas y limitaciones de este documento a la descripción.

Para repetir las comprobaciones del frontend:

```powershell
Set-Location 'Web Ui'
npx.cmd jest --runInBand
npx.cmd tsc --noEmit -p .
npm.cmd run lint
```

Si es una copia nueva sin dependencias, ejecutar primero `npm.cmd ci`. En esta tarea se usó `$env:CYPRESS_INSTALL_BINARY='0'` durante la instalación para omitir la descarga del navegador de Cypress, pues la validación ejecutada es Jest/TypeScript/lint. No se modificaron las versiones del proyecto.

### Subir la documentación a Notion

En Notion crear una página para la tarea y pegar este Markdown, o importar el archivo mediante **Importar → Texto y Markdown**. Agregar el número real de la tarea y los enlaces al pull request y a la rama después de publicarlos. Este documento no afirma que exista una publicación remota ni una página creada en Notion.

### Explicación breve para la revisión de clase

«El botón ya había sido eliminado, pero quedaba una ruta que activaba opciones cuyos componentes ya no existían. Primero registré la línea base y escribí una prueba que fallaba porque esa URL todavía montaba la vista. Retiré la ruta y después simplifiqué los parámetros del modo antiguo bajo pruebas de regresión. Las gráficas vigentes se conservaron. Separé los cambios en commits de pruebas, ruta, contratos, navegación y documentación.»

La evidencia Red/Green se conserva en los primeros dos commits; los resultados finales y sus límites están detallados en la sección 4.

## 6. Adaptación mínima al Pilar 1

Por solicitud posterior se añadieron instrucciones y estado persistente al repositorio, sin modificar la limpieza de producción:

| Elemento | Implementación |
| --- | --- |
| Mapa para agentes | [AGENTS.md](AGENTS.md) |
| Arquitectura, convenciones y comandos | [docs/README.md](docs/README.md) |
| Estado estructurado | [feature_list.json](feature_list.json) |
| Continuidad fuera del chat | [progress/current.md](progress/current.md) |
| Comprobación del entorno | [init.sh](init.sh), ejecutable con `bash init.sh` desde Git Bash; no instala ni modifica archivos. |
| Evidencia ejecutable | Se conservan `Web Ui/test` y `server/test`; no se duplican en otra carpeta `tests`. |
| Criterios de cierre | [CHECKPOINTS.md](CHECKPOINTS.md) |

Se validaron sintaxis y ejecución del script, JSON, enlaces y reglas de exclusión de Git. No se añadieron dependencias, frameworks, agentes especializados ni otro sistema de CI. No se repitieron las pruebas de la aplicación porque esta adaptación solo agrega documentación, estado y una comprobación de entorno. Los resultados de la sección 4 corresponden a la limpieza previamente verificada.

Esto cubre el Pilar 1; los archivos no constituyen por sí solos un harness completo con autorización, aislamiento o revisión independiente. La adaptación se registra en dos commits adicionales a los cinco de la limpieza original.
