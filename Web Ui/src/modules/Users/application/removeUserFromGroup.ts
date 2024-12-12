import UsersRepositoryInterface from "../domain/UsersRepositoryInterface";

export class RemoveUserFromGroup {
  constructor(private readonly userRepository: UsersRepositoryInterface) {}

  async removeUserFromGroup(userId: number): Promise<void> {
    console.log(userId)
    return await this.userRepository.removeUserFromGroup(userId);
  }
}