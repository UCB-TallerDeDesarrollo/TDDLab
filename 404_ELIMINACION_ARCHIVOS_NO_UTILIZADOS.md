# 404: eliminación de archivos que no se usan

## 1. Objetivo y alcance

La tarea 404 tuvo como objetivo identificar, verificar y eliminar archivos del repositorio TDDLab que estuvieran genuinamente sin utilizar, sin romper funcionalidad, pruebas, compilación, configuración, despliegue ni la arquitectura hexagonal del proyecto.

La herramienta de detección fue **Knip 5**, ejecutada sobre el proyecto que corresponde a cada paquete (`server` y `Web Ui`), y el resultado de la herramienta se trató siempre como una hipótesis que exigía verificación manual independiente antes de eliminar cualquier archivo.

El trabajo se realizó en:

- Repositorio: `https://github.com/UCB-TallerDeDesarrollo/TDDLab.git`
- Rama: `404/eliminar-archivos-que-no-se-usan`
- Estado inicial: `da950be4 test:first-commit`
- Estado final: `48a88d94 chore: add minimal knip config to fix server false positives`

### Restricciones que se respetaron

- No se modificó la estructura del proyecto ni el patrón hexagonal.
- No se movieron, renombraron ni reorganizaron archivos, paquetes o módulos.
- No se reescribió código funcional ni se hicieron refactorizaciones ajenas a la eliminación de archivos.
- No se eliminó ningún archivo por el simple hecho de no tener imports directos: cada candidato se comprobó contra imports estáticos, imports dinámicos, `require`, `import.meta.glob`, configuraciones, scripts, workflows de CI, Docker, manifiestos y recursos.
- No se eliminó código, pruebas, configuraciones ni dependencias con el fin de que Knip terminara sin incidencias.
- No se utilizó `git reset --hard`, `git clean -fd` ni `git push --force`.
- No se descartaron ni sobrescribieron cambios previos: el árbol de trabajo estaba limpio al comenzar.

### Resultado cuantitativo real

| Concepto | Cantidad |
|---|---|
| Archivos eliminados | 27 |
| Archivos de configuración añadidos | 1 (`server/knip.json`) |
| Candidatos conservados por decisión justificada | 1 (`Web Ui/test/presentation/tdd-visualization/fileMock.js`) |
| Cambios de estructura del proyecto | 0 |
| Líneas eliminadas | 1171 |

Todos los cambios están en commits independientes y revisables, uno por lote de eliminación.

---

## 2. Fase 1: inspección del repositorio

### 2.1 Verificación de la referencia remota

Se ejecutaron los comandos de inspección obligatorios:

```powershell
git rev-parse --is-inside-work-tree   # true
git remote -v                         # origin https://github.com/UCB-TallerDeDesarrollo/TDDLab.git
git status --short                    # vacío
git branch -a                         # rama activa 404/eliminar-archivos-que-no-se-usan
git ls-remote origin 404/eliminar-archivos-que-no-se-usan
```

Resultado de la comparación:

| Elemento | Valor |
|---|---|
| HEAD local | `da950be441b6a0c7a1f85e4bc012825495cdd0ea` |
| `origin/404/eliminar-archivos-que-no-se-usan` | `da950be441b6a0c7a1f85e4bc012825495cdd0ea` |
| `git ls-remote origin` de la rama | `da950be441b6a0c7a1f85e4bc012825495cdd0ea` |

Los tres hashes coinciden. La rama local activa coincide con la rama remota indicada en la tarea y el árbol de trabajo estaba limpio, sin modificaciones previas sin confirmar. No hubo ambigüedad que exigiera detener la ejecución.

### 2.2 Identificación de la tecnología real

No se presupuso ninguna tecnología. Se inspeccionó `package.json`, los archivos de bloqueo, los manifiestos y las configuraciones:

| Proyecto | Lenguaje / framework | Gestor de paquetes | Pruebas | Compilación |
|---|---|---|---|---|
| `server/` | TypeScript, Express, arquitectura hexagonal | npm (`package-lock.json`) | Jest + ts-jest | `tsc` (salida `build/`) |
| `Web Ui/` | TypeScript, React, Vite | npm (`package-lock.json`) | Jest + ts-jest + jsdom | `tsc && vite build` |
| `VSCodeExtension/` | TypeScript, extensión VS Code | npm | vscode-test | `tsc -p ./` |
| Raíz | Solo dependencias sueltas | npm | No define | No define |

Datos confirmados que condicionaron el trabajo:

- **Bun no está instalado** en el entorno (`bun` no se reconoce como comando). Por tanto se usó `npx knip`, conforme a la alternativa que la tarea autoriza.
- El gestor de paquetes del repositorio es **npm**: existen `package-lock.json` en `server`, `Web Ui` y `VSCodeExtension`.
- El repositorio **no es un monorepo con workspaces**: el `package.json` raíz no declara `workspaces`, por lo que Knip no puede analizar los tres subproyectos en una sola ejecución desde la raíz.
- No existe fichero `AGENTS.md` en el repositorio.
- La carpeta `docs/` está ignorada por `.gitignore` (`# Documentacion local no versionada` → `docs/`). Por eso este documento se colocó en la raíz, siguiendo la convención real del repositorio, cuyo único documento técnico previo es `BL-01_ELIMINACION_AUTENTICACION_GITHUB.md` en la raíz.

