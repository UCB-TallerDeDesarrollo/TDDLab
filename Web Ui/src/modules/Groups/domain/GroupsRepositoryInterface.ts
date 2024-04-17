import { GroupDataObject } from "./GroupInterface";

interface GroupsRepositoryInterface {
  getGroups(): Promise<GroupDataObject[]>;
  getGroupById(id: number): Promise<GroupDataObject | null>;
  createGroup(groupData: GroupDataObject): Promise<void>;
  deleteGroup(id: number): Promise<void>;
}

export default GroupsRepositoryInterface;
