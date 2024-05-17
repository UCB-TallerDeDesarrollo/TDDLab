import SubmissionRepository from "../Repository/SubmissionsRepository";
import { SubmissionDataObect } from "../Domain/Submission";

class GetSubmissionsUseCase {
    private adapter: SubmissionRepository;

    constructor(adapter: SubmissionRepository) {
        this.adapter = adapter;
    }

    async execute(): Promise<SubmissionDataObect[]> {
        try {
          const assignments = await this.adapter.ObtainSubmissions();
          return assignments;
        } catch (error) {
          throw error;
        }
      }
}

export default GetSubmissionsUseCase;