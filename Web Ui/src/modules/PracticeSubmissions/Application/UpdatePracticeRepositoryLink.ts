import PracticeSubmissionRepositoryInterface from "../Domain/PracticeSubmissionRepositoryInterface";
import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmissionInterface";

export class UpdatePracticeRepositoryLink {
  private readonly repository: PracticeSubmissionRepositoryInterface;

  constructor(repository: PracticeSubmissionRepositoryInterface) {
    this.repository = repository;
  }

  async execute(submissionId: number, repositoryLink: string): Promise<PracticeSubmissionDataObject> {
    return await this.repository.updateRepositoryLink(submissionId, repositoryLink);
  }
}