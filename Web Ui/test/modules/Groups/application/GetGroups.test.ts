import GetGroups from "../../../../src/modules/Groups/application/GetGroups";
import GroupsRepositoryInterface from "../../../../src/modules/Groups/domain/GroupsRepositoryInterface";
import MockGroupsRepository from "../../__mocks__/Groups/MockGroupsRepository";

describe('GetGroups', () => {
    let getGroupsInstance: GetGroups;
    let groupsRepositoryMock: GroupsRepositoryInterface;
  
    beforeEach(() => {
      groupsRepositoryMock = new MockGroupsRepository([
        {
            id: 1, 
            groupName: 'Group A',
            groupDetail: "",
            creationDate: new Date("2023-01-10"),
        },
        {
            id: 2, 
            groupName: 'Group B',
            groupDetail: "",
            creationDate: new Date("2023-01-10"),
        },
      ]);
      getGroupsInstance = new GetGroups(groupsRepositoryMock);
    });
  
    it('should get groups successfully', async () => {
      const groups = await getGroupsInstance.getGroups();
      expect(groups).toHaveLength(2);
      expect(groups[0].groupName).toBe('Group A');
      expect(groups[1].groupName).toBe('Group B');
    });
  
    it('should handle errors during group retrieval', async () => {
      const mockError = new Error('Failed to fetch groups');
      groupsRepositoryMock.getGroups = jest.fn().mockRejectedValueOnce(mockError);
  
      await expect(getGroupsInstance.getGroups()).rejects.toThrowError(mockError);
    });

    it("should return default group object when repository returns null in getGroupById", async () => {
      groupsRepositoryMock.getGroupById = jest.fn().mockResolvedValueOnce(null);

      const result = await getGroupsInstance.getGroupById(123);

      expect(result).toEqual({
        id: 0,
        groupName: "",
        groupDetail: "",
        creationDate: expect.any(Date),
    });
  });

      it("should return [-1] when repository returns null in getGroupsByUserId", async () => {
      groupsRepositoryMock.getGroupsByUserId = jest.fn().mockResolvedValueOnce(null);

      const result = await getGroupsInstance.getGroupsByUserId(123);

      expect(result).toEqual([-1]);
    });
        
  });