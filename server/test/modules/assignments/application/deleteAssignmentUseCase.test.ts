import DeleteAssignment from "../../../../src/modules/Assignments/application/AssignmentUseCases/deleteAssignmentUseCase";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();
let deleteAssignment: DeleteAssignment;

beforeEach(() => {
  deleteAssignment = new DeleteAssignment(assignmentRepositoryMock);
});

describe("Delete assignment", () => {
  
  it("should delete an assignment successfully", async () => {
    const assignmentId = "12345";
    assignmentRepositoryMock.deleteAssignment.mockResolvedValueOnce(undefined);
    await expect(deleteAssignment.execute(assignmentId)).resolves.toBeUndefined();
    expect(assignmentRepositoryMock.deleteAssignment).toHaveBeenCalledWith(assignmentId);
  });

  it("should handle errors when deleting an assignment", async () => {
    const assignmentId = "54321";
    assignmentRepositoryMock.deleteAssignment.mockRejectedValueOnce(new Error);
    await expect(deleteAssignment.execute(assignmentId)).rejects.toThrow();
    expect(assignmentRepositoryMock.deleteAssignment).toHaveBeenCalledWith(assignmentId);
  });
});
