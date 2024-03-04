import DeleteGroupUseCase from '../../../../src/modules/Groups/application/GroupUseCases/deleteGroupUseCase';
import { getGroupsRepositoryMock } from '../../../__mocks__/groups/repositoryMock';
import { getDataGroupMock, getDataListOfGroupsMock } from '../../../__mocks__/groups/dataTypeMocks/groupData';

const groupRepositoryMock = getGroupsRepositoryMock();
const deleteGroupUseCase = new DeleteGroupUseCase(groupRepositoryMock);

describe('DeleteGroupUseCase', () => {
  it('should delete an existing group successfully', async () => {
    const groupId = 1;
    const existingGroup = getDataListOfGroupsMock.find(group => group.id === groupId);
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(existingGroup);
    await deleteGroupUseCase.execute(groupId);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupId);
    expect(groupRepositoryMock.deleteGroup).toHaveBeenCalledWith(groupId);
  });

  it('should throw an error for non-existing group ID', async () => {
    const nonExistingGroupId = 0; //if theres no group, 0
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(null);
    await expect(deleteGroupUseCase.execute(nonExistingGroupId)).rejects.toThrowError(Error);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(nonExistingGroupId);
    expect(groupRepositoryMock.deleteGroup).toHaveBeenCalled();
  });

  it('should handle errors during group deletion', async () => {
    const groupId = 3;
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataGroupMock);
    groupRepositoryMock.deleteGroup.mockRejectedValueOnce(new Error());
    await expect(deleteGroupUseCase.execute(groupId)).rejects.toThrowError(Error);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupId);
    expect(groupRepositoryMock.deleteGroup).toHaveBeenCalledWith(groupId);
  });
});
