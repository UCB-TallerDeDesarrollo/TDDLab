
# Evaluación del harness de TDDLab

## 1. Propósito

Este documento registra la evaluación de agentes
codificadores y la prueba piloto del harness de TDDLab.

Su objetivo es comprobar si las instrucciones definidas
permiten que un agente realice tareas de desarrollo
respetando la arquitectura, las convenciones y el
flujo de trabajo del equipo.

La evaluación se divide en dos partes:

1. Comparación y selección de agentes.
2. Ejecución y análisis de una prueba piloto.

## 2. Criterios de evaluación

Para comparar agentes se consideran:

- Compatibilidad con instrucciones del repositorio.
- Capacidad de comprender proyectos existentes.
- Capacidad de modificar múltiples archivos.
- Acceso a herramientas de terminal y pruebas.
- Facilidad de uso para el equipo.
- Disponibilidad y costos.
- Facilidad para revisar los cambios propuestos.

La selección debe considerar las necesidades de TDDLab
y los recursos disponibles para el equipo.

## 3. Alternativas de agentes codificadores

### 3.1 OpenAI Codex

Codex es un agente orientado a tareas de programación.

Características relevantes:
- Puede analizar y modificar código.
- Puede trabajar con instrucciones del repositorio.
- Puede ejecutar verificaciones según el entorno.
- Utiliza AGENTS.md como mecanismo de instrucciones.

Aspectos por comprobar:
- Disponibilidad para el equipo.
- Permisos de acceso al repositorio.
- Herramientas habilitadas en el entorno utilizado.

### 3.2 Claude Code

Claude Code es un agente de programación que puede
trabajar sobre proyectos existentes.

Características relevantes:
- Puede analizar y modificar archivos.
- Puede utilizar herramientas de terminal.
- Permite establecer instrucciones del proyecto.

Aspectos por comprobar:
- Disponibilidad para el equipo.
- Compatibilidad de la configuración utilizada.
- Carga de instrucciones compartidas de AGENTS.md.

### 3.3 GitHub Copilot

GitHub Copilot proporciona asistencia de programación
integrada en diferentes entornos de desarrollo.

Características relevantes:
- Integración con editores como Visual Studio Code.
- Asistencia para comprender y modificar código.
- Capacidades de agente según la modalidad utilizada.
- Mecanismos de instrucciones personalizadas.

Aspectos por comprobar:
- Disponibilidad del modo agente.
- Compatibilidad con AGENTS.md en el entorno utilizado.
- Permisos para ejecutar comandos y modificar archivos.

## 4. Comparación preliminar

| Criterio | Codex | Claude Code | GitHub Copilot |
| --- | --- | --- | --- |
| Instrucciones del proyecto | AGENTS.md | CLAUDE.md y contexto proporcionado | Instrucciones configurables según entorno |
| Modificación de archivos | Sí | Sí | Sí, en modos compatibles |
| Uso de terminal | Según entorno y permisos | Según entorno y permisos | Según modo y permisos |
| Ejecución de pruebas | Según entorno | Según entorno | Según entorno |
| Integración con VS Code | Según herramienta disponible | Según instalación | Integración directa |
| Acceso y costo | Por verificar | Por verificar | Por verificar |

Esta tabla es una comparación funcional preliminar,
no una prueba de rendimiento ni una validación práctica.

Las capacidades pueden variar según versión,
configuración y permisos.

## 5. Selección del agente para la prueba piloto

Agente seleccionado:
[PENDIENTE]

Versión o modalidad utilizada:
[PENDIENTE]

Entorno de ejecución:
[PENDIENTE]

Justificación:
[PENDIENTE]

Motivos para no seleccionar las otras alternativas:
[PENDIENTE]

La elección del agente para la prueba piloto no
impide utilizar el harness con otras herramientas.

## 6. Objetivo de la prueba piloto

Validar que un agente codificador pueda resolver
una tarea pequeña y real del backlog de TDDLab
siguiendo las instrucciones del harness.

La tarea debe permitir comprobar:

- Lectura de las instrucciones.
- Análisis previo del repositorio.
- Respeto de la arquitectura.
- Cambios limitados al alcance.
- Ejecución de verificaciones.
- Propuesta de commit semántico en inglés.
- Entrega de un informe final.

## 7. Identificación de la tarea

Historia de usuario o issue:
[PENDIENTE]

Título:
[PENDIENTE]

Descripción:
[PENDIENTE]

Criterios de aceptación:
[PENDIENTE]

Rama de trabajo:
[PENDIENTE]

Componente afectado:
[PENDIENTE]

