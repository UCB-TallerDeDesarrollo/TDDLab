    import { Pool } from 'pg';
    import { getDataGroupMock, getModifiedGroupDataMock } from '../../../__mocks__/groups/dataTypeMocks/groupData';
    import GroupRepository from '../../../../src/modules/Groups/repositories/GroupRepository';

    let repository: GroupRepository;
    let poolConnectMock: jest.Mock;
    let clientQueryMock: jest.Mock;

    beforeEach(() => {
        poolConnectMock = jest.fn();
        clientQueryMock = jest.fn();
        poolConnectMock.mockResolvedValue({
            query: clientQueryMock,
            release: jest.fn(),
        });
        jest.spyOn(Pool.prototype, 'connect').mockImplementation(poolConnectMock);
        repository = new GroupRepository();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function getGroupTestData(count: number) {
        return {
            rows: Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            groupname: `Group ${i + 1}`,
            groupdetail: `Description of Group ${i + 1}`,
            })),
        };
    }

    describe('Obtain groups', () => {
        it('should retrieve all groups', async () => {
            clientQueryMock.mockResolvedValue(getGroupTestData(2));
            const groups = await repository.obtainGroups();
            expect(groups).toHaveLength(2);
        });

        it('should handle errors when obtaining groups', async () => {
            poolConnectMock.mockRejectedValue(new Error());
            await expect(repository.obtainGroups()).rejects.toThrow();
        });
    });

    describe('Obtain group by id', () => {
        it('should retrieve a group by existing ID', async () => {
            clientQueryMock.mockResolvedValue(getGroupTestData(1));
            const group = await repository.obtainGroupById(1);
            expect(group).not.toBeNull();
        });

        it('should retrieve null for a non-existing group ID', async () => {
            poolConnectMock.mockResolvedValue({
            query: jest.fn().mockResolvedValue({
                rows: [],
            }),
            release: jest.fn(),
            });
            const group = await repository.obtainGroupById(0);//use to be NonExisting id
            expect(group).toBeNull();
        });

        it('should handle errors when obtaining a group by ID', async () => {
            poolConnectMock.mockRejectedValue(new Error());
            await expect(repository.obtainGroupById(1)).rejects.toThrow();
        });
    });

    describe('Create group', () => {
        it('should handle errors when creating a group', async () => {
            poolConnectMock.mockRejectedValue(new Error());
            await expect(repository.createGroup(getModifiedGroupDataMock)).rejects.toThrow();
        });
        it('should create a group', async () => {
            const newGroup = {
                groupName: undefined,
                groupDetail: undefined,
                id: undefined
            };
            clientQueryMock.mockResolvedValue({ rows: [newGroup] });
            const createdGroup = await repository.createGroup(getDataGroupMock);
            expect(createdGroup).toEqual(newGroup);
        });
    });
    describe('Check group exists', () => {
        it('should return true if group exists', async () => {
            clientQueryMock.mockResolvedValue({ rows: [{ exists: true }] });
            const exists = await repository.checkGroupExists(1);
            expect(exists).toBe(true);
        });
        it('should return false if group does not exist', async () => {
            clientQueryMock.mockResolvedValue({ rows: [{ exists: false }] });
            const exists = await repository.checkGroupExists(999);
            expect(exists).toBe(false);
        });
        it('should handle errors when checking if a group exists', async () => {
            poolConnectMock.mockRejectedValue(new Error());
            await expect(repository.checkGroupExists(1)).rejects.toThrow();
        });
    });
    describe('Delete group', () => {
        it('should delete a group', async () => {
            clientQueryMock.mockResolvedValue({ rowCount: 1 });
            await repository.deleteGroup(1);
        });

        it('should handle errors when deleting a group', async () => {
            poolConnectMock.mockRejectedValue(new Error());
            await expect(repository.deleteGroup(1)).rejects.toThrow();
        });
        it('should handle errors when deleting assignments for a group', async () => {
            clientQueryMock
                .mockResolvedValueOnce({ rowCount: 1 }) // Simulate successful assignment deletion
                .mockRejectedValueOnce(new Error('Error deleting group')); // Simulate group deletion error
            await expect(repository.deleteGroup(1)).rejects.toThrow('Error deleting group');
            expect(clientQueryMock).toHaveBeenCalledWith('DELETE FROM assignments WHERE groupid = $1', [1]);
            expect(clientQueryMock).toHaveBeenCalledWith('ROLLBACK');
        });
    });

    describe('Update group', () => {
        it('should return null if no group was found', async () => {
            clientQueryMock.mockResolvedValue({ rows: [] });
            const updatedGroup = await repository.updateGroup(1, getModifiedGroupDataMock);
            expect(updatedGroup).toBeNull();
        });
        it('should update a group', async () => {
            const updatedGroup = {
                groupName: undefined,
                groupDetail: undefined,
                id: undefined,
            };
            clientQueryMock.mockResolvedValue({ rows: [updatedGroup] });
            const result = await repository.updateGroup(1, getModifiedGroupDataMock);
            expect(result).toEqual(updatedGroup);
        });
    });
