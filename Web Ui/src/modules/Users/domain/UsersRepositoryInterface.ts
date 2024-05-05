import { UserDataObject } from "./UsersInterface";

interface UsersRepositoryInterface {
  getUsers(): Promise<UserDataObject[]>;
  getUsersByGroupid(groupid: number): Promise<UserDataObject[]>;
}

export default UsersRepositoryInterface;