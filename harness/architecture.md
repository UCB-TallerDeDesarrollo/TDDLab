# Arquitectura de TDDLab

Este documento explica cómo está organizado TDDLab y sirve como guía
para que un agente pueda identificar dónde corresponde realizar un cambio.

## 1. Componentes principales del proyecto

TDDLab está dividido en tres componentes principales:

### Web Ui

Contiene la aplicación web con la que interactúa el usuario.

Aquí se encuentran las partes relacionadas con la interfaz, las vistas
y el comportamiento que se muestra en el navegador.

### server

Contiene el backend de TDDLab.

Se encarga de procesar las operaciones del sistema y de trabajar con
la información necesaria para cumplir las funcionalidades de la aplicación.

### VSCodeExtension

Contiene el código correspondiente a la extensión de Visual Studio Code
que forma parte de TDDLab.

Los cambios relacionados específicamente con el comportamiento de la
extensión deben realizarse dentro de este componente.

## 2. Arquitectura hexagonal

Dentro del proyecto se utilizan principios de arquitectura hexagonal.

La arquitectura hexagonal organiza el código según la responsabilidad
que cumple cada parte.

Por ejemplo:

- una parte contiene las reglas del sistema;
- otra coordina las acciones necesarias para realizar una funcionalidad;
- otra se comunica con APIs, almacenamiento u otros servicios;
- otra presenta la información al usuario.

Esta separación ayuda a evitar que responsabilidades diferentes se
mezclen dentro del mismo código.

## 3. Responsabilidades principales

### Domain

Contiene las reglas principales del sistema.

Aquí debe estar el código que representa cómo funciona una regla del
negocio y que no necesita conocer detalles de interfaces, APIs o servicios externos.

### Application

Coordina las acciones necesarias para realizar una funcionalidad.

Utiliza las reglas disponibles en Domain y organiza el flujo necesario
para completar una acción o caso de uso.

### Infrastructure

Contiene el código encargado de comunicarse con elementos externos.

Por ejemplo:

- APIs;
- GitHub;
- almacenamiento;
- servicios externos.

Infrastructure obtiene o envía información, pero las reglas principales
del sistema deben mantenerse separadas de estas comunicaciones.

### Presentation

Contiene las partes relacionadas con la interacción con el usuario.

Por ejemplo:

- vistas;
- componentes visuales;
- botones;
- formularios;
- información mostrada en pantalla.

## 4. Cómo decidir dónde realizar un cambio

Antes de modificar código, primero identifica qué componente del proyecto
está relacionado con la tarea:

- `Web Ui`
- `server`
- `VSCodeExtension`

Después identifica qué responsabilidad tiene el cambio.

Por ejemplo:

- Si cambia una regla del sistema, revisa Domain.
- Si coordina los pasos de una funcionalidad, revisa Application.
- Si necesita comunicarse con una API o servicio externo, revisa Infrastructure.
- Si modifica lo que ve o utiliza el usuario, revisa Presentation.

No todos los componentes necesariamente utilizan exactamente las mismas
carpetas o nombres. Antes de crear código nuevo, revisa cómo está organizada
actualmente la funcionalidad relacionada con la tarea.

## 5. Ejemplo

Supongamos que una funcionalidad necesita obtener información desde GitHub
y mostrarla al usuario.

El flujo puede dividirse de la siguiente manera:

Infrastructure
→ realiza la comunicación con GitHub.

Application
→ coordina qué debe hacerse con la información obtenida.

Domain
→ aplica las reglas necesarias del sistema, si corresponde.

Presentation
→ muestra el resultado al usuario.

De esta manera, cada parte tiene una responsabilidad clara y un cambio
en la comunicación con GitHub no debería obligar a mezclar esa lógica
con la interfaz o con las reglas principales del sistema.
