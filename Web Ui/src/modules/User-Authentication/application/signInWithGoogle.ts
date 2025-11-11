import {
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthCredential,
  getAuth,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from "firebase/auth";
import firebase from "../../../firebaseConfig";

export async function handleSignInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const auth = getAuth(firebase);
    const result = await signInWithPopup(auth, provider);
    const pendingData = sessionStorage.getItem("pendingLink");
    if (pendingData) {
      const pending = JSON.parse(pendingData) as {
        provider: "google" | "github";
        idToken?: string | null;
        accessToken?: string | null;
      };
      if (pending.provider === "github") {
        try {
          if (pending.accessToken) {
            const githubCredential =
              GithubAuthProvider.credential(pending.accessToken);
            await linkWithCredential(result.user, githubCredential);
          }
        } catch (linkErr) {
          console.error(
            "Error al vincular credencial de GitHub pendiente:",
            linkErr
          );
        } finally {
          sessionStorage.removeItem("pendingLink");
        }
      }
    }
    return result.user;
  } catch (error: any) {
    console.error("Error de autenticación con Google", error);
    if (error?.code === "auth/account-exists-with-different-credential") {
      try {
        const auth = getAuth(firebase);
        const email = error?.customData?.email as string | undefined;
        const pendingCredential = GoogleAuthProvider.credentialFromError(
          error
        ) as OAuthCredential | null;
        if (!email || !pendingCredential) {
          return null;
        }
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (!methods.length || methods.includes("github.com")) {
          // Verificar si el usuario ya está autenticado con GitHub
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.providerData.some(
            (provider) => provider.providerId === "github.com"
          )) {
            // El usuario ya está autenticado con GitHub, vincular directamente
            try {
              await linkWithCredential(currentUser, pendingCredential);
              // Vinculación exitosa, retornar el usuario actualizado
              return currentUser;
            } catch (linkErr) {
              console.error("Error al vincular la cuenta de Google:", linkErr);
              alert(
                "No se pudo vincular la cuenta de Google. Por favor intenta nuevamente."
              );
              return null;
            }
          } else {
            // El usuario no está autenticado, guardar la credencial para vincular después
            sessionStorage.setItem(
              "pendingLink",
              JSON.stringify({
                provider: "google",
                idToken: pendingCredential.idToken ?? null,
                accessToken: pendingCredential.accessToken ?? null,
              })
            );
            alert(
              "Esta cuenta ya está registrada con GitHub. Inicia sesión con GitHub para completar la vinculación."
            );
            return { needsReauth: "github" as const };
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
        console.error("Error al vincular la cuenta de Google:", linkErr);
        alert(
          "No se pudo vincular la cuenta. Inicia sesión con GitHub y vuelve a intentar con Google."
        );
        return null;
      }
    }
    return null;
  }
}
