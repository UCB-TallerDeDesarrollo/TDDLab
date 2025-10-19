import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import firebase from "../../../firebaseConfig";

export async function handleSignInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const auth = getAuth(firebase);
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error de autenticación con Google", error);
  }
}
