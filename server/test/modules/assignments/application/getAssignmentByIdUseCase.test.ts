import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";
import GetAssignmentById from "../../../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentByIdUseCase";
import { assignmentPendingDataMock } from "../../../__mocks__/assignments/dataTypeMocks/assignmentData";

let assignmentRepositoryMock: any;
let getAssignmentById: any;

beforeEach(() => {
    assignmentRepositoryMock = getAssignmentRepositoryMock();
    getAssignmentById = new GetAssignmentById(assignmentRepositoryMock);
});

describe("Get assignment by id", () => {
    it("should retrieve an assignment by ID", async () => {
        const assignmentId = "1";
        const expectedAssignment = assignmentPendingDataMock;
        assignmentRepositoryMock.obtainAssignmentById.mockResolvedValue(expectedAssignment);
        const result = await getAssignmentById.execute(assignmentId);
        expect(result).toEqual(expectedAssignment);
        expect(assignmentRepositoryMock.obtainAssignmentById).toHaveBeenCalledWith(assignmentId);
    });
    it("should handle errors when obtaining an assignment by ID", async () => {
        const assignmentId = "2";
        assignmentRepositoryMock.obtainAssignmentById.mockRejectedValue(new Error);
        await expect(getAssignmentById.execute(assignmentId)).rejects.toThrow();
        expect(assignmentRepositoryMock.obtainAssignmentById).toHaveBeenCalledWith(assignmentId);
    });
});
