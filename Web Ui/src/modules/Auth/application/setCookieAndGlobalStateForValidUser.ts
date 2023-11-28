import { User } from "firebase/auth";
import { setGlobalState } from "../domain/authStates";
import { setSessionCookie } from "./setSessionCookie";

export function setCookieAndGlobalStateForValidUser(
  userData: User,
  userCourse: string | null,
  positiveCallback = () => {}
) {
  if (userCourse && userData.photoURL && userData.email) {
    setGlobalState("authData", {
      userProfilePic: userData.photoURL,
      userEmail: userData.email,
      userCourse: userCourse,
    });
    setSessionCookie(userData);
    positiveCallback();
  } else {
    console.log("Invalid User");
  }
}
