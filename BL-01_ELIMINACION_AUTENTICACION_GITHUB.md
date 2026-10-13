# BL-01: eliminación completa de la autenticación con GitHub

## 1. Objetivo

La tarea BL-01 tuvo como objetivo retirar de TDDLab la posibilidad de iniciar sesión o registrarse mediante GitHub y conservar Google como único proveedor de autenticación visible.

El cambio se encuentra en:

- Rama: `Github-button`
- Commit funcional: `18a1f72f fix: removing the GitHub login button`

Aunque el nombre de la tarea menciona un botón, la solución no podía limitarse a ocultarlo. El flujo de GitHub atravesaba la interfaz, los hooks, los casos de uso, el repositorio HTTP, el proceso de invitaciones y el backend. Por eso se hizo una eliminación vertical completa.

## 2. Distinción fundamental

GitHub se utiliza en el proyecto para dos responsabilidades diferentes:

1. **Autenticar usuarios:** iniciar sesión o registrarse con una cuenta de GitHub.
2. **Analizar repositorios:** registrar enlaces, consultar commits y construir las gráficas TDD.

BL-01 eliminó únicamente la primera responsabilidad.

Se conservaron, entre otros elementos:

- `GitHubLinkDialog`, utilizado para registrar enlaces de repositorios.
- `CommitHistoryAdapter`, utilizado para obtener información de commits.
- `GithubRepository` del backend, utilizado por el módulo de ciclos TDD.
- Las rutas `/api/TDDCycles`.

Esta separación fue la principal precaución del cambio. Eliminar todo lo que contuviera la palabra `GitHub` habría roto la funcionalidad principal de TDDLab.

## 3. Flujo anterior y flujo resultante

### Antes

```text
Botón GitHub
    ↓
useAuth / flujo de invitación
    ↓
signInWithGithub (Firebase)
    ↓
CheckIfUserHasAccount
    ↓
LoginRepository
    ↓
POST /api/user/github
    ↓
UserController.getUserControllerGithub
    ↓
cookie de sesión de TDDLab
```

### Después

```text
Botón Google
    ↓
useAuth / flujo de invitación
    ↓
signInWithGoogle (Firebase)
    ↓
CheckIfUserHasAccount
    ↓
LoginRepository
    ↓
POST /api/user/google
    ↓
controlador de Google
    ↓
cookie de sesión de TDDLab
```

## 4. Orden seguido para realizar la eliminación

El commit contiene el resultado consolidado. Para comprenderlo y reproducirlo, este es el orden técnico en el que se abordó la eliminación.

### Paso 1: delimitar el alcance

Antes de borrar código se identificó qué referencias a GitHub pertenecían a autenticación y cuáles pertenecían al análisis de repositorios.

Se buscaron referencias como:

```text
handleSignInWithGitHub
signInWithGithub
handleGithubSignOut
userHasAnAccountWithToken
/user/github
getUserControllerGithub
Registrarse con GitHub
Accedé con GitHub
```

La regla utilizada fue:

> Se elimina una referencia solo si participa en la identidad o sesión del usuario. No se elimina si trabaja con repositorios, commits, pruebas o gráficas TDD.

### Paso 2: eliminar el botón de inicio de sesión de la presentación

En `Web Ui/src/presentation/auth/pages/AuthPage.tsx` se eliminó:

- El botón **“Accedé con GitHub”**.
- Su estilo verde.
- La referencia a `loginWithGitHub`.

La pantalla conservó el botón **“Accedé con Google”** y los estados de carga y error.

Este fue el cambio visible, pero todavía no era suficiente: si se hubiera detenido aquí, el código de GitHub y el endpoint seguirían disponibles.

### Paso 3: retirar GitHub del hook de autenticación

En `Web Ui/src/presentation/auth/hooks/useAuth.ts` se eliminó:

- La función `loginWithGitHub`.
- La importación de `handleSignInWithGitHub`.
- Los mensajes que pedían al usuario iniciar sesión con GitHub.
- La propiedad `loginWithGitHub` del objeto retornado por el hook.

El hook quedó responsable únicamente del inicio de sesión con Google.

### Paso 4: simplificar el servicio de presentación

En `Web Ui/src/presentation/auth/services/authService.ts` se eliminó el selector de proveedor.

Antes, `handleAuthResult` recibía `isGoogle` y decidía entre:

```text
userHasAnAccountWithGoogleToken
userHasAnAccountWithToken
```

