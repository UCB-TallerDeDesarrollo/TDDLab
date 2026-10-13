# TDDLab - Guía para agentes

Este archivo contiene las reglas básicas que debe seguir cualquier agente
de programación que trabaje en TDDLab.

## 1. Antes de modificar código

- Antes de modificar código, identifica en qué parte del proyecto se encuentra
  la funcionalidad relacionada con la tarea y revisa los archivos cercanos
  para entender cómo está organizada actualmente.

- Lee `harness/architecture.md` para entender dónde corresponde realizar el cambio.

## 2. Arquitectura

TDDLab utiliza una organización basada en arquitectura hexagonal.

Antes de agregar código, identifica a qué responsabilidad pertenece:

- Domain: reglas principales del negocio.
- Application: casos de uso y coordinación de acciones.
- Infrastructure: comunicación con elementos externos, como APIs o almacenamiento.
- Presentation: interacción con el usuario.

No coloques código en una capa solamente porque sea el lugar más rápido.
Respeta la responsabilidad de cada parte del proyecto.

## 3. Alcance de la tarea

- Modifica solamente lo necesario para resolver la tarea solicitada.

- Evita cambiar archivos que no estén relacionados con la tarea.

- Si encuentras un error que ya existía antes y no está relacionado con la tarea
  actual, no lo modifiques automáticamente. Informa que lo encontraste y continúa
  únicamente con el alcance solicitado.

## 4. Después de realizar cambios

Ejecuta las verificaciones básicas definidas en:

`harness/check.mjs`

Para ejecutar la verificación utiliza:

`node harness/check.mjs <componente>`

Los componentes disponibles son:

- `web` para Web Ui
- `server` para server
- `extension` para VSCodeExtension

Después de ejecutar la verificación, informa:

- el resultado de los tests;
- los archivos modificados.

## 5. Acciones que requieren autorización

No realices automáticamente:

- commits;
- push;
- instalación o actualización de dependencias;
- cambios fuera del alcance de la tarea.

Primero informa qué necesitas hacer y espera autorización.
