import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmissionInterface";
import PracticeSubmissionRepositoryInterface from "../Domain/PracticeSubmissionRepositoryInterface";

export class GetPracticeSubmissionsByPracticeId {
  constructor(
    private readonly practiceSubmissionRepository: PracticeSubmissionRepositoryInterface
  ) {}

  async getPracticeSubmissionsByPracticeId(
    assignmentid: number
  ): Promise<PracticeSubmissionDataObject[]> {
    return await this.practiceSubmissionRepository.getPracticeSubmissionsByPracticeId(
      assignmentid
    );
  }
}
