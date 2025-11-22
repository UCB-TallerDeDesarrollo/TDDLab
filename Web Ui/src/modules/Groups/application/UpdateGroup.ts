import { GroupDataObject } from "../domain/GroupInterface";
import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";


export class UpdateGroup {
  constructor(
    private readonly groupsRepository: GroupsRepositoryInterface
  ) {}

  async updateGroup(
    groupId: number,
    groupData: GroupDataObject
  ) {
    try {
      const updatedGroupData: GroupDataObject = {
        ...groupData,
        id: groupId,
      };

      await this.groupsRepository.updateGroup(
        groupId,
        updatedGroupData
      );
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  }
}
