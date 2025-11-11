import {
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthCredential,
  getAuth,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from "firebase/auth";
import firebase from "../../../firebaseConfig";
export async function handleSignInWithGitHub() {
  const provider = new GithubAuthProvider();
  // Garantiza que se obtenga el email del usuario desde GitHub
  try {
    provider.addScope("user:email");
  } catch {
    // ignorar si no se puede añadir scope en algún entorno
  }
  try {
    const auth = getAuth(firebase);
    const result = await signInWithPopup(auth, provider);
    // Si había una credencial pendiente de Google para vincular, procesarla
    const pendingData = sessionStorage.getItem("pendingLink");
    if (pendingData) {
      const pending = JSON.parse(pendingData) as {
        provider: "google" | "github";
        idToken?: string | null;
        accessToken?: string | null;
      };
      if (pending.provider === "google") {
        try {
          const googleCredential = GoogleAuthProvider.credential(
            pending.idToken ?? undefined,
            pending.accessToken ?? undefined
          );
          await linkWithCredential(result.user, googleCredential);
        } catch (linkErr) {
          console.error(
            "Error al vincular credencial de Google pendiente:",
            linkErr
          );
        } finally {
          sessionStorage.removeItem("pendingLink");
        }
      }
    }
    return result.user;
  } catch (error: unknown) {
    const fbErr = error as { code?: string; customData?: { email?: string } };
    console.error("Error de autenticación con GitHub", fbErr);

    // Si el correo ya existe con otro proveedor (normalmente Google)
    if (fbErr?.code === "auth/account-exists-with-different-credential") {
      try {
        const auth = getAuth(firebase);
        const email = fbErr?.customData?.email as string | undefined;
        const pendingCredential = GithubAuthProvider.credentialFromError(
          error as never
        ) as OAuthCredential | null;
        if (!email || !pendingCredential) {
          return null;
        }
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (!methods.length || methods.includes("google.com")) {
          // Verificar si el usuario ya está autenticado con Google
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.providerData.some(
            (provider) => provider.providerId === "google.com"
          )) {
            // El usuario ya está autenticado con Google, vincular directamente
            try {
              await linkWithCredential(currentUser, pendingCredential);
              // Vinculación exitosa, retornar el usuario actualizado
              return currentUser;
            } catch (linkErr) {
              console.error("Error al vincular la cuenta de GitHub:", linkErr);
              alert(
                "No se pudo vincular la cuenta de GitHub. Por favor intenta nuevamente."
              );
              return null;
            }
          } else {
            // El usuario no está autenticado, guardar la credencial para vincular después
            sessionStorage.setItem(
              "pendingLink",
              JSON.stringify({
                provider: "github",
                accessToken: pendingCredential.accessToken ?? null,
              })
            );
            alert(
              "Esta cuenta ya está registrada con Google. Inicia sesión con Google para completar la vinculación."
            );
            return { needsReauth: "google" as const };
          }
        } else {
          alert(
            `Esta cuenta ya está registrada con otro proveedor: ${
              methods[0] || "desconocido"
            }. Inicia sesión con ese proveedor.`
          );
        }
        return null;
      } catch (linkErr) {
        console.error("Error al vincular la cuenta de GitHub:", linkErr);
        alert(
          "No se pudo vincular la cuenta. Inicia sesión con Google y vuelve a intentar con GitHub."
        );
        return null;
      }
    }

    // Otros errores (popup cerrado, red, etc.)
    return null;
  }
}
