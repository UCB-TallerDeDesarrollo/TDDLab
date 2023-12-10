import { GroupDataObject } from "../domain/GroupInterface";
import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";

class GetGroups {
  constructor(private groupsRepository: GroupsRepositoryInterface) {}

  async getGroups(): Promise<GroupDataObject[]> {
    return await this.groupsRepository.getGroups();
  }
}

export default GetGroups;
