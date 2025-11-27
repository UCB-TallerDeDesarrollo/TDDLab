import GetUsers from '../../../src/modules/Users/application/getUsers';
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
describe('GetUsers', () => {
    let getUsers: GetUsers;
    const mockUsers: UserDataObject[] = [
      { id: 1, email: 'john@example.com', role: 'admin', groupid: 70 },
      { id: 2, email: 'jane@example.com', role: 'user', groupid: 70 },
    ];
  
    beforeEach(() => {
      getUsers = new GetUsers(mockRepository);
    });
  
    afterEach(() => {
      jest.resetAllMocks();
    });
  
    it('should return an array of users', async () => {
      (mockRepository.getUsers as jest.MockedFunction<typeof mockRepository.getUsers>).mockResolvedValue(mockUsers);
  
      const result = await getUsers.getUsers();
  
      expect(mockRepository.getUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  
    it('should return an empty array if no users are found', async () => {
      (mockRepository.getUsers as jest.MockedFunction<typeof mockRepository.getUsers>).mockResolvedValue([]);
  
      const result = await getUsers.getUsers();
  
      expect(mockRepository.getUsers).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
    it('should handle errors when fetching users', async () => {
      const error = new Error('Error fetching users');
      (mockRepository.getUsers as jest.MockedFunction<typeof mockRepository.getUsers>).mockRejectedValue(error);
      await expect(getUsers.getUsers()).rejects.toThrow('Error fetching users');
    });
  });