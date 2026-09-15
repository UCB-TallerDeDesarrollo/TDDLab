import { IPracticeSubmissionRepository } from "../Domain/IPracticeSubmissionRepository";

class DeletePracticeSubmission {
  private readonly adapter: IPracticeSubmissionRepository;

  constructor(adapter: IPracticeSubmissionRepository) {
    this.adapter = adapter;
  }

  async execute(practiceSubmissionid: number): Promise<void> {
    try {
      await this.adapter.deletePracticeSubmission(practiceSubmissionid);
    } catch (error) {
      console.error("Practice Submission Deletion Unsuccessful.");
      throw error;
    }
  }
}

export default DeletePracticeSubmission;
