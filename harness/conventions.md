
# Convenciones de desarrollo de TDDLab

## 1. Propósito

Este documento establece las convenciones que deben seguir
los agentes codificadores al colaborar en TDDLab.

Su objetivo es mantener la consistencia del código,
facilitar las revisiones y evitar modificaciones
innecesarias.

Estas reglas complementan las instrucciones de `AGENTS.md`.

## 2. Principios generales

Antes de escribir o modificar código:

- Revisa las convenciones existentes del componente.
- Prioriza soluciones simples y mantenibles.
- Reutiliza funcionalidades existentes.
- Evita introducir dependencias innecesarias.
- Mantén los cambios dentro del alcance de la tarea.
- No modifiques archivos ajenos al problema.
- Respeta las decisiones arquitectónicas existentes.

Las convenciones locales del proyecto tienen prioridad
sobre preferencias personales del agente.

## 3. Estilo de código

TDDLab utiliza principalmente TypeScript y JavaScript.

Los agentes deben:

- Mantener el estilo de indentación existente.
- Respetar las reglas configuradas de ESLint y Prettier,
  cuando estén disponibles.
- Utilizar los tipos existentes antes de crear otros.
- Evitar el uso innecesario de `any` en TypeScript.
- Mantener funciones con responsabilidades claras.
- Evitar duplicar lógica.
- No agregar comentarios que simplemente repitan el código.
- Evitar reformatear archivos completos sin necesidad.

No introducir nuevas herramientas de formato o análisis
estático sin autorización del desarrollador.

## 4. Convenciones de nomenclatura

Antes de crear archivos, funciones, variables o clases,
revisa los nombres utilizados en el módulo correspondiente.

Como referencia general:

- Variables y funciones: camelCase.
- Clases, interfaces, tipos y componentes React: PascalCase.
- Constantes globales: UPPER_SNAKE_CASE cuando corresponda.
- Archivos: respetar la convención del directorio existente.

Estas reglas son orientativas. Si un módulo utiliza una
convención diferente de manera consistente, respétala.

Utiliza nombres descriptivos relacionados con la
responsabilidad del elemento.

No renombres elementos existentes únicamente por estilo.

## 5. Convenciones arquitectónicas

Respeta la separación de responsabilidades definida en
`harness/architecture.md`.

- No coloques lógica de negocio en componentes visuales
  cuando exista una capa responsable.
- Evita acoplar el dominio a frameworks externos.
- Mantén los contratos entre componentes.
- Reutiliza los casos de uso y repositorios existentes.
- No introduzcas nuevas capas sin necesidad.

No conviertas una corrección pequeña en una
refactorización arquitectónica.

## 6. Convenciones para pruebas

Cuando se modifique el comportamiento del sistema:

- Revisa las pruebas existentes.
- Agrega o actualiza pruebas cuando corresponda.
- Utiliza el framework de pruebas del componente.
- Prioriza pruebas enfocadas en el comportamiento.
- Evita pruebas dependientes de detalles internos
  innecesarios.
- No elimines pruebas para ocultar fallos.
- No modifiques expectativas únicamente para hacer
  que una prueba pase si contradicen el comportamiento
  requerido.

Aplica Red-Green-Refactor cuando sea viable.

Después de implementar, ejecuta las verificaciones
relevantes documentadas en `harness/workflow.md`.

## 7. Convenciones de Git

### 7.1 Ramas

Trabaja sobre la rama que el desarrollador tenga activa.

Antes de modificar código, comprueba:

git branch --show-current
git status --short

No cambies, elimines ni renombres ramas automáticamente.

No descartes cambios existentes sin autorización.

### 7.2 Commits semánticos

Todos los mensajes de commit propuestos o creados
deben seguir Conventional Commits.

Formato:

<type>(<scope>): <description>

El scope es opcional.

Tipos permitidos como convención del harness:

- feat: nueva funcionalidad.
- fix: corrección de errores.
- docs: cambios de documentación.
- test: incorporación o actualización de pruebas.
- refactor: cambios internos sin alterar comportamiento.
- chore: tareas de mantenimiento.
- build: cambios de compilación o dependencias.
- ci: cambios de integración continua.
- perf: mejoras de rendimiento.

### 7.3 Idioma de los commits

Los mensajes de commit deben estar escritos en inglés.

Reglas:

- Utilizar descripciones claras y concisas.
- Preferir el modo imperativo.
- Evitar mensajes genéricos.
- No utilizar descripciones en español.
- No incluir información sensible.

Ejemplos válidos:

feat(web): add task validation
fix(server): handle missing repository
test(extension): add command execution tests
docs(harness): document agent conventions
refactor(server): simplify user mapping

Ejemplos no aceptados:

agregué validaciones
cambios finales
fix: arreglar errores
update
feat: cosas nuevas

### 7.4 Autorización

El agente puede sugerir mensajes de commit.

No debe ejecutar:

git add
git commit
git push

sin autorización explícita del desarrollador.

El agente tampoco debe realizar merges, rebases,
resets destructivos o cambios de rama sin autorización.

## 8. Seguridad

Nunca incluyas en el código o en Git:

- Tokens de acceso.
- Contraseñas.
- Claves privadas.
- Credenciales de servicios.
- Archivos `.env` con información sensible.

No imprimas secretos en los informes del agente.

No modifiques configuraciones sensibles sin autorización.

No instales ni actualices dependencias automáticamente.

Si una tarea requiere permisos adicionales,
explica el motivo y solicita autorización.

## 9. Gestión de cambios

Antes de finalizar una tarea:

1. Revisa los archivos modificados.
2. Comprueba que los cambios correspondan al issue.
3. Ejecuta `git diff --check`.
4. Revisa las pruebas relevantes.
5. Identifica posibles efectos secundarios.
6. Informa cualquier verificación pendiente.

No afirmes que una verificación fue exitosa si no
se ejecutó realmente.

## 10. Resolución de conflictos entre reglas

Cuando existan instrucciones contradictorias:

1. Respeta las restricciones de seguridad y permisos.
2. Sigue los requisitos explícitos de la tarea.
3. Respeta las convenciones existentes del módulo.
4. Consulta la documentación del harness.
5. Solicita aclaración si el conflicto sigue sin resolverse.

No ignores instrucciones del proyecto por preferencias
personales del agente.

## 11. Responsabilidad del desarrollador

El agente proporciona asistencia técnica, pero no
reemplaza la revisión humana.

El desarrollador es responsable de:

- Revisar los cambios propuestos.
- Verificar los criterios de aceptación.
- Autorizar commits y operaciones sensibles.
- Aprobar la integración del código.

El agente debe informar sus resultados y limitaciones
de forma clara y verificable.
