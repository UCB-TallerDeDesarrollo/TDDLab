import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "../../../firebaseConfig";
import { handleSignInWithGoogle } from "../../../modules/User-Authentication/application/signInWithGoogle";
import { handleSignOut } from "../../../modules/User-Authentication/application/signOut";
import { RegisterUserOnDb } from "../../../modules/User-Authentication/application/registerUserOnDb";
import { InvitationRegistrationParams } from "../types/invitation.types";

const registerUserPort = new RegisterUserOnDb();

export function subscribeToInvitationAuth(
  onSessionChange: (user: User | null) => void,
) {
  const auth = getAuth(firebase);

  return onAuthStateChanged(auth, (authUser) => {
    onSessionChange(authUser);
  });
}

export async function signInInvitationWithGoogle() {
  return handleSignInWithGoogle();
}

export function signOutInvitationSession() {
  return handleSignOut();
}

export function verifyInvitationPassword(password: string) {
  return registerUserPort.verifyPass(password);
}

export async function registerInvitationUser({
  groupid,
  role,
  user,
}: InvitationRegistrationParams) {
  const idToken = await user.getIdToken();
  await registerUserPort.registerWithGoogle(idToken, groupid, role);
}
