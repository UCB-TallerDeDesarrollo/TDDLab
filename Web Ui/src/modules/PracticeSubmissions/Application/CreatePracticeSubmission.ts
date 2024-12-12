import { PracticeSubmissionCreationObject } from "../Domain/PracticeSubmissionInterface";
import PracticeSubmissionRepositoryInterface from "../Domain/PracticeSubmissionRepositoryInterface";
export class CreatePracticeSubmission {
  constructor(
    private readonly practicesubmissionRepository: PracticeSubmissionRepositoryInterface
  ) {}

  async createSubmission(
    practiceSubmissionData: PracticeSubmissionCreationObject
  ) {
    return await this.practicesubmissionRepository.createPracticeSubmission(
      practiceSubmissionData
    );
  }
}
