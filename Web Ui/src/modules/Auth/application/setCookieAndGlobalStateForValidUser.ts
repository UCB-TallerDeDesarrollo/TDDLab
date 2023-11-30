import { User } from "firebase/auth";
import { setGlobalState } from "../domain/authStates";
import { setSessionCookie } from "./setSessionCookie";
import UserOnDb from "../domain/userOnDb.interface";

export function setCookieAndGlobalStateForValidUser(
  userData: User,
  userCourse: UserOnDb | null,
  positiveCallback = () => {}
) {
  if (userCourse && userData.photoURL && userData.email ) {
    setGlobalState("authData", {
      userProfilePic: userData.photoURL,
      userEmail: userData.email,
      userCourse: userCourse.course,
      userRole: userCourse.role,
    });
    const role =  userCourse.role;
    setSessionCookie({userData, role});
    positiveCallback();
  } else {
    console.log("Invalid User");
  }
}
