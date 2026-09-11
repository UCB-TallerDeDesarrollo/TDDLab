import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {firebase} from "../../../firebaseConfig";
import { RegisterUserOnDb } from "../../../modules/User-Authentication/application/registerUserOnDb";
import { UserOnDb } from "../../../modules/User-Authentication/domain/userOnDb.interface";
import {
  InvitationAuthProvider,
  InvitationRegistrationParams,
} from "../types/invitation.types";
import { fireBaseAuthManager, OAuthProvider } from "../../../modules/User-Authentication/infrastructure/authFirebase";

const registerUserPort = new RegisterUserOnDb();

function resolveAuthProvider(user: User | null): InvitationAuthProvider {
  const providerId = user?.providerData?.[0]?.providerId;

  switch (providerId) {
    case "google.com":
      return OAuthProvider.Google;
    case "github.com":
      return OAuthProvider.Github;
    default:
      return null;
  }
}

export function subscribeToInvitationAuth(
  onSessionChange: (user: User | null, provider: InvitationAuthProvider) => void,
) {
  const auth = getAuth(firebase);

  return onAuthStateChanged(auth, (authUser) => {
    onSessionChange(authUser, resolveAuthProvider(authUser));
  });
}


export async function signInInvitationWithGoogle() {
  // const user = await handleSignInWithGoogle();
  const user = await fireBaseAuthManager.loginWithOAuth(OAuthProvider.Google);
  return user ? { user, authProvider: OAuthProvider.Google } : null;
}

export function signOutInvitationSession() {
  return fireBaseAuthManager.logout();
}

export function verifyInvitationPassword(password: string) {
  return registerUserPort.verifyPass(password);
}

export async function registerInvitationUser({
  authProvider,
  groupid,
  role,
  user,
}: InvitationRegistrationParams) {
  if (authProvider === OAuthProvider.Google) {
    const idToken = await user.getIdToken();
    await registerUserPort.registerWithGoogle(idToken, groupid, role);
    return;
  }

  if (!user.email) {
    return;
  }

  const userObj: UserOnDb = {
    email: user.email,
    groupid,
    role,
  };

  await registerUserPort.register(userObj);
}
