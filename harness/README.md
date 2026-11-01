
# Harness de agentes codificadores - TDDLab

## 1. Introducción

Este harness establece un conjunto de instrucciones,
convenciones y procedimientos para integrar agentes de
inteligencia artificial en el desarrollo de TDDLab.

Su propósito es facilitar el trabajo con agentes
codificadores, manteniendo la arquitectura, la calidad
del código y las prácticas de desarrollo del equipo.

El harness está diseñado para ser reutilizable y
adaptable a diferentes agentes de programación.

## 2. ¿Qué es un harness?

Un harness es el entorno de instrucciones, contexto,
herramientas y procedimientos que orienta el trabajo
de un agente de IA.

En TDDLab, el harness permite que el agente:

- Comprenda la estructura del proyecto.
- Respete las convenciones de desarrollo.
- Trabaje dentro del alcance de cada tarea.
- Utilice las pruebas existentes.
- Siga un flujo de desarrollo ordenado.
- Informe sus resultados de forma verificable.

El harness no reemplaza al desarrollador ni garantiza
automáticamente que todas las instrucciones se cumplan.

## 3. Estructura del harness

El harness está compuesto por:

- `AGENTS.md`:
  Instrucciones generales para los agentes.

- `harness/architecture.md`:
  Arquitectura y responsabilidades de TDDLab.

- `harness/conventions.md`:
  Convenciones de código, Git y seguridad.

- `harness/workflow.md`:
  Procedimiento de desarrollo y verificaciones.

- `harness/README.md`:
  Guía de instalación, configuración y uso.

- `harness/evaluation.md`:
  Registro de la evaluación y prueba piloto.

Los documentos se mantienen dentro del repositorio
para que puedan versionarse junto con el proyecto.

## 4. Componentes de TDDLab

TDDLab contiene tres componentes principales:

| Componente | Descripción |
| --- | --- |
| Web Ui | Aplicación web React y TypeScript |
| server | API Express y TypeScript |
| VSCodeExtension | Extensión de Visual Studio Code |

Cada componente dispone de sus propias configuraciones
y herramientas de desarrollo.

El agente debe consultar la documentación correspondiente
antes de realizar modificaciones.

## 5. Requisitos previos

Para utilizar el harness se necesita:

1. Tener acceso al repositorio TDDLab.
2. Tener Git instalado.
3. Disponer de un agente codificador compatible.
4. Tener configurado el entorno de desarrollo del
   componente sobre el que se trabajará.
5. Conocer la historia de usuario o tarea asignada.

El harness no requiere instalar una aplicación adicional.

Las herramientas de compilación y pruebas dependen
del componente afectado.

## 6. Preparación del entorno

### 6.1 Obtener el repositorio

Si todavía no tienes el proyecto:

```bash
git clone https://github.com/UCB-TallerDeDesarrollo/TDDLab.git
cd TDDLab
```

Si ya tienes el repositorio, utiliza tu copia existente.

### 6.2 Seleccionar la rama de trabajo

Comprueba la rama activa:

```bash
git branch --show-current
git status --short
```

Trabaja en la rama asignada a tu historia de usuario.

No es necesario modificar la rama principal.

### 6.3 Revisar las instrucciones

Antes de utilizar un agente, lee:

1. `AGENTS.md`
2. `harness/architecture.md`
3. `harness/conventions.md`
4. `harness/workflow.md`

Estos documentos definen las reglas que debe seguir
el agente durante el desarrollo.

## 7. Uso con diferentes agentes

El harness utiliza `AGENTS.md` como documento central.

Sin embargo, cada herramienta puede disponer de
mecanismos distintos para cargar instrucciones.

### 7.1 OpenAI Codex

Codex admite instrucciones mediante `AGENTS.md`.

1. Abre el repositorio TDDLab.
2. Inicia Codex en el entorno de desarrollo.
3. Comprueba que tenga acceso al repositorio.
4. Asigna una tarea con sus criterios de aceptación.
5. Solicita que siga las instrucciones de `AGENTS.md`.

### 7.2 Claude Code

Claude Code utiliza `CLAUDE.md` como mecanismo
principal de instrucciones del proyecto.

Para utilizar este harness:

1. Abre el repositorio con Claude Code.
2. Proporciona explícitamente `AGENTS.md` como contexto.
3. Indica que debe seguir los documentos de `harness/`.
4. Comprueba que haya interpretado las restricciones.

