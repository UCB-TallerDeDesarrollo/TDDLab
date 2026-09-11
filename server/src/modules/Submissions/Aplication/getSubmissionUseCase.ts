import { SubmissionDataObject } from "../Domain/Submission";
import { ISubmissionsRepository } from "../Domain/ISubmissionsRepository";

class GetSubmissionUseCase {
  private readonly adapter: ISubmissionsRepository;
  constructor(adapter: ISubmissionsRepository) {
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