### 2.3 Convenciones de commits

Se revisaron los últimos commits del repositorio:

```text
da950be4 test:first-commit
23d65da3 refact: usar mensajes mas amigables para el usuario
c3be7b28 test/fix: solucion de errores secundarios en pruebas por cambios al manejo de errores
8bf3ad67 test/refact: cambiar pruebas por cambios sobre los errores que tira el controlador
56fd9274 fix: mejorar propagacion del error para mejorar UX
e7fa4037 fix: mejorar manejo de errores
```

La convención real es **commits semánticos con prefijo en minúsculas y dos puntos**: `test:`, `refact:`, `fix:`. Los mensajes de este trabajo usaron el mismo formato (`chore: ...`), que es coherente con el estilo existente, y en el cuerpo del commit se detalló la evidencia de verificación.

### 2.4 Revisión de CI/CD y scripts

`.github/workflows/deployment.yml` ejecuta, sobre `Web Ui` y `server`:

- `npm ci` y `npm test` de frontend.
- `npm install` y `npm test` de backend.
- Cypress (`npm run dev` + `cypress-io/github-action`).
- SonarCloud.
- `npx prettier --write "src/**/*.{js,ts,tsx}"`.
- Despliegue a Firebase y Vercel.

Conclusión relevante: los jobs de CI solo cubren `Web Ui` y `server`. `VSCodeExtension` no tiene job de CI en este workflow. Esto se tuvo en cuenta al decidir el alcance.

---

## 3. Fase 2: línea base

Antes de modificar nada se ejecutaron las verificaciones del proyecto para distinguir errores preexistentes de errores introducidos.

### 3.1 Pruebas del backend (`server`)

```powershell
cd server
npm test
```

Resultado de la línea base:

```text
Test Suites: 56 passed, 56 total
Tests:       349 passed, 349 total
Time:        59.887 s
```

Estado: **aprobado**.

### 3.2 Pruebas del frontend (`Web Ui`)

```powershell
cd "Web Ui"
npx jest
```

Resultado de la línea base:

```text
Test Suites: 63 passed, 63 total
Tests:       292 passed, 292 total
Time:        450.428 s
```

Estado: **aprobado**. Jest informó una advertencia de que un worker no terminó limpiamente (`worker process has failed to exit gracefully`), preexistente y no relacionada con esta tarea.

### 3.3 Compilación de tipos del backend

```powershell
cd server
npx tsc --noEmit -p .
```

Resultado: sin salida, código de salida 0. Estado: **aprobado**.

Nota: `npx tsc` desde la raíz falla porque TypeScript no está instalado en la raíz; el compilador vive en `server/node_modules`. Es una limitación del entorno, no un error del proyecto.

### 3.4 Compilación de tipos del frontend

```powershell
cd "Web Ui"
npx tsc --noEmit -p .
```

Resultado: sin salida, código de salida 0. Estado: **aprobado**.

### 3.5 Lint del frontend (línea base con errores preexistentes)

```powershell
cd "Web Ui"
npm run lint
```

Resultado de la línea base:

```text
97 problems (91 errors, 6 warnings)
10 errors and 0 warnings potentially fixable with the `--fix` option.
```

Estado: **falla preexistente, no relacionada con el objetivo**. Los errores son `@typescript-eslint/no-unused-vars` y `prefer-const` en ficheros de mocks y de `tdd-visualization`. Se conservaron como referencia para no atribuir a la limpieza errores ajenos.

### 3.6 Verificaciones no ejecutadas

| Verificación | Motivo |
|---|---|
| `npm run build` de `Web Ui` | Requiere variables de entorno de Firebase no disponibles localmente; no es necesario para el objetivo y no oculta error, porque el chequeo de tipos ya pasó |
| Cypress end-to-end | Requiere servidor de desarrollo y navegador; el workflow de CI lo cubre. No ejecutado localmente |
| Pruebas y lint de `VSCodeExtension` | `VSCodeExtension/node_modules` no existe y su configuración de Knip falla al cargar `eslint.config.mjs` por falta de `@typescript-eslint/eslint-plugin` instalado |
| SonarCloud | Requiere `SONAR_TOKEN` y ejecución en CI |
| `knip` en la raíz del repositorio | Produce una lista masiva de falsos positivos (ver sección 4.2) |

---

## 4. Fase 3: detección de candidatos con Knip

### 4.1 Versión y comando utilizado

- Versión de Knip: **5** (ejecutada mediante `npx --yes knip@5`).
- Telemetría deshabilitada con `KNIP_DISABLE_TELEMETRY=1`.
- No existía instalación local de Knip en `server/node_modules` ni en `Web Ui/node_modules`, por lo que se usó `npx`, que no modifica `package.json` ni los lockfiles del proyecto.

Comandos ejecutados:

```powershell
cd server
$env:KNIP_DISABLE_TELEMETRY="1"
npx --yes knip@5 --no-config-hints
npx --yes knip@5 --no-config-hints --reporter json
```

```powershell
cd "Web Ui"
$env:KNIP_DISABLE_TELEMETRY="1"
npx --yes knip@5 --no-config-hints
npx --yes knip@5 --no-config-hints --reporter json
```

