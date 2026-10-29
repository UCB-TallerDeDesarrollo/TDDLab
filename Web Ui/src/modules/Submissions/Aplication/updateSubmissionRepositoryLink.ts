import { SubmissionRepositoryLinkUpdateObject } from "../Domain/submissionInterfaces";
import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";

export class UpdateSubmissionRepositoryLink {
  constructor(
    private readonly submissionRepository: SubmissionRepositoryInterface
  ) {}

  async updateRepositoryLink(
    id: number,
    submissionData: SubmissionRepositoryLinkUpdateObject
  ) {
    try {
      return await this.submissionRepository.updateRepositoryLink(id, submissionData);
    } catch (error) {
      console.error("Error updating submission repository link:", error);
      throw error;
    }
  }
}
