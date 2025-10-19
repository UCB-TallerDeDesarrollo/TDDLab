import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";

class DeletePracticeSubmission {
  private readonly adapter: PracticeSubmissionRepository;

  constructor(adapter: PracticeSubmissionRepository) {
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
