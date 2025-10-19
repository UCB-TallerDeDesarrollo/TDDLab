import CreateSubmission from "../../../../src/modules/Submissions/Aplication/CreateSubmissionUseCase";
import { SubmissionInProgresDataMock } from "../../../__mocks__/submissions/dataTypeMocks/submissionData";
import { getSubmissionRepositoryMock } from "../../../__mocks__/submissions/repositoryMock";

const submissionRepositoryMock = getSubmissionRepositoryMock();
let createSubmissionInstance: CreateSubmission;

beforeEach(() => {
    createSubmissionInstance = new CreateSubmission(submissionRepositoryMock);
});

describe("Create submission", () => {
    it("should create a submission", async () => {
      const assignmentData = SubmissionInProgresDataMock;
      submissionRepositoryMock.CreateSubmission.mockResolvedValue(assignmentData);
      submissionRepositoryMock.assignmentidExistsForSubmission.mockResolvedValue(true);
      submissionRepositoryMock.useridExistsForSubmission.mockResolvedValue(true);
      const newAssignment = await createSubmissionInstance.execute(assignmentData);
      expect(submissionRepositoryMock.CreateSubmission).toHaveBeenCalledWith(assignmentData);
      expect(newAssignment).toEqual(assignmentData);
    });

    it("should handle errors when creating a submission", async () => {
        submissionRepositoryMock.CreateSubmission.mockRejectedValue(new Error);
        await expect(createSubmissionInstance.execute(SubmissionInProgresDataMock)).rejects.toThrow();
    });
    it("should throw an error if the assignment ID does not exist", async () => {
        submissionRepositoryMock.assignmentidExistsForSubmission.mockResolvedValue(false);
        submissionRepositoryMock.useridExistsForSubmission.mockResolvedValue(true);
        await expect(createSubmissionInstance.execute(SubmissionInProgresDataMock)).rejects.toThrow("Inexistent assignment ID");
    });
    it("should throw an error if the user ID does not exist", async () => {
        submissionRepositoryMock.assignmentidExistsForSubmission.mockResolvedValue(true);
        submissionRepositoryMock.useridExistsForSubmission.mockResolvedValue(false);
        await expect(createSubmissionInstance.execute(SubmissionInProgresDataMock)).rejects.toThrow("Inexistent user ID");
    });
});
  