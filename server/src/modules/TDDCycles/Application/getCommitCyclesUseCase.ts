import { IGithubRepository } from "../Domain/IGithubRepository";
import { CommitCycleData } from "../Domain/ICommitCycleData";

export class GetCommitCyclesUseCase {
  private readonly githubRepository: Pick<IGithubRepository, "getCommitCyclesData">;

  constructor(githubRepository: Pick<IGithubRepository, "getCommitCyclesData">) {
    this.githubRepository = githubRepository;
  }

  async execute(owner: string, repoName: string, branch = "main"): Promise<CommitCycleData[]> {
    try {
      return await this.githubRepository.getCommitCyclesData(owner, repoName, branch);
    } catch (error) {
      console.error(`Error executing GetCommitCyclesUseCase: ${error}`);
      throw error;
    }
  }
}
