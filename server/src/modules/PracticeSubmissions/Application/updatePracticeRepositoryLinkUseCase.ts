import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";
import { PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";

class UpdatePracticeRepositoryLinkUseCase {
  private repository: PracticeSubmissionRepository;

  constructor(repository: PracticeSubmissionRepository) {
    this.repository = repository;
  }

  async execute(id: number, repository_link: string): Promise<PracticeSubmissionDataObject | null> {
    return await this.repository.UpdateRepositoryLink(id, repository_link);
  }
}

export default UpdatePracticeRepositoryLinkUseCase;