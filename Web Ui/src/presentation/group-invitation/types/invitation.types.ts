import { User } from "firebase/auth";
import { OAuthProvider } from "../../../modules/User-Authentication/infrastructure/authFirebase";
import { UserRole } from "../../../modules/User-Authentication/domain/session.types";

export type InvitationAuthProvider = OAuthProvider | null;
export type InvitationRole = UserRole;

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
