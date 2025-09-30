import DeleteAssignment from "../../../../src/modules/Assignments/application/AssignmentUseCases/deleteAssignmentUseCase";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();
let deleteAssignment: DeleteAssignment;

beforeEach(() => {
  deleteAssignment = new DeleteAssignment(assignmentRepositoryMock);
});

describe("Delete assignment", () => {
  
  it("should delete an assignment successfully", async () => {
    const assignmentId = "id_assignment_pending";
    assignmentRepositoryMock.deleteAssignment.mockResolvedValueOnce(undefined);
    await expect(deleteAssignment.execute(String(assignmentId))).resolves.toBeUndefined();
    expect(assignmentRepositoryMock.deleteAssignment).toHaveBeenCalledWith(Number(assignmentId));
  });

  it("should handle errors when deleting an assignment", async () => {
    const assignmentId = "id_assignment_in_profress";
    assignmentRepositoryMock.deleteAssignment.mockRejectedValueOnce(new Error);
    await expect(deleteAssignment.execute(String(assignmentId))).rejects.toThrow();
    expect(assignmentRepositoryMock.deleteAssignment).toHaveBeenCalledWith(Number(assignmentId));
  });
});
