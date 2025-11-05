import { UserOnDb } from "./userOnDb.interface";

interface LoginRepositoryInterface {
  getAccountInfo(email: string): Promise<UserOnDb>;
  getAccountInfoWithToken(token: string): Promise<UserOnDb>;
  getAccountInfoWithGoogleToken(token: string): Promise<UserOnDb>;
  registerAccount(user: UserOnDb): Promise<void>;
  registerAccountWithGoogle(idToken: string, groupid: number, role: string): Promise<void>;
  verifyPassword(password: string): Promise<boolean>;
  getUserByid(id: number): Promise<UserOnDb>;
}

export default LoginRepositoryInterface;
