import GroupRepository from "../../repositories/GroupRepository";
import GroupDTO from "../../domain/Group";
class GetGroupByIdUseCase {
  private readonly groupRepository: GroupRepository;

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(groupid: number): Promise<GroupDTO | null> {
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
