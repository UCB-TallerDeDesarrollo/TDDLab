import SubmissionRepository from "../Repository/SubmissionsRepository";

class DeleteSubmission {
  private readonly adapter: SubmissionRepository;

  constructor(adapter: SubmissionRepository) {
    this.adapter = adapter;
  }

  async execute(submissionid: number): Promise<void> {
    try {
      await this.adapter.deleteSubmission(submissionid);
    } catch (error) {
      console.error("Submission Deletion Unsuccessful.");
      throw error;
    }
  }
}

export default DeleteSubmission;
