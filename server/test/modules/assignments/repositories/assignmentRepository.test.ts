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

describe('Obtain assignments', () => {
    it('should retrieve all assignments', async () => {
        const testData = {
            rows: [
                {
                    id: 1,
                    title: 'Assignment 1',
                    description: 'Description of Assignment 1',
                    start_date: '2023-01-01',
                    end_date: '2023-01-10',
                    state: 'pending',
                },
                {
                    id: 2,
                    title: 'Assignment 1',
                    description: 'Description of Assignment 1',
                    start_date: '2023-01-01',
                    end_date: '2023-01-10',
                    state: 'pending',
                },
            ],
        };
        clientQueryMock.mockResolvedValue(testData);
        const assignments = await repository.obtainAssignments();
        expect(assignments).toHaveLength(2);
    });
});
