# API de sincronización del historial TDD — Sprint 4

## Estado y alcance

La fase 4 incorpora un receptor HTTP para los scripts de BL-06. Recibe el contrato `BranchSyncData` versión 1, valida el lote, lo transforma en `TDDHistoryBatch` y utiliza `PostgresTDDHistoryRepository`.

La autenticación inicial acordada es un token Bearer exclusivo de sincronización, con permiso para un repositorio configurado en el servidor. El aprovisionamiento y la entrega del token al equipo son manuales; este endpoint no genera tokens ni verifica propiedad en GitHub. No utiliza una sesión del navegador ni un PAT de GitHub.

Las tablas de la migración `migrations/tdd-history/001_create_tdd_history.sql` deben estar aplicadas en la base de destino antes de enviar datos. Crear un endpoint no ejecuta migraciones automáticamente.

## Endpoint para BL-06

```http
POST /api/TDDCycles/sync
Authorization: Bearer <token-del-repositorio>
Content-Type: application/json
```

En desarrollo: `http://localhost:3000/api/TDDCycles/sync`. La URL desplegada dependerá del entorno donde se publique este commit.

El cuerpo es **el objeto completo `BranchSyncData`**, sin envolverlo en `data` o `payload`:

```json
{
  "schemaVersion": 1,
  "mode": "incremental",
  "repository": {
    "provider": "github",
    "owner": "equipo-tddlab",
    "name": "ejemplo-sprint4"
  },
  "branch": {
    "name": "main",
    "headSha": null,
    "expectedHeadVersion": null
  },
  "commits": [],
  "branchCommitShas": [],
  "executions": []
}
```

Este ejemplo mínimo registra la rama sin inventar datos. Para probar commits y ejecuciones reales del contrato, usar los cuatro ejemplos ya disponibles:

- `test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/main.json`.
- `test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/rama-a.json`.
- `test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/rama-b.json`.
- `test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/main-after-merge.json`.

El contrato TypeScript de referencia es `src/modules/TDDCycles/Application/BranchSyncData.ts`. Los scripts JavaScript pueden consumir los JSON y enviar la misma estructura; no necesitan importar TypeScript ni instalar el backend.

### Reglas de entrada

- `schemaVersion` debe ser `1` y `mode`, `incremental`.
- Los campos del contrato son obligatorios, incluso si su valor admitido es `null`. No sustituir valores desconocidos por cero.
- `provider` debe ser `github`; `owner` y `name` son segmentos, no una URL completa. El nombre no debe incluir el sufijo de clonación `.git`. Deben coincidir exactamente con el permiso del token; el endpoint no cambia mayúsculas y minúsculas.
- `branch.name` debe ser un texto no vacío y sin espacios en los extremos.
- Los SHA deben ser completos, hexadecimales en minúsculas, de 40 o 64 caracteres. No enviar el marcador mutable `HEAD`.
- `headSha`, `headShaAtExecution` y `associatedCommitSha` admiten `null` según el contrato. El primer valor pertenece a la rama consultada; el segundo conserva el contexto de ejecución; el tercero puede completarse posteriormente.
- `expectedHeadVersion` admite `null` o un entero seguro no negativo. Para scripts sin estado del backend, enviar `null`.
- `eventId` se genera una sola vez durante la captura y debe ser un UUID canónico en minúsculas. Conservarlo en los reintentos y después de un merge. Lo mismo aplica a `metrics.executionEventId` cuando se conoce.
- `timestamp` está expresado en milisegundos Unix. Las fechas de commit se envían como ISO UTC canónico, por ejemplo `2026-11-13T14:01:00.000Z`, o `null`.
- Las cantidades son enteros seguros no negativos; exitosas + fallidas no supera el total. La cobertura es `null` o un número finito entre 0 y 100. Una ejecución exitosa no puede tener pruebas fallidas.
- Un commit incluido en `branchCommitShas` debe existir en la base o llegar en `commits`. Una asociación de ejecución conocida también debe referirse a un commit disponible en el mismo repositorio.
- Los padres de un commit y el HEAD de captura pueden referirse a commits aún no importados. `parentShas: []` identifica una raíz; `parentShas: null` significa que los padres se desconocen.
- Los campos adicionales no se transfieren al almacenamiento. El backend selecciona expresamente los campos del contrato.
- El límite del cuerpo JSON es **2 MiB**. Dividir historiales mayores en lotes incrementales; enviar primero los commits que necesitan las relaciones o asociaciones posteriores.

### HEAD: limitación explícita de esta entrega

Esta versión guarda historial, relaciones y ejecuciones, pero **no actualiza el HEAD almacenado de una rama ni aplica `expectedHeadVersion` como control de concurrencia**. Puede aceptar el historial de un lote con esos metadatos sin afirmar que su HEAD fue aplicado.

Cada respuesta exitosa incluye `headUpdate.status: "not_applied"` y `reason: "HEAD_UPDATES_NOT_SUPPORTED"`. BL-06 no debe interpretar un HTTP 200 como confirmación de actualización de HEAD. La política de HEAD y sus conflictos sigue pendiente con la API; los scripts pueden capturar eventos offline sin consultar la base.

