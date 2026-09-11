import { ISubmissionsRepository } from "../Domain/ISubmissionsRepository";

class DeleteSubmission {
  private readonly adapter: ISubmissionsRepository;

  constructor(adapter: ISubmissionsRepository) {
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
