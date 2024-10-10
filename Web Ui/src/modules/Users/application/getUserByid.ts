import { UserDataObject } from "../domain/UsersInterface";
import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";

class GetUserById {
  constructor(private readonly userRepository: UsersRepositoryInterface) {}

  async getUserById(id: number): Promise<UserDataObject | null> {
    return await this.userRepository.getUserById(id);
  }
}

export default GetUserById;
