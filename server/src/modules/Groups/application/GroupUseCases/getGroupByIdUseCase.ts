import { GroupDataObject } from "../../domain/Group";
import { IGroupRepository } from "../../domain/IGroupRepository";

class GetGroupByIdUseCase {
  private readonly groupRepository: IGroupRepository;

  constructor(groupRepository: IGroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(groupid: number): Promise<GroupDataObject | null> {
    try {
      // Call the repository method to get the group by ID
      const group = await this.groupRepository.obtainGroupById(groupid);

      // Return the group if found, otherwise return null
      return group;
    } catch (error: any) {
      // Handle errors, log, and potentially throw a custom error
      throw new Error(`Failed to get group by ID: ${error.message}`);
    }
  }
}

export default GetGroupByIdUseCase;
