import UsersRepository from "../repository/UsersRepository";

export default class GetCurrentUserRole {
  private userRepository: UsersRepository;

  constructor(userRepository: UsersRepository) {
    this.userRepository = userRepository;
  }

  async execute(): Promise<string> {
    const user = await this.userRepository.getCurrentUser();
    return user.role;
  }
}
