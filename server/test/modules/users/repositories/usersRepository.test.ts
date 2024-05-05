import { UserRepository } from "../../../../src/modules/Users/Repositories/UserRepository";
import { Pool } from "pg";
import { mockUsers } from "../../../__mocks__/users/dataTypeMocks/mockUsers";

let repository: UserRepository;
let poolConnectMock: jest.Mock;
let clientQueryMock: jest.Mock;

beforeEach(() => {
  poolConnectMock = jest.fn();
  clientQueryMock = jest.fn();
  poolConnectMock.mockResolvedValue({
    query: clientQueryMock,
    release: jest.fn(),
  });
  jest.spyOn(Pool.prototype, "connect").mockImplementation(poolConnectMock);
  repository = new UserRepository();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("getUsersByGroupId", () => {
  it("should retrieve users by group ID", async () => {
    const groupId = 70;
    const expectedUsers = mockUsers.filter((user) => user.groupid === groupId);

    clientQueryMock.mockResolvedValue({ rows: expectedUsers });

    const result = await repository.getUsersByGroupid(groupId);

    expect(result).toEqual(expectedUsers);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "SELECT * FROM userstable WHERE groupid = $1",
      [groupId]
    );
  });

  it("should return an empty array if no users are found for the group ID", async () => {
    const groupId = 99;
    clientQueryMock.mockResolvedValue({ rows: [] });

    const result = await repository.getUsersByGroupid(groupId);

    expect(result).toEqual([]);
    expect(clientQueryMock).toHaveBeenCalledWith(
      "SELECT * FROM userstable WHERE groupid = $1",
      [groupId]
    );
  });

  it("should handle errors when obtaining users by group ID", async () => {
    const groupId = 70;
    const error = new Error("Database error");
    poolConnectMock.mockRejectedValue(error);

    await expect(repository.getUsersByGroupid(groupId)).rejects.toThrow(
      "Database error"
    );
    expect(clientQueryMock).not.toHaveBeenCalled();
  });
});