Motivo de selección:
[PENDIENTE]

## 8. Preparación de la prueba

Antes de iniciar:

1. Confirmar la rama activa.
2. Revisar el estado del repositorio.
3. Confirmar que el agente pueda acceder al código.
4. Proporcionar AGENTS.md y la documentación del harness.
5. Entregar la tarea y sus criterios de aceptación.
6. Definir qué verificaciones deberán ejecutarse.

Registrar el estado inicial:

Fecha:
[PENDIENTE]

Comando `git branch --show-current`:
[PENDIENTE]

Resultado de `git status --short`:
[PENDIENTE]

## 9. Instrucción utilizada en la prueba

Registrar el mensaje exacto enviado al agente.

Prompt utilizado:

[PENDIENTE]

Esto permitirá reproducir la evaluación y distinguir
las instrucciones del harness de las indicaciones
adicionales proporcionadas durante la prueba.

## 10. Registro de ejecución

### 10.1 Análisis inicial

¿Identificó correctamente el objetivo?
[PENDIENTE]

¿Revisó la rama y el estado de Git?
[PENDIENTE]

¿Consultó los archivos relevantes?
[PENDIENTE]

¿Explicó su enfoque antes de implementar?
[PENDIENTE]

Observaciones:
[PENDIENTE]

### 10.2 Implementación

Archivos modificados:
[PENDIENTE]

Cambios realizados:
[PENDIENTE]

¿Respetó la arquitectura existente?
[PENDIENTE]

¿Evitó cambios fuera del alcance?
[PENDIENTE]

¿Aplicó TDD cuando correspondía?
[PENDIENTE]

Observaciones:
[PENDIENTE]

### 10.3 Verificaciones

Registrar únicamente verificaciones realmente ejecutadas.

| Comando | Resultado | Observaciones |
| --- | --- | --- |
| [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |

Indicar si hubo pruebas no ejecutadas y por qué.

### 10.4 Git y seguridad

¿Evitó commits sin autorización?
[PENDIENTE]

¿Evitó push sin autorización?
[PENDIENTE]

¿Propuso un commit semántico en inglés?
[PENDIENTE]

Mensaje propuesto:
[PENDIENTE]

¿Respetó las restricciones de seguridad?
[PENDIENTE]

## 11. Evaluación de cumplimiento

Utilizar los siguientes estados:

- Cumplido: existe evidencia suficiente.
- Parcial: se cumplió con limitaciones.
- No cumplido: el agente incumplió la instrucción.
- No evaluado: la prueba no permitió comprobarlo.

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| Comprendió la tarea | No evaluado | Pendiente |
| Revisó el repositorio | No evaluado | Pendiente |
| Respetó la arquitectura | No evaluado | Pendiente |
| Limitó el alcance | No evaluado | Pendiente |
| Ejecutó verificaciones | No evaluado | Pendiente |
| Reportó resultados reales | No evaluado | Pendiente |
| Propuso commit en inglés | No evaluado | Pendiente |
| Respetó las autorizaciones | No evaluado | Pendiente |

## 12. Resultados de la prueba piloto

### Aspectos que funcionaron

[PENDIENTE]

### Problemas encontrados

[PENDIENTE]

### Instrucciones ambiguas o insuficientes

[PENDIENTE]

### Intervenciones humanas necesarias

[PENDIENTE]

### Limitaciones de la herramienta

[PENDIENTE]

## 13. Ajustes realizados al harness

| Problema detectado | Ajuste propuesto | Archivo afectado | Estado |
| --- | --- | --- | --- |
| Pendiente | Pendiente | Pendiente | Pendiente |

Registrar aquí los cambios realizados como
consecuencia de la prueba piloto.

No presentar ajustes propuestos como implementados
hasta haber modificado los archivos correspondientes.

## 14. Revisión humana

Responsable de la revisión:
[PENDIENTE]

Fecha:
[PENDIENTE]

¿Se revisó el diff?
[PENDIENTE]

¿Se revisaron las pruebas?
[PENDIENTE]

¿Se cumplieron los criterios de aceptación?
[PENDIENTE]

Decisión:
[PENDIENTE]

Opciones:
- Aprobado para integración.
- Requiere correcciones.
- Rechazado.

Observaciones:
[PENDIENTE]

## 15. Conclusión

Estado de la evaluación:
PENDIENTE DE EJECUCIÓN

Conclusión:
Se completará después de ejecutar la prueba piloto,
revisar los resultados y documentar los ajustes.

No debe declararse exitoso el harness únicamente
por disponer de archivos de instrucciones.
