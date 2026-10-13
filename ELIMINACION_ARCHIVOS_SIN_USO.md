# Leo — Eliminación de archivos sin uso

## Objetivo y punto de partida

Reducir código y recursos abandonados que dificultan identificar la implementación vigente de TDDLab. La limpieza se divide en commits revisables por responsabilidad.

- Rama base: `prime_tddlab_master`, actualizada desde `origin`.
- Commit base: `f509d9195100b5e50da8c6929cb78f955aab0bdb`.
- Rama de trabajo: `prime_tddlab_master-feat-eliminar-archivo`.
- Fecha de ejecución: 12 de octubre de 2026. Los commits conservan sus fechas reales.

## Estructura revisada

| Área | Responsabilidad y entradas comprobadas |
| --- | --- |
| `Web Ui/` | React, TypeScript y Vite. `index.html` carga `src/main.tsx`; `App.tsx` integra rutas y páginas mediante imports dinámicos. `presentation/` contiene páginas, componentes, hooks, servicios y tipos; `modules/` contiene casos de uso, contratos y repositorios; `shared/` aporta elementos reutilizables. |
| `server/` | Express y PostgreSQL. `src/app.ts` registra rutas; cada ruta conecta controladores con casos de uso y repositorios. `api/index.ts` es la entrada de Vercel. Se revisaron también autenticación, configuración y pruebas. |
| `VSCodeExtension/` | `package.json` declara la entrada compilada `out/extension.js`, comandos y vistas. `src/extension.ts` registra terminal, timeline y menú. Las plantillas HTML/CSS y ayuda se cargan mediante filesystem; los iconos se declaran en el manifiesto o se cargan por nombre. |
| `Web Ui/test/`, `server/test/` | Jest descubre pruebas automáticamente. Cypress usa `Web Ui/test/cypress/`, indicado expresamente por `Web Ui/cypress.config.ts`. Los tests y sus mocks se consideran consumidores válidos. |
| Recursos y herramientas | Vite usa `Web Ui/public/`; Firebase publica `Web Ui/dist/`. Se revisaron `public/` y `cypress/` de la raíz, el HTML antiguo en `Web Ui/build/`, manifiestos, configuraciones de editor, workflow y Sonar. |
| Submódulo | `VSCodeExtension/resources/TDDLabBaseProject` es un proyecto externo declarado en `.gitmodules`. La limpieza no modifica su contenido ni su puntero. |

## Criterio de eliminación

1. Inventariar archivos versionados con `git ls-files`.
2. Construir el grafo de imports, reexports, `require`, imports dinámicos y mocks mediante el parser TypeScript instalado en el frontend.
3. Recorrerlo desde las entradas ejecutables, configuraciones, declaraciones de tipos y pruebas. Detectar también cadenas completas de archivos que solamente se importan entre sí.
4. Confirmar candidatos mediante búsquedas de rutas, nombres y símbolos con `rg`, y lectura de los consumidores activos. Revisar especialmente rutas CSS/HTML, URLs públicas, manifiestos y lecturas de filesystem.
5. Ejecutar pruebas y compilación antes y después de cada bloque aplicable. Un fallo previo se registra; no se presenta como una validación exitosa.

La ausencia de imports por sí sola no autoriza borrar pruebas, declaraciones `.d.ts`, configuraciones, entradas ejecutables o recursos cargados por nombre. No se eliminan dependencias de los manifiestos como parte de esta tarea.

## Incrementos previstos

1. Registrar arquitectura, alcance y criterios de revisión.
2. Eliminar código y recursos abandonados de la extensión, recursos públicos duplicados, scaffolding inactivo y archivos generados de herramientas.
3. Eliminar módulos y componentes huérfanos del frontend, incluyendo la implementación antigua de la lista de prácticas y wrappers/reexports sin consumidores.
4. Registrar el inventario final, resultados de validación y evidencias funcionales por incremento.

## Consideración de la retroalimentación del sprint

Cada incremento debe explicar qué archivos se retiraron, por qué no participan en el flujo vigente y cómo se verificó el resultado. Los commits de esta sesión evidencian progreso técnico secuencial; no demuestran trabajo distribuido durante días anteriores del sprint. Para futuros sprints se debe iniciar el análisis y registrar incrementos desde los primeros días, sin alterar artificialmente fechas de Git.

## Incremento 2 — Extensión y recursos abandonados

