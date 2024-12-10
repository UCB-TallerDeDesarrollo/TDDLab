import SubmissionRepository from "../Repository/SubmissionsRepository";
import { SubmissionDataObject } from "../Domain/Submission";

class GetSubmissionsByAssignmentIdUseCase {
  private readonly adapter: SubmissionRepository;

  constructor(adapter: SubmissionRepository) {
    this.adapter = adapter;
  }

  async execute(assignmentid: number): Promise<SubmissionDataObject[] | null> {
    try {
      const submissions = await this.adapter.getSubmissionsByAssignmentId(
        assignmentid
      );
      return submissions;
    } catch (error) {
      console.error(`Error`);
      throw error;
    }
  }
}

export default GetSubmissionsByAssignmentIdUseCase;
