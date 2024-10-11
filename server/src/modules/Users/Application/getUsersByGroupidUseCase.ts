import { UserRepository } from "../Repositories/UserRepository";
import { User } from "../Domain/User";

class GetUsersByGroupidUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(groupid: number): Promise<User[]> {
    try {
      const users = await this.userRepository.getUsersByGroupid(groupid);
      return users;
    } catch (errror: any) {
      throw new Error("Failed to retrieve users by group");
    }
  }
}

export default GetUsersByGroupidUseCase;
