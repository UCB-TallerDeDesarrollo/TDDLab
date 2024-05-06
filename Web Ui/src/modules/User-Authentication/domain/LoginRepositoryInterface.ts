import { UserOnDb } from "./userOnDb.interface";
import { UserId } from "./userOnDb.interface";

interface LoginRepositoryInterface {
  getAccountInfo(email: string): Promise<UserOnDb>;
  registerAccount(user: UserOnDb): Promise<void>;
  verifyPassword(password: string): Promise<boolean>;
  getUserByid(id: number): Promise<UserId>;
}

export default LoginRepositoryInterface;
