import DeliverAssignmentUseCase from "../../../../src/modules/Assignments/application/AssignmentUseCases/deliverAssignmentaUseCase";
import { getAssignmentMock } from "../../../__mocks__/assignments/dataTypeMocks/assignmentData";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();
let deliverAssignment: DeliverAssignmentUseCase;

beforeEach(() => {
  deliverAssignment = new DeliverAssignmentUseCase(assignmentRepositoryMock);
});

describe("Deliver assignment", () => {
  it("Should deliver an assignment successfully", async () => {
    const assignmentId = "1";
    const link = "https://example.com/assignment";
    const expectedAssignment = getAssignmentMock();
    assignmentRepositoryMock.obtainAssignmentById.mockResolvedValue(expectedAssignment);
    const result = await deliverAssignment.execute(assignmentId, link);
    expect(result).toEqual(expectedAssignment);
  });

  it("Should handle the case where the assignment is not found", async () => {
    const assignmentId = "1";
    const link = "https://example.com/assignment";
    assignmentRepositoryMock.obtainAssignmentById.mockResolvedValueOnce(null);
    await expect(deliverAssignment.execute(assignmentId, link)).rejects.toThrow("Assignment not found");
  });
});
