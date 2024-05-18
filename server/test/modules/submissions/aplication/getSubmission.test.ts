import GetSubmissionsUseCase from "../../../../src/modules/Submissions/Aplication/getSubmissionsUseCase";
import { getSubmissionListMock } from "../../../__mocks__/submissions/dataTypeMocks/submissionData";
import { getSubmissionRepositoryMock } from "../../../__mocks__/submissions/repositoryMock";

const submissionRepositoryMock = getSubmissionRepositoryMock();
let getSubmissions: GetSubmissionsUseCase;

beforeEach(() => {
    getSubmissions = new GetSubmissionsUseCase(submissionRepositoryMock);
});

describe("Get Submissions", () => {
    it("should obtain submissions successfully", async () => {
        submissionRepositoryMock.ObtainSubmissions.mockResolvedValueOnce(getSubmissionListMock());
      const result = await getSubmissions.execute();
      expect(result).toEqual(getSubmissionListMock());
      expect(submissionRepositoryMock.ObtainSubmissions).toHaveBeenCalledTimes(1);
    });

    it("should handle errors when obtaining submission", async () => {
        submissionRepositoryMock.ObtainSubmissions.mockRejectedValue(new Error);
      await expect(getSubmissions.execute()).rejects.toThrow();
    });
});
  