import { User } from "firebase/auth";
import { useAuthStore } from "../domain/authStore";
import { UserOnDb } from "../domain/userOnDb.interface";

export function setCookieAndGlobalStateForValidUser(
  userData: User,
  usergroupid: UserOnDb | null,
  positiveCallback = () => {},
) {
  if (usergroupid?.id && userData.email) {
    localStorage.setItem("userProfilePic", userData.photoURL || "");
    const groupid = Array.isArray(usergroupid.groupid)
      ? usergroupid.groupid[0]
      : usergroupid.groupid;
    useAuthStore.getState().setSession(userData, {
      id: usergroupid.id,
      groupid,
      role: usergroupid.role,
    });
    positiveCallback();
  } else {
    console.log("Invalid User");
  }
}
