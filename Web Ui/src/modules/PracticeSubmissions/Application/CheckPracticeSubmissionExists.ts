import PracticeSubmissionRepositoryInterface from "../Domain/PracticeSubmissionRepositoryInterface";

export class CheckPracticeSubmissionExists {
  constructor(
    private readonly submissionRepository: PracticeSubmissionRepositoryInterface
  ) {}

  async checkPracticeSubmissionExists(
    assignmentid: number,
    userid: number
  ): Promise<{ hasStarted: boolean }> {
    return await this.submissionRepository.checkPracticeSubmissionExists(
      assignmentid,
      userid
    );
  }
}
