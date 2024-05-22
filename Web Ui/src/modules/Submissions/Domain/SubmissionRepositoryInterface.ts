import { SubmissionCreationObject, SubmissionDataObject } from "./submissionInterfaces";

interface SubmissionRepositoryInterface {
    createSubmission(submissionData: SubmissionCreationObject): Promise<void>;
    checkSubmissionExists(assignmentid: number, userid: number): Promise<{ hasStarted: boolean }>;
    getSubmissionsByAssignmentId(assignmentid: number): Promise<SubmissionDataObject[]>;
}

export default SubmissionRepositoryInterface;