import GroupRepository from "../../repositories/GroupRepository";

class CheckGroupExistsUseCase {
  private readonly groupRepository: GroupRepository;

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(groupid: number): Promise<boolean> {
    try {
      const exists = await this.groupRepository.checkGroupExists(groupid);
      return exists;
    } catch (error: any) {
      throw new Error(`Error checking group existence: ${error.message}`);
    }
  }
}

export default CheckGroupExistsUseCase;
