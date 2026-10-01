import { getAuth, signOut } from "firebase/auth";
import firebase from "../../../firebaseConfig";

export async function handleSignOut() {
  const auth = getAuth(firebase);
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión", error);
  }
}
