import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";
import { IPracticeSubmissionRepository } from "../Domain/IPracticeSubmissionRepository";

class GetPracticeSubmissionByPracticeAndUserUseCase {
  private readonly adapter: IPracticeSubmissionRepository;
  constructor(adapter: IPracticeSubmissionRepository) {
    this.adapter = adapter;
  }
  async execute(
    practiceid: number,
    userid: number
  ): Promise<PracticeSubmissionDataObject | null> {
    try {
      const submission = await this.adapter.getPracticeSubmissionByPracticeAndUser(
        practiceid,
        userid
      );
      return submission;
    } catch (error) {
      console.error("Error Obtaining Practice Submission", error);
      throw error;
    }
  }
}
export default GetPracticeSubmissionByPracticeAndUserUseCase;