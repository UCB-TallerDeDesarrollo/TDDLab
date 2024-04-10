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
    const groupid = 1;
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataGroupMock);
    groupRepositoryMock.updateGroup.mockResolvedValueOnce(true);
    const result = await updateGroupUseCase.execute(groupid, getModifiedGroupDataMock);
    expect(result).toEqual(getModifiedGroupDataMock);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupid);
    expect(groupRepositoryMock.updateGroup).toHaveBeenCalledWith(groupid, getModifiedGroupDataMock);
  });

  it('should return null for non-existing group', async () => {
    const nonExistingGroupId = 0;
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(null);
    const result = await updateGroupUseCase.execute(nonExistingGroupId, getModifiedGroupDataMock);
    expect(result).toBeNull();
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(nonExistingGroupId);
    expect(groupRepositoryMock.updateGroup).not.toHaveBeenCalled();
  });

  it('should handle errors during group update', async () => {
    const groupid = 1;
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataGroupMock);
    groupRepositoryMock.updateGroup.mockRejectedValueOnce(new Error('Update Failed'));
    await expect(updateGroupUseCase.execute(groupid, getModifiedGroupDataMock)).rejects.toThrowError('Update Failed');
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupid);
    expect(groupRepositoryMock.updateGroup).toHaveBeenCalledWith(groupid, getModifiedGroupDataMock);
  });

  it('should handle unsuccessful group update', async () => {
    const groupid = 1;
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(getDataGroupMock);
    groupRepositoryMock.updateGroup.mockResolvedValueOnce(false);
    const result = await updateGroupUseCase.execute(groupid, getModifiedGroupDataMock);
    expect(result).toBeNull();
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupid);
    expect(groupRepositoryMock.updateGroup).toHaveBeenCalledWith(groupid, getModifiedGroupDataMock);
  });
});
