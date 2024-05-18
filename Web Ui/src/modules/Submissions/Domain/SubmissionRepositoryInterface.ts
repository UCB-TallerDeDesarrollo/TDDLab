//import { SubmissionDataObject } from "./submissionInterfaces";
import { SubmissionCreationObject } from "./submissionInterfaces";

interface SubmissionRepositoryInterface {
    createSubmission(submissionData: SubmissionCreationObject): Promise<void>;
}

export default SubmissionRepositoryInterface;