import { User } from "firebase/auth";
import { handleSignInWithGoogle as signInWithGoogle } from "../../../modules/User-Authentication/application/signInWithGoogle";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";

const USER_NOT_REGISTERED_MESSAGE =
  "Disculpa, tu usuario no está registrado. Por favor, regístrate primero.";

export const handleSignInWithGoogle = async () => signInWithGoogle();

export const handleAuthResult = async ({
  userData,
  isGoogle,
  onSuccess,
}: {
  userData: User | null | undefined;
  isGoogle: boolean;
  onSuccess: () => void;
}) => {
  if (!userData?.email) {
    throw new Error(USER_NOT_REGISTERED_MESSAGE);
  }

  const idToken = await userData.getIdToken();
  const loginPort = new CheckIfUserHasAccount();

  const userCourse = isGoogle
    ? await loginPort.userHasAnAccountWithGoogleToken(idToken)
    : await loginPort.userHasAnAccountWithToken(idToken);

  if (!userCourse) {
    throw new Error(USER_NOT_REGISTERED_MESSAGE);
  }

  setCookieAndGlobalStateForValidUser(userData, userCourse, onSuccess);
  localStorage.setItem("userProfilePic", userData.photoURL || "");
};
