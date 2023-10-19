import AssignmentRepository from "../../../../src/modules/Assignments/repositories/AssignmentRepository";
import { Pool } from 'pg';
import { getAssignmentMock } from "../../../__mocks__/assignments/dataTypeMocks/assignmentData";

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

describe('Obtain assignments', () => {
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

describe('Obtain assignment by id', () => {
    it("should retrieve an assignment by existing ID", async () => {
        clientQueryMock.mockResolvedValue(getAssignmentTestData(1));
        const assignment = await repository.obtainAssignmentById('1');
        expect(assignment).not.toBeNull();
    });
    it('should retrieve null for a non-existing assignment ID', async () => {
        poolConnectMock.mockResolvedValue({
            query: jest.fn().mockResolvedValue({
                rows: [],
            }),
            release: jest.fn(),
        });
        const assignment = await repository.obtainAssignmentById('NonExistent_ID');
        expect(assignment).toBeNull();
    });
    it('should handle errors when obtaining an assignment by ID', async () => {
        poolConnectMock.mockRejectedValue(new Error);
        await expect(repository.obtainAssignmentById('1')).rejects.toThrow();
    });
});

describe('Create assignment', () => {
    it("should create an assignment", async () => {
        clientQueryMock.mockResolvedValue({ rows: [getAssignmentMock()] });
        const newAssignment = getAssignmentMock();
        const createdAssignment = await repository.createAssignment(newAssignment);
        expect(createdAssignment).toEqual(newAssignment);
    });
    it('should handle errors when creating an assignment', async () => {
        poolConnectMock.mockRejectedValue(new Error);
        await expect(repository.createAssignment(getAssignmentMock())).rejects.toThrow();
    });
});


describe('Delete assignment', () => {
    it("should delete an assignment", async () => {
        clientQueryMock.mockResolvedValue({ rowCount: 1 });
        const deletedAssignment = await repository.deleteAssignment('1');
        expect(deletedAssignment).toBeUndefined();
    });
    it('should handle errors when deleting an assignment', async () => {
        poolConnectMock.mockRejectedValue(new Error);
        await expect(repository.deleteAssignment('1')).rejects.toThrow();
    });
});

describe('Update assignment', () => {
    it("should update an assignment", async () => {
        clientQueryMock.mockResolvedValue({ rows: [getAssignmentMock()] });
        const updatedAssignment = await repository.updateAssignment(1, getAssignmentMock());
        expect(updatedAssignment).toEqual(getAssignmentMock());
    });
    it("should return null if no assignment was found", async () => {
        clientQueryMock.mockResolvedValue({ rows: [] });
        const updatedAssignment = await repository.updateAssignment(1, getAssignmentMock());
        expect(updatedAssignment).toBeNull();
    });
});