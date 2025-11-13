import {
  GithubAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth";
import firebase from "../../../firebaseConfig";

export async function handleSignInWithGitHub() {
  const auth = getAuth(firebase);
  
  // Verificar si ya hay una sesión activa con otro proveedor
  const currentUser = auth.currentUser;
  if (currentUser) {
    const providerData = currentUser.providerData;
    const hasGoogle = providerData.some(
      (provider) => provider.providerId === "google.com"
    );
    
    if (hasGoogle) {
      alert("Ya tienes una sesión activa con Google. Debes iniciar sesión con Google.");
      return null;
    }
  }
  
  const provider = new GithubAuthProvider();
  // Garantiza que se obtenga el email del usuario desde GitHub
  try {
    provider.addScope("user:email");
  } catch {
    // ignorar si no se puede añadir scope en algún entorno
  }
  
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: unknown) {
    const fbErr = error as { code?: string; customData?: { email?: string } };
    console.error("Error de autenticación con GitHub", fbErr);

    // Si el correo ya existe con otro proveedor (normalmente Google)
    if (fbErr?.code === "auth/account-exists-with-different-credential") {
      alert(
        "Esta cuenta ya está registrada con Google. Debes iniciar sesión con Google."
      );
    }

    // Otros errores (popup cerrado, red, etc.)
    return null;
  }
}
