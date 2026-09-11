import { GroupDataObject, GroupCreationObject, GroupUpdateObject } from "./Group";

export interface IGroupRepository {
  obtainGroups(): Promise<GroupDataObject[]>;
  obtainGroupById(id: number): Promise<GroupDataObject | null>;
  checkGroupExists(groupid: number): Promise<boolean>;
  createGroup(group: GroupCreationObject): Promise<GroupDataObject>;
  deleteGroup(id: number): Promise<void>;
  updateGroup(id: number, updatedGroup: GroupUpdateObject): Promise<GroupDataObject | null>;
}
