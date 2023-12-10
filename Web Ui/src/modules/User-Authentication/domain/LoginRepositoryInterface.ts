import UserOnDb from "./userOnDb.interface";

interface LoginRepositoryInterface {
  getAccountInfo(email: string): Promise<UserOnDb>;
  registerAccount(user: UserOnDb): Promise<void>;
  verifyPassword(password: string): Promise<boolean>;
}

export default LoginRepositoryInterface;
