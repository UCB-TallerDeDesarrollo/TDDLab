import GetAssignmentsByGroupidUseCase from "../../../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentsByGroupIdUseCase";
import { getAssignmentListMock } from "../../../__mocks__/assignments/dataTypeMocks/assignmentData";
import { getAssignmentRepositoryMock } from "../../../__mocks__/assignments/repositoryMock";
const assignmentRepositoryMock = getAssignmentRepositoryMock();
let getAssignmentsByGroupidUseCase: GetAssignmentsByGroupidUseCase;

beforeEach(() => {
  getAssignmentsByGroupidUseCase = new GetAssignmentsByGroupidUseCase(assignmentRepositoryMock);
});

describe("Get assignments by group ID", () => {
  it("should obtain assignments successfully for a given group ID", async () => {
    const groupid = 1;
    assignmentRepositoryMock.obtainAssignmentsByGroupId.mockResolvedValueOnce(getAssignmentListMock());
    const result = await getAssignmentsByGroupidUseCase.execute(groupid);
    expect(result).toEqual(getAssignmentListMock());
    expect(assignmentRepositoryMock.obtainAssignmentsByGroupId).toHaveBeenCalledTimes(1);
    expect(assignmentRepositoryMock.obtainAssignmentsByGroupId).toHaveBeenCalledWith(groupid);
  });
});