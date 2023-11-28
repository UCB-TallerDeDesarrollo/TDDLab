import GroupsRepositoryInterface from '../domain/GroupsRepositoryInterface';
import { GroupDataObject } from '../domain/GroupInterface';

export class GetGroupDetail {
  constructor(private groupsRepository: GroupsRepositoryInterface) {}

  async obtainGroupDetail(groupId: number): Promise<GroupDataObject | null> {
    try {
      const group = await this.groupsRepository.getGroupById(groupId);

      if (group === null) {
        return null;
      }

      return group;
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      throw error;
    }
  }
}