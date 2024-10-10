import GroupRepository from "../../repositories/GroupRepository";

class DeleteGroupUseCase {
  private readonly groupRepository: GroupRepository;

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(groupid: number): Promise<void> {
    try {
      // Check if the group exists before attempting to delete
      const existingGroup = await this.groupRepository.obtainGroupById(groupid);

      if (!existingGroup) {
        throw new Error("Group not found"); // You can create a custom error type
      }

      // Additional business logic/validation can be added here

      await this.groupRepository.deleteGroup(groupid);

      // Additional logic can be added here, e.g., sending notifications, logging, etc.
    } catch (error: any) {
      // Handle errors, log, and potentially throw a custom error
      throw new Error(`Failed to delete group: ${error.message}`);
    }
  }
}

export default DeleteGroupUseCase;
