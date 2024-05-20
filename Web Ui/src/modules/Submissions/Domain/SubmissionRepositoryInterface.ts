import { SubmissionCreationObject } from "./submissionInterfaces";

interface SubmissionRepositoryInterface {
    createSubmission(submissionData: SubmissionCreationObject): Promise<void>;
    checkSubmissionExists(assignmentid: number, userid: number): Promise<{ hasStarted: boolean }>;
}

export default SubmissionRepositoryInterface;