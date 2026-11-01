
# TDDLab - Instrucciones para agentes codificadores

## 1. Propósito

Este archivo define las reglas que deben seguir los agentes de IA
que colaboren en el desarrollo de TDDLab.

El objetivo es generar cambios consistentes, verificables y
alineados con las convenciones del equipo.

Estas instrucciones se aplican a todo el repositorio.

Antes de trabajar, consulta también la documentación de `harness/`.

## 2. Contexto del proyecto

TDDLab es una plataforma educativa orientada al aprendizaje
y seguimiento de Test-Driven Development (TDD).

El proyecto contiene tres componentes principales:

- `Web Ui/`: aplicación web desarrollada con React y TypeScript.
- `server/`: backend desarrollado con Express y TypeScript.
- `VSCodeExtension/`: extensión de Visual Studio Code.

El proyecto sigue principios de arquitectura hexagonal, aunque
su implementación puede variar entre componentes.

Consulta `harness/architecture.md` antes de modificar código.

## 3. Análisis obligatorio antes de modificar código

Antes de implementar una tarea:

1. Lee la descripción y los criterios de aceptación.
2. Verifica la rama activa con `git branch --show-current`.
3. Comprueba los cambios existentes con `git status --short`.
4. Identifica los archivos y componentes relacionados.
5. Revisa la implementación actual y sus pruebas.
6. Consulta las convenciones y arquitectura del proyecto.
7. Explica brevemente el enfoque antes de comenzar.

No sobrescribas cambios existentes sin comprenderlos.

No cambies de rama automáticamente.

Si falta información esencial, solicita aclaración.

## 4. Arquitectura y responsabilidades

Respeta la organización existente del componente afectado.

Principios generales:

- Domain: lógica y reglas del negocio.
- Application: coordinación de casos de uso.
- Infrastructure: integración con servicios externos.
- Presentation: interacción con usuarios.

No introduzcas dependencias innecesarias entre capas.

No realices refactorizaciones arquitectónicas fuera del
alcance de la tarea.

Consulta `harness/architecture.md` para más detalles.

## 5. Alcance de las modificaciones

- Modifica únicamente los archivos necesarios.
- Respeta los nombres y convenciones existentes.
- Evita agregar dependencias innecesarias.
- No elimines funcionalidades sin verificar sus referencias.
- No modifiques código ajeno a la tarea.
- No reformatees archivos que no necesiten cambios.

Si encuentras problemas no relacionados, repórtalos sin
corregirlos automáticamente.

## 6. Desarrollo guiado por pruebas

Cuando la tarea permita aplicar TDD, utiliza:

1. RED: crear o modificar una prueba que falle.
2. GREEN: implementar el código mínimo para aprobarla.
3. REFACTOR: mejorar el código manteniendo las pruebas.

Respeta la ubicación de pruebas existente.

No elimines pruebas para ocultar errores.

Si no es posible aplicar TDD, explica el motivo.

## 7. Verificación de cambios

Después de modificar código:

1. Ejecuta las pruebas relevantes.
2. Ejecuta compilación y lint cuando corresponda.
3. Revisa `git diff --check`.
4. Revisa `git status --short`.
5. Comprueba los criterios de aceptación.

Consulta `harness/workflow.md` para los comandos
correspondientes a cada componente.

No afirmes que una prueba pasó si no fue ejecutada.

Si una verificación falla, informa el error y sus posibles
causas sin ocultarlo.

## 8. Convenciones de Git

Los mensajes de commit deben:

- Estar escritos en inglés.
- Seguir Conventional Commits.
- Describir claramente el cambio realizado.
- Evitar mensajes genéricos.

Formato:

<type>(<scope>): <description>

Tipos recomendados:

- feat: nueva funcionalidad.
- fix: corrección de errores.
- docs: documentación.
- test: pruebas.
- refactor: refactorización.
- chore: mantenimiento.

Ejemplos:

feat(web): add user validation
fix(server): handle missing repository
test(extension): add command execution tests
docs(harness): document agent workflow

No crees commits ni ejecutes push sin autorización
explícita del desarrollador.

Consulta `harness/conventions.md`.

## 9. Seguridad y autorización

No realices sin autorización:

- Commits o push.
- Instalación o actualización de dependencias.
- Cambios de rama.
- Modificaciones fuera del alcance solicitado.
- Operaciones destructivas.
- Cambios en configuraciones sensibles.

Nunca expongas credenciales, tokens o secretos.

No incluyas archivos `.env` con datos sensibles en Git.

## 10. Informe final obligatorio

Al terminar una tarea, entrega:

1. Resumen de la tarea realizada.
2. Archivos modificados.
3. Componentes y capas afectados.
4. Criterios de aceptación cumplidos.
5. Pruebas y verificaciones ejecutadas.
6. Resultados obtenidos.
7. Errores, riesgos o verificaciones pendientes.
8. Mensaje de commit semántico sugerido.

La revisión y aprobación final corresponden al desarrollador.

## 11. Documentación complementaria

- `harness/README.md`: instalación y uso del harness.
- `harness/architecture.md`: arquitectura de TDDLab.
- `harness/conventions.md`: convenciones del proyecto.
- `harness/workflow.md`: flujo de trabajo y verificaciones.
- `harness/evaluation.md`: evaluación de la prueba piloto.

Estas instrucciones orientan al agente, pero no sustituyen
la revisión humana ni garantizan por sí solas el cumplimiento.
