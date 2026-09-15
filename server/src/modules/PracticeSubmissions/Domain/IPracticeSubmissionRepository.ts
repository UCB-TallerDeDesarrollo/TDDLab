import { PracticeSubmissionCreationObject, PracticeSubmissionDataObject, PracticeSubmissionUpdateObject } from "./PracticeSubmission";

export interface IPracticeSubmissionRepository {
  CreatePracticeSubmission(practiceSubmission: PracticeSubmissionCreationObject): Promise<PracticeSubmissionDataObject>;
  ObtainPracticeSubmissions(): Promise<PracticeSubmissionDataObject[]>;
  UpdatePracticeSubmission(id: number, updatedSubmission: PracticeSubmissionUpdateObject): Promise<PracticeSubmissionUpdateObject | null>;
  deletePracticeSubmission(id: number): Promise<void>;
  practiceidExistsForPracticeSubmission(practiceid: number): Promise<boolean>;
  useridExistsForPracticeSubmission(userid: number): Promise<boolean>;
  getPracticeSubmissionByPracticeAndUser(practiceid: number, userid: number): Promise<PracticeSubmissionDataObject | null>;
  getPracticeSubmissionsByPracticeId(practiceid: number): Promise<PracticeSubmissionDataObject[]>;
}
