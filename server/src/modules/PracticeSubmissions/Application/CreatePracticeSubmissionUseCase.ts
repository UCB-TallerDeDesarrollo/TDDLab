import { IPracticeSubmissionRepository } from "../Domain/IPracticeSubmissionRepository";
import { PracticeSubmissionCreationObject } from "../Domain/PracticeSubmission";

class CreatePracticeSubmission {
  private readonly adapter: IPracticeSubmissionRepository;

  constructor(adapter: IPracticeSubmissionRepository) {
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
