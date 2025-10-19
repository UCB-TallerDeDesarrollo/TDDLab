import { SubmissionDataObject } from "../Domain/submissionInterfaces";
import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";

export class GetSubmissionsByAssignmentId {
  constructor(
    private readonly submissionRepository: SubmissionRepositoryInterface
  ) {}

  async getSubmissionsByAssignmentId(
    assignmentid: number
  ): Promise<SubmissionDataObject[]> {
    return await this.submissionRepository.getSubmissionsByAssignmentId(
      assignmentid
    );
  }
}
