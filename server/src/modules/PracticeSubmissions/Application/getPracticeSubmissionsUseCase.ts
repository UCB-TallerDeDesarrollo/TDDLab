import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";
import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";

class GetPracticeSubmissionsUseCase {
  private readonly adapter: PracticeSubmissionRepository;

  constructor(adapter: PracticeSubmissionRepository) {
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