Después del cambio, siempre utiliza:

```text
userHasAnAccountWithGoogleToken
```

También se eliminó el wrapper `handleSignInWithGitHub`.

Este paso redujo estados imposibles: si Google es el único proveedor permitido, ya no tiene sentido enviar un booleano para decidir qué proveedor procesar.

### Paso 5: eliminar el caso de uso de Firebase para GitHub

Se eliminó el archivo:

```text
Web Ui/src/modules/User-Authentication/application/signInWithGithub.ts
```

Ese archivo era el encargado de:

- Crear `OAuthProvider("github.com")`.
- Ejecutar `signInWithPopup`.
- Obtener el usuario de Firebase.

Al eliminarlo se evitó que otra pantalla pudiera reutilizar accidentalmente el inicio de sesión con GitHub.

### Paso 6: limpiar el puerto y el adaptador HTTP del frontend

En la arquitectura hexagonal del frontend se limpiaron dos niveles.

#### Puerto de dominio

En `LoginRepositoryInterface.ts` se retiró el contrato genérico asociado al token de GitHub y quedó explícito el contrato de Google:

```text
getAccountInfoWithGoogleToken(token)
```

#### Adaptador de infraestructura

En `LoginRepository.ts` se eliminó:

```text
POST /api/user/github
```

El repositorio conserva la llamada:

```text
POST /api/user/google
```

En `checkIfUserHasAccount.ts` también se eliminó `userHasAnAccountWithToken`, dejando únicamente la comprobación mediante Google.

Este paso es importante porque quitar solo la interfaz visual no elimina la capacidad técnica de llamar al endpoint antiguo.

### Paso 7: convertir el cierre de sesión en una operación neutral

Cerrar sesión en Firebase no es una operación exclusiva de GitHub. Por eso no se eliminó; se generalizó.

Se renombró:

```text
signOutWithGithub.ts → signOut.ts
handleGithubSignOut → handleSignOut
```

Después se actualizaron sus consumidores:

- Menú de navegación.
- Servicio de invitaciones.
- Pruebas unitarias.

La idea fue conservar la capacidad necesaria, pero retirar el nombre que la vinculaba incorrectamente con GitHub.

### Paso 8: corregir el acceso desde el menú de navegación

`loginComponent.tsx` tenía un segundo flujo de autenticación con GitHub, independiente de `AuthPage`.

Antes intentaba autenticar directamente con GitHub desde el menú. Después del cambio, cuando un usuario necesita acceder, el componente lo dirige a:

```text
/login
```

Así existe un solo punto de entrada para autenticación y ese punto ofrece únicamente Google.

### Paso 9: migrar completamente el flujo de invitaciones

El registro mediante invitación también permitía GitHub, por lo que se modificaron todas sus capas.

#### Página de invitación

En `InvitationPage.tsx` se eliminó:

- El icono de GitHub.
- El botón **“Registrarse con GitHub”**.
- La llamada a `handleSignUp`.

Se conservó **“Registrarse con Google”**.

#### Hook

En `useInvitationPage.ts` se eliminó:

- `handleSignUp` de GitHub.
- El estado `authProvider`.
- La selección entre Google y GitHub.

#### Servicio

En `invitation.service.ts` se eliminó:

- `signInInvitationWithGithub`.
- `resolveAuthProvider`.
- La importación de `handleSignInWithGitHub`.
- La rama de registro directo basada en correo para GitHub.

El registro ahora obtiene siempre el token de Firebase y ejecuta `registerWithGoogle`.

#### Tipos y componentes auxiliares

Se eliminó `InvitationAuthProvider` y la propiedad `authProvider` de `InvitationRegistrationParams`.

Los componentes `CheckRegisterGroupPopUp` y `SuccessfulEnrollmentPopUp` pasaron a consultar la cuenta exclusivamente con el token de Google.

Este paso evitó dejar una entrada indirecta a GitHub después de quitar el botón de `/login`.

### Paso 10: eliminar el endpoint del backend

En `server/src/routes/userRoutes.ts` se eliminó:

```text
POST /api/user/github
```

En `server/src/controllers/users/userController.ts` se eliminó el método:

```text
getUserControllerGithub
```

También se eliminaron sus imports exclusivos:

- Firebase Admin utilizado por ese método.
- Tipo `User` utilizado en ese flujo.
- `getUserToken` utilizado para generar la sesión del flujo GitHub.

El endpoint de Google permaneció intacto.

