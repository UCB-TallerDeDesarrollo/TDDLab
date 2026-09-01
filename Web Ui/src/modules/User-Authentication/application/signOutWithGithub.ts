import { fireBaseAuthManager } from "../infrastructure/authFirebase";

export async function handleGithubSignOut() {
  return fireBaseAuthManager.logout();
}
