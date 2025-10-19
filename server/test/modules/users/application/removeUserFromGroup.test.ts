import { removeUser } from "../../../../src/modules/Users/Application/removeUserFromGroup";
import { UserRepository } from "../../../../src/modules/Users/Repositories/UserRepository";

// Mock de UserRepository
jest.mock("../../../../src/modules/Users/Repositories/UserRepository");

describe("removeUser", () => {
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>;
  });

  it("should successfully remove user from group", async () => {
    const userId = 1;
    userRepositoryMock.removeUserFromGroup.mockResolvedValue(undefined); // Simulando una eliminacion exitosa

    await removeUser(userId, userRepositoryMock); // Llamando al caso de uso con el mock del repo

    // Verificando llamada correcta al repo
    expect(userRepositoryMock.removeUserFromGroup).toHaveBeenCalledWith(userId);
  });

  it("should throw an error if removeUserFromGroup fails", async () => {
    const userId = 1;
    const error = new Error("Database error");
    userRepositoryMock.removeUserFromGroup.mockRejectedValue(error); // Simulando error en el repositorio

    // Verificar que el error esta siendo lanzado correctamente
    await expect(removeUser(userId, userRepositoryMock)).rejects.toThrow("Database error");
  });
});
