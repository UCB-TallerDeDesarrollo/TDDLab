import axios from 'axios';
import UsersRepository from '../../../../src/modules/Users/repository/UsersRepository';
import { UserDataObject } from '../../../../src/modules/Users/domain/UsersInterface';

const axiosGetSpy = jest.spyOn(axios, 'get');

const repository = new UsersRepository();
const API_URL = 'https://tdd-lab-api-gold.vercel.app/api/user/users';

describe('UsersRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should fetch user by ID successfully', async () => {
      const mockUser: UserDataObject = { id: 1, email: 'john@example.com', role: 'admin', groupid: 70 };
      axiosGetSpy.mockResolvedValue({ status: 200, data: mockUser });

      const result = await repository.getUserById(1);
      expect(result).toEqual(mockUser);
      expect(axiosGetSpy).toHaveBeenCalledWith(`${API_URL}/1`);
    });

    it('should handle fetch error', async () => {
      axiosGetSpy.mockRejectedValue(new Error('Network Error'));
      await expect(repository.getUserById(1)).rejects.toThrowError('Network Error');
    });
  });
  describe('getUsers', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers: UserDataObject[] = [
        { id: 1, email: 'john@example.com', role: 'admin', groupid: 70 },
        { id: 2, email: 'jane@example.com', role: 'user', groupid: 70 },
      ];
      axiosGetSpy.mockResolvedValue({ status: 200, data: mockUsers });

      const result = await repository.getUsers();
      expect(result).toEqual(mockUsers);
      expect(axiosGetSpy).toHaveBeenCalledWith(API_URL);
    });
    
  
    it('should handle fetch error', async () => {
      axiosGetSpy.mockRejectedValue(new Error('Network Error'));
      await expect(repository.getUsers()).rejects.toThrowError('Network Error');
    });
  });
  describe('getUsersByGroupid', () => {
    it('should fetch users by group ID successfully', async () => {
      const mockUsers: UserDataObject[] = [
        { id: 1, email: 'john@example.com', role: 'admin', groupid: 70 },
        { id: 2, email: 'jane@example.com', role: 'user', groupid: 70 },
      ];
      axiosGetSpy.mockResolvedValue({ status: 200, data: mockUsers });

      const result = await repository.getUsersByGroupid(70);
      expect(result).toEqual(mockUsers);
      expect(axiosGetSpy).toHaveBeenCalledWith(`${API_URL}/groupid/70`);
    });
  });

});