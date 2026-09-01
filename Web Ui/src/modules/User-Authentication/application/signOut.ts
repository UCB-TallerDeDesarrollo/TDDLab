import { getAuth, signOut } from "firebase/auth";
import firebase from "../../../firebaseConfig";

export async function handleSignOut() {
  const auth = getAuth(firebase);
  await signOut(auth);
}
