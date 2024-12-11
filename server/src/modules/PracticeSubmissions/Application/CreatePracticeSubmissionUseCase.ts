import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";
import { PracticeSubmissionCreationObject } from "../Domain/PracticeSubmission";

class CreatePracticeSubmission {
  private readonly adapter: PracticeSubmissionRepository;

  constructor(adapter: PracticeSubmissionRepository) {
    this.adapter = adapter;
  }

  async execute(
    practiceSubmission: PracticeSubmissionCreationObject
  ): Promise<PracticeSubmissionCreationObject> {
    try {
      const practiceExist =
        await this.adapter.practiceidExistsForPracticeSubmission(
            practiceSubmission.practiceid
        );
      const useridExist = await this.adapter.useridExistsForPracticeSubmission(
        practiceSubmission.userid
      );
      if (!practiceExist) {
        throw new Error("Inexistent practice ID");
      }
      if (!useridExist) {
        throw new Error("Inexistent user ID");
      }
      const newPracticeSubmission = await this.adapter.CreatePracticeSubmission(practiceSubmission);
      return newPracticeSubmission;
    } catch (error) {
      console.error("Practice Submission Creation Unsuccessful.", error);
      throw error;
    }
  }
}

export default CreatePracticeSubmission;