Se retiran 45 archivos. El manifiesto de la extensión, los comandos registrados, las rutas web, los endpoints y las pruebas existentes mantienen sus implementaciones activas.

| Archivos retirados | Justificación y funcionalidad vigente |
| --- | --- |
| `VSCodeExtension/src/FeatureConfigLoader.ts` | No tiene consumidores; pretendía leer `resources/features.json`, archivo que tampoco existe en la rama. |
| `VSCodeExtension/src/application/runTest/ExecuteTestCommand.ts` | No tiene consumidores. El comando registrado `TDD.runTest` delega en `TerminalViewProvider.executeCommand('npm test')`. Se conservan los puertos y ejecutores que sí forman parte del grafo activo. |
| `VSCodeExtension/src/domain/terminal/TerminalRepository.ts` | Contrato sin implementaciones ni consumidores. La terminal activa usa `TerminalPort` y `VSCodeTerminalRepository`. |
| `VSCodeExtension/src/data.json` | Datos de ejemplo sin lectores. La timeline obtiene datos mediante `TimelineRepository` y estado de workspace. |
| `VSCodeExtension/jest.config.js` | Configuración abandonada: el script `test` usa `vscode-test` y `.vscode-test.mjs`; la única suite existente usa Mocha. El manifiesto no instala Jest ni ts-jest. |
| `VSCodeExtension/media/style.css`, `images/github-color.png`, `resources/TddLab.png`, `resources/icono.png` | No se nombran en proveedores, plantillas ni manifiesto. Se conservan `images/git.png`, `resources/TddLab_v2.png`, las plantillas de terminal/timeline y `TerminalHelp.txt`. |
| `VSCodeExtension/.scannerwork/.sonar_lock` y cuatro `.DS_Store` | Archivos generados por herramientas o el sistema operativo. Se agrega `.scannerwork/` a `.gitignore`; `.DS_Store` ya estaba ignorado. |
| Los 24 archivos de `public/` en la raíz | HTML de bienvenida de Firebase y recursos de una carpeta que no es el directorio público de la app. Vite se ejecuta en `Web Ui/`, cuya carpeta `public/` conserva todos los recursos referenciados por la landing, navegación y autenticación. Firebase publica `Web Ui/dist/`. |
| Los tres archivos de `cypress/` en la raíz | Scaffolding de ejemplo sin pruebas ni configuración que lo utilice. La configuración activa apunta a `Web Ui/test/cypress/`; se conservan sus specs y soporte. |
| `Web Ui/build/index.html` | HTML antiguo fuera del directorio de salida de Vite y Firebase. La entrada vigente es `Web Ui/index.html`. Se agrega `/build/` al `.gitignore` del frontend para evitar versionar esa salida antigua. |
| `Web Ui/public/config.png`, `Web Ui/public/landing/landing.jpeg`, `Web Ui/public/landing/landing.svg` | Recursos sin URLs referenciadas por código, estilos, pruebas o HTML activo. Se conservan el favicon `vite.svg`, `Logo.png`, los isotipos y los recursos utilizados por la landing. |

Validación de la extensión: `npm run compile` antes y después de retirar sus archivos. Verificación de reglas de exclusión con `git check-ignore` y de diferencias con `git diff --check`.

## Incremento 3 — Código huérfano del frontend

Se retiran 29 archivos que no son alcanzables desde `main.tsx`, las páginas cargadas por `App.tsx`, configuraciones ni pruebas. Se comprobaron imports directos, imports dinámicos y reexports: algunos componentes antiguos se importaban entre sí, pero ningún consumidor activo llegaba a esa cadena.

