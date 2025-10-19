import { GroupDataObject } from "../domain/GroupInterface";
import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";

class GetGroups {
  constructor(private readonly groupsRepository: GroupsRepositoryInterface) {}

  async getGroups(): Promise<GroupDataObject[]> {
    return await this.groupsRepository.getGroups();
  }

  async getGroupById(id:number): Promise<GroupDataObject> {
    const groups = await this.groupsRepository.getGroupById(id);

    return groups ?? {
      id: 0,
      groupName: "",
      groupDetail: "",
      creationDate: new Date(),
    };
  }

  async getGroupsByUserId(id:number): Promise<number[]> {
    const groups = await this.groupsRepository.getGroupsByUserId(id);

    return groups ?? [-1];
  }

}

export default GetGroups;
