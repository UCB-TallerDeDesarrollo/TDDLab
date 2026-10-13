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
