import { SubmissionUpdateObject } from "../Domain/submissionInterfaces";
import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";

export class FinishSubmission {
  constructor(
    private readonly submissionRepository: SubmissionRepositoryInterface
  ) {}

  async finishSubmission(id: number, submissionData: SubmissionUpdateObject) {
    try {
      const updatedSubmisisonData: SubmissionUpdateObject = {
        ...submissionData,
        id: id,
      };
      await this.submissionRepository.finishSubmission(
        id,
        updatedSubmisisonData
      );
    } catch (error) {
      console.error("Error updating submission:", error);
      throw error;
    }
  }
}
