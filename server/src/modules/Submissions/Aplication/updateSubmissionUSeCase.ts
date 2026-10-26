import SubmissionRepository from "../Repository/SubmissionsRepository";
import { SubmissionUpdateObject, SubmissionDataObject } from "../Domain/Submission";

class UpdateSubmission {
  private readonly repository: SubmissionRepository;

  constructor(repository: SubmissionRepository) {
    this.repository = repository;
  }

  async execute(
    submissionid: number,
    updatedSubmission: SubmissionUpdateObject
  ): Promise<SubmissionDataObject | null> {
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

  async updateRepositoryLink(
    submissionid: number,
    repositoryLink: string
  ): Promise<SubmissionDataObject | null> {
    return this.repository.UpdateRepositoryLink
      ? this.repository.UpdateRepositoryLink(submissionid, repositoryLink)
      : null;
  }
}

export default UpdateSubmission;
