import CreateAssignment from "../../../../src/modules/Assignments/application/AssignmentUseCases/createAssignmentUseCase";
import { assignmentPendingDataMock } from "../../../__mocks__/assignments/dataTypeMocks/assignmentData";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();
let createAssignmentInstance: CreateAssignment;

beforeEach(() => {
  createAssignmentInstance = new CreateAssignment(assignmentRepositoryMock);
});

describe("Create assignment", () => {
  it("should create an assignment", async () => {
    const assignmentData = assignmentPendingDataMock;
    assignmentRepositoryMock.createAssignment.mockResolvedValue(assignmentData);
    const newAssignment = await createAssignmentInstance.execute(assignmentData);
    expect(assignmentRepositoryMock.createAssignment).toHaveBeenCalledWith(assignmentData);
    expect(newAssignment).toEqual(assignmentData);
  });

  it("should handle errors when creating an assignment", async () => {
    assignmentRepositoryMock.createAssignment.mockRejectedValue(new Error);
    await expect(createAssignmentInstance.execute(assignmentPendingDataMock)).rejects.toThrow();
  });
});

