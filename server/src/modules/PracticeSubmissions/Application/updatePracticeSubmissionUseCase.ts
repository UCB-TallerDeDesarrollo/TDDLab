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

  async updateRepositoryLink(
    practiceSubmissionid: number,
    repositoryLink: string
  ) {
    return this.repository.UpdateRepositoryLink
      ? this.repository.UpdateRepositoryLink(practiceSubmissionid, repositoryLink)
      : null;
  }
}

export default UpdatePracticeSubmission;
