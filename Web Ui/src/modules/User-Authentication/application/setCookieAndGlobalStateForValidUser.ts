import { User } from "firebase/auth";
import { setGlobalState } from "../domain/authStates";
import { UserOnDb } from "../domain/userOnDb.interface";

export function setCookieAndGlobalStateForValidUser(
  userData: User,
  usergroupid: UserOnDb | null,
  positiveCallback = () => {},
) {
  if (usergroupid && userData.photoURL && userData.email) {
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
