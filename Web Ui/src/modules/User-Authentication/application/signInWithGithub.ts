import { fireBaseAuthManager, OAuthProvider } from "../infrastructure/authFirebase";

export async function handleSignInWithGitHub() {
  return fireBaseAuthManager.loginWithOAuth(OAuthProvider.Github);
}
