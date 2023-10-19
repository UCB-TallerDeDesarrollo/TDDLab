import UpdateAssignment from "../../../../src/modules/Assignments/application/AssignmentUseCases/updateAssignmentUseCase";
import { getAssignmentMock } from "../../../__mocks__/assignments/dataTypeMocks/assignmentData";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();

let updateAssignment: UpdateAssignment;

beforeEach(() => {
  updateAssignment = new UpdateAssignment(assignmentRepositoryMock);
});

describe("Update assignment", () => {
  it("should update an assignment successfully", async () => {
    const assignmentId = 1;
    assignmentRepositoryMock.updateAssignment.mockResolvedValueOnce(getAssignmentMock());
    const result = await updateAssignment.execute(assignmentId, getAssignmentMock());
    expect(result).toEqual(getAssignmentMock());
    expect(assignmentRepositoryMock.updateAssignment).toHaveBeenCalledWith(
      assignmentId,
      getAssignmentMock()
    );
  });

  it("should handle errors when updating an assignment", async () => {
    const assignmentId = 2;
    assignmentRepositoryMock.updateAssignment.mockRejectedValueOnce(new Error());
    await expect(updateAssignment.execute(assignmentId, getAssignmentMock())).rejects.toThrow();
    expect(assignmentRepositoryMock.updateAssignment).toHaveBeenCalledWith(
      assignmentId,
      getAssignmentMock()
    );
  });
});

