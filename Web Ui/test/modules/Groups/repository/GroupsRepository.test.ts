import axios from 'axios';
import GroupsRepository from '../../../../src/modules/Groups/repository/GroupsRepository';
import { GroupDataObject } from '../../../../src/modules/Groups/domain/GroupInterface';
import dotenv from "dotenv";
dotenv.config();

const axiosGetSpy = jest.spyOn(axios, 'get');
const axiosPostSpy = jest.spyOn(axios, 'post');
const axiosDeleteSpy = jest.spyOn(axios, 'delete');

const repository = new GroupsRepository();
const API_URL = process.env.VITE_API_URL + '/groups';

describe('GroupsRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGroups', () => {
    it('should fetch all groups successfully', async () => {
      const mockGroups: GroupDataObject[] = [
        { id: 1, groupName: 'Group1', groupDetail: 'Detail1', creationDate: new Date() },
        { id: 2, groupName: 'Group2', groupDetail: 'Detail2', creationDate: new Date() },
      ];
      axiosGetSpy.mockResolvedValue({ status: 200, data: mockGroups });

      const result = await repository.getGroups();
      expect(result).toEqual(mockGroups);
      expect(axiosGetSpy).toHaveBeenCalledWith(API_URL);
    });
    it('should handle fetch error', async () => {
        axiosGetSpy.mockRejectedValue(new Error('Network Error'));
        await expect(repository.getGroups()).rejects.toThrowError('Network Error');
    });
  describe('getGroupById', () => {
      it('should fetch group by ID successfully', async () => {
        const mockGroup: GroupDataObject = { id: 1, groupName: 'Group1', groupDetail: 'Detail1', creationDate: new Date() };
        axiosGetSpy.mockResolvedValue({ status: 200, data: mockGroup });
    
        const result = await repository.getGroupById(1);
        expect(result).toEqual(mockGroup);
        expect(axiosGetSpy).toHaveBeenCalledWith(`${API_URL}/1`);
      });
      it('should handle fetch error', async () => {
        axiosGetSpy.mockRejectedValue(new Error('Network Error'));
        await expect(repository.getGroupById(1)).rejects.toThrowError('Network Error');
      });
    });
  });
  describe('createGroup', () => {
    it('should create a group successfully', async () => {
      const mockGroup: GroupDataObject = { id: 1, groupName: 'Group1', groupDetail: 'Detail1', creationDate: new Date() };
      axiosPostSpy.mockResolvedValue({ status: 201 });

      await expect(repository.createGroup(mockGroup)).resolves.not.toThrowError();
      expect(axiosPostSpy).toHaveBeenCalledWith(API_URL, mockGroup);
    });
    it('should handle creation error', async () => {
        axiosPostSpy.mockRejectedValue(new Error('Network Error'));
        const mockGroup: GroupDataObject = { id: 1, groupName: 'Group1', groupDetail: 'Detail1', creationDate: new Date() };
        await expect(repository.createGroup(mockGroup)).rejects.toThrowError('Network Error');
      });
  });
  describe('deleteGroup', () => {
    it('should delete a group successfully', async () => {
      axiosDeleteSpy.mockResolvedValue({ status: 200 });

      await expect(repository.deleteGroup(1)).resolves.not.toThrowError();
      expect(axiosDeleteSpy).toHaveBeenCalledWith(`${API_URL}/1`);
    });
    it('should handle deletion error', async () => {
        axiosDeleteSpy.mockRejectedValue(new Error('Network Error'));
        await expect(repository.deleteGroup(1)).rejects.toThrowError('Network Error');
    });
  });
});