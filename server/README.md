
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

## Historial TDD: integracion de BL-01 y BL-06

La API y el adaptador provienen de `origin/UCM-BL01-BD`. Ver
[BRANCH_SYNC_API.md](BRANCH_SYNC_API.md) para el contrato, permisos y errores.

- Las variables `PG*` conservan la conexion anterior de usuarios, grupos y tareas.
- `TDD_DATABASE_URL` configura un pool independiente para el historial. El nombre
  de la base y el servidor son los indicados por esa URL; el esquema es `tdd_history`.
- El historial se escribe en `repositories`, `branches`, `commits`, `branch_commits`
  y `test_executions` de ese esquema. Ya no se usan las tablas provisionales
  `tdd_sync_history` y `tdd_sync_credentials`; los datos anteriores se conservan.
- Las credenciales de Neon permanecen exclusivamente en `server/.env`.
  `TDD_SYNC_CREDENTIALS` configura el permiso Bearer de cada repositorio.

Desde `server`, iniciar el backend con `npm run dev`. La ruta de sincronizacion
local es `http://127.0.0.1:3000/api/TDDCycles/sync`.

Compatibilidad del CLI local: `POST /api/TDDCycles/sync/credentials/cli` solo
entrega un token ya configurado en `TDD_SYNC_CREDENTIALS`, requiere el secreto
`TDD_SETUP_CODE` y una conexion loopback. No genera permisos ni crea tablas.
Usa `TDD_SYNC_URL` para entregar la direccion HTTP al proyecto base.

Desde el proyecto base, `npm run tdd:setup` guarda la credencial HTTP en
`.tddlab/sync-credentials.json` (fuera de Git). `npm test` envia ejecuciones y
`npm run tdd:sync-commit` envia el commit actual con sus metricas, sin escribir logs
locales ni modificar el SHA. La vinculacion de BL-01 por sesion en
`/sync/credentials` sigue disponible sin cambios.

Las cinco tablas ya deben existir en el destino. No ejecutar la migracion
baseline sobre un esquema existente sin verificar su estado. La migracion de
referencia esta en `migrations/tdd-history/001_create_tdd_history.sql`.
Las pruebas PostgreSQL completas requieren una BD de pruebas aislada y
`TDD_TEST_DATABASE_URL`; no usar la conexion compartida de desarrollo para ellas.

Los JSON historicos y los registros enviados a la BD provisional no se migran
ni se borran automaticamente. Las graficas y el HEAD de las ramas mantienen
las limitaciones documentadas en la API.
