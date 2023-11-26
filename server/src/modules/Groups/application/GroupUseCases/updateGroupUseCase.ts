import GroupRepository from "../../repositories/GroupRepository";
import GroupDTO from "../../domain/Group";

class UpdateGroupUseCase {
  private groupRepository: GroupRepository;

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(
    groupId: string,
    updatedGroupData: GroupDTO
  ): Promise<GroupDTO | null> {
    try {
      // Check if the group with the given ID exists
      const existingGroup = await this.groupRepository.obtainGroupById(groupId);

      if (!existingGroup) {
        // Return null if the group doesn't exist
        return null;
      }

      // Update the group data with the provided values
      const updatedGroup = {
        ...existingGroup,
        groupName: updatedGroupData.groupName || existingGroup.groupName,
        groupDetail: updatedGroupData.groupDetail || existingGroup.groupDetail,
        // Add other fields as needed
      };

      // Call the repository method to update the group
      const result = await this.groupRepository.updateGroup(
        groupId,
        updatedGroup
      );

      if (result) {
        // Return the updated group data
        return updatedGroup;
      } else {
        // Return null if the update was not successful
        return null;
      }
    } catch (error: any) {
      // Handle errors, log, and potentially throw a custom error
      console.error(`Failed to update group: ${error.message}`);
      throw new Error(`Failed to update group: ${error.message}`);
    }
  }
}

export default UpdateGroupUseCase;
