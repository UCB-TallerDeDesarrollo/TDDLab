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
  async createGroup(groupData: GroupDataObject): Promise<GroupDataObject> {
    const newGroup: GroupDataObject = {
      ...groupData,
      id: groupData.id ?? Math.floor(Math.random() * 1000) + 1,
    };
    return newGroup;  
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

  async updateGroup(groupId: number, updatedGroupData: GroupDataObject): Promise<void> {
    const updateGroup: GroupDataObject ={
      ...updatedGroupData,
      id: groupId
    };
    try {
      await this.groupsRepository.updateGroup(groupId, updateGroup);
    } catch (error) {
      console.error("Ocurrio un error al actualizar el grupo:", error);
    }
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

  it("should throw a standardized error message when repository fails", async () => {
  const groupId = 1;
  groupsRepositoryMock.deleteGroup = jest
    .fn()
    .mockRejectedValueOnce(new Error("DB down"));

  await expect(deleteGroupInstance.deleteGroup(groupId))
    .rejects.toThrow("Failed to delete group");
});

});
