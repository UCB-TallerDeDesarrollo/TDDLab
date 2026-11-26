
## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run dev

# production mode
$ npm run dev
```

## Test

```bash
# unit tests
$ npm run test
$ npm run test:coverage

```


## Ingesta de eventos desde TDDLabBDBaseProject

Este módulo recibe las ejecuciones y los commits del proyecto base BD. Incluye
el contrato de escritura, su validación, la persistencia y el versionado de
asociaciones. La implementación de FakeRepository y las API de consulta de
las gráficas se desarrollan por separado.

La ingesta está deshabilitada por defecto. En el `.env` del backend, conserva
la configuración habitual de PostgreSQL y activa:

```dotenv
TDD_INGESTION_ENABLED=true
TDD_INGESTION_TOKEN=replace-with-a-private-development-token
TDD_INGESTION_REPOSITORY=owner/exercise
```

En el proyecto base BD, configura `TDD_API_URL` con la URL del backend terminada
en `/api/TDDCycles/events`, el mismo token como `TDD_API_TOKEN` y las mismas
coordenadas como `TDD_REPOSITORY`. Las credenciales PostgreSQL permanecen en
el backend. El token autoriza un repositorio de desarrollo, no todas las prácticas.

En una base de TDDLab que ya tenga `commitstable`, aplica estas migraciones en orden:

1. `src/migrations/001_create_tdd_logs_and_extend_commitstable.sql`.
2. `src/migrations/002_identify_tdd_events.sql`.
3. `src/migrations/003_version_tdd_associations.sql`.

`POST /api/TDDCycles/events` requiere `Authorization: Bearer <token>` y recibe:

- `owner` y `repoName` del repositorio autorizado.
- `executions`: hasta 100 ejecuciones con UUID, rama opcional, contadores,
  timestamp en milisegundos, resultado y cobertura. `null` indica cobertura
  desconocida; `0` y `false` conservan su significado.
- `commits`: hasta 20 commits con SHA completo, padres, mensaje, timestamp,
  estadísticas de cambios y los UUID de sus ejecuciones.
- Para una reescritura, el commit incluye `rewrite: { id, from }`: un UUID
  estable de operación y los SHA originales. Los originales deben enviarse
  primero; el proyecto base BD prepara y reintenta estos envíos automáticamente.

Cada lote se guarda en una transacción. Repetir una ejecución, commit u operación
no duplica datos. Un UUID o SHA reenviado con datos contradictorios devuelve
`409`; una reescritura concurrente incompatible también se rechaza sin modificar
la versión aceptada. Las respuestas `400`, `401`, `403` y `503` indican datos
inválidos, token inválido, repositorio fuera del alcance y configuración de
ingesta incompleta, respectivamente.

### Proveedor de visualización

`TDD_DATA_SOURCE` selecciona el lector de las tres consultas de visualización:
`GET /api/TDDCycles/commits-history`, `/commit-cycles` y `/tdd-logs`.

| Valor | Proveedor |
| --- | --- |
| `github` | Archivos JSON del repositorio; valor predeterminado. |
| `fake` | Datos de demostración del backend. |
| `db` | PostgreSQL, con las migraciones 001–003 aplicadas. |

La selección explícita tiene prioridad sobre `TDD_USE_FAKE_REPOSITORY`. Si no se
define `TDD_DATA_SOURCE`, se conserva el modo fake cuando esa bandera es `true`;
en los demás casos se usa GitHub. La cabecera `X-TDD-Data-Source` identifica el
proveedor utilizado. La escritura conserva su propia configuración de ingesta.

Para probar la variante BD, configura `TDD_DATA_SOURCE=db` en `server/.env`,
además de la conexión PostgreSQL y las variables de ingesta indicadas arriba.
En `TDDLabBDBaseProject`, `TDD_API_URL` debe apuntar al endpoint `/api/TDDCycles/events`,
`TDD_API_TOKEN` debe coincidir con `TDD_INGESTION_TOKEN` y `TDD_REPOSITORY` con
`TDD_INGESTION_REPOSITORY`. El frontend consume la misma API con `VITE_API_URL`;
no necesita credenciales de PostgreSQL ni el token de ingesta.

Esta versión configura un repositorio autorizado por token de ingesta. La lectura
puede consultar diferentes repositorios; probar varias configuraciones de escritura
no equivale a disponer todavía de administración de tokens por estudiante.

### Asociaciones y contrato para la API de lectura

`tdd_logs.commit_sha` representa la asociación vigente. `tdd_execution_commits`
conserva las asociaciones anteriores y `tdd_commit_rewrites` registra las
operaciones aceptadas. Las ejecuciones mantienen su UUID y resultado al hacer
rebase, amend o squash. Los resultados históricos sin UUID conservan su formato;
no se reconstruyen asociaciones que no estaban registradas.

El equipo que implementa las consultas dispone de estas vistas PostgreSQL:

| Vista | Uso |
| --- | --- |
| `tdd_current_commits` | Contexto del grafo de commits vigente, incluso sin métricas. |
| `tdd_commit_metrics` | Commits con ejecuciones medidas para historial y ciclos. |
| `tdd_current_logs` | Logs históricos y ejecuciones UUID asociadas a la versión vigente. |

`VisualizeTDDRepository` consume estas vistas y preserva cobertura `null`.
Los commits sin pruebas se muestran como contexto del grafo y no reciben métricas
ficticias. El lector adapta los UUID y sus asociaciones por SHA al contrato de
logs que ya consume el frontend, conservando los identificadores de los históricos.

Un commit vigente puede referenciar un padre de una versión anterior, por
ejemplo si otra rama continúa después de un squash. Su metadata permanece en
`commitstable`: el lector resuelve esos ancestros para el grafo sin volver
a incluir las ejecuciones o métricas de la versión reemplazada.

### Validación

Desde la carpeta `server`:

```bash
npx --no-install tsc --noEmit
npm test -- --runInBand --coverage=false test/modules/TDDCycles test/controllers/TDDCycles
```

Las pruebas normales usan conexiones simuladas. Para comprobar las vistas con
una base de desarrollo que ya tenga una ejecución confirmada, activa
`TDD_TEST_DATABASE=true`, define `TDD_TEST_REPOSITORY=owner/exercise` y ejecuta
`test/modules/TDDCycles/Repositories/PostgresTDDEventRepository.realDb.test.ts`.
Estas pruebas consultan la base y no modifican sus registros.
