import UpdateAssignment from "../../../../src/modules/Assignments/application/AssignmentUseCases/updateAssignmentUseCase";
import { assignmentPendingDataMock } from "../../../__mocks__/assignments/dataTypeMocks/assignmentData";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();

let updateAssignment: UpdateAssignment;

beforeEach(() => {
  updateAssignment = new UpdateAssignment(assignmentRepositoryMock);
});

describe("Update assignment", () => {
  it("should update an assignment successfully", async () => {
    const assignmentId = "1";
    assignmentRepositoryMock.obtainAssignmentById.mockResolvedValueOnce(assignmentPendingDataMock);
    assignmentRepositoryMock.checkDuplicateTitle.mockResolvedValueOnce(false);
    assignmentRepositoryMock.updateAssignment.mockResolvedValueOnce(assignmentPendingDataMock);
    const result = await updateAssignment.execute(assignmentId, assignmentPendingDataMock);
    expect(result).toEqual(assignmentPendingDataMock);
    expect(assignmentRepositoryMock.updateAssignment).toHaveBeenCalledWith(
      assignmentId,
      assignmentPendingDataMock
    );
  });

  it("should handle errors when updating an assignment", async () => {
    const assignmentId = "2";
    assignmentRepositoryMock.obtainAssignmentById.mockResolvedValueOnce(assignmentPendingDataMock);
    assignmentRepositoryMock.checkDuplicateTitle.mockResolvedValueOnce(false);
    assignmentRepositoryMock.updateAssignment.mockRejectedValueOnce(new Error());
    await expect(updateAssignment.execute(assignmentId, assignmentPendingDataMock)).rejects.toThrow();
    expect(assignmentRepositoryMock.updateAssignment).toHaveBeenCalledWith(
      assignmentId,
      assignmentPendingDataMock
    );
  });
});