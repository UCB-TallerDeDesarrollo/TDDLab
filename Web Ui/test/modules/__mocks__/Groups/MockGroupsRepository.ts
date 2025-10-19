import { GroupDataObject } from "../../../../src/modules/Groups/domain/GroupInterface";
import GroupsRepositoryInterface from "../../../../src/modules/Groups/domain/GroupsRepositoryInterface";

class MockGroupsRepository implements GroupsRepositoryInterface {
  private readonly groups: GroupDataObject[];

  constructor(groups: GroupDataObject[] = []) {
    this.groups = groups;
  }

  getGroups(): Promise<GroupDataObject[]> {
    return Promise.resolve(this.groups);
  }

  getGroupById(_id: number): Promise<GroupDataObject | null> {
    throw new Error("Method not implemented.");
  }

  createGroup(_groupData: GroupDataObject): Promise<void> {
    throw new Error("Method not implemented.");
  }

  deleteGroup(_id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getGroupsByUserId(_id: number): Promise<number[]>{
    throw new Error("Method not implemented.");
  }
}

export default MockGroupsRepository;
