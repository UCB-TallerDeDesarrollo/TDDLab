import { SubmissionDataObect } from "../Domain/Submission";
import SubmissionRepository from "../Repository/SubmissionsRepository";

class getSubmissionUseCase{
    private adapter: SubmissionRepository;
    constructor(adapter: SubmissionRepository) {
        this.adapter = adapter;
    }
    async execute(assignmentid: number, userid: number): Promise<SubmissionDataObect | null> {
        try {
          const submission = await this.adapter.getSubmissionByAssignmentAndUser(assignmentid, userid);
          return submission ? submission : null;
        } catch (error) {
          throw error;
        }
      }
}
export default getSubmissionUseCase;