## Configuración del backend

En `server/.env`, conservar las variables `PG*` actuales y agregar:

```dotenv
TDD_DATABASE_URL="postgresql://USUARIO:CONTRASENA@HOST/tddlab_history?sslmode=require"
TDD_SYNC_CREDENTIALS='[{"token":"REEMPLAZAR_POR_TOKEN_ALEATORIO_DE_32_BYTES","repository":{"provider":"github","owner":"equipo-tddlab","name":"ejemplo-sprint4"}}]'
```

La URL real se obtiene de la base de destino en Neon, conservando sus parámetros de conexión. El token de la plantilla debe sustituirse por uno aleatorio. Para generarlo, ejecutar localmente:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`TDD_SYNC_CREDENTIALS` es un arreglo JSON de permisos. Cada entrada tiene `token` y `repository`; el token acepta entre 32 y 256 caracteres de `A-Z`, `a-z`, `0-9`, `_` y `-`. Un token solo puede aparecer una vez. Para rotarlo temporalmente se pueden configurar dos tokens distintos para el mismo repositorio; eliminar el antiguo revoca su permiso.

Configurar estas variables también en el backend desplegado cuando se publique el cambio. No incluirlas en el frontend, no usar prefijo `VITE_`, no compartir la URL PostgreSQL con los scripts y no versionar los secretos. Para el script se entrega únicamente su token y la URL HTTP de sincronización; usar HTTPS en los entornos desplegados.

La configuración se valida al atender la sincronización. Los demás endpoints no necesitan `TDD_DATABASE_URL` para arrancar por la incorporación de esta ruta. El pool PostgreSQL se obtiene solo después de validar el lote y comprobar el permiso.

## Ejemplo de envío desde JavaScript

Fragmento de referencia para BL-06, sin modificaciones a TDDLabBaseProject:

```javascript
async function synchronizeBranch(batch) {
  const url = process.env.TDD_SYNC_URL;
  const token = process.env.TDD_SYNC_TOKEN;
  if (!url || !token)
    throw new Error("Configurar TDD_SYNC_URL y TDD_SYNC_TOKEN");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batch),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.code || "SYNC_FAILED");
    error.status = response.status;
    throw error;
  }
  return result;
}
```

Conservar el lote local hasta recibir una respuesta exitosa. Ante un timeout o error de red puede no saberse si el servidor confirmó la transacción: reenviar el mismo lote con los mismos `eventId`. La idempotencia evita duplicaciones. Aplicar reintentos con espera; no reintentar indefinidamente errores 400, 401, 403 o 409 sin corregir su causa.

### Prueba manual con PowerShell

Desde `server`, con el backend configurado y ejecutándose con `npm run dev`:

```powershell
# Definir TDD_SYNC_TOKEN en el entorno local con el valor entregado para el repositorio.
$syncHeaders = @{ Authorization = "Bearer $env:TDD_SYNC_TOKEN" }
$syncBody = Get-Content -Raw -Encoding utf8 'test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/main.json'
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/TDDCycles/sync' -Headers $syncHeaders -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($syncBody))
```

Reenviar el mismo ejemplo y luego los otros tres. El total final esperado es 1 repositorio, 3 ramas, 4 commits, 8 relaciones y 3 ejecuciones. No hay una ejecución sintética del merge y las capturas originales se conservan.

## Respuesta exitosa y errores

HTTP **200**, tanto en el primer lote como en un reenvío:

```json
{
  "schemaVersion": 1,
  "mode": "incremental",
  "repository": {
    "provider": "github",
    "owner": "equipo-tddlab",
    "name": "ejemplo-sprint4"
  },
  "branch": "main",
  "summary": {
    "repositoryCreated": true,
    "branchesAdded": 1,
    "commitsAdded": 1,
    "commitsUpdated": 0,
    "relationsAdded": 1,
    "executionsAdded": 1,
    "executionsUpdated": 0
  },
  "headUpdate": {
    "status": "not_applied",
    "reason": "HEAD_UPDATES_NOT_SUPPORTED"
  }
}
```

El ejemplo corresponde al primer envío de `main.json` sobre un repositorio ausente. En el reenvío idéntico `repositoryCreated` es `false` y las cantidades son cero. Las cantidades contabilizan operaciones efectivas realizadas dentro del lote; no son un inventario total de la base.

