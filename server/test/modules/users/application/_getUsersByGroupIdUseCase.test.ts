import { getUserRepositoryMock } from "../../../__mocks__/users/userRepositoryMock";
import GetUsersByGroupidUseCase from "../../../../src/modules/Users/Application/getUsersByGroupidUseCase";
import { mockUsers } from "../../../__mocks__/users/dataTypeMocks/mockUsers";

let userRepositoryMock: any
let getUsersByGroupid: any;

beforeEach(() => {
    userRepositoryMock = getUserRepositoryMock();
    getUsersByGroupid = new GetUsersByGroupidUseCase(userRepositoryMock);
  });

describe('GetUsersByGroupIdUseCase', () => {
  
    it('should retrieve users by group ID', async () => {
      const groupId = 70;
      const expectedUsers = mockUsers.filter((user) => user.groupid.includes(groupId));
  
      const result = await getUsersByGroupid.execute(groupId);
  
      expect(result).toEqual(expectedUsers);
      expect(userRepositoryMock.getUsersByGroupid).toHaveBeenCalledWith(groupId);
    });
    it("should throw an error when repository throws an error", async () => {
      userRepositoryMock.getUsersByGroupid.mockRejectedValue(new Error("Failed to retrieve users by group"));
      await expect(getUsersByGroupid.execute(1)).rejects.toThrow("Failed to retrieve users by group");
    });
  
  });