
# Flujo de trabajo para agentes codificadores

## 1. Propósito

Este documento define el procedimiento que deben seguir
los agentes de IA al trabajar en tareas de desarrollo de TDDLab.

Su objetivo es asegurar que cada modificación sea:
- Comprensible.
- Limitada al alcance solicitado.
- Compatible con la arquitectura existente.
- Verificable mediante pruebas.
- Revisable por el desarrollador responsable.

Este flujo complementa `AGENTS.md` y las convenciones
documentadas en `harness/conventions.md`.

## 2. Recepción de una tarea

Antes de modificar archivos, identifica:

- Historia de usuario o issue relacionado.
- Objetivo de la modificación.
- Criterios de aceptación.
- Componentes posiblemente afectados.
- Restricciones o funcionalidades que deben conservarse.

Si la solicitud es ambigua y puede cambiar el resultado,
solicita aclaración antes de implementar.

No inventes requisitos ni amplíes el alcance.

## 3. Inspección inicial del repositorio

Ejecuta los siguientes comandos desde la raíz:

```bash
git branch --show-current
git status --short
git log -1 --oneline
```

Comprueba:
- Que estás trabajando en la rama asignada.
- Que no existen cambios que puedan sobrescribirse.
- Cuál es el estado inicial del proyecto.

No cambies de rama automáticamente.

Si existen modificaciones previas, identifícalas
antes de continuar.

## 4. Análisis técnico

Antes de editar:

1. Localiza la funcionalidad relacionada.
2. Revisa los archivos cercanos.
3. Identifica los puntos de entrada.
4. Sigue el flujo hacia los casos de uso y adaptadores.
5. Localiza pruebas existentes.
6. Identifica dependencias y contratos afectados.
7. Consulta `harness/architecture.md`.

No asumas que un archivo no se utiliza sin comprobar
sus referencias.

Para tareas de eliminación, revisa imports, exports,
configuraciones, rutas, comandos y pruebas.

## 5. Plan de implementación

Antes de modificar código, informa brevemente:

- Qué problema se resolverá.
- Qué archivos o componentes podrían modificarse.
- Qué enfoque se utilizará.
- Qué pruebas o verificaciones se ejecutarán.
- Qué riesgos o dudas se identificaron.

Este informe inicial permite al desarrollador
comprender el alcance previsto.

Si no existen bloqueos ni dudas esenciales,
continúa con la implementación.

## 6. Implementación

Durante el desarrollo:

- Modifica únicamente lo necesario.
- Respeta la arquitectura existente.
- Conserva los contratos no afectados.
- Evita refactorizaciones generales.
- No instales dependencias sin autorización.
- No sobrescribas cambios ajenos.
- Sigue `harness/conventions.md`.

### Desarrollo guiado por pruebas

Cuando sea viable, aplica Red-Green-Refactor.

RED:
- Escribe una prueba que represente el comportamiento.
- Ejecuta la prueba y confirma el fallo esperado.

GREEN:
- Implementa el cambio mínimo necesario.
- Ejecuta nuevamente la prueba.

REFACTOR:
- Mejora la implementación sin alterar el comportamiento.
- Comprueba que las pruebas continúen pasando.

Si la tarea no permite aplicar este ciclo,
documenta la razón.

## 7. Verificaciones por componente

Ejecuta las verificaciones relevantes del componente
modificado.

Antes de utilizar un comando, confirma que exista
en el `package.json` correspondiente.

No asumas que el repositorio raíz dispone de scripts
para todos los componentes.


### 7.1 Aplicación web

Directorio: `Web Ui/`

Scripts confirmados en `Web Ui/package.json`.

Pruebas unitarias:

```bash
cd "Web Ui"
npm test -- --runInBand
```

Análisis estático:

```bash
npm run lint
```

Compilación:

```bash
npm run build
```

Pruebas de navegador con Cypress, cuando correspondan:

```bash
npm run cy:run
```

Las pruebas Cypress pueden requerir que la aplicación
o los servicios relacionados estén disponibles.

El agente debe comprobar los requisitos de ejecución
antes de iniciar estas pruebas.

No es necesario ejecutar Cypress para todos los cambios;
su uso depende del alcance de la tarea.



### 7.2 Servidor

Directorio: `server/`

Scripts confirmados en `server/package.json`.

Pruebas unitarias:

```bash
cd server
npm test -- --runInBand
```

Compilación y verificación de TypeScript:

