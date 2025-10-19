import { SubmissionCreationObject, SubmissionDataObject, SubmissionUpdateObject } from "./submissionInterfaces";

interface SubmissionRepositoryInterface {
    createSubmission(submissionData: SubmissionCreationObject): Promise<void>;
    checkSubmissionExists(assignmentid: number, userid: number): Promise<{ hasStarted: boolean }>;
    getSubmissionsByAssignmentId(assignmentid: number): Promise<SubmissionDataObject[]>;
    getSubmissionbyUserandSubmissionId(assignmentid: number, userid:number): Promise<SubmissionDataObject>;
    finishSubmission(id: number, submissionData: SubmissionUpdateObject): Promise<void>;
}

export default SubmissionRepositoryInterface;