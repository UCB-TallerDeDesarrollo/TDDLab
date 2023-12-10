import UserOnDb from "./userOnDb.interface";

interface LoginRepositoryInterface {
  getAccountInfo(email: string): Promise<UserOnDb>;
  registerAccount(user: UserOnDb, password: string | null): Promise<void>;
}

export default LoginRepositoryInterface;
