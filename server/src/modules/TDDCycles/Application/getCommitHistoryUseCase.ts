import { IGithubRepository } from "../Domain/IGithubRepository";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";
import type { ITDDHistoryRepository } from "../Domain/ITDDHistoryRepository";
import type { BranchTestMetricHistory } from "../Domain/BranchTestMetrics";

export class GetCommitHistoryUseCase {
  private readonly githubRepository: IGithubRepository;

  constructor(
    githubRepository: IGithubRepository,
    private readonly historyRepository?: ITDDHistoryRepository
  ) {
    this.githubRepository = githubRepository;
  }

  async executeBranches(owner: string, repoName: string) {
    if (!this.historyRepository) return undefined;
    const repository = { provider: "github", owner, name: repoName };
    if (!await this.historyRepository.findRepository(repository)) return null;
    const branches = await this.historyRepository.listBranches(repository);
    return { repository, branches: branches.map(branch => branch.name) };
  }

  async executeBranchHistory(owner: string, repoName: string, branch: string) {
    if (!this.historyRepository) return undefined;
    const repository = { provider: "github", owner, name: repoName };
    if (!await this.historyRepository.findRepository(repository)) return null;
    const branches = await this.historyRepository.listBranches(repository);
    if (!branches.some(item => item.name === branch)) return null;
    const [commits, executions] = await Promise.all([
      this.historyRepository.listBranchCommits(repository, branch),
      this.historyRepository.listExecutions(repository, {
        kind: "in-branch-history", branchName: branch,
      }),
    ]);
    return { repository, branch, commits, executions };
  }

  async executeBranchTestMetrics(owner: string, repoName: string): Promise<BranchTestMetricHistory[]> {
    return await this.githubRepository.getBranchTestMetrics(owner, repoName);
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
