import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";

class DeleteGroup {
  constructor(private groupsRepository: GroupsRepositoryInterface) {}

  async deleteGroup(groupId: number): Promise<void> {
    try {
      await this.groupsRepository.deleteGroup(groupId);
    } catch (error) {
      console.error("Failed to delete group:", error);
      throw new Error("Failed to delete group");
    }
  }
}

export default DeleteGroup;
