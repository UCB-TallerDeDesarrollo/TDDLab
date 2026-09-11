import { GroupDataObject } from "../../domain/Group";
import { IGroupRepository } from "../../domain/IGroupRepository";

class GetGroupsUseCase {
  private readonly groupRepository: IGroupRepository;

  constructor(groupRepository: IGroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(): Promise<GroupDataObject[]> {
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
