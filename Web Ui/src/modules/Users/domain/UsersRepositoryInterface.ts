import { UserDataObject } from "./UsersInterface";
import { SearchParams } from "./SearchParamsInterface";

interface UsersRepositoryInterface {
  getUserById(id: number): Promise<UserDataObject>;
  getUsers(): Promise<UserDataObject[]>;
  getUsersByGroupid(groupid: number): Promise<UserDataObject[]>;
  getUserByEmail(email: string): Promise<UserDataObject | null>;
  updateUser(id: number, groupid: number): Promise<void>;
  removeUserFromGroup(userId: number): Promise<void>;
  getFilteredUsersByEmail(params: SearchParams): Promise<UserDataObject[]>;

}

export default UsersRepositoryInterface;