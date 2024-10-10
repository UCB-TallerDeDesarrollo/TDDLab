import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";

class GetUsers {
  constructor(private readonly userRepository: UsersRepositoryInterface) {}

  async getUsers(): Promise<UserDataObject[]> {
    return await this.userRepository.getUsers();
  }
}

export default GetUsers;
