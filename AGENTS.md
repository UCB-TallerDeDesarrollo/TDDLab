# Instrucciones para agentes de IA

Estas instrucciones se aplican a todo el repositorio. Antes de trabajar en una carpeta, lee también cualquier `AGENTS.md` más específico que exista allí. El flujo detallado por tarea está en [README.md](README.md).

## Contexto del proyecto

TDDLab es una plataforma educativa para practicar y revisar TDD. El repositorio contiene tres componentes principales:

- `Web Ui/`: aplicación web React, TypeScript y Vite para grupos, tareas, prácticas, entregas, administración y visualización de ciclos TDD.
- `server/`: API Express y TypeScript. Integra PostgreSQL, Firebase Admin, GitHub y el asistente de IA.
- `VSCodeExtension/`: extensión de VS Code para ejecutar pruebas, mostrar una línea de tiempo TDD y trabajar con una terminal de la extensión.

El inicio de sesión con Google/Firebase y la integración con repositorios GitHub son responsabilidades distintas. GitHub también se usa para leer commits y datos de pruebas que alimentan la visualización TDD. No elimines una de esas capacidades por encontrar una referencia compartida a `GitHub`.

## Flujo obligatorio antes de modificar archivos

Para cada issue o tarea del sprint:

1. Lee el issue, sus criterios de aceptación, restricciones y exclusiones. Comprueba si hay otro `AGENTS.md` que aplique.
2. Inspecciona la rama y el estado real del workspace:

   ```bash
   git branch --show-current
   git status --short --branch
   git log -1 --oneline
   ```

3. Identifica los cambios ya presentes. No los descartes, sobrescribas, muevas a otra rama ni los incluyas en tu tarea sin entender su propósito.
4. Sigue el comportamiento afectado desde su punto de entrada hasta los adaptadores y las pruebas: ruta o pantalla, servicio/controlador, caso de uso, contrato y repositorio cuando existan.
5. Localiza pruebas, configuración, comandos, assets y referencias estáticas o dinámicas relacionados. Usa búsquedas globales como `rg` antes de asumir que un archivo no se utiliza.
6. Comparte un checkpoint breve con la rama, estado existente, alcance entendido, capas afectadas, enfoque y verificaciones previstas. Si falta un dato que cambie el comportamiento esperado, pregunta al desarrollador antes de implementar. Si el issue es claro, continúa después del checkpoint.

Trabaja sobre la rama de la tarea que ya está abierta. No cambies de rama ni renombres ramas automáticamente. La convención propuesta para enlazar ramas con issues está documentada en el README; el equipo debe acordarla antes de tratarla como política existente.

## Arquitectura y límites de cambio

Mantén la separación de responsabilidades que usa el componente afectado:

- En `Web Ui/src/app/` están las rutas, navegación e integración global; `Web Ui/src/presentation/` organiza pantallas por funcionalidad; `Web Ui/src/shared/` contiene elementos transversales; `Web Ui/src/modules/` agrupa aplicación, dominio, contratos y repositorios por módulo.
- En `server/src/routes/` se declaran rutas HTTP; `server/src/controllers/` traduce solicitudes y respuestas; `server/src/modules/` organiza casos de uso, modelos de dominio y repositorios; `server/src/config/`, `server/src/middleware/` e `Infrastructure/` conectan tecnologías externas.
- En `VSCodeExtension/src/`, `domain/` define modelos y algunos puertos, `application/` coordina casos de uso, `infrastructure/` integra VS Code y procesos externos, y `presentation/` registra vistas y comandos.

La inversión de dependencias no está aplicada de forma idéntica en todas las áreas. Hay puertos explícitos en módulos como TDD Cycles y en la extensión; otras partes inyectan repositorios concretos. Al modificar código, conserva la convención local y evita introducir dependencias nuevas desde dominio/aplicación hacia React, Express, PostgreSQL, Firebase, Axios, GitHub o VS Code. No conviertas una tarea funcional en una migración arquitectónica; esa migración requiere un issue y criterios propios.

Implementa el cambio como un recorrido vertical y acotado cuando una funcionalidad cruce varias capas. No dupliques reglas de negocio en componentes, controladores y adaptadores. Mantén compatibilidad de contratos, rutas, comandos de VS Code, permisos y formatos de datos según el alcance del issue.

### Tareas de eliminación o limpieza

Antes de borrar un archivo o símbolo, demuestra que no participa en:

- imports, exports, alias o carga dinámica;
- rutas, comandos y contribuciones declaradas en `package.json` de la extensión;
- selectores CSS, nombres de assets, URLs públicas, configuración o scripts de build/deploy;
- pruebas, mocks, fixtures, documentación o datos de ejemplo que todavía respalden una capacidad vigente.

Revisa las referencias de producción y pruebas. Si el issue retira una capacidad, actualiza las pruebas para comprobar el comportamiento resultante, incluida la ausencia del punto de entrada retirado cuando sea relevante. No elimines pruebas solo porque el archivo probado desapareció. Para cambios sobre GitHub, conserva explícitamente el análisis de repositorios y commits cuando el alcance retire autenticación u otra función distinta.

## Desarrollo y verificación

- Para cambios de comportamiento, sigue Red–Green–Refactor cuando el módulo permita una prueba enfocada: primero expresa el comportamiento, implementa el mínimo cambio y luego refactoriza sin ampliar el issue.
- Añade o ajusta pruebas en la ubicación que ya utiliza el componente: `Web Ui/test/`, `server/test/` o junto a la extensión en `VSCodeExtension/src/`.
- Ejecuta las pruebas y compilaciones relevantes del componente afectado. Para cambios que cruzan componentes, valida cada componente implicado. No ejecutes comandos desde la raíz suponiendo que el monorepo tiene scripts: el `package.json` raíz no define scripts de trabajo.
- Usa los comandos locales que figuran en el README y confirma cualquier comando adicional en el `package.json` correspondiente.
- No inventes resultados. Si una verificación no se ejecutó, indica cuál y por qué. Si falla, informa el resultado y si el fallo parece previo al cambio.
- Antes de entregar, revisa `git diff --check`, `git status --short`, el diff completo y su relación con los criterios del issue. Evita reformateos o limpiezas ajenas al alcance.
- No agregues secretos, tokens, archivos `.env` ni credenciales a Git. No cambies dependencias o lockfiles si el issue no lo necesita.

## Informe al desarrollador

Al finalizar cada tarea, informa:

1. Issue y rama revisados.
2. Cambios realizados y capas/componentes afectados.
3. Criterios de aceptación cubiertos y evidencia en el diff.
4. Comandos de prueba/build ejecutados y resultados exactos.
5. Riesgos, verificaciones pendientes o bloqueos.

El desarrollador asignado conserva la responsabilidad de revisar el diff y decidir si la tarea está lista para integrarse y cerrarse.
