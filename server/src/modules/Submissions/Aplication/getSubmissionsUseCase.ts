import { ISubmissionsRepository } from "../Domain/ISubmissionsRepository";
import { SubmissionDataObject } from "../Domain/Submission";

class GetSubmissionsUseCase {
  private readonly adapter: ISubmissionsRepository;

  constructor(adapter: ISubmissionsRepository) {
    this.adapter = adapter;
  }

  async execute(): Promise<SubmissionDataObject[]> {
    try {
      const assignments = await this.adapter.ObtainSubmissions();
      return assignments;
    } catch (error) {
      console.error("Error Obtaining Submissions");
      throw error;
    }
  }
}

export default GetSubmissionsUseCase;
