import { Pool } from 'pg';
import { getModifiedGroupDataMock } from '../../../__mocks__/groups/dataTypeMocks/groupData';
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
        const group = await repository.obtainGroupById('1');
        expect(group).not.toBeNull();
    });

    it('should retrieve null for a non-existing group ID', async () => {
        poolConnectMock.mockResolvedValue({
        query: jest.fn().mockResolvedValue({
            rows: [],
        }),
        release: jest.fn(),
        });
        const group = await repository.obtainGroupById('NonExistent_ID');
        expect(group).toBeNull();
    });

    it('should handle errors when obtaining a group by ID', async () => {
        poolConnectMock.mockRejectedValue(new Error());
        await expect(repository.obtainGroupById('1')).rejects.toThrow();
    });
});

describe('Create group', () => {
    it('should handle errors when creating a group', async () => {
        poolConnectMock.mockRejectedValue(new Error());
        await expect(repository.createGroup(getModifiedGroupDataMock)).rejects.toThrow();
    });
});

describe('Delete group', () => {
    it('should delete a group', async () => {
        clientQueryMock.mockResolvedValue({ rowCount: 1 });
        await repository.deleteGroup('1');
    });

    it('should handle errors when deleting a group', async () => {
        poolConnectMock.mockRejectedValue(new Error());
        await expect(repository.deleteGroup('1')).rejects.toThrow();
    });
});

describe('Update group', () => {
    it('should return null if no group was found', async () => {
        clientQueryMock.mockResolvedValue({ rows: [] });
        const updatedGroup = await repository.updateGroup('1', getModifiedGroupDataMock);
        expect(updatedGroup).toBeNull();
    });

    it('should handle errors when updating a group', async () => {
        poolConnectMock.mockRejectedValue(new Error());
        await expect(repository.updateGroup('1', getModifiedGroupDataMock)).rejects.toThrow();
    });
});
