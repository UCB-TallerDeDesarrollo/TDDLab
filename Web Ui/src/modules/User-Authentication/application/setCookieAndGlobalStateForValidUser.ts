import { User } from "firebase/auth";
import { setGlobalState } from "../domain/authStates";
import { UserOnDb } from "../domain/userOnDb.interface";

const AUTH_SESSION_HINT_KEY = "tddlabAuthSession";

export function setCookieAndGlobalStateForValidUser(
  userData: User,
  usergroupid: UserOnDb | null,
  positiveCallback = () => {},
) {
  if (usergroupid && userData.photoURL && userData.email) {
    localStorage.setItem(AUTH_SESSION_HINT_KEY, "active");
    setGlobalState("authData", {
      userid: usergroupid.id,
      userProfilePic: userData.photoURL,
      userEmail: userData.email,
      usergroupid: usergroupid.groupid,
      userRole: usergroupid.role,
    });
    positiveCallback();
  } else {
    console.log("Invalid User");
  }
}
