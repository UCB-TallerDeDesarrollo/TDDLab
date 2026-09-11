import { User } from "firebase/auth";

export enum UserRole {
  Student = "student",
  Teacher = "teacher",
  Admin = "admin",
}

export enum SessionHintState {
  Active = "active",
  Inactive = "inactive",
}

export enum SessionCookieName {
  UserSession = "userSession",
  AuthHint = "tddlabAuthSession",
}

export interface SessionData {
  id: number;
  email: string;
  groupid: number;
  role: UserRole;
  userProfilePic?: string;
}

export interface AuthData {
  userid: number;
  userProfilePic: string;
  userEmail: string;
  usergroupid: number;
  userRole: UserRole;
}

export const NULL_AUTH_DATA: AuthData = {
  userid: -1,
  userProfilePic: "",
  userEmail: "",
  usergroupid: -1,
  userRole: UserRole.Student,
};

export const buildAuthDataFromSession = (
  session: SessionData,
  photoURL?: string | null,
): AuthData => ({
  userid: session.id,
  userProfilePic: photoURL ?? "",
  userEmail: session.email,
  usergroupid: session.groupid,
  userRole: session.role,
});

export const buildAuthDataFromFirebaseUser = (
  user: User,
  userCourse: { id: number; groupid: number; role: UserRole },
): AuthData => ({
  userid: userCourse.id,
  userProfilePic: user.photoURL ?? "",
  userEmail: user.email ?? "",
  usergroupid: userCourse.groupid,
  userRole: userCourse.role,
});
