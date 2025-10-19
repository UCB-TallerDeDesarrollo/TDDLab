import GetSubmissionUseCase from "../../../../src/modules/Submissions/Aplication/getSubmissionUseCase";
import { getSubmissionListMock } from "../../../__mocks__/submissions/dataTypeMocks/submissionData";
import { getSubmissionRepositoryMock } from "../../../__mocks__/submissions/repositoryMock";

const submissionRepositoryMock = getSubmissionRepositoryMock();
let getSubmission : GetSubmissionUseCase

beforeEach(() => {
    getSubmission = new GetSubmissionUseCase(submissionRepositoryMock);
});

describe("Get a Submission by an assigmentid and userid", () => {
    it("should obtain submissions successfully", async () => {
        const assignmentid= 25;
        const userid = 4;
        submissionRepositoryMock.getSubmissionByAssignmentAndUser.mockResolvedValueOnce(getSubmissionListMock());
        const result = await getSubmission.execute(assignmentid, userid);
        expect(result).toEqual(getSubmissionListMock());
        expect(submissionRepositoryMock.getSubmissionByAssignmentAndUser).toHaveBeenCalledTimes(1);
    });
});