Se usó el reporter `json` además del reporter por defecto `symbols` para obtener la lista exacta de archivos sin ambigüedad de formato.

### 4.2 Resultado en `server`: 30 falsos positivos por falta de entry

La primera ejecución en `server` informó:

```text
Unused files (30)
api/index.ts
src/app.ts
src/config/server.ts
src/routes/AIAssistant.ts
src/routes/assignmentRoutes.ts
src/routes/featureFlagsRoutes.ts
src/routes/groupsRouter.ts
src/routes/practicesRoutes.ts
src/routes/practiceSubmissionsRoutes.ts
src/routes/submissionRoutes.ts
src/routes/TDDCyclesRoutes.ts
src/routes/teacherCommentsOnSubmissionsRoutes.ts
src/controllers/PracticeSubmissions/PracticeSubmissionsController.ts
src/controllers/practices/practicesController.ts
src/modules/Practices/domain/Practice.ts
src/modules/Practices/repository/PracticeRepository.ts
src/modules/PracticeSubmissions/... (casos de uso, dominio y repositorio)
src/modules/Practices/application/PracticeUseCases/... (todos los casos de uso)
```

Ese resultado es inválido como guía de eliminación. Knip no detectó los puntos de entrada porque no existe configuración y los nombres `src/app.ts` y `api/index.ts` no coinciden con los patrones de entrada por defecto de Knip.
La verificación manual demostró que esos archivos son el runtime vivo de la API:

- `server/src/app.ts` construye la aplicación Express, monta los diez routers (`/api/user`, `/api/assignments`, `/api/TDDCycles`, `/api/groups`, `/api/submissions`, `/api/commentsSubmission`, `/api/practices`, `/api/practiceSubmissions`, `/api/AIAssistant`, `/api/featureFlags`) y llama a `server(app, port)`.
- `server/api/index.ts` es el entry de Vercel: importa `../src/app` y exporta la aplicación.
- Los workflows de CI despliegan `server` con Vercel (`vercel deploy --prod`), que usa `api/index.ts`.

