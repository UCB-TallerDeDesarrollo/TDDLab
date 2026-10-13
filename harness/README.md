# TDDLab Harness

Este harness ayuda a desarrolladores y agentes de programación a trabajar
de forma más ordenada dentro de TDDLab.

Su objetivo es dar contexto sobre el proyecto, indicar cómo debe trabajar
el agente y ofrecer una verificación básica después de realizar cambios.

## 1. Archivos del harness

### AGENTS.md

Contiene las instrucciones que debe seguir un agente antes, durante y
después de realizar una tarea.

Entre otras cosas, le indica:

- revisar dónde está implementada la funcionalidad;
- consultar `harness/architecture.md`;
- limitar los cambios al alcance de la tarea;
- ejecutar `harness/check.mjs` al finalizar.

### harness/architecture.md

Explica cómo está organizado TDDLab.

Describe los tres componentes principales:

- Web Ui
- server
- VSCodeExtension

También explica las responsabilidades relacionadas con la arquitectura
hexagonal para ayudar a decidir dónde corresponde realizar un cambio.

### harness/check.mjs

Realiza una verificación básica después de modificar el proyecto.

El script:

1. recibe qué componente se quiere revisar;
2. ejecuta los tests existentes de ese componente cuando están configurados;
3. muestra si los tests pasaron o fallaron;
4. muestra los archivos modificados mediante Git.

### harness/README.md

Explica cómo se conectan y utilizan las diferentes partes del harness.

## 2. Flujo de uso con un agente

El flujo esperado es:

1. El agente lee `AGENTS.md`.
2. `AGENTS.md` le indica consultar `harness/architecture.md`.
3. El agente identifica dónde corresponde realizar el cambio.
4. Realiza únicamente los cambios relacionados con la tarea.
5. Al finalizar, ejecuta `harness/check.mjs`.
6. Informa el resultado de los tests y los archivos modificados.

## 3. Uso manual

Un desarrollador también puede ejecutar el harness sin utilizar un agente.

Para verificar Web Ui:

`node harness/check.mjs web`

Para verificar server:

`node harness/check.mjs server`

Para verificar VSCodeExtension:

`node harness/check.mjs extension`

## 4. Ejemplo de uso con un agente

El desarrollador solamente necesita proporcionar la tarea.

Ejemplo:

"Implementa BL-XX: corregir el comportamiento del botón de GitHub."

El agente debe utilizar las instrucciones del repositorio definidas en
`AGENTS.md`.

A partir de ahí, el propio harness le indica:

- qué contexto revisar;
- cómo respetar la arquitectura;
- cómo limitar el cambio;
- qué verificación ejecutar al finalizar.

No es necesario repetir manualmente todas estas instrucciones en cada tarea.

Si un agente no reconoce automáticamente `AGENTS.md`, se le debe indicar
una sola vez que utilice ese archivo como instrucciones del repositorio.
No es necesario repetir manualmente todas las reglas en cada tarea.

## 5. Resultado esperado

Ejemplo:

================================
        TDDLab Harness
================================

Componente:
Web Ui

Tests:
PASS ✅

Archivos modificados:
M Web Ui/src/example.ts

================================

## 6. Alcance actual

Esta versión del harness es intencionalmente básica.

Actualmente:

- utiliza los tests que ya existen en Web Ui y server;
- muestra si los tests pasan o fallan;
- muestra los archivos modificados;
- puede ser utilizado por un agente o manualmente.

En VSCodeExtension los tests automáticos no están configurados en esta
versión porque su comando actual también ejecuta previamente compile y lint,
verificaciones que quedaron fuera del alcance.

El harness no realiza automáticamente:

- instalación de dependencias;
- actualización de dependencias;
- commits;
- push;
- modificaciones de código durante la verificación;
- lint;
- typecheck;
- auditoría de dependencias.
