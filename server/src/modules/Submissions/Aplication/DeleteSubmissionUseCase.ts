import SubmissionRepository from "../Repository/SubmissionsRepository";


class DeleteSubmission{
    private adapter: SubmissionRepository;

  constructor(adapter: SubmissionRepository) {
    this.adapter = adapter;
  }

  async execute(submissionid: number): Promise<void> {
    try {
      await this.adapter.deleteSubmission(submissionid);
    } catch (error) {

      throw error;
    }
  }
}

export default DeleteSubmission;