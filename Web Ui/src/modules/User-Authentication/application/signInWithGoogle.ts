import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth";
import firebase from "../../../firebaseConfig";

export async function handleSignInWithGoogle() {
  const auth = getAuth(firebase);
  
  // Verificar si ya hay una sesión activa con otro proveedor
  const currentUser = auth.currentUser;
  if (currentUser) {
    const providerData = currentUser.providerData;
    const hasGitHub = providerData.some(
      (provider) => provider.providerId === "github.com"
    );
    
    if (hasGitHub) {
      alert("Ya tienes una sesión activa con GitHub. Debes iniciar sesión con GitHub.");
      return null;
    }
  }
  
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Error de autenticación con Google", error);
    if (error?.code === "auth/account-exists-with-different-credential") {
      alert(
        "Esta cuenta ya está registrada con GitHub. Debes iniciar sesión con GitHub."
      );
    }
    return null;
  }
}
