import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";
import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";

class GetPracticeSubmissionsByPracticeIdUseCase {
  private readonly adapter: PracticeSubmissionRepository;

  constructor(adapter: PracticeSubmissionRepository) {
    this.adapter = adapter;
  }

  async execute(practiceid: number): Promise<PracticeSubmissionDataObject[] | null> {
    try {
      const practiceSubmissions = await this.adapter.getPracticeSubmissionsByPracticeId(
        practiceid
      );
      return practiceSubmissions;
    } catch (error) {
      console.error(`Error`);
      throw error;
    }
  }
}

export default GetPracticeSubmissionsByPracticeIdUseCase;
