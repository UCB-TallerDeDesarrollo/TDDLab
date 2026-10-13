import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import firebase from "../../../firebaseConfig";

function isPopupBlockedError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "auth/popup-blocked"
  );
}

export async function handleSignInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(firebase);

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (isPopupBlockedError(error)) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    throw error;
  }
}

export async function handleGoogleRedirectResult() {
  const auth = getAuth(firebase);
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
}
