import { OAuthProvider } from "../AuthManager";
import { UserOnDb } from "../userOnDb.interface";

export interface RegisterAccountDTO {
  idToken: string;
  provider: OAuthProvider;
  groupid: UserOnDb["groupid"];
  role: UserOnDb["role"];
}