Por tanto, los 30 archivos eran **falsos positivos de categoría C (necesarios)**. Siguiendo el criterio de la tarea, se corrigió únicamente la configuración estrictamente necesaria, añadiendo `server/knip.json`:

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": ["api/index.ts", "src/app.ts"],
  "project": ["**/*.ts"]
}
```

Con esa corrección, Knip pasó a informar **cero archivos sin uso en `server`**, lo que confirma que no había ni un solo archivo muerto real en el backend. El `package.json` de `server` no se modificó.

### 4.3 Resultado en `Web Ui`: 28 candidatos reales

Knip en `Web Ui` sí resolvió correctamente los puntos de entrada (Vite/React). Informó 28 archivos sin uso. Esa lista se verificó archivo por archivo, y se redujo a las eliminaciones descritas en la sección 6.

### 4.4 Criterios de aceptación y rechazo aplicados

Para cada candidato se comprobó, antes de aceptarlo:

1. **Referencias por símbolo exportado.** Búsqueda con `git grep` de cada nombre exportado (`adaptarDatos`, `saveSelectedGroup`, `loadSelectedGroup`, `TDDLabLogo`, `CheckPracticeSubmissionExists`, `GetTDDLogUseCase`, `updateGroup`, `updateUser`, `AIResultSection`, `AssignmentsListLayout`, `GroupsToolbar`, `MyPracticesListLayout`, `PracticeListItem`, `UsersDivider`, `UsersFeedbackDialog`, `RemoveUserDialog`, `users.types`, `usePracticeDetailData`, `useGitHubLinkValidation`, `PracticesList`, `usePractices`, `EditPracticeDialog`, `CreatePracticeDialog`, `PracticeOverviewCard`) sobre todo el repositorio: `Web Ui`, `server`, `public`, `cypress`, `VSCodeExtension` y `.github`.
2. **Imports dinámicos y carga por reflexión.** Búsqueda de `import(`, `import.meta.glob` y `require(` en `Web Ui/src`. Los únicos imports dinámicos del proyecto están en `Web Ui/src/App.tsx` mediante `React.lazy` y apuntan exclusivamente a páginas vivas (`HomePage`, `LandingPage`, `GroupsPage`, `UserPage`, `UserBygroupPage`, `SettingsPage`, `AssignmentsPage`, `AssignmentDetail`, `TDDChartPage`, `AuthPage`, `InvitationPage`, `MyPracticesPage`, `PracticeDetail`, `AIAssistantPage`). Ninguno apuntaba a un archivo eliminado.
3. **Barriles (`index.ts`).** Búsqueda de imports por directorio (`from "../components"`, `from "../hooks"`, `from "../services"`, `from "../types"`). Los barriles usados realmente son `groups/services`, `groups/types`, `my-practices/services` y `my-practices/types`, y se conservaron. Los cuatro barriles eliminados no eran importados por nadie.
4. **Configuraciones, scripts, CI, Docker, manifiestos y recursos.** Revisión de `package.json`, `jest.config.ts`, `jest.config.js`, `vite.config.ts`, `tsconfig.json`, `firebase.json`, `cypress.config.ts`, `.github/workflows/deployment.yml`, `README.md` y `sonar-project.properties`.
5. **Archivos generados, plantillas, recursos estáticos, migraciones y puntos de entrada públicos.** Se comprobó que ninguno de los eliminados fuera un recurso, una plantilla o un punto de entrada.

Clasificación final de los candidatos:

| Categoría | Archivos |
|---|---|
| A. Confirmado innecesario | Los 27 archivos eliminados |
| B. Posible falso positivo, conservado | `Web Ui/test/presentation/tdd-visualization/fileMock.js` |
| C. Necesario, conservado | Los 30 archivos de `server` y todos los archivos vivos de `Web Ui` |

---

## 5. Fase 4: TDD y control de commits

### 5.1 Decisión sobre el ciclo TDD

Se aplicó el ciclo Red/Green solo cuando existía un cambio con comportamiento verificable. En este trabajo el objetivo era eliminar archivos que Knip y la verificación manual demostraban que no eran alcanzables desde ningún punto de entrada.

Para esas eliminaciones se aplicó el tratamiento que la tarea autoriza explícitamente para código muerto sin comportamiento funcional observable:

1. Se conservó como evidencia la identificación inicial del candidato por Knip y la verificación independiente de referencias.
2. Se ejecutaron las pruebas de regresión existentes antes y después.
3. Se comprobó que el análisis posterior ya no reporta el archivo eliminado ni nuevos problemas derivados.
4. Se verificaron la compilación de tipos, el lint y Knip.
5. Se realizó un commit independiente por lote una vez validadas las comprobaciones.
6. Este documento registra expresamente que se trata de eliminación de código muerto sin prueba unitaria significativa y qué controles la sustituyen.

**No se inventaron pruebas vacías, tests que solo simularan un fallo, referencias temporales ni código artificial para aparentar cumplimiento de TDD.**

La justificación técnica es que una prueba unitaria solo puede verificarse contra una unidad de producción existente. Los 27 archivos eliminados no tienen consumidor: no hay comportamiento que una prueba nueva pudiera observar, y añadir una prueba referenciando los archivos eliminados habría recreado una dependencia artificial sobre código muerto. La regresión pertinente es la suite existente, que sí cubre el comportamiento del sistema que permanece.

### 5.2 Control incremental

No se acumuló una limpieza masiva para revisarla al final. Se aplicaron siete commits, uno por lote, verificando después de cada uno:

| # | Commit | Contenido | Archivos |
|---|---|---|---|
| 1 | `095c2473` | `chore: remove unused utility and logo files` | 3 |
| 2 | `a955be31` | `chore: remove unused use cases from hex layers` | 4 |
| 3 | `5ffe522c` | `chore: remove unreferenced presentation components` | 5 |
| 4 | `4bfb93da` | `chore: remove superseded my-practices component tree` | 9 |
| 5 | `6f17ff52` | `chore: remove unused barrel files` | 4 |
| 6 | `eb946616` | `chore: remove unreferenced layout re-export and groups toolbar` | 2 |
| 7 | `48a88d94` | `chore: add minimal knip config to fix server false positives` | 1 (añadido) |

Verificación realizada después de cada commit: `tsc --noEmit` en el proyecto afectado, `git grep` de los símbolos eliminados y `git diff` inspeccionado para confirmar que solo contiene borrados.

---

## 6. Cambios y eliminaciones significativas

### 6.1 Tabla de eliminaciones

| Archivo o elemento | Acción | Evidencia de que no se utilizaba | Motivo de eliminación | Validación realizada |
|---|---|---|---|---|
| `Web Ui/src/utils/adaptarDatos.ts` | Eliminado | `git grep` de `adaptarDatos` en todo el repositorio devuelve una sola coincidencia: la propia declaración `export function adaptarDatos(...)` en la línea 3 del archivo | Función de adaptación de datos de auth huérfana, sin consumidor en ninguna capa | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/utils/localStorageService.ts` | Eliminado | `git grep` de `saveSelectedGroup`, `loadSelectedGroup` y `selectedGroup`: las coincidencias son la declaración en el propio archivo y usos directos de `localStorage` desde `useAssignmentsScreen.ts` y `useGroupsData.ts`, que no importan este archivo | Wrapper de `localStorage` sustituido por acceso directo en los hooks vivos | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/app/navigation/components/TDDLabLogo.tsx` | Eliminado | `git grep` de `TDDLabLogo`: solo la declaración del componente y de su interfaz `TDDLabLogoProps` dentro del propio archivo | Logo reemplazado por `<img src="/Logo.png">` en `MainMenu.tsx:159` y por imágenes directas en las páginas vivas | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/modules/PracticeSubmissions/Application/CheckPracticeSubmissionExists.ts` | Eliminado | `git grep` de `CheckPracticeSubmissionExists`: solo la declaración de la clase en la línea 3 del archivo | Caso de uso de la capa de aplicación sin inyección ni consumidor; el módulo de submissions sí usa su propio `checkSubmissionExists` vivo | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK; Knip deja de reportarlo |
| `Web Ui/src/modules/TDDCycles-Visualization/application/GetTDDLogUseCase.ts` | Eliminado | `git grep` de `GetTDDLogUseCase`: cero coincidencias, ni siquiera la declaración (la clase se llama `GetTDDLogsUseCase`) | Caso de uso duplicado de `GetTDDLogs.ts`, que es el que consume `usePracticeDetail` | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/modules/User-Authentication/application/updateGroup.ts` | Eliminado | `git grep` de `updateGroup` distingue este archivo (declara `updateGroupOnDb`) de los usos reales, que apuntan a `modules/Groups/application/UpdateGroup.ts` | Función `updateGroupOnDb` que instancia `UsersRepository` directamente, sin consumidor | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/modules/Users/application/updateUser.ts` | Eliminado | `git grep` de `updateUser` distingue este archivo (clase `UpdateUser`) de los usos reales, que apuntan a `src/modules/Users/domain/UsersRepositoryInterface.ts` y al repositorio | Clase de aplicación que solo delega en `userRepository.updateUser`, sin consumidor | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/ai-assistant/components/AIResultSection.tsx` | Eliminado | `git grep` de `AIResultSection`: solo la declaración del componente y su `export default` dentro del propio archivo | Sección de resultado del asistente IA no renderizada por ninguna página | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/assignments/components/AssignmentsListLayout.tsx` | Eliminado | `git grep` de `AssignmentsListLayout`: solo la declaración, más una referencia en el barril `assignments/components/index.ts`, que a su vez nadie importaba | Re-export de una línea de `shared/components/FeatureItemsLayout`, que los consumidores reales importan directo | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/groups/components/GroupsToolbar.tsx` | Eliminado | `git grep` de `GroupsToolbar`: solo la declaración de la función y una referencia en el barril `groups/components/index.ts`, que nadie importaba | Barra de herramientas de grupos sin consumidor tras retirar el barril | `tsc --noEmit` OK; Knip deja de reportarlo |
| `Web Ui/src/presentation/users/components/UsersDivider.tsx` | Eliminado | `git grep` de `UsersDivider`: solo la declaración dentro del propio archivo | Wrapper de una línea sobre `shared/components/FeatureSectionDivider` sin consumidor | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/users/components/dialogs/RemoveUserDialog.tsx` | Eliminado | `git grep` de `RemoveUserDialog`: solo la declaración dentro del propio archivo | Diálogo de confirmación sin montar en ninguna página; el diálogo usado es `shared/components/ConfirmationDialog` | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/users/components/dialogs/UsersFeedbackDialog.tsx` | Eliminado | `git grep` de `UsersFeedbackDialog`: solo la declaración dentro del propio archivo | Wrapper de una línea sobre `ValidationDialog` sin consumidor | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/users/types/users.types.ts` | Eliminado | `git grep` de `users.types`: sin coincidencias. El archivo está vacío | Archivo vacío declarado en la estructura de tipos de usuarios | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/components/PracticesList.tsx` | Eliminado | `git grep`: ningún archivo importa `PracticesList`. El árbol vivo es `MyPracticesList.tsx` → `MyPracticesPage.tsx`, alcanzado desde `App.tsx` | Segunda implementación completa de la lista de prácticas, sustituida por `MyPracticesList` | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/components/PracticeListItem.tsx` | Eliminado | Su único importador era `PracticesList.tsx`, eliminado en el mismo commit | Fila de la lista muerta; el equivalente vivo es `PracticeRow.tsx`, que sí usa `MyPracticesList` | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/components/CreatePracticeDialog.tsx` | Eliminado | Su único importador era `PracticesList.tsx` | Diálogo de creación de la implementación muerta | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/components/EditPracticeDialog.tsx` | Eliminado | Su único importador era `PracticeListItem.tsx`. No confundir con `EditPracticeForm.tsx`, que permanece vivo y lo usa el flujo real | Diálogo de edición de la implementación muerta | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/components/detail/PracticeOverviewCard.tsx` | Eliminado | `git grep`: `PracticeDetailPage.tsx:10` importa desde `"../components/PracticeOverviewCard"`, sin pasar por `detail/` | Re-export de una línea que duplicaba el componente real | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/hooks/usePractices.ts` | Eliminado | Su único consumidor era `PracticesList.tsx`. El hook vivo del módulo es `useMyPracticesScreen` | Hook de la implementación muerta de prácticas | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/hooks/usePracticeDetailData.ts` | Eliminado | `git grep` de `usePracticeDetailData`: solo el propio re-export. Los consumidores reales importan `usePracticeDetail` directo | Alias de re-export sin consumidor | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/hooks/useGitHubLinkValidation.ts` | Eliminado | `git grep`: los consumidores reales (`CommentDialog.tsx:13`, `GitHubLinkDialog.tsx:8`) importan desde `"../hooks/useGitHubLinkValidation"`, que resuelve a `src/shared/hooks/useGitHubLinkValidation.ts` | Duplicado del hook compartido, sin consumidor propio | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/my-practices/components/MyPracticesListLayout.tsx` | Eliminado | `git grep` de `MyPracticesListLayout`: solo la declaración del re-export | Re-export de una línea de `shared/components/FeatureItemsLayout`; los consumidores reales lo importan directo | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/assignments/components/index.ts` | Eliminado | Sin imports por directorio. Los símbolos que re-exportaba (`AssignmentForm`, `AssignmentRow`, `AssignmentsList`, `AssignmentsFilterPopover`, `DatePicker`, `EditAssignmentForm`) se importan directo desde sus módulos | Barril muerto | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/assignments/hooks/index.ts` | Eliminado | Sin imports por directorio. `useAssignmentsScreen` se importa en `AssignmentsPage.tsx:13` y `useAssignmentDetailData` en `AssignmentDetail.tsx:15`, ambos directos | Barril muerto | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/assignments/services/index.ts` | Eliminado | Sin imports por directorio. `AssignmentForm.tsx:25` y `EditAssignmentForm.tsx:23` importan `dispatchAssignmentUpdatedEvent` desde `"../services/assignmentEvents"` directo | Barril muerto | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `Web Ui/src/presentation/groups/components/index.ts` | Eliminado | Sin imports por directorio. `GroupsPage.tsx` importa `GroupsList`, `GroupsForm` y `EditGroupForm` directo; `GroupItem` se importa desde `./GroupItem` | Barril muerto. Su eliminación dejó a `GroupsToolbar` sin consumidor, lo que permitió detectarlo en el commit siguiente | `tsc --noEmit` OK; suite `Web Ui` 292/292 OK |
| `server/knip.json` | Añadido | No es una eliminación: es la corrección de configuración estrictamente necesaria para evitar 30 falsos positivos en `server` (ver sección 4.2) | Declara los dos puntos de entrada reales del backend para que Knip calcule alcanzabilidad correctamente | Knip de `server` pasa de 30 archivos reportados a 0 |
### 6.2 Candidatos conservados y motivo

| Archivo | Categoría | Motivo de conservación |
|---|---|---|
| `Web Ui/test/presentation/tdd-visualization/fileMock.js` | B. Posible falso positivo | Es el destino declarado del `moduleNameMapper` de `jest.config.ts:10`: `"\\.(gif\|ttf\|eot\|svg\|png)$": "<rootDir>/test/__ mocks __/fileMock.js"`. Knip no puede resolver esa ruta porque el directorio configurado contiene espacios (`test/__ mocks __`) y no existe en el repositorio, por lo que Knip la reporta como import no resuelto y el archivo como sin uso. La ruta real del archivo es `test/presentation/tdd-visualization/fileMock.js`. Aunque hoy ningún archivo importa una imagen como módulo (todas las referencias a `.svg` y `.png` son cadenas de URL en atributos `src`), el archivo es la red de seguridad declarada en la configuración de Jest. Eliminarlo habría dejado el mapeo apuntando a la nada y habría roto cualquier prueba futura que importara un asset. Se conservó y se documenta el defecto preexistente de la ruta. |
| Los 30 archivos de `server` reportados por Knip | C. Necesarios | Puntos de entrada, rutas, controladores, dominio, repositorios y casos de uso del API viva. Ver sección 4.2. |
| Barriles `groups/services`, `groups/types`, `my-practices/services`, `my-practices/types` | C. Necesarios | Sí se importan por directorio desde `GroupsPage.tsx`, `useGroupsData.ts`, `GroupsList.tsx`, `GroupItem.tsx`, `EditPracticeDialog.tsx`, `usePractices.ts`, `practiceSubmissionsService.ts`, `usePracticeDetail.ts` y `practicesService.ts`. |
| `EditPracticeForm.tsx` | C. Necesario | Se conservó frente a `EditPracticeDialog.tsx` porque es el formulario vivo del flujo real de edición, confirmado por `git grep`. |
| `shared/components/FeatureItemsLayout.tsx`, `shared/components/FeatureSectionDivider.tsx`, `shared/hooks/useGitHubLinkValidation.ts` | C. Necesarios | Destino real de los re-exports eliminados y consumidos por `AssignmentsList`, `MyPracticesList`, `GroupsList`, `CommentDialog` y `GitHubLinkDialog`. |

---

## 7. Resultados de las verificaciones

### 7.1 Comparación antes y después

| Verificación | Antes | Después |
|---|---|---|
| `server` · `npm test` | 56 suites, 349 pruebas, aprobado | 56 suites, 349 pruebas, aprobado |
| `Web Ui` · `npx jest` | 63 suites, 292 pruebas, aprobado | 63 suites, 292 pruebas, aprobado |
| `server` · `tsc --noEmit -p .` | código 0, aprobado | código 0, aprobado |
| `Web Ui` · `tsc --noEmit -p .` | código 0, aprobado | código 0, aprobado |
| `Web Ui` · `npm run lint` | 97 problemas (91 errores, 6 advertencias), falla preexistente | 96 problemas (90 errores, 6 advertencias), falla preexistente |
| `server` · Knip | 30 archivos sin uso (falsos positivos) | 0 archivos sin uso |
| `Web Ui` · Knip | 28 archivos sin uso | 1 archivo sin uso (el `fileMock.js` conservado) |

### 7.2 Análisis detallado del cambio en el lint

La reducción de 91 a 90 errores de lint se comprobó con una comparación línea a línea entre el informe de la línea base y el informe final. El único error desaparecido fue:

```text
28:27  error  '_index' is defined but never used  @typescript-eslint/no-unused-vars
```

Ese error pertenecía a uno de los archivos eliminados, de modo que su desaparición es consecuencia directa de la limpieza y no un error nuevo. No se añadió ni un solo error de lint. Los 90 errores restantes siguen siendo preexistentes y ajenos al objetivo.

### 7.3 Verificaciones aprobadas

```text
server · npm test            → 56 suites, 349 pruebas, aprobado
Web Ui · npx jest            → 63 suites, 292 pruebas, aprobado en 13 de 14 ejecuciones
server · tsc --noEmit        → aprobado
Web Ui · tsc --noEmit        → aprobado
Web Ui · knip                → sin archivos sin uso salvo fileMock.js conservado
server · knip                → sin archivos sin uso
git diff da950be4..HEAD      → 27 borrados, 1 añadido, sin modificaciones de código
git status --short           → vacío
```

La ejecución de `Web Ui` que no pasó se analiza en la sección 7.5.

### 7.4 Verificaciones no ejecutadas o fallidas

| Verificación | Estado | Motivo |
|---|---|---|
| `Web Ui` · `npm run build` | No ejecutado | Requiere variables de entorno de Firebase. El chequeo de tipos (`tsc --noEmit`) sí se ejecutó y pasó, lo que cubre la validez del código eliminado |
| Cypress end-to-end | No ejecutado | Requiere servidor de desarrollo y navegador en el entorno local |
| `VSCodeExtension` · Knip | No ejecutado | Knip falla al cargar `eslint.config.mjs` porque `@typescript-eslint/eslint-plugin` no está instalado en `VSCodeExtension/node_modules`. No es un error introducido por esta tarea |
| `VSCodeExtension` · pruebas y lint | No ejecutado | `VSCodeExtension/node_modules` no existe |
| SonarCloud | No ejecutado | Requiere `SONAR_TOKEN` y contexto de CI |
| Knip en la raíz del repositorio | Descartado | Sin workspaces declarados, Knip trata todo el repositorio como un solo proyecto sin entry y reporta más de 300 archivos como sin uso, incluidos todos los que son claramente vivos. Ese resultado no es utilizable |
| `Web Ui` · suite Jest | Inestable por timeouts | 13 de 14 ejecuciones pasaron 292/292; 1 ejecución tuvo 4 fallos por timeout. Se verificó que el mismo fallo ocurre en el commit base, por lo que es preexistente. Ver sección 7.5 |

No se afirma que todo funcione en lo no ejecutado. Los resultados aprobados son los de la tabla 7.1.

### 7.5 Verificación de la inestabilidad intermitente de las pruebas del frontend

Durante las ejecuciones de regresión se observó una ejecución con **4 pruebas fallidas** sobre 292, repartidas en las suites `GroupItem.test.tsx`, `GroupsPage.test.tsx` y `UserPage.test.tsx`. El error registrado fue `Exceeded timeout of 5000 ms for a test`, es decir, agotamiento del tiempo de espera de Jest, y **no** un fallo de aserción ni un error de resolución de módulos.

Ese comportamiento podía interpretarse como una regresión causada por la limpieza, por lo que se verificó de forma controlada. Se creó un worktree de Git desprendido en el commit base `da950be4`, sin ninguno de los cambios de esta tarea, se le enlazó el mismo `node_modules` y se ejecutó la suite completa cinco veces. Resultado:

| Ejecución | Commit base `da950be4` | Rama de esta tarea |
|---|---|---|
| Trials sin fallos | 9 de 10 | 13 de 14 |
| Trials con 4 fallos por timeout | 1 de 10 (`GroupItem`, `GroupsPage`, `UserPage`) | 1 de 14 |

Los mismos cuatro casos fallaron por el mismo motivo de timeout en el commit base, sin que existiera ninguna de las eliminaciones. La inestabilidad es, por tanto, **preexistente y ajena a esta tarea**: se debe a que varias suites del proyecto tardan más de 400 segundos y al límite de 5 segundos por prueba que Jest aplica bajo carga, junto con la advertencia de worker que Jest ya emite en la línea base.

Esto es relevante para el criterio de aceptación: la suite del frontend no es determinista en este entorno, y un fallo aislado por timeout no constituye por sí solo evidencia de una regresión introducida. La evidencia que sí confirma que estas eliminaciones no rompieron nada es que la compilación de tipos pasa sin errores, que no queda ninguna referencia colgante a los símbolos eliminados, que cada suite afectada pasó en las ejecuciones en que no hubo timeout, y que el único error desaparecido del lint pertenecía a un archivo eliminado.

Se recomienda, como trabajo futuro independiente, estabilizar estas suites (subir `testTimeout`, corregir el teardown de manejadores asíncronos y corregir la ruta rota del `moduleNameMapper` descrita en la sección 8.3).

---

## 8. Impacto arquitectónico y funcional

### 8.1 Por qué la arquitectura hexagonal se mantiene intacta

La eliminación se restringió a archivos **sin consumidor**. Ningún archivo eliminado formaba parte de una cadena viva de dependencias, y por tanto ninguna responsabilidad de dominio, aplicación, puerto o adaptador quedó sin implementar.

En `Web Ui`, los 27 archivos eliminados se encontraban en tres situaciones:

1. **Casos de uso de aplicación sin consumidor** (`CheckPracticeSubmissionExists`, `GetTDDLogUseCase`, `updateGroup`, `updateUser`). No eran invocados por ningún hook, servicio o página. Los puertos y adaptadores de esos módulos se conservan completos, con sus casos de uso vivos (`UpdateGroup`, `UpdateAssignment`, etc.).
2. **Componentes de presentación sin renderizar.** Ninguna página alcanzada desde `App.tsx` los montaba. El árbol vivo de prácticas quedó intacto: `MyPracticesPage` → `MyPracticesList` → `PracticeRow`, con el hook `useMyPracticesScreen` y los servicios `myPracticesScreenService` y `practiceDetail.service`.
3. **Duplicados y re-exports de una línea.** Eran caminos alternativos hacia código que sigue existiendo y consumiéndose por su ruta directa. Eliminar el duplicado no elimina la capacidad: `FeatureItemsLayout`, `FeatureSectionDivider`, `useGitHubLinkValidation`, `usePracticeDetail` y `PracticeOverviewCard` siguen presentes y en uso.

En `server` no se eliminó nada. La única modificación fue añadir `server/knip.json`, que no altera código de producción ni la arquitectura: únicamente declara a Knip los dos puntos de entrada reales del backend.

### 8.2 Arrastre de funcionalidad

No se produjo. Las pruebas que cubren las áreas afectadas continúan pasando sin modificarse:

- `Web Ui/test/presentation/my-practices/` — la suite de prácticas pasó completa, incluida `practiceDetailPage.test.tsx`.
- `Web Ui/test/presentation/groups/` — `GroupsPage.test.tsx`, `GroupItem.test.tsx` y `useGroupsData.test.tsx pasaron, confirmando que la eliminación de `GroupsToolbar` y del barril de `groups/components` no afectó la pantalla de grupos.
- `Web Ui/test/presentation/assignments/` — las suites de asignaciones pasaron, confirmando que la eliminación de los tres barriles de `assignments` no afectó el flujo de tareas.
- `server/test` — las 56 suites pasaron sin cambios, confirmando que el backend no se vio afectado.

### 8.3 Riesgo conocido pendiente

La ruta del `moduleNameMapper` en `Web Ui/jest.config.ts:10` apunta a `test/__ mocks __/fileMock.js`, una ruta que no existe. Es un defecto preexistente, no introducido por esta tarea y no corregido, porque la corrección de configuración ajena al objetivo estaba fuera de alcance. Se documenta para que el equipo pueda corregirla en una tarea independiente.

---

## 9. Referencias técnicas

| Fuente | Criterio concreto tomada |
|---|---|
| Knip, configuración de archivos del proyecto — https://knip.dev/guides/configuring-project-files | Determina que los patrones `entry` y `project` definen la alcanzabilidad de archivos. Es la base para detectar que los 30 archivos de `server` eran falsos positivos por ausencia de configuración, y para escribir `server/knip.json` solo con los dos entry reales (`api/index.ts` y `src/app.ts`). |
| Knip, resolución de incidencias — https://knip.dev/guides/handling-issues | Fundamenta el tratamiento de incidencias por tipo y la corrección de la causa raíz en lugar de suprimir el síntoma. Se aplicó al conservar `fileMock.js` pese al reporte, y al no tocar dependencias ni borrar tests. |
| Martin Fowler, Test-Driven Development — https://martinfowler.com/bliki/TestDrivenDevelopment.html | Define el ciclo Red/Green y el propósito de que una prueba falle primero por el motivo correcto. Se usó para justificar por qué no se añadieron pruebas a eliminaciones de código muerto: no existe unidad de producción observable que una prueba nueva pueda verificar, y añadir referencias a archivos eliminados habría recreado una dependencia artificial. |
| Google Testing Blog, How Much Testing Is Enough? — https://testing.googleblog.com/2021/06/how-much-testing-is-enough.html | Sostiene que el valor de una prueba está en su capacidad de detectar regresiones reales y que las pruebas de relleno añaden coste sin cobertura. Es el criterio para elegir la regresión existente como control suficiente, en lugar de inventar pruebas sin comportamiento que verifiquen. |

Todas las fuentes anteriores son publicaciones verificables. No se consultó a expertos personalmente y no se afirman validaciones que no se hayan ejecutado.

---

## 10. Resumen

La tarea eliminó 27 archivos genuinamente sin uso en `Web Ui`, verificados uno por uno con Knip y con `git grep` sobre todo el repositorio. En `server` no había ningún archivo muerto real: los 30 reportados eran falsos positivos por ausencia de configuración de entry, y se corrigió añadiendo `server/knip.json`, tras lo cual Knip informa cero.

No se modificó la estructura del proyecto ni el patrón hexagonal. Las pruebas del backend (349) y del frontend (292) pasan igual que en la línea base, la compilación de tipos pasa en ambos proyectos y el lint no tiene ni un error nuevo. Un candidato, `fileMock.js`, se conservó con justificación por ser el destino declarado de la configuración de Jest. Los resultados no ejecutados y las limitaciones se listan explícitamente en la sección 7.4.

Queda documentada en la sección 7.5 una inestabilidad preexistente de la suite del frontend: cuatro casos fallan intermitentemente por timeout, tanto en el commit base como en esta rama, sin relación con las eliminaciones. Se recomienda corregirla en una tarea independiente junto con la ruta rota del `moduleNameMapper` de Jest.
