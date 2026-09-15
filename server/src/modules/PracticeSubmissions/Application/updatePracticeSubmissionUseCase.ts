import { PracticeSubmissionUpdateObject } from "../Domain/PracticeSubmission";
import { IPracticeSubmissionRepository } from "../Domain/IPracticeSubmissionRepository";

class UpdatePracticeSubmission {
  private readonly repository: IPracticeSubmissionRepository;

  constructor(repository: IPracticeSubmissionRepository) {
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
