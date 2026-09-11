import { ISubmissionsRepository } from "../Domain/ISubmissionsRepository";
import { SubmissionDataObject } from "../Domain/Submission";

class GetSubmissionsByAssignmentIdUseCase {
  private readonly adapter: ISubmissionsRepository;

  constructor(adapter: ISubmissionsRepository) {
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
