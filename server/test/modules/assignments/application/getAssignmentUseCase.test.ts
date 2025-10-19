import GetAssignments from "../../../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentsUseCase";
import { getAssignmentListMock } from "../../../__mocks__/assignments/dataTypeMocks/assignmentData";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";

const assignmentRepositoryMock = getAssignmentRepositoryMock();
let getAssignments: GetAssignments;

beforeEach(() => {
  getAssignments = new GetAssignments(assignmentRepositoryMock);
});

describe("Get assignments", () => {
  it("should obtain assignments successfully", async () => {
    assignmentRepositoryMock.obtainAssignments.mockResolvedValueOnce(getAssignmentListMock());
    const result = await getAssignments.execute();
    expect(result).toEqual(getAssignmentListMock());
    expect(assignmentRepositoryMock.obtainAssignments).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when obtaining assignments", async () => {
    assignmentRepositoryMock.obtainAssignments.mockRejectedValue(new Error);
    await expect(getAssignments.execute()).rejects.toThrow();
  });
});

