import { SubmissionUpdateObject } from "../Domain/submissionInterfaces";
import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";

export class FinishSubmission {
  constructor(
    private readonly submissionRepository: SubmissionRepositoryInterface
  ) {}

  async updateRepositoryLink(id: number, repositoryLink: string) {
    return this.submissionRepository.updateRepositoryLink(id, repositoryLink);
  }

  async finishSubmission(id: number, submissionData: SubmissionUpdateObject) {
    try {
      const updatedSubmisisonData: SubmissionUpdateObject = {
        ...submissionData,
        id: id,
      };
      return await this.submissionRepository.finishSubmission(
        id,
        updatedSubmisisonData
      );
    } catch (error) {
      console.error("Error updating submission:", error);
      throw error;
    }
  }
}
