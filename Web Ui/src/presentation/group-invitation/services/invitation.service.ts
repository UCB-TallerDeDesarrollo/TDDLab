import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "../../../firebaseConfig";
import { handleSignInWithGoogle } from "../../../modules/User-Authentication/application/signInWithGoogle";
import { handleSignOut } from "../../../modules/User-Authentication/application/signOut";
import { RegisterUserOnDb } from "../../../modules/User-Authentication/application/registerUserOnDb";
import { UserOnDb } from "../../../modules/User-Authentication/domain/userOnDb.interface";
import {
  InvitationAuthProvider,
  InvitationRegistrationParams,
} from "../types/invitation.types";

const registerUserPort = new RegisterUserOnDb();

function resolveAuthProvider(user: User | null): InvitationAuthProvider {
  const providerId = user?.providerData?.[0]?.providerId;

  if (providerId === "google.com") {
    return "google";
  }

  return null;
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
  const user = await handleSignInWithGoogle();
  return user ? { user, authProvider: "google" as const } : null;
}

export function signOutInvitationSession() {
  return handleSignOut();
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
  if (authProvider === "google") {
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
