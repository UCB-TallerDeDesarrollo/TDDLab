import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";
import { PracticeSubmissionUpdateObject } from "../Domain/PracticeSubmission";

class UpdatePracticeSubmission {
  private readonly repository: PracticeSubmissionRepository;

  constructor(repository: PracticeSubmissionRepository) {
    this.repository = repository;
  }

  async execute(
    practiceSubmissionid: number,
    updatedPracticeSubmission: PracticeSubmissionUpdateObject
  ): Promise<PracticeSubmissionUpdateObject | null> {
    try {
      const updatedPracticeSubmissionResult = await this.repository.UpdatePracticeSubmission(
        practiceSubmissionid,
        updatedPracticeSubmission
      );
      return updatedPracticeSubmissionResult;
    } catch (error) {
      console.error("Error updating Practice Submission");
      throw error;
    }
  }
}

export default UpdatePracticeSubmission;
