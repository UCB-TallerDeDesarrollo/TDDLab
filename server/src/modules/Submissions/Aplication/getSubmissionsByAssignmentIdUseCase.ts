import SubmissionRepository from "../Repository/SubmissionsRepository";
import { SubmissionDataObect } from "../Domain/Submission";

class GetSubmissionsByAssignmentIdUseCase {
    private adapter: SubmissionRepository;

    constructor(adapter: SubmissionRepository) {
        this.adapter = adapter;
    }

    async execute(assignmentid: number): Promise<SubmissionDataObect[] | null> {
        try {
          const submissions = await this.adapter.getSubmissionsByAssignmentId(assignmentid);
          return submissions;
        } catch (error) {
          throw error;
        }
      }
}

export default GetSubmissionsByAssignmentIdUseCase;