import CreateSubmission from "../../../../src/modules/Submissions/Aplication/CreateSubmissionUseCase";
import { SubmissionInProgresDataMock } from "../../../__mocks__/submissions/dataTypeMocks/submissionData";
import { getSubmissionRepositoryMock } from "../../../__mocks__/submissions/repositoryMock";

const submissionRepositoryMock = getSubmissionRepositoryMock();
let createSubmissionInstance: CreateSubmission;

beforeEach(() => {
    createSubmissionInstance = new CreateSubmission(submissionRepositoryMock);
});

describe("Create submission", () => {
    it("should create an submission", async () => {
      const assignmentData = SubmissionInProgresDataMock;
      submissionRepositoryMock.CreateSubmission.mockResolvedValue(assignmentData);
      submissionRepositoryMock.assignmentidExistsForSubmission.mockResolvedValue(true);
      submissionRepositoryMock.useridExistsForSubmission.mockResolvedValue(true);
      const newAssignment = await createSubmissionInstance.execute(assignmentData);
      expect(submissionRepositoryMock.CreateSubmission).toHaveBeenCalledWith(assignmentData);
      expect(newAssignment).toEqual(assignmentData);
    });
});
  