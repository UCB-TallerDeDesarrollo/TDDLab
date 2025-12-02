import GetUserById from '../../../src/modules/Users/application/getUserByid';
import { UserDataObject } from '../../../src/modules/Users/domain/UsersInterface';
import UsersRepositoryInterface from '../../../src/modules/Users/domain/UsersRepositoryInterface';

const mockRepository: UsersRepositoryInterface = {
  getUserById: jest.fn(),
  getUsers: jest.fn(),
  getUsersByGroupid: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUser: jest.fn(),
  removeUserFromGroup: jest.fn(),
  getFilteredUsersByEmail: jest.fn(),
};

describe('GetUserById', () => {
  let getUserById: GetUserById;
  const userid = 1;
  const mockUser: UserDataObject = {
    id: userid,
    email: 'john@example.com',
    role: 'admin',
    groupid: 70,
  };
  const notFoundUser: UserDataObject = {
    id: -1,
    email: '',
    role: '',
    groupid: -1,
  };

  beforeEach(() => {
    // Inicializamos la instancia de GetUserById con el mock de la interfaz
    getUserById = new GetUserById(mockRepository);
  });

  afterEach(() => {
    // Limpiamos los mocks después de cada prueba
    jest.resetAllMocks();
  });

  it('should return a user when a valid userId is provided', async () => {
    // Configuramos el mock para que devuelva el usuario cuando se llame a getUserById
    (mockRepository.getUserById as jest.MockedFunction<typeof mockRepository.getUserById>).mockResolvedValue(mockUser);

    const result = await getUserById.getUserById(userid);

    expect(mockRepository.getUserById).toHaveBeenCalledWith(userid);
    expect(result).toEqual(mockUser);
  });

  it('should return null when an invalid userId is provided', async () => {
    // Configuramos el mock para que devuelva una promesa resuelta con un objeto de usuario no encontrado cuando se llame a getUserById
    (mockRepository.getUserById as jest.MockedFunction<typeof mockRepository.getUserById>).mockResolvedValue(Promise.resolve(notFoundUser));
    const result = await getUserById.getUserById(userid);

    expect(mockRepository.getUserById).toHaveBeenCalledWith(userid);
    expect(result).toEqual(notFoundUser);
  });
});