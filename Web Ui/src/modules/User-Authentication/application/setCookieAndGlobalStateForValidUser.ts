import { User } from "firebase/auth";
import { setGlobalState } from "../domain/authStates";
import { UserOnDb } from "../domain/userOnDb.interface";

export function setCookieAndGlobalStateForValidUser(
  userData: User,
  usergroupid: UserOnDb | null,
  positiveCallback = () => {},
) {
  // photoURL can be null depending on provider/account settings.
  // We still consider the user valid if we have an account + email.
  if (usergroupid && userData.email) {
    const userProfilePic = userData.photoURL ?? "";

    setGlobalState("authData", {
      userid: usergroupid.id,
      userProfilePic,
      userEmail: userData.email,
      usergroupid: usergroupid.groupid,
      userRole: usergroupid.role,
    });

    try {
      if (typeof window !== "undefined") {
        window.localStorage?.setItem("userProfilePic", userProfilePic);
      }
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }

    positiveCallback();
  } else {
    console.log("Invalid User");
  }
}