Con esto la capacidad dejó de existir en el servidor. Aunque alguien intentara invocar manualmente la URL antigua, Express respondería `404`.

### Paso 11: actualizar las pruebas

Las pruebas se modificaron junto con el comportamiento.

#### Prueba de presentación

`AuthPage.test.tsx` ahora verifica dos condiciones:

1. No existe ningún botón cuyo nombre contenga “GitHub”.
2. El botón de Google continúa presente.

#### Pruebas del caso de uso eliminado

Se eliminó `signInWithGithub.test.ts` porque su unidad de producción dejó de existir.

#### Prueba de cierre de sesión

`signOutWithGithub.test.ts` fue reemplazada por `signOut.test.ts`, verificando el comportamiento neutral `handleSignOut`.

#### Pruebas de invitaciones

Se actualizaron para simular Google y confirmar que el registro y la aceptación de invitaciones continúan funcionando.

#### Pruebas del controlador

Se eliminaron los casos dedicados a `getUserControllerGithub`, ya que el método dejó de formar parte del sistema.

#### Prueba negativa de la ruta

Se añadió `server/test/routes/userRoutes.test.ts`. Esta prueba intenta ejecutar:

```text
POST /api/user/github
```

y espera una respuesta `404`.

Esta prueba es especialmente valiosa porque demuestra la ausencia de la capacidad, no solo la ausencia del botón.

### Paso 12: buscar residuos y comprobar la frontera del cambio

Después de modificar las capas se realizó una búsqueda global de los identificadores eliminados.

En el código de producción ya no aparecen:

```text
signInWithGithub
handleSignInWithGitHub
handleGithubSignOut
getUserControllerGithub
/user/github
Registrarse con GitHub
Accedé con GitHub
```

La única referencia esperada a `/user/github` está en la prueba negativa que comprueba que la ruta responde `404`.

Luego se confirmó que seguían existiendo los módulos de análisis de repositorios GitHub. De esta manera se verificó que la limpieza no excediera el alcance de BL-01.

## 5. Relación con la arquitectura hexagonal

El cambio puede estudiarse como un recorrido vertical por las capas.

| Capa | Elementos modificados | Responsabilidad |
|---|---|---|
| Presentación | `AuthPage`, `InvitationPage`, popups y menú | Dejar de ofrecer GitHub al usuario |
| Coordinación de presentación | `useAuth`, `useInvitationPage`, servicios | Eliminar decisiones y estados relacionados con GitHub |
| Aplicación | `signInWithGithub`, `CheckIfUserHasAccount` | Retirar los casos de uso exclusivos de GitHub |
| Dominio/puertos | `LoginRepositoryInterface`, tipos de invitación | Eliminar contratos que ya no deben existir |
| Adaptadores | `LoginRepository`, Firebase Google | Dejar de invocar `/user/github` y conservar Google |
| Entrada del backend | `userRoutes` | Retirar la ruta HTTP |
| Controlador backend | `UserController` | Retirar la coordinación del login GitHub |
| Infraestructura de repositorios | `GithubRepository` de TDD Cycles | Se conserva porque no autentica usuarios |

La lección principal es que una funcionalidad está completamente eliminada cuando desaparece desde la presentación hasta el adaptador de entrada del backend. Ocultar el botón solo modifica la capa exterior.

## 6. Cómo se garantizó que el cambio estaba bien hecho

### 6.1 Verificación automatizada del frontend

Se ejecutaron las pruebas directamente relacionadas con el cambio:

```powershell
cd "Web Ui"

.\node_modules\.bin\jest.cmd `
  "test/presentation/auth/AuthPage.test.tsx" `
  "test/presentation/group-invitation/InvitationPage.test.tsx" `
  "test/presentation/group-invitation/SuccesfulEnrollmentCourse.test.tsx" `
  "test/modules/User-Authentication/application/signOut.test.ts" `
  --runInBand --coverage=false --forceExit
```

Resultado verificado el 16 de septiembre de 2026:

```text
4 suites aprobadas
8 pruebas aprobadas
```

Las suites de componentes dejan manejadores asíncronos abiertos en la configuración actual de Jest. Al ejecutarlas individualmente se utilizó `--forceExit` para finalizar el proceso después de obtener el resultado. Es una limitación conocida del entorno de pruebas y no un fallo funcional de BL-01.

### 6.2 Verificación automatizada del backend

```powershell
cd server

