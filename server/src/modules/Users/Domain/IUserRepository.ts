import { User, UserCreationObect } from "./User";

export interface IUserRepository {
  registerUser(user: UserCreationObect): Promise<void>;
  obtainUserByemail(email: string): Promise<User | null>;
  obtainUser(id: number): Promise<User | null>;
  obtainUsers(): Promise<User[] | null>;
  getUsersByGroupid(groupid: number): Promise<User[]>;
  removeUserFromGroup(userId: number): Promise<void>;
  updateUser(id: number, groupid: number): Promise<User | null>;
}
