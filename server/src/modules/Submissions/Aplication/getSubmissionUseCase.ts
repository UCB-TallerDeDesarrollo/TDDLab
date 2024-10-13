import { SubmissionDataObject } from "../Domain/Submission";
import SubmissionRepository from "../Repository/SubmissionsRepository";

class GetSubmissionUseCase {
  private readonly adapter: SubmissionRepository;
  constructor(adapter: SubmissionRepository) {
    this.adapter = adapter;
  }
  async execute(
    assignmentid: number,
    userid: number
  ): Promise<SubmissionDataObject | null> {
    try {
      const submission = await this.adapter.getSubmissionByAssignmentAndUser(
        assignmentid,
        userid
      );
      return submission;
    } catch (error) {
      console.error("Error Obtaining Submission", error);
      throw error;
    }
  }
}
export default GetSubmissionUseCase;
