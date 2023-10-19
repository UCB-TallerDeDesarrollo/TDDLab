import AssignmentRepository from "../../../../src/modules/Assignments/repositories/AssignmentRepository";
import { Pool } from 'pg';

let repository: AssignmentRepository;
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
    repository = new AssignmentRepository();
});

afterEach(() => {
    jest.restoreAllMocks();
});

function getAssignmentTestData(count: number) {
    return {
        rows: Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            title: `Assignment ${i + 1}`,
            description: `Description of Assignment ${i + 1}`,
            start_date: '2023-01-01',
            end_date: '2023-01-10',
            state: 'pending',
        })),
    };
}

describe('obtainAssignments', () => {
    it('should retrieve all assignments', async () => {
        clientQueryMock.mockResolvedValue(getAssignmentTestData(2));
        const assignments = await repository.obtainAssignments();
        expect(assignments).toHaveLength(2);
    });
    it('should handle errors when obtaining assignments', async () => {
        poolConnectMock.mockRejectedValue(new Error);
        await expect(repository.obtainAssignments()).rejects.toThrow();
    });
});

describe('obtainAssignmentById', () => {
    it("should retrieve an assignment by existing ID", async () => {
        clientQueryMock.mockResolvedValue(getAssignmentTestData(1));
        const assignment = await repository.obtainAssignmentById('1');
        expect(assignment).not.toBeNull();
    });
});