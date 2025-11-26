import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import firebase from "../../../firebaseConfig";

export async function handleSignInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(firebase);
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

