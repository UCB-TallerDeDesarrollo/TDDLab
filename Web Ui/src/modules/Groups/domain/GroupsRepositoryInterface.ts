import { GroupDataObject } from "./GroupInterface";

interface GroupsRepositoryInterface {
  getGroups(): Promise<GroupDataObject[]>;
  getGroupById(id: number): Promise<GroupDataObject | null>;
  getGroupsByUserId(id: number): Promise<number[]>;
  createGroup(groupData: GroupDataObject): Promise<GroupDataObject>;
  deleteGroup(id: number): Promise<void>;
  updateGroup(groupId: number, updatedGroupData: GroupDataObject): Promise<void>;
}

export default GroupsRepositoryInterface;
