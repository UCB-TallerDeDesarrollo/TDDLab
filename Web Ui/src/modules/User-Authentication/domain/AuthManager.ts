import { UserDomain } from "./User";

export enum OAuthProvider {
  Google = 'google',
  GitHub = 'github',
}


export interface AuthManager {
  login(provider: OAuthProvider): Promise<void>;
  logout(): Promise<void>;
  onAuthStateChanged(callback: (user: UserDomain | null) => void): () => void;
  getIdToken(): Promise<string | null>;
}
