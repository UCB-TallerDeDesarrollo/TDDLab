import { IGithubRepository } from "../Domain/IGithubRepository";
import { CommitCycleData } from "../Domain/ICommitCycleData";

export class GetCommitCyclesUseCase {
  private readonly githubRepository: IGithubRepository;

  constructor(githubRepository: IGithubRepository) {
    this.githubRepository = githubRepository;
  }

  async execute(owner: string, repoName: string): Promise<CommitCycleData[]> {
    try {
      return await this.githubRepository.getCommitCyclesData(owner, repoName);
    } catch (error) {
      console.error(`Error executing GetCommitCyclesUseCase: ${error}`);
      throw error;
    }
  }
}
