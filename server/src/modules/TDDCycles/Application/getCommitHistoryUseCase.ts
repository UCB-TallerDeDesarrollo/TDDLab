import { IGithubRepository } from "../Domain/IGithubRepository";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";

export class GetCommitHistoryUseCase {
  private readonly githubRepository: Pick<IGithubRepository, "getCommitHistoryData">;

  constructor(githubRepository: Pick<IGithubRepository, "getCommitHistoryData">) {
    this.githubRepository = githubRepository;
  }

  async execute(owner: string, repoName: string, branch = "main"): Promise<CommitHistoryData[]> {
    try {
      return await this.githubRepository.getCommitHistoryData(owner, repoName, branch);
    } catch (error) {
      console.error(`Error executing GetCommitHistoryUseCase: ${error}`);
      throw error;
    }
  }
}
