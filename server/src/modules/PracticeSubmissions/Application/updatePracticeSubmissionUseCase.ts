import { validateSubmissionRepositoryLink } from "../../Submissions/Domain/Submission";
import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";
import { PracticeSubmissionUpdateObject, PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";

class UpdatePracticeSubmission {
  private readonly repository: PracticeSubmissionRepository;

  constructor(repository: PracticeSubmissionRepository) {
    this.repository = repository;
  }

  async updateRepositoryLink(id: number, userid: number, repositoryLink: string): Promise<PracticeSubmissionDataObject | null> {
    validateSubmissionRepositoryLink(id, userid, repositoryLink);
    return this.repository.updateRepositoryLink(id, userid, repositoryLink);
  }

  async finishWithRepositoryLink(id: number, userid: number, data: PracticeSubmissionUpdateObject) {
    validateSubmissionRepositoryLink(id, userid, data.repository_link);
    if (data.status !== "delivered") throw new TypeError("La entrega debe finalizarse.");
    return this.repository.UpdatePracticeSubmission(id, data, userid);
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