Como alternativa, se puede mantener un archivo
`CLAUDE.md` que remita a las instrucciones compartidas.

### 7.3 GitHub Copilot

La compatibilidad depende del editor y del modo agente.

Cuando el entorno admita `AGENTS.md`, utiliza
ese mecanismo.

En otros casos, proporciona las instrucciones mediante
el mecanismo de configuración del agente o mediante
el contexto de la conversación.

Verifica siempre que el agente haya recibido las reglas.

## 8. Cómo asignar una tarea

Antes de comenzar, proporciona al agente:

- Identificador de la historia o issue.
- Objetivo de la tarea.
- Criterios de aceptación.
- Restricciones importantes.
- Componente afectado, si se conoce.

Ejemplo de solicitud:

```text
Trabaja en la historia de usuario HU-XX de TDDLab.

Objetivo:
[Describir la funcionalidad o problema]

Criterios de aceptación:
[Enumerar los criterios]

Restricciones:
[Indicar qué no debe modificarse]

Sigue las instrucciones de AGENTS.md y la
documentación de harness/.

Antes de implementar, analiza el estado de la
rama y explica tu enfoque.

Realiza únicamente los cambios necesarios,
ejecuta las verificaciones correspondientes
y entrega el informe final.

No realices commits ni push sin autorización.
```

## 9. Flujo de trabajo

El agente debe seguir seis etapas:

1. Comprender la tarea.
2. Inspeccionar el repositorio.
3. Planificar los cambios.
4. Implementar la solución.
5. Ejecutar verificaciones.
6. Entregar un informe.

El procedimiento detallado está documentado en
`harness/workflow.md`.

## 10. Verificación del trabajo

Después de implementar una tarea, el agente debe
ejecutar las pruebas correspondientes al componente.

Los comandos se encuentran en `harness/workflow.md`
y deben contrastarse con los scripts reales de cada
`package.json`.

Además, debe revisar:

```bash
git diff --check
git status --short
git diff
```

El desarrollador debe comprobar los resultados
y revisar también los archivos nuevos.

Una prueba no ejecutada no puede reportarse como
aprobada.

## 11. Commits semánticos

Los commits deben seguir Conventional Commits
y estar escritos en inglés.

Ejemplos:

```text
feat(web): add task validation
fix(server): handle invalid requests
test(extension): add command tests
docs(harness): update agent instructions
```

El agente puede proponer mensajes, pero necesita
autorización antes de realizar commits o push.

Consulta `harness/conventions.md`.

## 12. Responsabilidades

### Agente codificador

- Analizar la tarea y el código.
- Respetar las convenciones.
- Implementar cambios acotados.
- Ejecutar verificaciones.
- Informar resultados y limitaciones.

### Desarrollador responsable

- Definir el objetivo y los criterios.
- Resolver dudas sobre el comportamiento esperado.
- Revisar los cambios.
- Autorizar operaciones sensibles.
- Aprobar la integración.

## 13. Evaluación del harness

El harness debe probarse con una tarea real del
backlog de TDDLab.

La evaluación debe registrar:

- Agente utilizado.
- Historia de usuario seleccionada.
- Cambios realizados.
- Cumplimiento de instrucciones.
- Pruebas ejecutadas.
- Problemas encontrados.
- Mejoras propuestas.

Los resultados se documentan en
`harness/evaluation.md`.

## 14. Limitaciones

Este harness está basado principalmente en
instrucciones y procedimientos.

Por lo tanto:

- No garantiza que todos los agentes cumplan las reglas.
- No ejecuta verificaciones automáticamente.
- No bloquea commits incorrectos por sí solo.
- No sustituye las pruebas del proyecto.
- No reemplaza la revisión humana.

La compatibilidad y el cumplimiento deben verificarse
con cada agente utilizado.

## 15. Mantenimiento

Cuando cambien la arquitectura, las herramientas o
las convenciones del proyecto:

1. Revisar la documentación afectada.
2. Actualizar los comandos de verificación.
3. Comprobar que las instrucciones sigan siendo válidas.
4. Realizar una nueva prueba cuando el cambio sea relevante.

Los cambios al harness deben revisarse como cualquier
otra modificación del repositorio.
