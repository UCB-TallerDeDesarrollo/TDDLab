import GroupRepository from "../../repositories/GroupRepository";
interface CreateGroupDTO {
  groupName: string;
  groupDetail: string;
  creationDate: Date;
}

class CreateGroupUseCase {
  private readonly groupRepository: GroupRepository;

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository;
  }

  async execute(data: CreateGroupDTO): Promise<any> {
    try {
      // Additional business logic/validation can be added here

      const newGroup = await this.groupRepository.createGroup(data);

      // Additional logic can be added here, e.g., sending notifications, logging, etc.

      return newGroup;
    } catch (error: any) {
      // Specify the type of the error variable
      // 'any' is used here for simplicity; you can use a more specific type if available
      //console.error(`Failed to create group: ${error.message}`);

      // Handle errors, log, and potentially throw a custom error
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }
}

export default CreateGroupUseCase;
