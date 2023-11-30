import GetGroupByIdUseCase from '../../../../src/modules/Groups/application/GroupUseCases/getGroupByIdUseCase';
import { getGroupsRepositoryMock } from '../../../__mocks__/groups/repositoryMock';
import { getDataListOfGroupsMock } from '../../../__mocks__/groups/dataTypeMocks/groupData';

const groupRepositoryMock = getGroupsRepositoryMock();
const getGroupByIdUseCase = new GetGroupByIdUseCase(groupRepositoryMock);

describe('GetGroupByIdUseCase', () => {
  it('should fetch a group by ID successfully', async () => {
    const groupId = '1';
    const groupData = getDataListOfGroupsMock.find(group => group.id === groupId);
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(groupData);

    const result = await getGroupByIdUseCase.execute(groupId);
    expect(result).toEqual(groupData);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupId);
  });

  it('should handle errors during group fetch by ID', async () => {
    const groupId = '2';
    groupRepositoryMock.obtainGroupById.mockRejectedValueOnce(new Error());

    await expect(getGroupByIdUseCase.execute(groupId)).rejects.toThrowError(Error);
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(groupId);
  });

  it('should return null for non-existing group ID', async () => {
    const nonExistingGroupId = '3';
    groupRepositoryMock.obtainGroupById.mockResolvedValueOnce(null);

    const result = await getGroupByIdUseCase.execute(nonExistingGroupId);
    expect(result).toBeNull();
    expect(groupRepositoryMock.obtainGroupById).toHaveBeenCalledWith(nonExistingGroupId);
  });
});
