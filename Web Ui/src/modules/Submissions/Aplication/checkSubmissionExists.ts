import SubmissionRepositoryInterface from "../Domain/SubmissionRepositoryInterface";

export class CheckSubmissionExists {
    constructor(private submissionRepository: SubmissionRepositoryInterface) {}

    async checkSubmissionExists(assignmentid: number, userid: number): Promise<{ hasStarted: boolean }> {
        return await this.submissionRepository.checkSubmissionExists(assignmentid, userid);
    }
}