import { GroupDataObject } from "../domain/GroupInterface";
import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";

class CreateGroup {
  constructor(private readonly groupsRepository: GroupsRepositoryInterface) {}

  async createGroup(groupData: GroupDataObject): Promise<void> {
    return await this.groupsRepository.createGroup(groupData);
  }
}

export default CreateGroup;
