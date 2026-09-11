import { IPracticeSubmissionRepository } from "../Domain/IPracticeSubmissionRepository";
import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";

class GetPracticeSubmissionsUseCase {
  private readonly adapter: IPracticeSubmissionRepository;

  constructor(adapter: IPracticeSubmissionRepository) {
    this.adapter = adapter;
  }

  async execute(): Promise<PracticeSubmissionDataObject[]> {
    try {
      const practices = await this.adapter.ObtainPracticeSubmissions();
      return practices;
    } catch (error) {
      console.error("Error Obtaining Practice Submissions");
      throw error;
    }
  }
}

export default GetPracticeSubmissionsUseCase;
