import SubmissionRepositoryInterface from "../../../../src/modules/Submissions/Domain/SubmissionRepositoryInterface";
import { SubmissionDataObject } from "../../../../src/modules/Submissions/Domain/submissionInterfaces";


export class MockSubmissionRepository implements SubmissionRepositoryInterface{
    private submissions: SubmissionDataObject[] = [];

    createSubmission = jest.fn(async (submissionData: SubmissionDataObject) => {
        this.submissions.push(submissionData);
      });
    checkSubmissionExists = jest.fn()

}