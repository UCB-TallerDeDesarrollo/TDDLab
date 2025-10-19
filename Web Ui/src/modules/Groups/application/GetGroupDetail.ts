import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";
import { GroupDataObject } from "../domain/GroupInterface";

export class GetGroupDetail {
  constructor(private readonly groupsRepository: GroupsRepositoryInterface) {}

  async obtainGroupDetail(groupid: number): Promise<GroupDataObject | null> {
    try {
      const group = await this.groupsRepository.getGroupById(groupid);
      if (group === null) {
        return null;
      }

      return group;
    } catch (error) {
      console.error("Error fetching group by ID:", error);
      throw error;
    }
  }
}
