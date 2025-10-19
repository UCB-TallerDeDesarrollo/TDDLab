import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";

class DeleteGroup {
  constructor(private readonly groupsRepository: GroupsRepositoryInterface) {}

  async deleteGroup(id: number): Promise<void> {
    try {
      await this.groupsRepository.deleteGroup(id);
    } catch (error) {
      console.error("Failed to delete group:", error);
      throw new Error("Failed to delete group");
    }
  }
}

export default DeleteGroup;
