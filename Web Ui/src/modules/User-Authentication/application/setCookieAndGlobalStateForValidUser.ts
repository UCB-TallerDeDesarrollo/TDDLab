import { User } from "firebase/auth";
import { setGlobalState } from "../domain/authStates";
import { setSessionCookie } from "./setSessionCookie";
import UserOnDb from "../domain/userOnDb.interface";

export function setCookieAndGlobalStateForValidUser(
  userData: User,
  usergroupid: UserOnDb | null,
  positiveCallback = () => {},
) {
  if (usergroupid && userData.photoURL && userData.email) {
    setGlobalState("authData", {
      userProfilePic: userData.photoURL,
      userEmail: userData.email,
      usergroupid: usergroupid.groupid,
      userRole: usergroupid.role,
    });
    setSessionCookie({
      userData,
      role: usergroupid.role,
      course: usergroupid.groupid,
    });
    positiveCallback();
  } else {
    console.log("Invalid User");
  }
}
