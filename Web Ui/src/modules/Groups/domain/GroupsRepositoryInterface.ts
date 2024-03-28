import { GroupDataObject } from "./GroupInterface";

interface GroupsRepositoryInterface {
  getGroups(): Promise<GroupDataObject[]>;
  getGroupById(id: number): Promise<GroupDataObject | null>;
  createGroup(groupData: GroupDataObject): Promise<void>;
  deleteGroup(groupid: number): Promise<void>;
}

export default GroupsRepositoryInterface;
