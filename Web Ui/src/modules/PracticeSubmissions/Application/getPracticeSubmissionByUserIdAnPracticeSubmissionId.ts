import PracticeSubmissionRepositoryInterface from "../Domain/PracticeSubmissionRepositoryInterface";
import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmissionInterface";
export class GetPracticeSubmissionByUserandPracticeSubmissionId {
  constructor(
    private readonly practiceSubmissionRepository: PracticeSubmissionRepositoryInterface
  ) {}

  async getPracticeSubmisssionByUserandPracticeSubmissionId(
    assignmentid: number,
    userid: number | undefined
  ): Promise<PracticeSubmissionDataObject> {
    return await this.practiceSubmissionRepository.getPracticeSubmissionbyUserandSubmissionId(
      assignmentid,
      userid
    );
  }
}
