import {SubmissionCreationObject,SubmissionDataObject,SubmissionRepositoryLinkUpdateObject,SubmissionUpdateObject,} from "./submissionInterfaces";

interface SubmissionRepositoryInterface {
    createSubmission(submissionData: SubmissionCreationObject): Promise<SubmissionDataObject>;
    checkSubmissionExists(assignmentid: number, userid: number): Promise<{ hasStarted: boolean }>;
    getSubmissionsByAssignmentId(assignmentid: number): Promise<SubmissionDataObject[]>;
    getSubmissionbyUserandSubmissionId(assignmentid: number, userid:number): Promise<SubmissionDataObject | null>;
    finishSubmission(id: number, submissionData: SubmissionUpdateObject): Promise<SubmissionDataObject>;
    updateRepositoryLink(id: number, submissionData: SubmissionRepositoryLinkUpdateObject): Promise<SubmissionDataObject>;
}

export default SubmissionRepositoryInterface;
