import GetGroupsUseCase from "../../../../src/modules/Groups/application/GroupUseCases/getGroupsUseCase";
import { getDataListOfGroupsMock } from "../../../__mocks__/groups/dataTypeMocks/groupData";
import { getGroupsRepositoryMock } from "../../../__mocks__/groups/repositoryMock";

const groupRepositoryMock = getGroupsRepositoryMock();
const getGroupsUseCase = new GetGroupsUseCase(groupRepositoryMock);

describe('GetGroupsUseCase', () => {
  it('should fetch groups successfully', async () => {
    groupRepositoryMock.obtainGroups.mockResolvedValueOnce(getDataListOfGroupsMock);
    const result = await getGroupsUseCase.execute();
    expect(result).toEqual(getDataListOfGroupsMock);
    expect(groupRepositoryMock.obtainGroups).toHaveBeenCalled();
  });

  it('should handle errors during group fetch', async () => {
    groupRepositoryMock.obtainGroups.mockRejectedValueOnce(new Error);
    await expect(getGroupsUseCase.execute()).rejects.toThrowError(new Error);
    expect(groupRepositoryMock.obtainGroups).toHaveBeenCalled();
  });
});
