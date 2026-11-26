# Reproducción de la validación HU08

Se necesita Node.js 24 (versión declarada por el backend), npm, PostgreSQL y el navegador de Cypress. Instalar dependencias con `npm ci` en `server/` y `Web Ui/`. La ejecución final del backend usó Node 24.22.1 y la del frontend Node 22.23.5, con PostgreSQL 18.4 y las versiones instaladas que constan en las evidencias.

## Base de datos aislada

Crear una base **exclusiva para pruebas**, por ejemplo `tddlab_hu08`. No usar la base compartida del equipo. La suite aplica la migración y limpia únicamente los datos del propietario `hu08-integration`. El navegador conserva los datos del propietario `hu08` como evidencia local.

En PowerShell, desde `server/`, definir las variables con las credenciales propias del entorno:

```powershell
$env:TDDLAB_TEST_DATABASE_URL='postgresql://usuario:clave@localhost:5432/tddlab_hu08'
$env:TDDLAB_DATABASE_URL=$env:TDDLAB_TEST_DATABASE_URL
$env:TDDLAB_DATABASE_SSL='false'
$env:TDD_RESULTS_REPOSITORY='database'
psql $env:TDDLAB_TEST_DATABASE_URL -v ON_ERROR_STOP=1 -f migrations/008_tdd_migration_validation.sql
npm run test:hu08:integration
npm test -- --runInBand
npm run tsc
```

La migración usa `BEGIN` y `COMMIT`, crea `jobstable` cuando no existe, añade la rama y una restricción única por propietario, repositorio y SHA, y crea `tdd_result_snapshots`. Se puede aplicar dos veces. Si ya hay duplicados anteriores en `jobstable`, la creación del índice falla deliberadamente: revisar esos registros antes de migrar; el script no borra evidencia existente.

`TDDLAB_DATABASE_SSL=false` corresponde solo a PostgreSQL local sin TLS. Para un servidor con TLS, conservar la configuración SSL del proyecto. No sobrescribir el `.env` existente; `server/.env.example` enumera las variables.

## Flujo HTTP y navegador

En una primera terminal, desde `server/`, mantener las variables anteriores y ejecutar:

```powershell
npm run qa:hu08
```

Esta entrada monta el router real de TDDCycles en `127.0.0.1:3008`; no carga las integraciones ajenas a esta migración. En otra terminal, desde `Web Ui/`:

```powershell
npm run qa:hu08
```

En una tercera terminal, también desde `Web Ui/`, definir `TDDLAB_TEST_DATABASE_URL` con la **misma base** y ejecutar:

```powershell
$env:TDDLAB_TEST_DATABASE_URL='postgresql://usuario:clave@localhost:5432/tddlab_hu08'
npm run test:hu08:e2e
npm test -- --runInBand
npm run build
```

La página de QA es `http://127.0.0.1:5173/test/manual/hu08-migration.html`. Reutiliza `TDDChartPage`, `TDDList`, los casos de uso y `CommitHistoryAdapter` de producción. Solo aísla nombre de usuario, comentarios y descubrimiento de ramas de GitHub, que no son parte del flujo de migración. El historial, los logs, la ingesta y el registro usan HTTP y PostgreSQL reales. El caso de carga añade demora a una respuesta real; el de error HTTP 500 se simula intencionalmente en Cypress. La caída real de BD se verifica además contra un puerto local sin servidor en `databaseUnavailable.test.ts`.

El hook inicial de Cypress ejecuta tres consultas del runner Jest: dos tests aprobados, uno aprobado y uno fallido, y una búsqueda sin tests. El fallo del proyecto de muestra es intencional y está aislado de las suites de regresión. Estos resultados se comparan con los contadores del JSON enviado. Es un emisor de QA de HU08; no sustituye la validación de los hooks y scripts oficiales de HU07 en el otro repositorio.

## Repositorios y contrato

`TDD_RESULTS_REPOSITORY=database|fake|file` selecciona el adaptador del par de archivos en un único punto, `createTDDCyclesDependencies.ts`. El valor predeterminado es `database`. El modo falso contiene los tres casos en `demo/tests`, rama `main`. El modo archivo utiliza `TDD_JSON_DIRECTORY` y conserva ambos JSON en un solo archivo por identidad. El modo de registro de jobs anterior mantiene su configuración heredada `TDD_JOBS_REPOSITORY=fake`; el modo principal `TDD_RESULTS_REPOSITORY=fake` selecciona ambos falsos.

`POST /api/TDDCycles/ingest-logs` recibe `repoOwner`, `repoName`, `branch`, `commitHistory` y `tddLog`, y responde 200 al guardar el par completo. `sha` es necesario cuando los archivos contienen el alias `HEAD`. Solo se resuelven `sha` y `commitId` que sean exactamente `HEAD`; se retienen los originales descargados y sus hashes. No se alteran mensajes, métricas, URLs ni marcas de tiempo. El guardado de ambas listas es atómico. La tabla guarda el último par recibido por rama, con actualización idempotente por identidad; no es un archivo histórico de todas las versiones del par ni rechaza automáticamente un envío antiguo que llegue después de uno reciente. La retención de revisiones y el ordenamiento de envíos requieren una política adicional si el equipo los necesita.

`POST /api/TDDCycles/jobs` recibe `sha`, `owner`, `reponame`, `conclusion` y opcionalmente `branch`: 201 para creado, 200 para duplicado idéntico, 409 para una conclusión conflictiva y 400 para campos inválidos. La identidad es propietario, repositorio y SHA. El ID es interno y se genera por almacenamiento. `GET /api/TDDCycles/jobs` preserva los campos de negocio y devuelve el ID numérico. La consulta no necesita volver a importar Actions de GitHub.

La vista consulta `commits-history`, `commit-cycles` y `test-log`; los tres leen el adaptador activo. La base conserva los campos adicionales del JSON, aunque la proyección de la vista expone solo el contrato que ya usa el frontend. Las fechas se convierten a `Date` en el adaptador; por HTTP se serializan en ISO. La comparación de JSON es de valores y tipos, sin exigir el orden de claves ni los espacios de formato. El orden de commits de la respuesta es descendente por fecha, y la lista permite ordenarlos en pantalla.

## Muestras de los enlaces del Word

Las copias consultadas y sus SHA inmutables están en `evidence/references/reference-check.json`. Las pruebas usan esas copias para evitar depender de cambios remotos. `node scripts/hu08-fetch-references.cjs`, desde `server/`, actualiza las copias y el manifiesto mediante peticiones de solo lectura a GitHub. Actualizarlo puede cambiar el conjunto probado y requiere repetir las comparaciones.

Totalizador tiene ambos archivos. Fizzbuzz y TennisPlay respondieron 404 para `script/tdd_log.json`; en sus pruebas se usa una lista vacía, y no se afirma que existiera un log que pudiera migrarse. Ninguno de esos proyectos contiene el caso de cero tests en el historial consultado; ese caso se cubre con el fixture determinista de HU08.

## Publicación pendiente

El usuario decidió publicar después en Trello y Notion. `DEFECTOS_TRELLO.md` contiene las fichas preparadas. Copiar el reporte y las evidencias al apartado de cada integrante, crear las tarjetas y añadir sus enlaces a la matriz antes del cierre global. La HU07 y la confirmación de PostgreSQL activo en el entorno compartido siguen pendientes; no se deducen de una prueba local.
