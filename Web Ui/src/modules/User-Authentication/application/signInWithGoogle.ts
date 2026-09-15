import { fireBaseAuthManager, OAuthProvider } from "../infrastructure/authFirebase";

export async function handleSignInWithGoogle() {
  return fireBaseAuthManager.loginWithOAuth(OAuthProvider.Google);
}
