import { AuthProvider, GithubAuthProvider, GoogleAuthProvider, User, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig"
// if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
//   connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
// }

export enum OAuthProvider {
  Google = "google",
  Github = "github"
}

class FirebaseAuthManager{
  oAuthProviders: Record<OAuthProvider,AuthProvider> = {
    [OAuthProvider.Google]: new GoogleAuthProvider(),
    [OAuthProvider.Github]: new GithubAuthProvider()
  };
  async loginWithOAuth(provider: OAuthProvider): Promise<User>{
    const firebaseProvider = this.oAuthProviders[provider];
    try {
      const result = await signInWithPopup(auth, firebaseProvider);
      return result.user;
    } catch (error) {
      console.error("Error en la authenticacion");
      throw error;
    }
  }
  async logout(): Promise<boolean>{
    let success = true;
    await signOut(auth).catch(error => {
      console.error(error);
      success = false;
    });
    return Promise.resolve(success);
  }
}

export const fireBaseAuthManager = new FirebaseAuthManager;
