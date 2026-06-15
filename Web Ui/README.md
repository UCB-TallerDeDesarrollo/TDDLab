# Frontend TDDLab

Frontend de TDDLab construido con React, TypeScript y Vite. La aplicacion se organiza alrededor de una capa de presentacion por dominios funcionales, componentes compartidos y modulos de dominio/infraestructura reutilizables.

## Arquitectura general

La estructura principal del frontend es:

```text
src/
├── app/
├── presentation/
├── shared/
├── modules/
└── utils/
```

- `app/`: integra rutas, navegacion principal, proteccion de rutas y configuracion global de la aplicacion.
- `presentation/`: contiene las pantallas y flujos visuales del sistema, organizados por dominio funcional.
- `shared/`: reune componentes, hooks, helpers y estilos reutilizables entre varias pantallas.
- `modules/`: conserva casos de uso, repositorios, puertos e integraciones asociadas al dominio o acceso a datos.
- `utils/`: agrupa utilidades transversales de bajo nivel.

## Capa de presentacion

`presentation/` es la capa principal para implementar pantallas, vistas y comportamiento de UI. Cada dominio funcional debe mantener una separacion clara entre composicion de pantalla, componentes visuales, hooks, servicios/adaptadores y tipos.

Estructura recomendada:

```text
presentation/<feature>/
├── pages/
├── components/
├── hooks/
├── services/
└── types/
```

- `pages/`: composicion de pantalla y conexion de las piezas principales.
- `components/`: componentes visuales especificos de la feature.
- `hooks/`: comportamiento de pantalla, estado local y coordinacion de acciones.
- `services/`: adaptacion de datos, llamadas a modulos o helpers especificos de presentacion.
- `types/`: contratos propios de la feature.

## Features disponibles

Las features principales del frontend son:

- `auth`: pantalla y flujo de autenticacion.
- `landing`: landing publica del sistema.
- `home`: pantalla de inicio autenticada.
- `groups`: gestion de grupos.
- `assignments`: tareas, detalle de tarea y entregas.
- `my-practices`: practicas y detalle de practica.
- `users`: usuarios y usuarios por grupo.
- `settings`: configuraciones y administracion de parametros.
- `ai-assistant`: asistente IA integrado al frontend.
- `group-invitation`: flujo de invitacion e inscripcion a grupos.
- `tdd-visualization`: visualizacion de ciclos TDD y graficas asociadas.

## Componentes compartidos

Los elementos reutilizables entre varias pantallas deben vivir en `shared/`. Esta carpeta incluye componentes de layout, estados de pantalla, dialogos, feedback, botones, helpers de navegacion, estilos compartidos y hooks transversales.

Antes de crear un componente nuevo dentro de una feature, revisar si el patron ya existe en `shared/`. Si un componente comienza a repetirse entre dos o mas features, debe evaluarse moverlo a `shared/`.

## Rutas y navegacion

Las rutas principales se integran desde `src/App.tsx`. La navegacion principal vive en `src/app/navigation` y se renderiza de acuerdo con el rol del usuario.

Rutas destacadas:

- `/landing`: landing publica.
- `/login`: autenticacion.
- `/`: home autenticada o landing publica segun sesion.
- `/groups`: grupos.
- `/tareas`: tareas.
- `/assignment/:id`: detalle de tarea.
- `/mis-practicas`: practicas del usuario.
- `/mis-practicas/:id`: detalle de practica.
- `/user`: usuarios.
- `/users/group/:groupid`: usuarios por grupo.
- `/configuraciones`: configuraciones.
- `/invitation`: invitaciones de grupo.
- `/asistente-ia`: asistente IA.
- `/graph`: visualizacion TDD principal.
- `/aditionalgraph`: visualizacion TDD adicional.

## Reglas para nuevas pantallas

- Crear nuevas pantallas dentro de `src/presentation/<feature>`.
- Separar UI, comportamiento, servicios/adaptadores y tipos.
- Evitar logica de negocio compleja dentro de componentes visuales.
- Reutilizar `shared/` para patrones comunes de layout, feedback, dialogos, botones y estados.
- Mantener una fuente de verdad clara para filtros, seleccion, navegacion y contexto de pantalla.
- Cubrir estados de `loading`, `empty`, `error` y `success` cuando aplique.
- Mantener las rutas y permisos alineados con `App.tsx` y `app/navigation`.
- No acoplar pantallas directamente a implementaciones internas si existe un modulo, servicio o adapter disponible.

## Comandos utiles

Instalar dependencias:

```bash
npm install
```

Levantar entorno local:

```bash
npm run dev
```

Validar TypeScript:

```bash
npx tsc --noEmit
```

Ejecutar pruebas unitarias:

```bash
npm test -- --runInBand
```

Generar build:

```bash
npm run build
```

Ejecutar Cypress con Vite activo:

```bash
npm run cy:run
```

## Criterios de mantenimiento

El frontend prioriza una organizacion por dominios funcionales, con responsabilidades separadas y componentes reutilizables. Los cambios nuevos deben mantener consistencia visual, preservar flujos existentes y evitar duplicar logica entre pantallas.
