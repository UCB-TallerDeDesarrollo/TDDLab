import {
  PracticeSubmissionCreationObject,
  PracticeSubmissionDataObject,
  PracticeSubmissionUpdateObject,
} from "./PracticeSubmissionInterface";

interface PracticeSubmissionRepositoryInterface {
  createPracticeSubmission(
    practiceSubmissionData: PracticeSubmissionCreationObject
  ): Promise<void>;
  checkPracticeSubmissionExists(
    practiceid: number,
    userid: number
  ): Promise<{ hasStarted: boolean }>;
  getPracticeSubmissionsByPracticeId(
    practiceid: number
  ): Promise<PracticeSubmissionDataObject[]>;
  getPracticeSubmissionbyUserandSubmissionId(
    practiceid: number,
    userid: number | undefined
  ): Promise<PracticeSubmissionDataObject>;
  finishPracticeSubmission(
    id: number,
    practuceSubmissionData: PracticeSubmissionUpdateObject
  ): Promise<void>;
  updateRepositoryLink(
    submissionid: number,
    repository_link: string
  ): Promise<PracticeSubmissionDataObject>;
}

export default PracticeSubmissionRepositoryInterface;
