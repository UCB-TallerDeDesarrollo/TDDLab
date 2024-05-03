import { UserDataObject } from "./UsersInterface";

interface UsersRepositoryInterface {
  getUsers(): Promise<UserDataObject[]>;
  getUsersByGroupid(groupid: number): Promise<UserDataObject[]>;
  getUserByEmail(email: string): Promise<UserDataObject | null>;
  updateUser(email: string,
    userData: UserDataObject):Promise<void>;
}

export default UsersRepositoryInterface;