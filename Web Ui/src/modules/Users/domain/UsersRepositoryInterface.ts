import { UserDataObject } from "./UsersInterface";

interface UsersRepositoryInterface {
  getUserById(id: number): Promise<UserDataObject>;
  getUsers(): Promise<UserDataObject[]>;
  getUsersByGroupid(groupid: number): Promise<UserDataObject[]>;
}

export default UsersRepositoryInterface;