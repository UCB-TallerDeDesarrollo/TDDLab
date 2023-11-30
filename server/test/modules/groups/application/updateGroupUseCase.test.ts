import UpdateGroupUseCase from '../../../../src/modules/Groups/application/GroupUseCases/updateGroupUseCase';
import { getDataGroupMock, getModifiedGroupDataMock } from '../../../__mocks__/groups/dataTypeMocks/groupData';
import { getGroupsRepositoryMock } from '../../../__mocks__/groups/repositoryMock';

const groupRepositoryMock = getGroupsRepositoryMock();
const updateGroupUseCase = new UpdateGroupUseCase(groupRepositoryMock);

describe('UpdateGroupUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update an existing group successfully', async () => {
    const groupId = '1';
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataGroupMock);
    groupRepositoryMock.updateGroup.mockResolvedValueOnce(true);
    const result = await updateGroupUseCase.execute(groupId, getModifiedGroupDataMock);
    expect(result).toEqual(getModifiedGroupDataMock);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupId);
    expect(groupRepositoryMock.updateGroup).toHaveBeenCalledWith(groupId, getModifiedGroupDataMock);
  });

  it('should return null for non-existing group', async () => {
    const nonExistingGroupId = 'nonExistingGroupId';
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(null);
    const result = await updateGroupUseCase.execute(nonExistingGroupId, getModifiedGroupDataMock);
    expect(result).toBeNull();
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(nonExistingGroupId);
    expect(groupRepositoryMock.updateGroup).not.toHaveBeenCalled();
  });

  it('should handle errors during group update', async () => {
    const groupId = '1';
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataGroupMock);
    groupRepositoryMock.updateGroup.mockRejectedValueOnce(new Error('Update Failed'));
    await expect(updateGroupUseCase.execute(groupId, getModifiedGroupDataMock)).rejects.toThrowError('Update Failed');
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupId);
    expect(groupRepositoryMock.updateGroup).toHaveBeenCalledWith(groupId, getModifiedGroupDataMock);
  });

  it('should handle unsuccessful group update', async () => {
    const groupId = '1';
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataGroupMock);
    groupRepositoryMock.updateGroup.mockResolvedValueOnce(false);
    const result = await updateGroupUseCase.execute(groupId, getModifiedGroupDataMock);
    expect(result).toBeNull();
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupId);
    expect(groupRepositoryMock.updateGroup).toHaveBeenCalledWith(groupId, getModifiedGroupDataMock);
  });
});
