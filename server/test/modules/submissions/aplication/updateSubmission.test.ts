import UpdateSubmission from "../../../../src/modules/Submissions/Aplication/updateSubmissionUSeCase";
import { SubmissionInProgresDataMock } from "../../../__mocks__/submissions/dataTypeMocks/submissionData";
import { getSubmissionRepositoryMock } from "../../../__mocks__/submissions/repositoryMock";

const submissionRepositoryMock = getSubmissionRepositoryMock();

let updateSubmission: UpdateSubmission;

beforeEach(() => {
    updateSubmission = new UpdateSubmission(submissionRepositoryMock);
});

describe("Update submission", () => {
    it("should update an submission successfully", async () => {
      const submissionId = 1;
      submissionRepositoryMock.UpdateSubmission.mockResolvedValueOnce(SubmissionInProgresDataMock);
      const result = await updateSubmission.execute(submissionId, SubmissionInProgresDataMock);
      expect(result).toEqual(SubmissionInProgresDataMock);
      expect(submissionRepositoryMock.UpdateSubmission).toHaveBeenCalledWith(
        submissionId,
        SubmissionInProgresDataMock
      );
    });
});