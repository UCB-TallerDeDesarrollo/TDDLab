import { UserDataObject } from "./UsersInterface";

interface UsersRepositoryInterface {
  getUsers(): Promise<UserDataObject[]>;
}

export default UsersRepositoryInterface;