# HU-02: botón único Iniciar / Finalizar

El detalle de una tarea muestra una única acción de cambio de estado para el estudiante.

| Estado guardado | Etiqueta | Color | Acción |
| --- | --- | --- | --- |
| Sin entrega (GET devuelve 404) | Pendiente | Gris | Iniciar tarea |
| `in progress` | En progreso | Ámbar | Finalizar tarea |
| `delivered` | Finalizado | Verde | Ninguna acción de inicio/finalización |

El enlace a la gráfica y el asistente siguen siendo acciones de consulta. El docente conserva su tabla de entregas.

## Comportamiento

- Iniciar abre el diálogo existente para indicar el repositorio. Cancelar no modifica la tarea.
- El botón cambia en el mismo lugar después de recibir la entrega guardada del servidor.
- Finalizar abre el diálogo existente para añadir un comentario opcional.
- La finalización se muestra únicamente cuando el servidor confirma el guardado.
- Mientras se guarda, se deshabilitan los controles de envío y cierre para evitar envíos repetidos.
- Un error conserva el estado y los datos del diálogo, muestra un mensaje y permite reintentar.
- Al entrar o recargar se consulta el estado guardado. No se ofrece iniciar mientras la consulta está pendiente o falla; un error de lectura permite reintentar.
- Se descartan respuestas tardías de la consulta de una tarea anterior al cambiar de ruta.
- El estado utiliza texto y color, con `role="status"` para anunciar los cambios.

## Frontend y backend

El flujo utiliza los endpoints existentes, con las credenciales de sesión habituales:

1. `GET /submissions/:assignmentid/:userid`: recupera la entrega; solo un 404 representa una tarea sin iniciar.
2. `POST /submissions`: guarda `in progress`, repositorio y fecha de inicio, y devuelve la entrega con su ID.
3. `PUT /submissions/:id`: guarda `delivered`, fecha de finalización y comentario, y devuelve la entrega actualizada.

El frontend usa la respuesta guardada para actualizar la pantalla, evitando una segunda lectura después del guardado. Una recarga vuelve a consultar el backend. No se usa `localStorage` para simular el progreso y no se requiere una migración de base de datos.

Los tipos de respuesta del repositorio y los casos de uso del backend reflejan la entrega completa que ya devuelve SQL con `RETURNING *`.

## Pruebas

Desde la raíz del repositorio, en PowerShell:

```powershell
# Pantalla, diálogos, recarga, cancelación, errores y respuestas tardías
npm.cmd --prefix "Web Ui" test -- --runInBand --coverage=false --runTestsByPath test/presentation/assignments/assignmentLifecycle.test.tsx test/presentation/assignments/assignmentDetail.test.tsx

# Contrato HTTP del repositorio frontend
npm.cmd --prefix "Web Ui" test -- --runInBand --coverage=false --runTestsByPath test/modules/Submissions/repository/SubmissionsRepository.test.ts

# Controlador, casos de uso y repositorio SQL, con PostgreSQL simulado
npm.cmd --prefix server test -- --runInBand --coverage=false --runTestsByPath test/controllers/submissionLifecycle.test.ts

# Suites completas
npm.cmd --prefix server test -- --runInBand
npm.cmd --prefix "Web Ui" test -- --runInBand

# Compilación de producción
npm.cmd --prefix "Web Ui" run build
```

### Navegador: escritorio y móvil

La prueba `cypress/e2e/assignmentLifecycle.spec.ts` recorre la aplicación real a 1280 y 390 píxeles de ancho. Verifica los botones, su posición en el grupo de acciones, los colores CSS calculados y las recargas. Intercepta las respuestas de la API; no necesita un usuario real ni modifica datos del servidor.

En una terminal:

```powershell
$env:VITE_API_URL = '/api'
npm.cmd --prefix "Web Ui" run dev -- --host 127.0.0.1 --port 5180 --strictPort
```

En otra terminal, desde la raíz:

```powershell
# El entorno de algunas aplicaciones establece esta variable y bloquea Electron.
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
npm.cmd --prefix "Web Ui" run cy:run -- --spec test/cypress/e2e/assignmentLifecycle.spec.ts --config baseUrl=http://127.0.0.1:5180 --browser electron --headless
```

Las capturas quedan en `Web Ui/cypress/screenshots/assignmentLifecycle.spec.ts/`, fuera de Git.

Estas pruebas cubren la interfaz real y el contrato del repositorio SQL. Para validar la persistencia contra PostgreSQL real, ejecutar el mismo recorrido con un estudiante de pruebas y una tarea de pruebas: iniciar, recargar, finalizar y volver a ingresar.