.\node_modules\.bin\jest.cmd `
  "test/routes/userRoutes.test.ts" `
  "test/controllers/userController.test.ts" `
  --runInBand --coverage=false
```

Resultado:

```text
2 suites aprobadas
7 pruebas aprobadas
```

La prueba más importante para BL-01 confirma que `POST /api/user/github` devuelve `404`.

### 6.3 Compilación

Se verificaron los dos proyectos:

```powershell
cd "Web Ui"
npm.cmd run build

cd ..\server
npm.cmd run tsc
```

Resultados:

- Frontend: compilación TypeScript y build de Vite correctos.
- Backend: compilación TypeScript correcta.
- Vite informó una advertencia de tamaño de bundle superior a 500 kB; no está relacionada con BL-01.
- `ts-jest` informó una advertencia sobre `isolatedModules`; las pruebas finalizaron correctamente.

### 6.4 Verificación estática de residuos

Se buscó cualquier uso restante del flujo eliminado. El criterio fue:

- Cero referencias activas a autenticación GitHub.
- Una referencia permitida a `/user/github` dentro de la prueba que espera `404`.
- Permanencia de las referencias a GitHub asociadas a repositorios y gráficas.

### 6.5 Verificación funcional esperada

La comprobación manual debe cubrir:

1. Abrir `/login`.
2. Confirmar que solo aparece **“Accedé con Google”**.
3. Iniciar sesión con Google y confirmar que se crea la sesión de TDDLab.
4. Cerrar sesión desde el menú y confirmar que la sesión termina.
5. Abrir una invitación y confirmar que solo aparece el registro con Google.
6. Completar una invitación con Google.
7. Intentar `POST /api/user/github` y confirmar `404`.
8. Registrar un enlace de repositorio GitHub en una tarea.
9. Abrir su gráfica y confirmar que los commits continúan cargando.

Los últimos dos puntos garantizan que se eliminó la autenticación con GitHub sin eliminar la integración académica con sus repositorios.

## 7. Errores que se evitaron

### Error 1: ocultar únicamente el botón

Habría dejado el hook, el caso de uso y el endpoint disponibles.

### Error 2: borrar todas las referencias a GitHub

Habría eliminado también la consulta de repositorios y roto las gráficas TDD.

### Error 3: olvidar el flujo de invitaciones

Los usuarios todavía habrían podido registrarse con GitHub desde otra pantalla.

### Error 4: eliminar el cierre de sesión

La función tenía un nombre asociado a GitHub, pero su comportamiento era genérico de Firebase. La solución correcta fue renombrarla.

### Error 5: conservar contratos y tipos obsoletos

Aunque no se utilizaran, habrían comunicado que GitHub seguía siendo un proveedor válido y podrían haber sido reutilizados accidentalmente.

### Error 6: borrar las pruebas sin reemplazar la garantía

Las pruebas del comportamiento eliminado se retiraron, pero se añadieron garantías negativas: el botón no existe y el endpoint devuelve `404`.

## 8. Resumen para estudiar o exponer

La eliminación comenzó identificando todos los puntos por los que GitHub participaba en la autenticación. Primero se retiró el botón de las pantallas de login e invitaciones. Después se eliminaron las funciones de los hooks y servicios, el caso de uso de Firebase, el método del puerto y la llamada HTTP del repositorio. Luego se generalizó el cierre de sesión, porque esa operación seguía siendo necesaria para Google. Finalmente se eliminó la ruta y el controlador del backend.

La solución se validó con pruebas que confirman que el botón ya no se renderiza, que Google continúa disponible, que las invitaciones siguen funcionando y que la antigua ruta de GitHub devuelve `404`. Además, se compilaron frontend y backend y se verificó que la integración con repositorios GitHub permaneciera intacta.

## 9. Preguntas de repaso

1. ¿Por qué ocultar el botón no elimina completamente una funcionalidad?
2. ¿Qué diferencia existe entre autenticación GitHub e integración con repositorios GitHub?
3. ¿Qué papel cumple `LoginRepositoryInterface` dentro de la arquitectura?
4. ¿Por qué `handleGithubSignOut` se renombró en lugar de eliminarse?
5. ¿Por qué fue necesario revisar el flujo de invitaciones?
6. ¿Qué garantiza la prueba que espera un `404` de `/api/user/github`?
7. ¿Qué capas se recorrieron para completar la eliminación vertical?
8. ¿Cómo se comprobó que las gráficas TDD no fueran afectadas?
