import { IGithubRepository } from "../Domain/IGithubRepository";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";

export class GetCommitHistoryUseCase {
  private readonly githubRepository: IGithubRepository;

  constructor(githubRepository: IGithubRepository) {
    this.githubRepository = githubRepository;
  }

  async execute(owner: string, repoName: string): Promise<CommitHistoryData[]> {
    try {
      return await this.githubRepository.getCommitHistoryData(owner, repoName);
    } catch (error) {
      console.error(`Error executing GetCommitHistoryUseCase: ${error}`);
      throw error;
    }
  }
}
