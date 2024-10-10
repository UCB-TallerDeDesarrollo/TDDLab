import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";
import { SubmissionDataObject } from "../Domain/submissionInterfaces";

export class GetSubmissionByUserandAssignmentId {
  constructor(
    private readonly submissionRepository: SubmissionRepositoryInterface
  ) {}

  async getSubmisssionByUserandSubmissionId(
    assignmentid: number,
    userid: number
  ): Promise<SubmissionDataObject> {
    return await this.submissionRepository.getSubmissionbyUserandSubmissionId(
      assignmentid,
      userid
    );
  }
}
