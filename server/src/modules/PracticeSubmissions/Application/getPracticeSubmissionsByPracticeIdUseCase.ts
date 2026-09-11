import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";
import { IPracticeSubmissionRepository } from "../Domain/IPracticeSubmissionRepository";

class GetPracticeSubmissionsByPracticeIdUseCase {
  private readonly adapter: IPracticeSubmissionRepository;

  constructor(adapter: IPracticeSubmissionRepository) {
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
