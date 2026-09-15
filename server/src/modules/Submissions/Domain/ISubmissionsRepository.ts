import { SubmissionCreationObject, SubmissionDataObject, SubmissionUpdateObject } from "./Submission";

export interface ISubmissionsRepository {
  CreateSubmission(submission: SubmissionCreationObject): Promise<SubmissionDataObject>;
  ObtainSubmissions(): Promise<SubmissionDataObject[]>;
  UpdateSubmission(id: number, updatedSubmission: SubmissionUpdateObject): Promise<SubmissionUpdateObject | null>;
  deleteSubmission(id: number): Promise<void>;
  assignmentidExistsForSubmission(assignmentid: number): Promise<boolean>;
  useridExistsForSubmission(userid: number): Promise<boolean>;
  getSubmissionByAssignmentAndUser(assignmentid: number, userid: number): Promise<SubmissionDataObject | null>;
  getSubmissionsByAssignmentId(assignmentid: number): Promise<SubmissionDataObject[] | null>;
}