| Grupo | Cambios y efecto sobre el mantenimiento |
| --- | --- |
| Lista antigua de prácticas | Se eliminan `PracticesList`, `PracticeListItem`, `CreatePracticeDialog`, `EditPracticeDialog` y `usePractices`. La ruta `/mis-practicas` usa `MyPracticesPage`, `MyPracticesList`, `MyPracticesForm`, `EditPracticeForm` y `useMyPracticesScreen`; estos mantienen creación, edición, eliminación, ordenamiento y navegación al detalle. Así se evita mantener dos implementaciones de un mismo flujo. |
| Wrappers y estilos de prácticas | Se eliminan `MyPracticesListLayout`, el reexport `components/detail/PracticeOverviewCard`, el alias `usePracticeDetailData`, el hook local `useGitHubLinkValidation` y `PracticeDetail.css`. La implementación activa usa directamente el layout compartido, `components/PracticeOverviewCard`, `usePracticeDetail`, el hook de `shared/` y `PracticeDetailPage.css`. Se conserva `pages/PracticeDetail.tsx` porque `App.tsx` sí lo carga. |
| Tareas | Se eliminan `AssignmentsListLayout` y tres `index.ts` sin consumidores. Las páginas y pruebas importan directamente los componentes/hooks/servicios utilizados; se mantiene `FeatureItemsLayout`. |
| Grupos | Se eliminan `GroupsToolbar` y el `index.ts` de componentes que lo reexportaba. `GroupsPage` usa el encabezado y los controles compartidos y conserva los formularios, la lista y los controles de ordenamiento vigentes. |
| Usuarios | Se eliminan `UsersDivider`, `RemoveUserDialog`, `UsersFeedbackDialog` y el archivo vacío `users.types.ts`. Ninguna página o prueba los consume; las pantallas actuales conservan sus componentes compartidos de confirmación, feedback y separación. |
| Navegación y asistente IA | Se eliminan `TDDLabLogo`, `loginComponentStyles.css` y `AIResultSection`. `MainMenu` renderiza el logo vigente y el login usa estilos MUI. `AIAssistantPage` compone `ChatPanel` y `AssistantActions`. |
| Casos de uso y utilidades | Se eliminan cuatro wrappers sin consumidores y dos utilidades sin llamadas. Se conservan `GetTDDLogs`, los repositorios, contratos y servicios utilizados; por ejemplo, `tddVisualization.service.ts` consume `GetTDDLogs`, no `GetTDDLogUseCase`. |

Inventario exacto de este incremento, relativo a `Web Ui/src/`:

```text
app/navigation/components/TDDLabLogo.tsx
app/navigation/styles/loginComponentStyles.css
modules/PracticeSubmissions/Application/CheckPracticeSubmissionExists.ts
modules/TDDCycles-Visualization/application/GetTDDLogUseCase.ts
modules/User-Authentication/application/updateGroup.ts
modules/Users/application/updateUser.ts
presentation/ai-assistant/components/AIResultSection.tsx
presentation/assignments/components/AssignmentsListLayout.tsx
presentation/assignments/components/index.ts
presentation/assignments/hooks/index.ts
presentation/assignments/services/index.ts
presentation/groups/components/GroupsToolbar.tsx
presentation/groups/components/index.ts
presentation/my-practices/components/CreatePracticeDialog.tsx
presentation/my-practices/components/EditPracticeDialog.tsx
presentation/my-practices/components/MyPracticesListLayout.tsx
presentation/my-practices/components/PracticeListItem.tsx
presentation/my-practices/components/PracticesList.tsx
presentation/my-practices/components/detail/PracticeOverviewCard.tsx
presentation/my-practices/hooks/useGitHubLinkValidation.ts
presentation/my-practices/hooks/usePracticeDetailData.ts
presentation/my-practices/hooks/usePractices.ts
presentation/my-practices/pages/PracticeDetail.css
presentation/users/components/UsersDivider.tsx
presentation/users/components/dialogs/RemoveUserDialog.tsx
presentation/users/components/dialogs/UsersFeedbackDialog.tsx
presentation/users/types/users.types.ts
utils/adaptarDatos.ts
utils/localStorageService.ts
```

## Resultado medido

- Inventario inicial: 724 archivos versionados.
- Archivos retirados: 74; 33 del frontend, 10 de la extensión, 24 de `public/`, tres de `cypress/` y cuatro `.DS_Store` (tres de estos últimos estaban en el servidor).
- Contenido retirado del árbol versionado: 56.969.143 bytes, aproximadamente 54,33 MiB. Este valor corresponde a los blobs eliminados; no implica borrar su historia de Git.
- Archivos de código/estilos/datos en `Web Ui/src/`: de 286 a 257. En la extensión: de 23 a 19. Las 124 fuentes del servidor se conservan.
- El grafo posterior no detectó archivos `.ts`, `.tsx` o `.json` huérfanos en `src/` con las entradas y pruebas consideradas. Las únicas dos hojas CSS sin imports son las plantillas de la extensión, cuyo uso por filesystem se verificó manualmente.
- Las 21 URLs de recursos públicos encontradas en el código del frontend siguen resolviendo a archivos de `Web Ui/public/`; también se conserva el favicon referenciado por `index.html`.
- Ninguna prueba, manifiesto, lockfile, configuración de rutas o puntero del submódulo cambió.

