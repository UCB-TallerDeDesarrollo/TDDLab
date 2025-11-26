import { RemoveUserFromGroup } from "../../../src/modules/Users/application/removeUserFromGroup";
import UsersRepositoryInterface from "../../../src/modules/Users/domain/UsersRepositoryInterface";

describe("RemoveUserFromGroup", () => {
  let mockRepository: jest.Mocked<UsersRepositoryInterface>;
  let removeUserFromGroup: RemoveUserFromGroup;

  beforeEach(() => {
    // Crear un mock del repositorio
    mockRepository = {
      getUserById: jest.fn(),
      getUsers: jest.fn(),
      getUsersByGroupid: jest.fn(),
      getUserByEmail: jest.fn(),
      getFilteredUsersByEmail: jest.fn(),
      updateUser: jest.fn(),
      removeUserFromGroup: jest.fn(),
    };

    // Crear la instancia de RemoveUserFromGroup con el repositorio mockeado
    removeUserFromGroup = new RemoveUserFromGroup(mockRepository);
  });

  it("debería llamar a removeUserFromGroup con el ID correcto", async () => {
    const userId = 1;

    // Configurar el mock para que no haga nada cuando se llame
    mockRepository.removeUserFromGroup.mockResolvedValue(undefined);

    await removeUserFromGroup.removeUserFromGroup(userId);

    // Asegurarse de que se haya llamado con el ID correcto
    expect(mockRepository.removeUserFromGroup).toHaveBeenCalledWith(userId);
  });

  it("debería lanzar un error si removeUserFromGroup falla", async () => {
    const userId = 1;

    // Configurar el mock para que falle
    mockRepository.removeUserFromGroup.mockRejectedValue(new Error("Error al eliminar usuario"));

    await expect(removeUserFromGroup.removeUserFromGroup(userId)).rejects.toThrow("Error al eliminar usuario");
  });

  
});
