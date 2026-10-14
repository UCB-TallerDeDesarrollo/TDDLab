import SubmissionRepository from "../Repository/SubmissionsRepository";
import { SubmissionUpdateObject, SubmissionDataObject, validateSubmissionRepositoryLink } from "../Domain/Submission";

class UpdateSubmission {
  private readonly repository: SubmissionRepository;

  constructor(repository: SubmissionRepository) {
    this.repository = repository;
  }

  async updateRepositoryLink(id: number, userid: number, repositoryLink: string): Promise<SubmissionDataObject | null> {
    validateSubmissionRepositoryLink(id, userid, repositoryLink);
    return this.repository.updateRepositoryLink(id, userid, repositoryLink);
  }

  async finishWithRepositoryLink(id: number, userid: number, data: SubmissionUpdateObject) {
    validateSubmissionRepositoryLink(id, userid, data.repository_link);
    if (data.status !== "delivered") throw new TypeError("La entrega debe finalizarse.");
    return this.repository.UpdateSubmission(id, data, userid);
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
}

export default UpdateSubmission;
