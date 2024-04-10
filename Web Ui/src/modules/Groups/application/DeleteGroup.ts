import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";

class DeleteGroup {
  constructor(private groupsRepository: GroupsRepositoryInterface) {}

  async deleteGroup(groupid: number): Promise<void> {
    try {
      await this.groupsRepository.deleteGroup(groupid);
    } catch (error) {
      console.error("Failed to delete group:", error);
      throw new Error("Failed to delete group");
    }
  }
}

export default DeleteGroup;
