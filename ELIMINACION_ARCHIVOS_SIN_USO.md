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
2. Eliminar módulos y componentes huérfanos del frontend, incluyendo la implementación antigua de la lista de prácticas y wrappers/reexports sin consumidores.
3. Eliminar código y recursos abandonados de la extensión, recursos públicos duplicados, scaffolding inactivo y archivos generados de herramientas.
4. Registrar el inventario final, resultados de validación y evidencias funcionales por incremento.

## Consideración de la retroalimentación del sprint

Cada incremento debe explicar qué archivos se retiraron, por qué no participan en el flujo vigente y cómo se verificó el resultado. Los commits de esta sesión evidencian progreso técnico secuencial; no demuestran trabajo distribuido durante días anteriores del sprint. Para futuros sprints se debe iniciar el análisis y registrar incrementos desde los primeros días, sin alterar artificialmente fechas de Git.
