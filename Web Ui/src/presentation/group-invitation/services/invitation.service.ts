import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "../../../firebaseConfig";
import { fireBaseAuthManager } from "../../../modules/User-Authentication/infraestructure/FirebaseAuthManager";
import { OAuthProvider } from "../../../modules/User-Authentication/domain/AuthManager";
import { RegisterUserOnDb } from "../../../modules/User-Authentication/application/registerUserOnDb";
import { InvitationRegistrationParams } from "../types/invitation.types";

const registerUserPort = new RegisterUserOnDb();

function resolveAuthProvider(user: User | null): InvitationAuthProvider {
  const providerId = user?.providerData?.[0]?.providerId;

  if (providerId === "google.com") return "google";
  if (providerId === "github.com") return "github";

  return null;
}

export function subscribeToInvitationAuth(
  onSessionChange: (user: User | null) => void,
) {
  const auth = getAuth(firebase);

  return onAuthStateChanged(auth, (authUser) => {
    onSessionChange(authUser);
  });
}

export async function signInInvitationWithGithub() {
  await fireBaseAuthManager.login(OAuthProvider.GitHub);
}

export async function signInInvitationWithGoogle() {
  await fireBaseAuthManager.login(OAuthProvider.Google);
}

export async function signOutInvitationSession() {
  await fireBaseAuthManager.logout();
}

export function verifyInvitationPassword(password: string) {
  return registerUserPort.verifyPass(password);
}

export async function registerInvitationUser({
  groupid,
  role,
  user,
}: InvitationRegistrationParams) {
  if (authProvider === "google") {
    const idToken = await user.getIdToken();
    await registerUserPort.registerWithGoogle(idToken, groupid, role);
    return;
  }

  if (!user.email) return;

  const userObj: UserOnDb = {
    email: user.email,
    groupid,
    role,
  };

  await registerUserPort.register(userObj);
}
