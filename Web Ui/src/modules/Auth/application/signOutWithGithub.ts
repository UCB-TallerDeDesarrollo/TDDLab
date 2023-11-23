import { getAuth, signOut } from "firebase/auth";
import firebase from "../../../firebaseConfig";

export async function handleGithubSignOut() {
  const auth = getAuth(firebase);
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión", error);
  }
}
