import DeleteGroup from "../../../../src/modules/Groups/application/DeleteGroup";
import { GroupDataObject } from "../../../../src/modules/Groups/domain/GroupInterface";
import GroupsRepositoryInterface from "../../../../src/modules/Groups/domain/GroupsRepositoryInterface";

class MockGroupsRepository implements GroupsRepositoryInterface {
  groupsRepository: any;
  getGroups(): Promise<GroupDataObject[]> {
    throw new Error("Method not implemented.");
  }
  getGroupById(_id: number): Promise<GroupDataObject | null> {
    throw new Error("Method not implemented.");
  }
  createGroup(_groupData: GroupDataObject): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async deleteGroup(id: number): Promise<void> {
    try {
      await this.groupsRepository.deleteGroup(id);
    } catch (error) {
      console.error("Ocurrió un error al eliminar el grupo:", error);
    }
  }
  getGroupsByUserId(_id: number): Promise<number[]>{
    throw new Error("Method not implemented.");
  }
}

describe("DeleteGroup", () => {
  let deleteGroupInstance: DeleteGroup;
  let groupsRepositoryMock: GroupsRepositoryInterface;

  beforeEach(() => {
    groupsRepositoryMock = new MockGroupsRepository();
    deleteGroupInstance = new DeleteGroup(groupsRepositoryMock);
  });

  it("should delete a group successfully", async () => {
    const groupId = 1;
    groupsRepositoryMock.deleteGroup = jest
      .fn()
      .mockResolvedValueOnce(undefined);
    await deleteGroupInstance.deleteGroup(groupId);
    expect(groupsRepositoryMock.deleteGroup).toHaveBeenCalledWith(groupId);
  });

  it("should handle errors during group deletion", async () => {
    const groupId = 1;
    const mockError = new Error("Failed to delete group");
    groupsRepositoryMock.deleteGroup = jest
      .fn()
      .mockRejectedValueOnce(mockError);
    await expect(deleteGroupInstance.deleteGroup(groupId)).rejects.toThrowError(
      mockError
    );
  });
});
