
# Arquitectura de TDDLab

## 1. Propósito

Este documento proporciona contexto arquitectónico a los
agentes codificadores que trabajan en TDDLab.

Su objetivo es ayudar a identificar dónde realizar cambios,
manteniendo la separación de responsabilidades y evitando
modificaciones innecesarias.

Las instrucciones generales están definidas en `AGENTS.md`.

## 2. Organización general

TDDLab está compuesto por tres aplicaciones principales:

- `Web Ui/`: interfaz web.
- `server/`: API y lógica del servidor.
- `VSCodeExtension/`: extensión de Visual Studio Code.

Cada componente tiene sus propias dependencias, configuración,
estructura interna y mecanismos de verificación.

Antes de modificar un componente, revisa su implementación
actual y su documentación.

## 3. Principios arquitectónicos

TDDLab utiliza principios de arquitectura hexagonal,
aunque su aplicación puede variar entre módulos.

Las responsabilidades se organizan conceptualmente en:

### Dominio

Contiene las reglas y modelos principales del negocio.

No debe depender innecesariamente de frameworks,
interfaces gráficas o tecnologías externas.

### Aplicación

Coordina los casos de uso y las operaciones del sistema.

Debe mantener separadas las reglas del negocio de los
detalles de infraestructura.

### Infraestructura

Implementa la comunicación con tecnologías externas:

- Bases de datos.
- APIs.
- Servicios de autenticación.
- GitHub.
- Sistemas de archivos.

### Presentación

Gestiona la interacción con los usuarios o consumidores
de los servicios.

Incluye interfaces, controladores y puntos de entrada,
según la organización del componente.

## 4. Aplicación web: Web Ui

Ubicación: `Web Ui/`

Tecnologías principales:
- React.
- TypeScript.
- Vite.

Responsabilidades:
- Presentar información al usuario.
- Gestionar navegación y pantallas.
- Coordinar interacciones con los casos de uso.
- Consumir servicios y APIs mediante los mecanismos existentes.

Antes de modificar la aplicación web:

1. Identifica la pantalla o funcionalidad afectada.
2. Revisa los componentes y módulos relacionados.
3. Localiza los casos de uso y contratos existentes.
4. Reutiliza componentes compartidos cuando corresponda.
5. Evita incorporar lógica de negocio directamente en
   componentes visuales cuando ya exista una capa responsable.

No modifiques contratos de comunicación con el servidor
sin analizar sus consumidores.

## 5. Servidor: server

Ubicación: `server/`

Tecnologías principales:
- Node.js.
- Express.
- TypeScript.

Responsabilidades:
- Exponer endpoints y servicios.
- Coordinar casos de uso.
- Gestionar persistencia e integraciones externas.
- Validar y procesar solicitudes.

Antes de modificar el servidor:

1. Identifica la ruta o punto de entrada relacionado.
2. Revisa el controlador correspondiente.
3. Localiza los casos de uso involucrados.
4. Comprueba los modelos y repositorios utilizados.
5. Revisa los contratos y pruebas existentes.

Evita colocar reglas de negocio directamente en
controladores cuando exista una capa de aplicación
o dominio responsable.

No alteres contratos públicos sin verificar
las funcionalidades que dependen de ellos.

## 6. Extensión: VSCodeExtension

Ubicación: `VSCodeExtension/`

Tecnologías principales:
- TypeScript.
- API de Visual Studio Code.

Responsabilidades:
- Integrarse con el entorno de VS Code.
- Ejecutar y coordinar funcionalidades de la extensión.
- Presentar vistas, comandos y resultados.
- Interactuar con procesos y recursos externos.

Antes de modificar la extensión:

1. Identifica el comando o funcionalidad afectada.
2. Revisa su registro y punto de entrada.
3. Localiza los casos de uso relacionados.
4. Comprueba las integraciones de infraestructura.
5. Revisa las pruebas y configuraciones existentes.

No elimines comandos, contribuciones o configuraciones
sin comprobar sus referencias.

## 7. Cambios entre componentes

Algunas funcionalidades pueden involucrar más de un
componente de TDDLab.

Cuando una tarea requiera modificar varios componentes:

1. Identifica el flujo completo.
2. Determina las responsabilidades de cada componente.
3. Revisa los contratos de comunicación.
4. Implementa únicamente los cambios necesarios.
5. Verifica cada componente afectado.

No dupliques reglas de negocio en diferentes capas.

## 8. Integraciones externas

TDDLab utiliza integraciones externas para distintas
funcionalidades.

Antes de modificar una integración:

- Identifica qué funcionalidades dependen de ella.
- Revisa las configuraciones y contratos existentes.
- Evita introducir dependencias innecesarias.
- No expongas credenciales ni información sensible.

Una integración puede servir a diferentes funcionalidades.
No elimines capacidades ajenas a la tarea solicitada.

## 9. Reglas para cambios arquitectónicos

Los agentes deben:

- Respetar la organización existente.
- Priorizar soluciones compatibles con el diseño actual.
- Evitar refactorizaciones generales no solicitadas.
- Mantener la separación de responsabilidades.
- Revisar las dependencias antes de introducir cambios.
- Documentar cualquier limitación arquitectónica detectada.

Si una tarea requiere modificar significativamente la
arquitectura, informa primero al desarrollador.

## 10. Verificación

Después de realizar cambios:

1. Comprueba que las responsabilidades permanezcan
   en las capas correspondientes.
2. Revisa los contratos afectados.
3. Ejecuta las pruebas relevantes.
4. Verifica que no existan cambios fuera del alcance.
5. Informa las modificaciones realizadas.

Los comandos específicos están documentados en
`harness/workflow.md`.
