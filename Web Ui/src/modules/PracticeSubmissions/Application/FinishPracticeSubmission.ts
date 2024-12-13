import { PracticeSubmissionUpdateObject } from "../Domain/PracticeSubmissionInterface";
import PracticeSubmissionRepositoryInterface from "../Domain/PracticeSubmissionRepositoryInterface";

export class FinishPracticeSubmission {
  constructor(
    private readonly practiceSubmissionRepository: PracticeSubmissionRepositoryInterface
  ) {}

  async finishSubmission(
    id: number,
    practiceSubmissionData: PracticeSubmissionUpdateObject
  ) {
    try {
      const updatedPracticeSubmisisonData: PracticeSubmissionUpdateObject = {
        ...practiceSubmissionData,
        id: id,
      };
      await this.practiceSubmissionRepository.finishPracticeSubmission(
        id,
        updatedPracticeSubmisisonData
      );
    } catch (error) {
      console.error("Error updating practice submission:", error);
      throw error;
    }
  }
}
