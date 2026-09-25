import {
  Auth,
  AuthProvider,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from "firebase/auth";
import { AuthManager, OAuthProvider } from "../domain/AuthManager";
import isWebKit from "../../../utils/browserKit";
import firebase from "../../../firebaseConfig";
import { UserDomain } from "../domain/User";
import { ILogger } from "../../../utils/Logs/domain/ILogger";
import { LoggerFactory } from "../../../utils/Logs/infraestructure/LoggerFactory";

class FirebaseAuthManager implements AuthManager {
  private static instance: FirebaseAuthManager;
  private readonly auth: Auth;

  private readonly logger: ILogger = LoggerFactory.create(FirebaseAuthManager.name);

  private readonly providers: Record<OAuthProvider, AuthProvider> = {
    [OAuthProvider.Google]: new GoogleAuthProvider(),
    [OAuthProvider.GitHub]: new GithubAuthProvider(),
  };

  private constructor() {
    this.auth = getAuth(firebase);
  }

  public static get Manager(): FirebaseAuthManager {
    if (!FirebaseAuthManager.instance) {
      FirebaseAuthManager.instance = new FirebaseAuthManager();
    }
    return FirebaseAuthManager.instance;
  }

  _checkProvider(provider: OAuthProvider): boolean {
    if (!this.providers[provider]) throw new Error("Proveedor no soportado");
    return true;
  }
  async handleRedirectResult(): Promise<User | null> {
    try {
      const result = await getRedirectResult(this.auth);
      if (result?.user) {
        return result.user;
      }
      return null;
    } catch (error: any) {
      this.logger.error(error?.message || "Error al obtener resultado de redirección.");
      return null;
    }
  }

  waitForAuthReady(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    if (!this.auth.currentUser) {
      return null;
    }
    const token = await this.auth.currentUser.getIdToken(forceRefresh);
    return token;
  }

  async login(provider: OAuthProvider): Promise<void> {
    try {
      this._checkProvider(provider);
      const firebaseProvider = this.providers[provider];

      if (firebaseProvider instanceof GoogleAuthProvider) {
        firebaseProvider.setCustomParameters({ prompt: "select_account" });
      }
      try {
        await signInWithPopup(this.auth, firebaseProvider);
      } catch (popupError: any) {
        if (popupError?.code === "auth/popup-blocked" || isWebKit()) {
          await signInWithRedirect(this.auth, firebaseProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      this.logger.error(error?.message || "Error al iniciar sesión.");
      throw new Error(error?.message || "Error al iniciar sesión.");
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  private mapToUserDomain(user: User | null): UserDomain | null {
    if (!user) return null;
    return {
      id: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      photoUrl: user.photoURL ?? "",
    };
  }

  onAuthStateChanged(callback: (user: UserDomain | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => {
      callback(this.mapToUserDomain(user));
    });
  }
}

export const fireBaseAuthManager = FirebaseAuthManager.Manager;
export default FirebaseAuthManager;
