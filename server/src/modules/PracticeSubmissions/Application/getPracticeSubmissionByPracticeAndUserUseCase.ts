import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";
import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";

class GetPracticeSubmissionByPracticeAndUserUseCase {
  private readonly adapter: PracticeSubmissionRepository;
  constructor(adapter: PracticeSubmissionRepository) {
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