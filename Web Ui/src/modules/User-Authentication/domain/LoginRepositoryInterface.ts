import { UserOnDb } from "./userOnDb.interface";
import { OAuthProvider } from "./OAuthProvider";
import { RegisterAccountDTO } from "./dto/RegisterAccountDto";

export interface AuthDBRepositoryInterface {
  getAccountInfoWithToken(idToken: string, provider: OAuthProvider): Promise<UserOnDb>;
  getAccountInfoByEmail(email: string): Promise<UserOnDb>;
  getUserById(id: number): Promise<UserOnDb>;
  registerAccountWithToken(dto: RegisterAccountDTO, provider: OAuthProvider): Promise<UserOnDb>;
  verifyPassword(password: string): Promise<boolean>;
}
