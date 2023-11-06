import UserOnDb from "./userOnDb.interface";

interface LoginRepositoryInterface {
  getAccountInfo(email: string): Promise<UserOnDb>;
}

export default LoginRepositoryInterface;
