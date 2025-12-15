import { GroupDataObject } from "../../../../src/modules/Groups/domain/GroupInterface";
import GroupsRepositoryInterface from "../../../../src/modules/Groups/domain/GroupsRepositoryInterface";

class MockGroupsRepository implements GroupsRepositoryInterface {
  private groups: GroupDataObject[];
  private nextId: number;

  constructor(initialGroups: GroupDataObject[] = []) {
    this.groups = initialGroups;
    this.nextId =
      initialGroups.length > 0
        ? Math.max(...initialGroups.map(g => g.id ?? 0)) + 1
        : 1;
  }

  async getGroups(): Promise<GroupDataObject[]> {
    return this.groups;
  }

  async getGroupById(id: number): Promise<GroupDataObject | null> {
    return this.groups.find(g => g.id === id) || null;
  }

  async createGroup(groupData: GroupDataObject): Promise<GroupDataObject> {
    const newGroup: GroupDataObject = {
      ...groupData,
      id: groupData.id ?? this.nextId++,
    };
    this.groups.push(newGroup);
    return newGroup;
  }

  async deleteGroup(id: number): Promise<void> {
    this.groups = this.groups.filter(g => g.id !== id);
  }

  async getGroupsByUserId(userId: number): Promise<number[]> {
    return this.groups
      .filter(g => g.id === userId)
      .map(g => g.id);
  }

  async updateGroup(groupId: number, updatedGroupData: GroupDataObject): Promise<void> {
    const updateGroup: GroupDataObject = {
      ...updatedGroupData,
      id: groupId
    };
    this.groups.push(updateGroup);
  }
}

export default MockGroupsRepository;
