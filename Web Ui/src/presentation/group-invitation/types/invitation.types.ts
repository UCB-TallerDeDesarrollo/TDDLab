import { User } from "firebase/auth";

export type InvitationAuthProvider = "google" | null;
export type InvitationRole = "student" | "teacher";

export interface InvitationRegistrationParams {
  authProvider: InvitationAuthProvider;
  groupid: number;
  role: InvitationRole;
  user: User;
}

export interface RotationState {
  rotateX: number;
  rotateY: number;
}
