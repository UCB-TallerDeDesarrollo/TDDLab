import { GroupDataObject } from "./GroupInterface";

interface GroupsRepositoryInterface {
  getGroups(): Promise<GroupDataObject[]>;
  getGroupById(id: number): Promise<GroupDataObject | null>;
  createGroup(groupData: GroupDataObject): Promise<void>;
  deleteGroup(groupId: number): Promise<void>;
}

export default GroupsRepositoryInterface;