## Evidencias por commit

| Incremento | Evidencia y resultado |
| --- | --- |
| Análisis | [7553d92b](https://github.com/UCB-TallerDeDesarrollo/TDDLab/commit/7553d92b): registra entradas, capas, criterios para distinguir archivos huérfanos de recursos cargados dinámicamente y el plan de trabajo incremental. |
| Extensión y recursos | [e6086a64](https://github.com/UCB-TallerDeDesarrollo/TDDLab/commit/e6086a64): elimina 45 archivos abandonados y añade exclusiones para salidas antiguas de build y Sonar. La extensión compila antes y después; conserva comandos, vistas, iconos y plantillas utilizados. |
| Frontend | [57944c9e](https://github.com/UCB-TallerDeDesarrollo/TDDLab/commit/57944c9e): elimina 29 archivos huérfanos, incluyendo una cadena completa de componentes de prácticas que no llegaba a ninguna ruta. Los consumidores activos no tienen imports ni reexports hacia los archivos eliminados y TypeScript valida el frontend después de la limpieza. |

## Alcance de la validación inicial

Las primeras ejecuciones completas de Jest se interrumpieron y no produjeron un resumen final. Sus suites marcadas `PASS` se consideran evidencia parcial, no una certificación de toda la suite. En el servidor se excluyó `build/` mediante opciones de CLI porque había compilados locales que duplicaban tests y mocks; su configuración versionada no se modificó.

El primer `npm run build` del frontend, lanzado junto con otras validaciones, completó TypeScript pero terminó por falta de memoria durante Vite (`Zone Allocation failed - process out of memory`). El resultado del build posterior se registra por separado. No se alteraron configuraciones de compilación ni límites de memoria para ocultar ese fallo.

## Validación final completada

| Comprobación | Resultado |
| --- | --- |
| Frontend: `npm run build` | Exitoso, código de salida 0. TypeScript valida todas las fuentes incluidas y Vite genera `dist/`; la etapa Vite terminó en 2 min 4 s. Hay una advertencia de tamaño de chunks; no impide generar el build. |
| Extensión: `npm run compile` | Exitoso antes y después de la eliminación, código de salida 0. Se retiraron además los `.js` y sourcemaps locales obsoletos correspondientes a las tres fuentes eliminadas para evitar que quedaran en `out/`. |
| Jest del frontend, pruebas dirigidas | 7 suites y 31 pruebas aprobadas; ninguna falló. Se valida ordenamiento/permisos de prácticas, estados y navegación de su detalle, autenticación, navegación de landing, datos de grupos, eliminación de usuario de un grupo y adaptación de datos para visualización TDD. |
| Recursos públicos del build | Los 22 archivos activos comprobados, incluido el favicon, coinciden por SHA-256 con sus fuentes. Los tres recursos públicos retirados del frontend ya no aparecen en `dist/`. |
| Referencias del bundle | Se comprobaron 214 referencias a JS/CSS desde el HTML y chunks generados: cero destinos ausentes. |
| Grafo y diferencias Git | Cero imports/reexports de archivos conservados hacia archivos eliminados; `git diff --check` sin errores; pruebas, dependencias, rutas, lockfiles y submódulo sin cambios. |

Pruebas dirigidas ejecutadas desde `Web Ui/`:

```powershell
npm test -- --runInBand --forceExit --coverage=false --runTestsByPath test/presentation/my-practices/services/myPracticesScreenService.test.ts test/presentation/my-practices/services/practiceDetail.service.test.ts test/presentation/landing/useLanding.test.ts test/presentation/auth/useAuth.test.ts test/presentation/groups/useGroupsData.test.tsx test/modules/Users/removeUserFromGroup.test.ts test/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter.test.ts
```

Esta validación dirigida no certifica toda la suite Jest ni pruebas E2E de Cypress. No se ejecutó el test de ejemplo Mocha de la extensión dentro de una ventana de VS Code; su verificación final fue de compilación y referencias de recursos.

Los logs locales de las ejecuciones se encuentran en `docs/cleanup-validation/`, directorio ignorado por la configuración existente del repositorio. La evidencia portable y versionada es este informe junto con los diffs de los commits.
