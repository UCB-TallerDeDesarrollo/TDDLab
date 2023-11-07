import {
  OAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import firebase from "../../../firebaseConfig";

export class GithubAuthPort {
  async handleSignInWithGitHub() {
    const provider = new OAuthProvider("github.com");
    try {
      const auth = getAuth(firebase);
      const result = await signInWithPopup(auth, provider);

      return result.user;
    } catch (error) {
      console.error("Error de autenticación con GitHub", error);
    }
  }
  async handleSignOut() {
    const auth = getAuth(firebase);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  }
}
