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
      const newGroup = await this.groupRepository.createGroup(data);
      return newGroup;
    } catch (error: any) {
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }
}

export default CreateGroupUseCase;