```bash
npm run tsc
```

El servidor no tiene un script de lint declarado
en el package.json revisado.

No debe inventarse un comando de lint.

Si una prueba requiere base de datos, credenciales
o servicios externos, el agente debe comprobar
que el entorno esté preparado.

No debe modificar credenciales ni instalar
dependencias sin autorización.



### 7.3 Extensión de VS Code

Directorio: `VSCodeExtension/`

Scripts confirmados en `VSCodeExtension/package.json`.

Compilación de TypeScript:

```bash
cd VSCodeExtension
npm run compile
```

Análisis estático:

```bash
npm run lint
```

Pruebas de la extensión:

```bash
npm test
```

El comando `npm test` ejecuta automáticamente el
script `pretest`, que realiza:

1. `npm run compile`
2. `npm run lint`

Si ambas verificaciones finalizan correctamente,
se ejecuta `vscode-test`.

Las pruebas pueden requerir un entorno compatible
con VS Code y sus herramientas de testing.

Si una verificación falla, registra el comando,
el error y la etapa en la que ocurrió.

No reportes las pruebas como aprobadas si el proceso
se detuvo durante `pretest`.

Para cambios pequeños, el agente puede ejecutar
compilación y lint por separado durante el desarrollo.

Antes de finalizar, debe ejecutar las verificaciones
relevantes según el alcance de la tarea.


### 7.4 Cambios entre componentes

Si una tarea modifica más de un componente:

1. Identifica todos los componentes afectados.
2. Ejecuta sus verificaciones relevantes.
3. Comprueba los contratos compartidos.
4. Informa cualquier comprobación pendiente.

No ejecutes pruebas innecesarias de componentes
que no estén relacionados con la tarea.

## 8. Revisión de cambios

Antes de entregar, vuelve a la raíz del repositorio
y ejecuta:

```bash
git diff --check
git status --short
git diff
```

Si existen archivos nuevos sin seguimiento,
revísalos también: `git diff` no muestra su contenido
hasta que se agregan al índice.

Comprueba que:
- No existan modificaciones fuera del alcance.
- No se hayan eliminado funcionalidades por accidente.
- No se hayan incluido secretos.
- Las pruebas correspondan al comportamiento solicitado.
- Los criterios de aceptación estén cubiertos.

Si detectas problemas, corrígelos cuando pertenezcan
al alcance de la tarea.

## 9. Gestión de errores

Si una verificación falla:

1. Registra el comando ejecutado.
2. Identifica el mensaje de error.
3. Determina si está relacionado con la modificación.
4. Corrige únicamente los problemas dentro del alcance.
5. Ejecuta nuevamente la verificación cuando corresponda.

Si el error es previo o ajeno a la tarea,
informa al desarrollador.

No ocultes errores ni presentes resultados no ejecutados
como satisfactorios.

## 10. Commits y operaciones de Git

El agente no debe realizar automáticamente:

- `git add`
- `git commit`
- `git push`
- `git merge`
- `git rebase`
- Cambios o eliminación de ramas.
- Operaciones destructivas sobre archivos o historial.

Solicita autorización antes de estas operaciones.

Cuando corresponda, sugiere un mensaje siguiendo
Conventional Commits y escrito en inglés.

Ejemplo:

```text
fix(server): handle invalid request data
```

Consulta `harness/conventions.md`.

## 11. Informe final

Al terminar, entrega un informe con esta estructura:

```text
Historia de usuario / Issue:
Rama de trabajo:

Objetivo:
Cambios realizados:
Archivos modificados:
Componentes y capas afectados:

Criterios de aceptación:
- Criterio 1: cumplido / pendiente
- Criterio 2: cumplido / pendiente

Verificaciones:
- Comando:
- Resultado:
- Observaciones:

Riesgos o limitaciones:
Verificaciones pendientes:
Commit sugerido:
```

El informe debe reflejar resultados reales.

No afirmes que una tarea está completamente validada
si existen verificaciones relevantes pendientes.

## 12. Revisión humana

El desarrollador responsable debe:

1. Revisar los archivos modificados.
2. Confirmar el cumplimiento de los criterios.
3. Revisar los resultados de pruebas.
4. Evaluar los riesgos identificados.
5. Autorizar las operaciones Git necesarias.
6. Decidir si el trabajo está listo para integrarse.

El agente asiste al desarrollo, pero no reemplaza
la revisión ni la aprobación humana.
