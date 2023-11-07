import UserOnDb from "./userOnDb.interface";

interface LoginRepositoryInterface {
  getAccountInfo(email: string): Promise<UserOnDb>;
  registerAccount(user: UserOnDb): Promise<void>;
}

export default LoginRepositoryInterface;
