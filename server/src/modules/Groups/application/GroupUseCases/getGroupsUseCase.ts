import GroupRepository from "../../repositories/GroupRepository";
import GroupDTO from "../../domain/Group";

class GetGroupsUseCase {
  private readonly groupRepository: GroupRepository;

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(): Promise<GroupDTO[]> {
    try {
      // Call the repository method to obtain all groups
      const groups = await this.groupRepository.obtainGroups();

      // Return the list of groups
      return groups;
    } catch (error: any) {
      // Log the error for internal debugging

      // Rethrow the error so that the controller can handle it
      throw error;
    }
  }
}

export default GetGroupsUseCase;
