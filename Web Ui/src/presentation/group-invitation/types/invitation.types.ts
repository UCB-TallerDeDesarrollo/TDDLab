import { User } from "firebase/auth";

export type InvitationRole = "student" | "teacher";

export interface InvitationRegistrationParams {
  groupid: number;
  role: InvitationRole;
  user: User;
}

export interface RotationState {
  rotateX: number;
  rotateY: number;
}
