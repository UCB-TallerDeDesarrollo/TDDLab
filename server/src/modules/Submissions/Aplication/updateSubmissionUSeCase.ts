import SubmissionRepository from "../Repository/SubmissionsRepository";
import { SubmissionUpdateObject } from "../Domain/Submission";

class UpdateSubmission {
  private readonly repository: SubmissionRepository;

  constructor(repository: SubmissionRepository) {
    this.repository = repository;
  }

  async execute(
    submissionid: number,
    updatedSubmission: SubmissionUpdateObject
  ): Promise<SubmissionUpdateObject | null> {
    try {
      const updatedSubmissionResult = await this.repository.UpdateSubmission(
        submissionid,
        updatedSubmission
      );
      return updatedSubmissionResult;
    } catch (error) {
      console.error("Error updating Submission");
      throw error;
    }
  }
}

export default UpdateSubmission;
