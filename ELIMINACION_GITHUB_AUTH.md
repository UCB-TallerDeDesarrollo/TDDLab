# Documentación de Eliminación de Autenticación con GitHub (TDDLab)

**Fecha:** Septiembre 2026  
**Proyecto:** TDDLab (FrontEnd: `Web Ui` | BackEnd: `server`)  

---

## 1. Resumen Ejecutivo

Este documento detalla el proceso, la arquitectura y las razones técnicas detrás de la remoción completa del sistema de **autenticación / inicio de sesión con GitHub** en TDDLab, asegurando la preservación intacta de la **integración funcional con repositorios y commits de GitHub** necesaria para el flujo central de trabajo de TDD.

---

## 2. Diferenciación Crítica: Autenticación vs. Integración de Repositorios

Para evitar romper la funcionalidad principal de la plataforma (seguimiento de ciclos TDD en repositorios de GitHub), se aplicó una estricta separación de responsabilidades:

| Dominio | Estado | Descripción |
| :--- | :---: | :--- |
| **Autenticación (Auth)** | ❌ **ELIMINADO** | Inicio de sesión, registro, tokens de autenticación de usuario y callbacks de OAuth a nivel de identidad usando GitHub. |
| **Integración TDD / Repositorios** | ✅ **MANTENIDO** | Validación de URLs (`github.com/usuario/repo`), consulta a la API de GitHub (Octokit) para obtener commits, archivos y visualizar ciclos TDD. |

---

## 3. Detalle de Cambios en FrontEnd (`Web Ui`)

### 3.1. Archivos Eliminados
1. **`src/modules/User-Authentication/application/signInWithGithub.ts`**
   - **Razón:** Contenía la función `handleSignInWithGitHub()`, la cual invocaba a Firebase con `OAuthProvider("github.com")`. Al migrar la autenticación de usuarios al proveedor de Google, esta lógica quedó obsoleta.
2. **`test/modules/User-Authentication/application/signInWithGithub.test.ts`**
   - **Razón:** Suite de pruebas unitarias asociada al inicio de sesión con GitHub.

### 3.2. Archivos Refactorizados
1. **`src/modules/User-Authentication/application/signOutWithGithub.ts` ➔ `signOut.ts`**
   - **Cambio:** Se renombró el módulo y la función exportada a `handleSignOut()`.
   - **Justificación:** La función internamente llamaba a `signOut(auth)` de Firebase, lo cual cierra la sesión de Firebase independientemente del proveedor de identidad utilizado (ej. Google). El nombre original causaba confusión.
2. **`test/modules/User-Authentication/application/signOutWithGithub.test.ts` ➔ `signOut.test.ts`**
   - **Cambio:** Actualización de las pruebas unitarias asociadas a la función genérica `handleSignOut()`.

### 3.3. Limpieza de Repositorios y Servicios Intermediarios
1. **`src/modules/User-Authentication/domain/LoginRepositoryInterface.ts`**
   - **Cambio:** Eliminación de la definición del método `getAccountInfoWithToken(token: string)`.
2. **`src/modules/User-Authentication/repository/LoginRepository.ts`**
   - **Cambio:** Eliminación de la implementación de `getAccountInfoWithToken(idToken: string)` que realizaba peticiones `POST` al endpoint `/user/github`.
3. **`src/modules/User-Authentication/application/checkIfUserHasAccount.ts`**
   - **Cambio:** Eliminación del método `userHasAnAccountWithToken(idToken: string)`.
4. **`src/app/navigation/components/loginComponent.tsx`**
   - **Cambio:** Actualización de la importación y llamada a `handleSignOut()` en el menú de usuario.
5. **`src/presentation/group-invitation/services/invitation.service.ts`**
   - **Cambio:** Actualización de la función `signOutInvitationSession()` para consumir el nuevo `handleSignOut()`.
6. **`test/presentation/group-invitation/SuccesfulEnrollmentCourse.test.tsx`**
   - **Cambio:** Eliminación del mock del método en desuso `userHasAnAccountWithToken`.

---

## 4. Detalle de Cambios en BackEnd (`server`)

### 4.1. Verificación del Dominio de Usuarios (`server/src/controllers/users/userController.ts` y `server/src/routes/userRoutes.ts`)
- **Estado:** El backend ya se encontraba adaptado para autenticación exclusiva con Google y manejo de sesiones seguras mediante JWT / HTTP-Only Cookies (`/api/user/google`, `/api/user/register/google`, `/api/user/me`).
- **Endpoints de Autenticación Activos:**
  - `POST /api/user/google` (Inicio de sesión verificado con Firebase Google Token)
  - `POST /api/user/register/google` (Registro de usuarios de curso con Google Token)
  - `POST /api/user/logout` (Destrucción de la cookie `userSession`)
  - `GET /api/user/me` (Información del usuario autenticado)

---

## 5. Prevención de Daños Colaterales (Safety & Integrity Checks)

Para asegurar que la eliminación no impactara otras áreas del sistema, se realizaron las siguientes verificaciones:

1. **Búsqueda global de referencias:** Se realizó un escaneo completo (`grep`) confirmando que no existen referencias residuales a `signInWithGithub`, `signOutWithGithub` ni a `/user/github`.
2. **Integridad del Visor de Ciclos TDD:** Los módulos bajo `src/modules/TDDCycles-Visualization` y `server/src/modules/TDDCycles` se mantuvieron 100% intactos ya que dependen de la API de repositorios de GitHub y no de la identidad del usuario en la plataforma.
3. **Página de Login (`AuthPage.tsx`):** Se confirmó que la interfaz presenta de manera limpia y clara la única opción de inicio de sesión soportada: **"Accedé con Google"**.

---

## 6. Verificación de Pruebas Unitarias

Se ejecutaron las suites de pruebas automatizadas:
- **FrontEnd (`Web Ui`):** `npm test` ➔ Todas las pruebas pasan satisfactoriamente.
- **BackEnd (`server`):** `npm test` ➔ Todas las pruebas pasan satisfactoriamente.

---

*Documento generado automáticamente tras la refactorización e inspección del proyecto.*
