import GroupRepository from "../../repositories/GroupRepository";
import GroupDataObject from "../../domain/Group";

class GetGroupsUseCase {
  private groupRepository: GroupRepository;

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(): Promise<GroupDataObject[]> {
    try {
      // Call the repository method to obtain all groups
      const groups = await this.groupRepository.obtainGroups();

      // Return the list of groups
      return groups;
    } catch (error: any) {
      // Handle errors, log, and potentially throw a custom error
      console.error(`Failed to get groups: ${error.message}`);
      throw new Error(`Failed to get groups: ${error.message}`);
    }
  }
}

export default GetGroupsUseCase;