| HTTP | `code`                                | Acción del emisor                                                                                                                      |
| ---- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `INVALID_JSON` / `INVALID_SYNC_BATCH` | Corregir JSON, formato, campos o referencias inválidas.                                                                                |
| 401  | `UNAUTHORIZED`                        | Proporcionar un token Bearer válido.                                                                                                   |
| 403  | `REPOSITORY_FORBIDDEN`                | El token pertenece a otro repositorio; revisar el permiso con el equipo.                                                               |
| 409  | `HISTORY_CONFLICT`                    | Revisar la reutilización de identidades con datos incompatibles. No sobrescribir ni generar un evento nuevo para ocultar el conflicto. |
| 413  | `PAYLOAD_TOO_LARGE`                   | Dividir el lote respetando sus referencias.                                                                                            |
| 415  | `JSON_REQUIRED`                       | Enviar `Content-Type: application/json`.                                                                                               |
| 503  | `SYNC_UNAVAILABLE`                    | Revisar configuración del backend.                                                                                                     |
| 500  | `SYNC_FAILED`                         | Revisar almacenamiento o error interno; conservar el lote para diagnóstico o reintento.                                                |

Los errores se devuelven como `{ "code": "...", "message": "..." }`, sin credenciales ni detalles internos de conexión. Los lotes inválidos o conflictivos no dejan escrituras parciales. El endpoint no envía ni elimina datos del repositorio GitHub.

## Archivos y comprobaciones

- `src/modules/TDDCycles/Application/normalizeBranchSyncData.ts`: validación de entrada y transformación DTO → dominio.
- `src/modules/TDDCycles/Application/SyncBranchHistoryUseCase.ts`: permiso de repositorio y guardado mediante el puerto existente.
- `src/modules/TDDCycles/Infrastructure/BranchSyncCredentials.ts`: lectura de credenciales y verificación del token.
- `src/controllers/TDDCycles/BranchSyncController.ts`: respuesta HTTP y traducción de errores.
- `src/routes/TDDHistorySyncRoutes.ts`: composición PostgreSQL, autenticación y parser exclusivo del endpoint.
- `src/app.ts`: montaje antes del parser general para respetar el límite propio.

Desde `server`:

```powershell
node ./node_modules/jest/bin/jest.js --runTestsByPath test/modules/TDDCycles/Application/SyncBranchHistoryUseCase.test.ts test/routes/TDDHistorySyncRoutes.test.ts --runInBand --coverage=false
node ./node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
```

Las pruebas HTTP utilizan el repositorio funcional en memoria y comprueban separadamente la composición con PostgreSQL mediante sustituciones de prueba. No prueban conectividad real con Neon. Para verificar la persistencia real se necesita una base aislada, la migración aplicada y `TDD_TEST_DATABASE_URL` para la suite de integración existente.

Las consultas para gráficas, el despliegue, el aprovisionamiento automatizado de tokens y la política de actualización de HEAD siguen siendo entregas independientes. La implementación de este receptor no modifica los scripts ni el frontend.

## Entrega de credenciales a un usuario de TDDLab

`POST /api/TDDCycles/sync/credentials` recibe `{"repository":{"provider":"github","owner":"equipo-tddlab","name":"ejemplo-sprint4"}}` como JSON. El cliente de vinculación debe enviar la cookie de sesión `userSession`.

En el backend, configurar `TDD_SYNC_URL` con la URL completa de `/api/TDDCycles/sync` y añadir `"userIds":[23]` a la entrada correspondiente de `TDD_SYNC_CREDENTIALS`, usando los IDs internos de los usuarios autorizados. Cada entrada existente sin `userIds` sigue funcionando para sincronizar y queda fuera de la entrega por sesión. Si hay varias entradas autorizadas para el mismo usuario y repositorio, se entrega la primera.

El endpoint devuelve `TDD_SYNC_URL` y `TDD_SYNC_TOKEN` con `Cache-Control: no-store`. Devuelve `401` si la sesión es inválida y `403` si el usuario no tiene asignada esa credencial. La URL configurada requiere HTTPS, con excepción de HTTP en localhost.

El cliente de vinculación debe guardar la respuesta fuera de Git para que el proyecto base la cargue cuando ejecute las pruebas. El servidor conserva la URL de PostgreSQL y las credenciales de Neon.

### Configuración del despliegue

En los entornos `staging` y `production` de GitHub Actions, asignar `TDD_DATABASE_URL` y `TDD_SYNC_CREDENTIALS` como secretos del entorno. Asignar `TDD_SYNC_URL` como variable del entorno con la URL pública completa del endpoint `/api/TDDCycles/sync` del backend correspondiente. Incluir los IDs internos autorizados en `userIds` para cada credencial que deba entregarse.

El workflow pasa estos valores como variables de ejecución al proyecto de Vercel correspondiente. También se pueden configurar directamente en Vercel. Los valores definidos en GitHub Actions se aplican al despliegue, y los que se dejan vacíos se omiten para conservar la configuración administrada en Vercel.

## Compatibilidad de vinculacion CLI local (BL-06)

`POST /api/TDDCycles/sync/credentials/cli` recibe el mismo repositorio y el header
`x-tdd-setup-code`. Exige `TDD_SETUP_CODE`, conexiones locales y un permiso existente
en `TDD_SYNC_CREDENTIALS`. Devuelve la URL `TDD_SYNC_URL` y el token de ese permiso
con `Cache-Control: no-store`. No modifica los permisos ni persiste tokens en las
tablas de historial. Los scripts pueden seguir usando `npm run tdd:setup`.
