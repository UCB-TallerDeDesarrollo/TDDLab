
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

## 16. Registro formal de ejecución de la prueba piloto HU-08

Este registro completa y prevalece sobre los campos `[PENDIENTE]` de la
plantilla anterior para la prueba piloto descrita a continuación.

### 16.1 Identificación

| Campo | Resultado |
| --- | --- |
| Historia piloto | HU-05: validación de enlace de repositorio GitHub |
| Agente seleccionado | OpenAI Codex |
| Rama utilizada | `Cachuchines/HU8-pilot` |
| Componente | `Web Ui/`, presentación compartida y pruebas relacionadas |
| Fecha de registro | 2026-10-15 |

El objetivo fue validar enlaces de repositorio en el diálogo de GitHub,
manteniendo `initialLink?: string`. La revisión humana precisó que el único
formato aceptable era `https://github.com/<owner>/<repo>` y que debían
rechazarse enlaces vacíos, malformados, sin HTTPS, de otro dominio, con
credenciales, puertos, parámetros, fragmentos o segmentos adicionales.

### 16.2 Fase de análisis

El agente confirmó la rama `Cachuchines/HU8-pilot`, revisó el estado de Git y
detectó cambios sin confirmar en el diálogo, el hook de validación y la prueba
de asignación. Los preservó; no cambió de rama ni descartó cambios. También
consultó `AGENTS.md`, arquitectura, workflow, convenciones, implementación,
pruebas y `package.json` de la UI.

Identificó correctamente `GitLinkDialog`, `useGitHubLinkValidation` y la prueba
de detalle de asignación, y anunció un cambio limitado al hook compartido con
pruebas de borde. El análisis delimitó correctamente la presentación, aunque
la condición de URL canónica exacta se hizo explícita tras la revisión humana.

### 16.3 Iteraciones

**Primera implementación.** Añadió soporte de `initialLink`, mejoró la
comprobación de dominio y cubrió URL vacía, malformada y de dominio distinto.
El resultado de 20 pruebas aprobadas fue reportado por el agente.

**Revisión humana independiente.** Detectó que la primera implementación aún
aceptaba URLs con credenciales, puertos y rutas adicionales. Esta detección
motivó una segunda iteración limitada.

**Segunda iteración.** Restringió la validación al formato exacto
`https://github.com/<owner>/<repo>` y añadió pruebas de credenciales, puerto,
parámetros, fragmento, ruta adicional, slash final y HTTP. Se mantuvo el
contrato opcional `initialLink`; no se modificaron backend, navegación,
persistencia ni configuración. La segunda iteración terminó con 27 pruebas
aprobadas.

### 16.4 Resultados y procedencia de la evidencia

| Procedencia | Verificación | Resultado | Observación |
| --- | --- | --- | --- |
| Reportado por el agente | Batería de primera iteración | 20 aprobadas | No existe una ejecución independiente registrada de esta batería. |
| Ejecutado por el agente | `jest --runInBand --runTestsByPath test/presentation/assignments/assignmentDetail.test.tsx` | 27 aprobadas | Una suite aprobada; cubre la segunda iteración. |
| Ejecutado por el agente | `tsc --noEmit` | Aprobada | Sin errores de TypeScript. |
| Ejecutado por el agente | `npm run lint` | Aprobada | ESLint terminó sin diagnósticos. |
| Ejecutado por el agente | `git diff --check` | Aprobada | Sin errores; solo advertencias de conversión LF a CRLF. |
| Ejecutado por el agente | `npm run build` | Fallida | `tsc` finalizó antes del fallo; Vite/esbuild no pudo leer un directorio padre por permisos y terminó con panic. |
| Independiente humana | Revisión de primera iteración | Brechas detectadas | Confirmó la aceptación indebida de credenciales, puertos y rutas adicionales. |

No se ejecutaron pruebas Cypress porque el alcance fue la validación unitaria
del diálogo. El primer intento RED de la segunda iteración no emitió informe de
Jest; la ejecución dirigida posterior confirmó las 27 pruebas aprobadas.

### 16.5 Aprendizajes, limitaciones y conclusión

El harness orientó adecuadamente la inspección inicial, el alcance, las
autorizaciones y el informe final. Sin embargo, la cobertura inicial no expresó
el requisito de URL canónica; la revisión humana fue necesaria para identificar
casos límite decisivos. La segunda iteración corrigió la brecha sin ampliar la
arquitectura ni el alcance.

Limitaciones: las 20 pruebas de la primera iteración permanecen como resultado
reportado, no como verificación independiente; PowerShell bloqueó inicialmente
`npm.ps1` y se usó `npm.cmd` sin alterar la política; la compilación completa
no quedó validada por el error de permisos de Vite/esbuild, aunque TypeScript
aprobó por separado.

**Conclusión: evaluación completada con limitaciones de entorno.** OpenAI
Codex siguió el harness para analizar el repositorio, limitar el cambio,
respetar autorizaciones y documentar resultados. La revisión humana aportó una
segunda iteración con 27 pruebas aprobadas. No se declara validación completa
del build hasta resolver los permisos del entorno de Vite/esbuild.
