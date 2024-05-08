import { UserCreationObect } from "../Domain/User";
import { UserRepository } from "../Repositories/UserRepository";

class UpdateUser{
  private repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  async execute(
    userId: number,
    updatedUser: UserCreationObect
  ): Promise<UserCreationObect | null> {
    try {
      const updatedUserResult = await this.repository.updateGroup(
        userId,
        updatedUser
      );
      return updatedUserResult;
    } catch (error) {

      throw error;
    }
  }
}

export default UpdateUser;