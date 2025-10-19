import { CreateSubmission } from "../../../../src/modules/Submissions/Aplication/createSubmission";
import { SubmissionDataObject } from "../../../../src/modules/Submissions/Domain/submissionInterfaces";
import { MockSubmissionRepository } from "../../__mocks__/submissions/mockSubmissionsRepository";

let mockRepository: MockSubmissionRepository;
let createSubmission: CreateSubmission;

beforeEach(() => {
    mockRepository = new MockSubmissionRepository();
    createSubmission = new CreateSubmission(mockRepository);
});
describe("Create Submission", () => {
    it("Should successfully create a new Submission", async () => {
      const submissionId = 1;
      const submission: SubmissionDataObject = {
        id: submissionId,
        assignmentid:2,
        userid: 1,
        status: "in Progress",
        repository_link: "Enlace",
        start_date: new Date("2023-10-31"),
        end_date: new Date("2023-11-05"),
        comment: " ",

      };
      mockRepository.createSubmission(submission);
      await createSubmission.createSubmission(submission);
    });
  });