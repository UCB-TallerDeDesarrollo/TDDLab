import { RemoveUserFromGroup } from "../../../src/modules/Users/application/removeUserFromGroup";
import UsersRepositoryInterface from "../../../src/modules/Users/domain/UsersRepositoryInterface";

describe("RemoveUserFromGroup", () => {
  let mockRepository: jest.Mocked<UsersRepositoryInterface>;
  let removeUserFromGroup: RemoveUserFromGroup;

  beforeEach(() => {
    mockRepository = {
      getUserById: jest.fn(),
      getUsers: jest.fn(),
      getUsersByGroupid: jest.fn(),
      getUserByEmail: jest.fn(),
      updateUser: jest.fn(),
      removeUserFromGroup: jest.fn(),
    };
    removeUserFromGroup = new RemoveUserFromGroup(mockRepository);
  });

  it("debería llamar a removeUserFromGroup con el ID correcto", async () => {
    const userId = 1;
    await removeUserFromGroup.removeUserFromGroup(userId);
    expect(mockRepository.removeUserFromGroup).toHaveBeenCalledWith(userId);
  });

  it("debería lanzar un error si removeUserFromGroup falla", async () => {
    const userId = 1;
    mockRepository.removeUserFromGroup.mockRejectedValue(new Error("Error al eliminar usuario"));

    await expect(removeUserFromGroup.removeUserFromGroup(userId)).rejects.toThrow("Error al eliminar usuario");
  });
});
