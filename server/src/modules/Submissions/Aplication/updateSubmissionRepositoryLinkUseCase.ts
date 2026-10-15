import SubmissionRepository from "../Repository/SubmissionsRepository";
import {
  SubmissionDataObject,
  SubmissionRepositoryLinkUpdateObject,
} from "../Domain/Submission";

class UpdateSubmissionRepositoryLinkUseCase {
  private readonly repository: SubmissionRepository;

  constructor(repository: SubmissionRepository) {
    this.repository = repository;
  }

  async execute(
    submissionid: number,
    userid: number,
    updatedSubmission: SubmissionRepositoryLinkUpdateObject
  ): Promise<SubmissionDataObject | null> {
    try {
      return await this.repository.UpdateSubmissionRepositoryLink(
        submissionid,
        userid,
        updatedSubmission
      );
    } catch (error) {
      console.error("Error updating Submission repository link");
      throw error;
    }
  }
}

export default UpdateSubmissionRepositoryLinkUseCase;
